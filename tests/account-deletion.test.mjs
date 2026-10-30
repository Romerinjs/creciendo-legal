import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getPublicSupabaseConfig,
  signInForDeletion,
  deleteAuthenticatedAccount,
  endDeletionSession,
} from "../app/eliminar-cuenta/account-deletion.ts";

const config = { url: "https://example.supabase.co", key: "sb_publishable_test" };
const user = { id: "test-user", email: "guardian@example.invalid", email_confirmed_at: "2026-01-01" };
const session = () => ({ accessToken: "test-access-token", userId: user.id, email: user.email, expiresAt: Date.now() + 60_000 });
const json = (data, status = 200) => Response.json(data, { status });
const failIfCalled = async () => { assert.fail("Network must not be called"); };

test("configuration rejects missing, privileged, mismatched and non-HTTPS values", () => {
  const jwt = (role, ref = "example") => `e30.${Buffer.from(JSON.stringify({ role, ref })).toString("base64url")}.signature`;
  assert.equal(getPublicSupabaseConfig(undefined, undefined), null);
  assert.equal(getPublicSupabaseConfig(config.url, "sb_secret_do_not_expose"), null);
  assert.equal(getPublicSupabaseConfig(config.url, jwt("service_role")), null);
  assert.equal(getPublicSupabaseConfig(config.url, jwt("anon", "other")), null);
  assert.equal(getPublicSupabaseConfig("http://example.supabase.co", config.key), null);
  assert.equal(getPublicSupabaseConfig("https://example.supabase.co.evil.invalid", config.key), null);
  assert.equal(getPublicSupabaseConfig(`${config.url}/arbitrary`, config.key), null);
  assert.deepEqual(getPublicSupabaseConfig(config.url, config.key), config);
  assert.equal(getPublicSupabaseConfig(config.url, jwt("anon"))?.url, config.url);
});

test("login only authenticates; it does not delete, create accounts or persist a refresh token", async () => {
  const calls = [];
  const active = await signInForDeletion(config, ` ${user.email} `, "password", async (url, init) => {
    calls.push(url);
    assert.equal(url, `${config.url}/auth/v1/token?grant_type=password`);
    assert.deepEqual(JSON.parse(init.body), { email: user.email, password: "password" });
    assert.equal(init.credentials, "omit");
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    assert.equal(init.referrerPolicy, "no-referrer");
    return json({ access_token: "test-access-token", refresh_token: "must-not-be-kept", expires_in: 3600, user });
  });
  assert.equal(calls.length, 1);
  assert.equal(active.userId, user.id);
  assert.ok(active.expiresAt <= Date.now() + 600_000);
  assert.equal("refreshToken" in active, false);
});

test("login failures do not reveal raw database/auth messages or registered emails", async () => {
  await assert.rejects(signInForDeletion(config, user.email, "wrong", async () => json({ message: "sensitive internals" }, 400)),
    { message: "No pudimos iniciar sesión. Revisa tu correo y contraseña." });
  await assert.rejects(signInForDeletion(config, user.email, "wrong", async () => json({}, 429)), /Demasiados intentos/);
});

test("unconfirmed and expired sessions cannot trigger any request", async () => {
  await assert.rejects(deleteAuthenticatedAccount(config, session(), false, failIfCalled), /Confirma/);
  await assert.rejects(deleteAuthenticatedAccount(config, { ...session(), expiresAt: 0 }, true, failIfCalled), /expiró/);
});

test("invalid Auth identity blocks the RPC", async () => {
  for (const response of [json({}, 401), json({ ...user, id: "another-user" }), json({ ...user, email_confirmed_at: null }), json({ ...user, is_anonymous: true })]) {
    let calls = 0;
    await assert.rejects(deleteAuthenticatedAccount(config, session(), true, async (url) => {
      calls++;
      assert.equal(url, `${config.url}/auth/v1/user`);
      return response;
    }));
    assert.equal(calls, 1);
  }
});

