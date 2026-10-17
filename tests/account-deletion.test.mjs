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

test("only a verified session and explicit confirmation call the existing RPC once, without IDs", async () => {
  const calls = [];
  await deleteAuthenticatedAccount(config, session(), true, async (url, init) => {
    calls.push(url);
    assert.equal(init.headers.Authorization, "Bearer test-access-token");
    assert.equal(init.headers.apikey, config.key);
    if (calls.length === 1) return json(user);
    assert.equal(init.method, "POST");
    assert.equal(init.body, "{}");
    return new Response(null, { status: 204 });
  });
  assert.deepEqual(calls, [`${config.url}/auth/v1/user`, `${config.url}/rest/v1/rpc/delete_user_account`]);
});

test("RPC error, unexpected result and ambiguous network failures never become success or automatic fallback", async () => {
  for (const outcome of [() => json({ message: "database internals" }, 500), () => json({ success: false }), () => { throw Error("network"); }]) {
    let calls = 0;
    await assert.rejects(deleteAuthenticatedAccount(config, session(), true, async () => {
      calls++;
      if (calls === 1) return json(user);
      return outcome();
    }));
    assert.equal(calls, 2);
  }
});

test("cancel/logout only ends this web session, never invokes deletion", async () => {
  await endDeletionSession(config, session(), async (url, init) => {
    assert.equal(url, `${config.url}/auth/v1/logout?scope=local`);
    assert.equal(init.method, "POST");
    return new Response(null, { status: 204 });
  });
});

const directUser = { ...user, id: "11111111-1111-4111-8111-111111111111" };
const spaceId = "22222222-2222-4222-8222-222222222222";
const childId = "33333333-3333-4333-8333-333333333333";
const viewFailure = () => json({ code: "55000", message: 'cannot delete from view "growth_series_points"' }, 500);
const rows = (data) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Content-Range": `0-${Math.max(0, data.length - 1)}/${data.length}` } });
const directSession = () => ({ ...session(), userId: directUser.id });

function cleanupMock(overrides = {}) {
  const calls = [];
  let rpcCalls = 0;
  const fetcher = async (address, init) => {
    const url = new URL(address);
    const path = url.pathname;
    calls.push({ url, init });
    assert.equal(init.headers.Authorization, "Bearer test-access-token");
    if (path === "/auth/v1/user") return json(directUser);
    if (path === "/rest/v1/rpc/delete_user_account") {
      rpcCalls++;
      return rpcCalls === 1 ? viewFailure() : (overrides.finalRpc?.() ?? json(null));
    }
    if (path === "/storage/v1/object/list/avatars") {
      assert.equal(JSON.parse(init.body).prefix, `${directUser.id}/`);
      return json(overrides.avatars ?? [{ id: "photo-id", name: "avatar.jpg" }]);
    }
    if (path === "/storage/v1/object/avatars") {
      assert.equal(init.method, "DELETE");
      const { prefixes } = JSON.parse(init.body);
      assert.deepEqual(prefixes, [`${directUser.id}/avatar.jpg`]);
      return json(prefixes.map((name) => ({ name })));
    }
    if (init.method === "PATCH") {
      assert.equal(path, "/rest/v1/children");
      assert.equal(url.searchParams.get("created_by"), `eq.${directUser.id}`);
      assert.equal(url.searchParams.get("care_space_id"), `eq.${spaceId}`);
      assert.deepEqual(JSON.parse(init.body), { status: "archived" });
      if (overrides.archiveFailure) return json({ error: "patch blocked" }, 403);
      return json(overrides.archiveResult ?? [{ id: url.searchParams.get("id")?.slice(3), status: "archived" }]);
    }
    if (init.method === "DELETE") {
      assert.ok(url.searchParams.size > 1, "Every table delete must have filters");
      assert.equal(url.searchParams.get("select"), path.endsWith("guardian_profiles") ? "user_id" : "id");
      assert.ok(!["growth_series_points", "auth.users", "audit_logs"].some((name) => path.endsWith(name)));
      assert.ok(!url.searchParams.has("sender_id"));
      if (overrides.deleteFailure?.(path)) return json(overrides.deleteError ?? { error: "blocked" }, overrides.deleteStatus ?? 403);
      return json(path.endsWith("children") ? [{ id: childId }] : path.endsWith("care_spaces") ? [{ id: url.searchParams.get("id")?.slice(3) }] : []);
    }
    if (path === "/rest/v1/care_spaces") return rows(overrides.spaces ?? [{ id: spaceId, created_by: directUser.id }]);
    const requestedSpace = url.searchParams.get("care_space_id")?.slice(3);
    if (path === "/rest/v1/children") return rows(overrides.childrenBySpace?.[requestedSpace] ?? overrides.children ?? [{ id: childId, care_space_id: spaceId, created_by: directUser.id }]);
    if (path === "/rest/v1/care_space_members") return rows(overrides.membersBySpace?.[requestedSpace] ?? overrides.members ?? [{ user_id: directUser.id }]);
    if (path === "/rest/v1/child_access") return rows([{ user_id: directUser.id }]);
    if (path === "/rest/v1/clinical_memory_legal_holds") return rows(overrides.holds ?? []);
    assert.fail(`Unexpected request: ${path}`);
  };
  return { calls, fetcher };
}

