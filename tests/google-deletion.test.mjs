import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  clearGoogleDeletionFlow,
  startGoogleDeletionSignIn,
  finishGoogleDeletionSignIn,
} from "../app/eliminar-cuenta/account-deletion.ts";

const config = { url: "https://example.supabase.co", key: "sb_publishable_test" };
const origin = "https://www.creciendo.com.co";
const callback = `${origin}/eliminar-cuenta?code=test-code`;
const user = { id: "google-user", email: "guardian@example.invalid", email_confirmed_at: "2026-01-01", identities: [{ provider: "google" }] };
const json = (data, status = 200) => Response.json(data, { status });
const failIfCalled = async () => { assert.fail("No request should be sent"); };
function storage() {
  const entries = new Map();
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
}

test("Google uses a random PKCE S256 challenge and an exact same-origin return, never a client-selected redirect", async () => {
  const store = storage();
  const url = new URL(await startGoogleDeletionSignIn(config, origin, store));
  const flow = JSON.parse([...store.entries.values()][0]);
  assert.equal(url.origin, config.url);
  assert.equal(url.pathname, "/auth/v1/authorize");
  assert.equal(url.searchParams.get("provider"), "google");
  assert.equal(url.searchParams.get("redirect_to"), `${origin}/eliminar-cuenta`);
  assert.equal(url.searchParams.get("prompt"), "select_account");
  assert.equal(url.searchParams.get("code_challenge_method"), "s256");
  assert.equal(url.searchParams.get("code_challenge"), createHash("sha256").update(flow.verifier).digest("base64url"));
  assert.equal(flow.verifier.length, 86);
  assert.ok(!url.href.includes(flow.verifier));
  assert.deepEqual(Object.keys(flow).sort(), ["createdAt", "project", "redirectTo", "verifier"]);
  await startGoogleDeletionSignIn(config, origin, store);
  assert.notEqual(JSON.parse([...store.entries.values()][0]).verifier, flow.verifier);
});

test("Google startup rejects insecure origins and unavailable browser storage", async () => {
  for (const origin of ["http://www.creciendo.com.co", "https://www.creciendo.com.co/foreign", "https://user:password@www.creciendo.com.co"]) {
    await assert.rejects(startGoogleDeletionSignIn(config, origin, storage()));
  }
  await assert.rejects(startGoogleDeletionSignIn(config, origin, { ...storage(), setItem() { throw Error("storage blocked"); } }));
});

test("Google callback authenticates and validates identity only; never calls the deletion RPC", async () => {
  const store = storage();
  await startGoogleDeletionSignIn(config, origin, store);
  const flow = JSON.parse([...store.entries.values()][0]);
  const calls = [];
  const active = await finishGoogleDeletionSignIn(config, callback, store, async (url, init) => {
    calls.push(url);
    assert.equal(init.credentials, "omit");
    assert.equal(init.cache, "no-store");
    assert.equal(store.entries.size, 0);
    if (calls.length === 1) {
      assert.equal(url, `${config.url}/auth/v1/token?grant_type=pkce`);
      assert.deepEqual(JSON.parse(init.body), { auth_code: "test-code", code_verifier: flow.verifier });
      return json({ access_token: "google-access", refresh_token: "never-persist", expires_in: 3600, user });
    }
    assert.equal(url, `${config.url}/auth/v1/user`);
    assert.equal(init.headers.Authorization, "Bearer google-access");
    return json(user);
  });
  assert.equal(active.userId, user.id);
  assert.equal(active.email, user.email);
  assert.equal(calls.length, 2);
  assert.equal(store.entries.size, 0);
  assert.ok(!JSON.stringify(active).includes("never-persist"));
  await assert.rejects(finishGoogleDeletionSignIn(config, callback, store, failIfCalled), /no se inició/);
});

test("missing, expired, mismatched and malformed PKCE transactions cannot exchange a code", async () => {
  const edits = [
    (flow) => ({ ...flow, createdAt: Date.now() - 600_001 }),
    (flow) => ({ ...flow, createdAt: Date.now() + 60_000 }),
    (flow) => ({ ...flow, project: "https://other.supabase.co" }),
    (flow) => ({ ...flow, redirectTo: "https://foreign.invalid/eliminar-cuenta" }),
    (flow) => ({ ...flow, verifier: "short" }),
    () => null,
  ];
  for (const edit of edits) {
    const store = storage();
    await startGoogleDeletionSignIn(config, origin, store);
    const [key, value] = [...store.entries][0];
    store.setItem(key, JSON.stringify(edit(JSON.parse(value))));
    await assert.rejects(finishGoogleDeletionSignIn(config, callback, store, failIfCalled));
    assert.equal(store.entries.size, 0);
  }
});

test("provider cancellation, implicit tokens, duplicate and absent codes never authenticate or delete", async () => {
  for (const suffix of ["?error=access_denied&error_description=sensitive-provider-text", "#error=access_denied", "#access_token=untrusted", "?code=a&code=b", "?code=", ""]) {
    const store = storage();
    await startGoogleDeletionSignIn(config, origin, store);
    await assert.rejects(finishGoogleDeletionSignIn(config, `${origin}/eliminar-cuenta${suffix}`, store, failIfCalled), (error) => {
      assert.ok(!error.message.includes("sensitive-provider-text"));
      return true;
    });
    assert.equal(store.entries.size, 0);
  }
});

test("failed code exchange is consumed without retry or raw provider error leakage", async () => {
  const store = storage();
  await startGoogleDeletionSignIn(config, origin, store);
  let calls = 0;
  await assert.rejects(finishGoogleDeletionSignIn(config, callback, store, async () => {
    calls++;
    return json({ error_description: "sensitive internals" }, 400);
  }), { message: "No pudimos verificar el acceso con Google. Vuelve a intentarlo." });
  assert.equal(calls, 1);
  assert.equal(store.entries.size, 0);
});

test("a foreign Google identity is rejected and its temporary session is ended", async () => {
  const store = storage();
  await startGoogleDeletionSignIn(config, origin, store);
  const calls = [];
  await assert.rejects(finishGoogleDeletionSignIn(config, callback, store, async (url) => {
    calls.push(url);
    if (calls.length === 1) return json({ access_token: "google-access", expires_in: 3600, user });
    if (calls.length === 2) return json({ ...user, id: "foreign-user" });
    assert.equal(url, `${config.url}/auth/v1/logout?scope=local`);
    return new Response(null, { status: 204 });
  }), /validar la cuenta/);
  assert.equal(calls.length, 3);
});

test("cancel clears the pending Google flow without touching Auth", async () => {
  const store = storage();
  await startGoogleDeletionSignIn(config, origin, store);
  clearGoogleDeletionFlow(store);
  assert.equal(store.entries.size, 0);
});