test("password login does not bypass enrolled MFA", async () => {
  await assert.rejects(deleteAuthenticatedAccount(config, session(), true, async (url) => {
    assert.equal(url, `${config.url}/auth/v1/user`);
    return json({ ...user, factors: [{ status: "verified" }] });
  }), /dos factores/);
});

test("expiration while verifying the user cannot send a destructive request", async () => {
  const active = session();
  let calls = 0;
  await assert.rejects(deleteAuthenticatedAccount(config, active, true, async () => {
    calls++;
    active.expiresAt = 0;
    return json(user);
  }), /expiró/);
  assert.equal(calls, 1);
});


const receipt = { version: "account-deletion.v1", status: "queued", requestId: "00000000-0000-4000-8000-000000000001", accessRevoked: true };

test("verified confirmation queues deletion without selecting an actor or touching tables", async () => {
  const calls=[];
  const result=await deleteAuthenticatedAccount(config,session(),true,async (url,init)=>{
    calls.push(url);
    if(url.endsWith('/auth/v1/user')) return json(user);
    assert.equal(url,'/api/account-deletion');
    assert.equal(init.headers.Authorization,'Bearer test-access-token');
    assert.match(init.headers['Idempotency-Key'],/^[a-f0-9-]{36}$/);
    assert.deepEqual(JSON.parse(init.body),{version:'account-deletion.v1',confirmed:true});
    assert.equal(init.credentials,'omit');
    assert.equal(init.redirect,'error');
    return json(receipt,202);
  });
  assert.deepEqual(result,{status:'queued',requestId:receipt.requestId});
  assert.equal(calls.length,2);
});

test("lost response retries the same operation, without another identity lookup or direct cleanup",async()=>{
  const active=session(),keys=[];let identityCalls=0;
  const fetcher=async(url,init)=>{
    if(url.endsWith('/auth/v1/user')){identityCalls++;return json(user);}
    assert.equal(url,'/api/account-deletion');keys.push(init.headers['Idempotency-Key']);
    if(keys.length===1)throw Error('private network details');
    return json(receipt,202);
  };
  await assert.rejects(deleteAuthenticatedAccount(config,active,true,fetcher),/No pudimos confirmar/);
  assert.equal((await deleteAuthenticatedAccount(config,active,true,fetcher)).status,'queued');
  assert.equal(identityCalls,1);assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
});

test("only an exact 202 queued receipt means accepted; failures never use legacy cleanup",async()=>{
  for(const response of [new Response(null,{status:204}),json(receipt),json(null,202),json({...receipt,accessRevoked:false},202),json({...receipt,requestId:'invalid'},202),json({...receipt,extra:true},202),json({code:'55000',message:'cannot delete from view growth_series_points'},500)]){
    let calls=0;
    await assert.rejects(deleteAuthenticatedAccount(config,session(),true,async(url)=>{
      calls++;if(calls===1)return json(user);assert.equal(url,'/api/account-deletion');return response;
    }));assert.equal(calls,2);
  }
});

test("different sessions get separate operation keys and revoked sessions require login",async()=>{
  const keys=[];
  for(let i=0;i<2;i++)await deleteAuthenticatedAccount(config,session(),true,async(url,init)=>{
    if(url.endsWith('/auth/v1/user'))return json(user);
    keys.push(init.headers['Idempotency-Key']);return json(receipt,202);
  });assert.notEqual(keys[0],keys[1]);
  await assert.rejects(deleteAuthenticatedAccount(config,session(),true,async(url)=>url.endsWith('/auth/v1/user')?json(user):json({},401)),error=>error.requiresSignIn===true);
});

test("cancel logs out this web session only",async()=>{
  await endDeletionSession(config,session(),async(url,init)=>{
    assert.equal(url,config.url+'/auth/v1/logout?scope=local');assert.equal(init.method,'POST');
    return new Response(null,{status:204});
  });
});