test("known rolled-back view error activates scoped mobile cleanup then Auth RPC, never an unfiltered delete", async () => {
  const { calls, fetcher } = cleanupMock();
  await deleteAuthenticatedAccount(config, directSession(), true, fetcher);
  const deletes = calls.filter(({ init }) => init.method === "DELETE");
  assert.ok(deletes.some(({ url }) => url.pathname === "/rest/v1/children"));
  assert.ok(deletes.some(({ url }) => url.pathname === "/storage/v1/object/avatars"));
  for (const { url } of deletes) {
    if (url.searchParams.has("child_id")) {
      assert.equal(url.searchParams.get("child_id"), `eq.${childId}`);
      assert.equal(url.searchParams.get("care_space_id"), `eq.${spaceId}`);
    }
  }
  assert.equal(calls.filter(({ url }) => url.pathname.endsWith("/rpc/delete_user_account")).length, 2);
  assert.equal(calls.at(-1).url.pathname, "/rest/v1/rpc/delete_user_account");
});

test("shared or foreign scopes and legal holds abort before any direct DELETE", async () => {
  for (const overrides of [
    { spaces: [{ id: spaceId, created_by: "foreign-user" }], members: [] },
    { members: [{ user_id: directUser.id }, { user_id: "foreign-user" }] },
    { children: [{ id: childId, care_space_id: spaceId, created_by: "foreign-user" }] },
    { holds: [{ id: "legal-hold" }] },
    { avatars: [{ id: "photo", name: "../foreign-photo.jpg" }] },
  ]) {
    const { calls, fetcher } = cleanupMock(overrides);
    await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, fetcher), /No se inició/);
    assert.equal(calls.filter(({ init }) => init.method === "DELETE").length, 0);
    assert.equal(calls.filter(({ url }) => url.pathname.endsWith("/rpc/delete_user_account")).length, 1);
  }
});

test("an owned space without membership rows does not block mobile-compatible cleanup", async () => {
  const { calls, fetcher } = cleanupMock({ members: [] });
  await deleteAuthenticatedAccount(config, directSession(), true, fetcher);
  const spaceDelete = calls.find(({ url, init }) => url.pathname === "/rest/v1/care_spaces" && init.method === "DELETE");
  assert.ok(spaceDelete);
  assert.equal(spaceDelete.url.searchParams.get("created_by"), `eq.${directUser.id}`);
  assert.equal(calls.at(-1).url.pathname, "/rest/v1/rpc/delete_user_account");
});

test("one owned populated space plus an owned empty space can be processed in the same cleanup", async () => {
  const emptySpace = "44444444-4444-4444-8444-444444444444";
  const { calls, fetcher } = cleanupMock({
    spaces: [{ id: spaceId, created_by: directUser.id }, { id: emptySpace, created_by: directUser.id }],
    membersBySpace: { [emptySpace]: [] },
    childrenBySpace: { [emptySpace]: [] },
  });
  await deleteAuthenticatedAccount(config, directSession(), true, fetcher);
  const spaceDeletes = calls.filter(({ url, init }) => url.pathname === "/rest/v1/care_spaces" && init.method === "DELETE");
  assert.deepEqual(spaceDeletes.map(({ url }) => url.searchParams.get("id")), [`eq.${spaceId}`, `eq.${emptySpace}`]);
  assert.ok(spaceDeletes.every(({ url }) => url.searchParams.get("created_by") === `eq.${directUser.id}`));
});

test("failed direct DELETE stops the sequence and reports irreversible partial progress, not success", async () => {
  const { calls, fetcher } = cleanupMock({ deleteFailure: (path) => path.endsWith("anthropometric_measurements") });
  await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, fetcher), /eliminación quedó incompleta/);
  assert.equal(calls.at(-1).url.pathname, "/rest/v1/anthropometric_measurements");
  assert.equal(calls.filter(({ url }) => url.pathname.endsWith("/rpc/delete_user_account")).length, 1);
});

test("successful direct cleanup cannot claim account deletion when final Auth RPC still fails", async () => {
  const { calls, fetcher } = cleanupMock({ finalRpc: () => json({ code: "42703" }, 400) });
  await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, fetcher), /servidor no pudo completar/);
  assert.equal(calls.filter(({ url }) => url.pathname.endsWith("/rpc/delete_user_account")).length, 2);
});

