export type PublicSupabaseConfig = Readonly<{ url: string; key: string }>;
export type DeletionSession = Readonly<{
  accessToken: string;
  userId: string;
  email: string;
  expiresAt: number;
}>;
export type DeletionOutcome =
  | { status: "deleted" }
  | { status: "archived"; archivedProfiles: number };

class ImmutableAnthropometryError extends Error {}

type Fetcher = typeof fetch;
type OAuthStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const GOOGLE_FLOW_KEY = "creciendo.account-deletion.google-pkce";
const GOOGLE_FLOW_TTL = 10 * 60 * 1000;

export class AccountDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionError";
  }
}

// Called on the server: only validated public configuration reaches the client.
export function getPublicSupabaseConfig(
  url: string | undefined,
  key: string | undefined,
): PublicSupabaseConfig | null {
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      !/^[a-z0-9]+\.supabase\.co$/.test(parsed.hostname) ||
      parsed.username || parsed.password || parsed.port ||
      parsed.search || parsed.hash || parsed.pathname !== "/"
    ) return null;

    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
      const payload = key.split(".")[1];
      const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      if (claims.role !== "anon" || claims.ref !== parsed.hostname.split(".")[0]) return null;
    }
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

function headers(config: PublicSupabaseConfig, accessToken?: string) {
  return {
    apikey: config.key,
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function request(
  fetcher: Fetcher,
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetcher(url, {
      ...init,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new AccountDeletionError(
      "No pudimos confirmar el resultado de la operación. Revisa tu conexión antes de continuar.",
    );
  }
}

export async function signInForDeletion(
  config: PublicSupabaseConfig,
  email: string,
  password: string,
  fetcher: Fetcher = fetch,
): Promise<DeletionSession> {
  const response = await request(fetcher, `${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!response.ok) {
    throw new AccountDeletionError(
      response.status === 429
        ? "Demasiados intentos. Espera unos minutos antes de volver a intentar."
        : "No pudimos iniciar sesión. Revisa tu correo y contraseña.",
    );
  }
  return deletionSessionFromResponse(await response.json());
}

function deletionSessionFromResponse(data: {
  access_token?: unknown;
  expires_in?: unknown;
  user?: { id?: unknown; email?: unknown; email_confirmed_at?: unknown; is_anonymous?: unknown };
}): DeletionSession {
  if (
    typeof data.access_token !== "string" || !data.access_token ||
    typeof data.user?.id !== "string" || !data.user.id ||
    typeof data.user?.email !== "string" || !data.user.email ||
    typeof data.expires_in !== "number" || data.expires_in <= 0 ||
    !data.user.email_confirmed_at || data.user.is_anonymous === true
  ) {
    throw new AccountDeletionError("No pudimos verificar la sesión. Vuelve a iniciar sesión.");
  }
  return {
    accessToken: data.access_token,
    userId: data.user.id,
    email: data.user.email,
    expiresAt: Date.now() + Math.min(data.expires_in, 600) * 1000,
  };
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function clearGoogleDeletionFlow(storage: OAuthStorage): void {
  storage.removeItem(GOOGLE_FLOW_KEY);
}

export async function startGoogleDeletionSignIn(
  config: PublicSupabaseConfig,
  origin: string,
  storage: OAuthStorage,
): Promise<string> {
  const site = new URL(origin);
  if (site.origin !== origin || (site.protocol !== "https:" && !(site.protocol === "http:" && ["localhost", "127.0.0.1"].includes(site.hostname)))) {
    throw new AccountDeletionError("Inicia sesión desde la web segura de Creciendo.");
  }
  // Web Crypto only: never downgrade PKCE to plain or Math.random().
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  const redirectTo = `${site.origin}/eliminar-cuenta`;
  storage.setItem(GOOGLE_FLOW_KEY, JSON.stringify({ verifier, createdAt: Date.now(), project: config.url, redirectTo }));
  const url = new URL(`${config.url}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectTo);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "s256");
  url.searchParams.set("prompt", "select_account");
  return url.href;
}

export async function finishGoogleDeletionSignIn(
  config: PublicSupabaseConfig,
  callbackUrl: string,
  storage: OAuthStorage,
  fetcher: Fetcher = fetch,
): Promise<DeletionSession> {
  const saved = storage.getItem(GOOGLE_FLOW_KEY);
  // Consume even on error. A callback/reload cannot replay the exchange.
  clearGoogleDeletionFlow(storage);
  const url = new URL(callbackUrl);
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has("error") || fragment.has("error")) {
    throw new AccountDeletionError("El acceso con Google se canceló o no pudo completarse. Tu cuenta no se ha eliminado.");
  }
  let flow;
  try { flow = JSON.parse(saved ?? "null"); } catch { /* Invalid browser state is not authority. */ }
  if (
    !flow || flow.project !== config.url ||
    flow.redirectTo !== `${url.origin}${url.pathname}` || url.pathname !== "/eliminar-cuenta" ||
    typeof flow.createdAt !== "number" || !Number.isFinite(flow.createdAt) ||
    Date.now() < flow.createdAt || Date.now() - flow.createdAt >= GOOGLE_FLOW_TTL ||
    typeof flow.verifier !== "string" || !/^[A-Za-z0-9_-]{86}$/.test(flow.verifier) ||
    fragment.has("access_token") || fragment.has("refresh_token")
  ) {
    throw new AccountDeletionError("El acceso con Google expiró o no se inició en esta pestaña. Vuelve a intentarlo.");
  }
  const codes = url.searchParams.getAll("code");
  if (codes.length !== 1 || !/^[A-Za-z0-9_-]{1,4096}$/.test(codes[0])) {
    throw new AccountDeletionError("No pudimos verificar el retorno de Google. Vuelve a iniciar sesión.");
  }
  const response = await request(fetcher, `${config.url}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify({ auth_code: codes[0], code_verifier: flow.verifier }),
  });
  if (!response.ok) throw new AccountDeletionError("No pudimos verificar el acceso con Google. Vuelve a intentarlo.");
  const session = deletionSessionFromResponse(await response.json());
  // Validate the server identity before displaying the account to be deleted.
  try {
    const userResponse = await request(fetcher, `${config.url}/auth/v1/user`, {
      method: "GET",
      headers: headers(config, session.accessToken),
    });
    if (!userResponse.ok) throw new AccountDeletionError("No pudimos validar tu sesión de Google.");
    const user = await userResponse.json();
    if (
      user.id !== session.userId || user.email !== session.email ||
      !user.email_confirmed_at || user.is_anonymous === true ||
      !Array.isArray(user.identities) || !user.identities.some((identity: { provider?: string }) => identity.provider === "google")
    ) {
      throw new AccountDeletionError("No pudimos validar la cuenta de Google. Vuelve a iniciar sesión.");
    }
    return session;
  } catch (cause) {
    await endDeletionSession(config, session, fetcher);
    throw cause;
  }
}

export async function deleteAuthenticatedAccount(
  config: PublicSupabaseConfig,
  session: DeletionSession,
  confirmed: boolean,
  fetcher: Fetcher = fetch,
): Promise<DeletionOutcome> {
  if (!confirmed) throw new AccountDeletionError("Confirma que deseas eliminar tu cuenta.");
  if (!session.accessToken || Date.now() >= session.expiresAt) {
    throw new AccountDeletionError("Tu sesión expiró. Vuelve a iniciar sesión.");
  }
  // Verify with Auth, not a locally decoded JWT or a user ID supplied to the RPC.
  const userResponse = await request(fetcher, `${config.url}/auth/v1/user`, {
    method: "GET",
    headers: headers(config, session.accessToken),
  });
  if (!userResponse.ok) throw new AccountDeletionError("No pudimos validar tu sesión. Vuelve a iniciar sesión.");
  const user = await userResponse.json();
  if (user.id !== session.userId || !user.email_confirmed_at || user.is_anonymous === true) {
    throw new AccountDeletionError("No pudimos validar tu identidad. Vuelve a iniciar sesión.");
  }
  // Neither password nor Google login satisfies an enrolled second factor.
  if (Array.isArray(user.factors) && user.factors.some((factor: { status?: string }) => factor.status === "verified")) {
    throw new AccountDeletionError("Esta cuenta requiere verificación de dos factores. Continúa desde la aplicación.");
  }
  if (Date.now() >= session.expiresAt) {
    throw new AccountDeletionError("Tu sesión expiró. Vuelve a iniciar sesión.");
  }

  const response = await request(fetcher, `${config.url}/rest/v1/rpc/delete_user_account`, {
    method: "POST",
    headers: headers(config, session.accessToken),
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    let failure;
    try { failure = await response.json(); } catch { /* Unknown failures must not trigger direct writes. */ }
    if (response.status === 500 && failure?.code === "55000" && failure?.message === 'cannot delete from view "growth_series_points"') {
      // Explicit mobile-compatible recovery for this known, rolled-back SQL failure only.
      // Never run it for timeouts, auth failures or an unknown RPC result.
      const cleanup = await deleteAccountDataDirectly(config, session, fetcher);
      if (cleanup.status === "archived") return cleanup;
      const finalResponse = await request(fetcher, `${config.url}/rest/v1/rpc/delete_user_account`, {
        method: "POST",
        headers: headers(config, session.accessToken),
        body: JSON.stringify({}),
      });
      if (!finalResponse.ok) {
        throw new AccountDeletionError("La limpieza directa se ejecutó, pero el servidor no pudo completar la eliminación de la cuenta. Contacta a soporte antes de reintentar.");
      }
      const finalReceipt = (await finalResponse.text()).trim();
      if (finalReceipt !== "" && finalReceipt !== "null") {
        throw new AccountDeletionError("Se procesó la limpieza, pero no pudimos confirmar la eliminación de la cuenta. Contacta a soporte.");
      }
      return { status: "deleted" };
    }
    throw new AccountDeletionError("No se pudo completar la eliminación. No se ha confirmado el borrado de tu cuenta.");
  }
  // Existing RPC returns void (null/empty), not an application-level success object.
  const receipt = (await response.text()).trim();
  if (receipt !== "" && receipt !== "null") {
    throw new AccountDeletionError("No pudimos confirmar el resultado del borrado. Contacta a soporte antes de reintentarlo.");
  }
  return { status: "deleted" };
}

async function deleteAccountDataDirectly(
  config: PublicSupabaseConfig,
  session: DeletionSession,
  fetcher: Fetcher,
): Promise<{ status: "cleaned" } | { status: "archived"; archivedProfiles: number }> {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(session.userId)) throw new AccountDeletionError("No pudimos verificar el alcance de la limpieza.");
  let writesStarted = false;
  const scopedRequest = async (path: string, init: RequestInit = {}) => {
    if (Date.now() >= session.expiresAt) throw new Error("expired");
    const response = await request(fetcher, `${config.url}${path}`, {
      ...init,
      headers: { ...headers(config, session.accessToken), ...init.headers },
    });
    if (!response.ok) {
      let failure;
      try { failure = await response.json(); } catch { /* Unknown errors cannot activate archival. */ }
      if (response.status === 403 && failure?.code === "42501" && failure?.message === "anthropometry_history_immutable") {
        throw new ImmutableAnthropometryError();
      }
      throw new Error("cleanup_failed");
    }
    return response;
  };
  const readAll = async (table: string, select: string, filters: Record<string, string>) => {
    const rows: Record<string, unknown>[] = [];
    let total = 0;
    do {
      const query = new URLSearchParams({ select, ...filters, limit: "100", offset: String(rows.length) });
      const response = await scopedRequest(`/rest/v1/${table}?${query}`, { headers: { Prefer: "count=exact" } });
      const count = response.headers.get("content-range")?.split("/")[1];
      if (!count || !/^\d+$/.test(count)) throw new Error("unknown_scope");
      total = Number(count);
      const batch = await response.json();
      if (!Array.isArray(batch) || (!batch.length && rows.length < total)) throw new Error("incomplete_scope");
      rows.push(...batch);
      if (rows.length > 10_000) throw new Error("scope_too_large");
    } while (rows.length < total);
    return rows;
  };
  const removeRows = async (table: string, filters: Record<string, string>, expectedId?: string) => {
    const identityColumn = table === "guardian_profiles" ? "user_id" : "id";
    const query = new URLSearchParams({ select: identityColumn, ...filters });
    writesStarted = true;
    const response = await scopedRequest(`/rest/v1/${table}?${query}`, {
      method: "DELETE", headers: { Prefer: "return=representation" },
    });
    const removed = await response.json();
    if (!Array.isArray(removed) || (expectedId && !removed.some((row) => row[identityColumn] === expectedId))) throw new Error("unconfirmed_delete");
  };
  try {
    // Collect and check the entire scope before the first irreversible REST call.
    const spaces = await readAll("care_spaces", "id,created_by", { created_by: `eq.${session.userId}` });
    const children = await readAll("children", "id,care_space_id,created_by", { created_by: `eq.${session.userId}` });
    const spaceIds = new Set(spaces.map((row) => row.id));
    for (const space of spaces) {
      if (typeof space.id !== "string" || !uuid.test(space.id) || space.created_by !== session.userId) throw new Error("foreign_scope");
      const members = await readAll("care_space_members", "user_id", { care_space_id: `eq.${space.id}` });
      // Membership rows can be absent on a space created by this guardian.
      // Do not require a self-membership merely to clean up an owned space.
      // Server authorization still governs every read and filtered DELETE.
      if (members.some((member) => member.user_id !== session.userId)) throw new Error("shared_scope");
      const allChildren = await readAll("children", "id,created_by", { care_space_id: `eq.${space.id}` });
      if (allChildren.some((child) => child.created_by !== session.userId || !children.some((owned) => owned.id === child.id))) throw new Error("foreign_scope");
    }
    for (const child of children) {
      if (typeof child.id !== "string" || !uuid.test(child.id) || typeof child.care_space_id !== "string" || !spaceIds.has(child.care_space_id) || child.created_by !== session.userId) throw new Error("foreign_scope");
      const access = await readAll("child_access", "user_id", { child_id: `eq.${child.id}`, care_space_id: `eq.${child.care_space_id}` });
      if (access.some((row) => row.user_id !== session.userId)) throw new Error("shared_scope");
      const holds = await readAll("clinical_memory_legal_holds", "id", { child_id: `eq.${child.id}`, care_space_id: `eq.${child.care_space_id}` });
      if (holds.length) throw new Error("retention_hold");
    }

    // Same avatar namespace used by the native uploader: <guardianId>/<filename>.
    // List first; never send a bucket-wide prefix or delete storage.objects rows.
    const avatarPaths: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const listed = await scopedRequest("/storage/v1/object/list/avatars", {
        method: "POST",
        body: JSON.stringify({ prefix: `${session.userId}/`, limit: 100, offset, sortBy: { column: "name", order: "asc" } }),
      });
      const objects = await listed.json();
      if (!Array.isArray(objects)) throw new Error("invalid_storage_scope");
      for (const object of objects) {
        if (!object.id || typeof object.name !== "string" || !object.name || object.name.includes("/") || object.name === "." || object.name === "..") throw new Error("invalid_storage_scope");
        avatarPaths.push(`${session.userId}/${object.name}`);
      }
      if (objects.length < 100) break;
      if (avatarPaths.length >= 10_000) throw new Error("scope_too_large");
    }

    for (const [index, child] of children.entries()) {
      const filters = { child_id: `eq.${child.id}`, care_space_id: `eq.${child.care_space_id}` };
      // Port of the mobile direct cleanup, using current actor column names.
      // Archival has a separate result; it must never be described as deletion.
      try {
        for (const table of [
          "messages", "tool_executions", "safety_evaluations",
          "clinical_memory_embeddings", "clinical_memory_items", "conversation_summaries",
          "agent_sessions", "anthropometric_measurements", "development_observations",
          "vaccine_administrations", "child_food_reactions", "consent_records", "documents",
          "child_access",
        ]) await removeRows(table, filters);
        await removeRows("children", { id: `eq.${child.id}`, care_space_id: `eq.${child.care_space_id}`, created_by: `eq.${session.userId}` }, child.id as string);
      } catch (cause) {
        if (!(cause instanceof ImmutableAnthropometryError)) throw cause;
        let archivedProfiles = 0;
        // Stop destructive cleanup. Archive only the still-pending verified scope.
        for (const pending of children.slice(index)) {
          const query = new URLSearchParams({ select: "id,status", id: `eq.${pending.id}`, care_space_id: `eq.${pending.care_space_id}`, created_by: `eq.${session.userId}` });
          writesStarted = true;
          const response = await scopedRequest(`/rest/v1/children?${query}`, {
            method: "PATCH",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify({ status: "archived" }),
          });
          const archived = await response.json();
          if (!Array.isArray(archived) || archived.length !== 1 || archived[0].id !== pending.id || archived[0].status !== "archived") throw new Error("unconfirmed_archive");
          archivedProfiles++;
        }
        // Keep Auth, memberships, profile and retained files. No final delete RPC.
        return { status: "archived", archivedProfiles };
      }
    }
    // Do this before removing memberships/profile, while Storage authorization exists.
    for (let index = 0; index < avatarPaths.length; index += 100) {
      writesStarted = true;
      const response = await scopedRequest("/storage/v1/object/avatars", {
        method: "DELETE", body: JSON.stringify({ prefixes: avatarPaths.slice(index, index + 100) }),
      });
      const removed = await response.json();
      const expected = avatarPaths.slice(index, index + 100);
      if (!Array.isArray(removed) || !expected.every((path) => removed.some((object) => object.name === path))) throw new Error("unconfirmed_storage_delete");
    }
    await removeRows("messages", { actor_user_id: `eq.${session.userId}` });
    await removeRows("care_space_members", { user_id: `eq.${session.userId}` });
    for (const space of spaces) await removeRows("care_spaces", { id: `eq.${space.id}`, created_by: `eq.${session.userId}` }, space.id as string);
    await removeRows("guardian_profiles", { user_id: `eq.${session.userId}` });
    await removeRows("audit_events", { actor_user_id: `eq.${session.userId}` });
    return { status: "cleaned" };
  } catch {
    throw new AccountDeletionError(writesStarted
      ? "La eliminación quedó incompleta: algunos registros pueden haberse eliminado o archivado, pero no se confirmó la eliminación de tu cuenta. Contacta a soporte antes de reintentar."
      : "No pudimos comprobar que la limpieza directa afecte solo a tu cuenta. No se inició esa limpieza. Contacta a soporte.");
  }
}

export async function endDeletionSession(
  config: PublicSupabaseConfig,
  session: DeletionSession,
  fetcher: Fetcher = fetch,
): Promise<void> {
  try {
    // Do not log out other devices when the user only cancels the web flow.
    await request(fetcher, `${config.url}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: headers(config, session.accessToken),
    });
  } catch {
    // Auth may already have removed the user. Local memory is cleared by caller.
  }
}