test("missing exact-count scope information aborts without direct writes", async () => {
  const { calls, fetcher } = cleanupMock();
  await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, async (url, init) => {
    if (new URL(url).pathname === "/rest/v1/care_spaces") return json([]);
    return fetcher(url, init);
  }), /No se inició/);
  assert.equal(calls.filter(({ init }) => init.method === "DELETE").length, 0);
});

test("immutable growth history archives pending owned profiles without claiming Auth deletion", async () => {
  const secondChild = "55555555-5555-4555-8555-555555555555";
  const { calls, fetcher } = cleanupMock({
    children: [childId, secondChild].map((id) => ({ id, care_space_id: spaceId, created_by: directUser.id })),
    deleteFailure: (path) => path.endsWith("anthropometric_measurements"),
    deleteError: { code: "42501", message: "anthropometry_history_immutable" },
  });
  const outcome = await deleteAuthenticatedAccount(config, directSession(), true, fetcher);
  assert.deepEqual(outcome, { status: "archived", archivedProfiles: 2 });
  const blockedIndex = calls.findIndex(({ url, init }) => url.pathname.endsWith("anthropometric_measurements") && init.method === "DELETE");
  const remaining = calls.slice(blockedIndex + 1);
  assert.equal(remaining.length, 2);
  assert.ok(remaining.every(({ init }) => init.method === "PATCH"));
  assert.deepEqual(remaining.map(({ url }) => url.searchParams.get("id")), [`eq.${childId}`, `eq.${secondChild}`]);
  assert.equal(calls.filter(({ url }) => url.pathname.endsWith("/rpc/delete_user_account")).length, 1);
});

test("failed or unconfirmed archival remains an incomplete operation", async () => {
  for (const failure of [{ archiveFailure: true }, { archiveResult: [] }, { archiveResult: [{ id: childId, status: "active" }] }]) {
    const { fetcher } = cleanupMock({
      ...failure,
      deleteFailure: (path) => path.endsWith("anthropometric_measurements"),
      deleteError: { code: "42501", message: "anthropometry_history_immutable" },
    });
    await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, fetcher), /eliminación quedó incompleta/);
  }
});

test("an unrelated permission error cannot activate the archival fallback", async () => {
  const { calls, fetcher } = cleanupMock({
    deleteFailure: (path) => path.endsWith("anthropometric_measurements"),
    deleteError: { code: "42501", message: "permission denied" },
  });
  await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, fetcher), /eliminación quedó incompleta/);
  assert.equal(calls.filter(({ init }) => init.method === "PATCH").length, 0);
});

test("restricted chat events archive pending profiles without deleting the events or retrying Auth", async () => {
  const secondChild = "55555555-5555-4555-8555-555555555555";
  const { calls, fetcher } = cleanupMock({
    children: [childId, secondChild].map((id) => ({ id, care_space_id: spaceId, created_by: directUser.id })),
    deleteFailure: (path) => path.endsWith("agent_sessions"),
    deleteStatus: 409,
    deleteError: {
      code: "23503",
      message: 'update or delete on table "agent_sessions" violates foreign key constraint "creciendo_channel_events_session_scope_fk" on table "creciendo_channel_events"',
    },
  });
  const result = await deleteAuthenticatedAccount(config, directSession(), true, fetcher);
  assert.deepEqual(result, { status: "archived", archivedProfiles: 2 });
  const blockedIndex = calls.findIndex(({ url, init }) => url.pathname.endsWith("agent_sessions") && init.method === "DELETE");
  const remaining = calls.slice(blockedIndex + 1);
  assert.equal(remaining.length, 2);
  assert.ok(remaining.every(({ init, url }) => init.method === "PATCH" && url.pathname === "/rest/v1/children"));
  assert.equal(calls.filter(({ url }) => url.pathname.endsWith("creciendo_channel_events")).length, 0);
  assert.equal(calls.filter(({ url }) => url.pathname.endsWith("/rpc/delete_user_account")).length, 1);
});

test("unrecognized FK failures still stop instead of archiving or deleting dependencies", async () => {
  const { calls, fetcher } = cleanupMock({
    deleteFailure: (path) => path.endsWith("agent_sessions"),
    deleteStatus: 409,
    deleteError: { code: "23503", message: 'foreign key constraint "unknown_constraint"' },
  });
  await assert.rejects(deleteAuthenticatedAccount(config, directSession(), true, fetcher), /eliminación quedó incompleta/);
  assert.equal(calls.filter(({ init }) => init.method === "PATCH").length, 0);
});
