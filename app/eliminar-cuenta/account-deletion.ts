export type PublicSupabaseConfig = Readonly<{ url: string; key: string }>;
export type DeletionSession = Readonly<{
  accessToken: string;
  userId: string;
  email: string;
  expiresAt: number;
}>;
export type DeletionOutcome = { status: "queued"; requestId: string };
const deletionAttempts = new WeakMap<DeletionSession, string>();

type Fetcher = typeof fetch;
type OAuthStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const GOOGLE_FLOW_KEY = "creciendo.account-deletion.google-pkce";
const GOOGLE_FLOW_TTL = 10 * 60 * 1000;

export class AccountDeletionError extends Error {
  requiresSignIn: boolean;
  constructor(message: string, requiresSignIn = false) {
    super(message);
    this.name = "AccountDeletionError";
    this.requiresSignIn = requiresSignIn;
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
  const checkExpiry = () => {
    if (!session.accessToken || Date.now() >= session.expiresAt) {
      throw new AccountDeletionError("Tu sesión expiró. Vuelve a iniciar sesión.", true);
    }
  };
  checkExpiry();
  let key = deletionAttempts.get(session);
  if (!key) {
    // Validate before the first attempt. A retry retains this verified session/key:
    // a response may have been lost after the server revoked access.
    const userResponse = await request(fetcher, config.url + "/auth/v1/user", {
      method: "GET", headers: headers(config, session.accessToken),
    });
    if (!userResponse.ok) throw new AccountDeletionError("No pudimos validar tu sesión. Vuelve a iniciar sesión.", true);
    const user = await userResponse.json();
    if (user.id !== session.userId || user.email !== session.email || !user.email_confirmed_at || user.is_anonymous === true) {
      throw new AccountDeletionError("No pudimos validar tu identidad. Vuelve a iniciar sesión.", true);
    }
    if (Array.isArray(user.factors) && user.factors.some((factor: { status?: string }) => factor.status === "verified")) {
      throw new AccountDeletionError("Esta cuenta requiere verificación de dos factores. Continúa desde la aplicación.", true);
    }
    checkExpiry();
    key = crypto.randomUUID();
    deletionAttempts.set(session, key);
  }
  const response = await request(fetcher, "/api/account-deletion", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.accessToken, "Idempotency-Key": key },
    body: JSON.stringify({ version: "account-deletion.v1", confirmed: true }),
  });
  if (response.status === 401) {
    throw new AccountDeletionError("Tu sesión expiró. Vuelve a iniciar sesión.", true);
  }
  let receipt;
  try { receipt = await response.json(); } catch { /* Void is never a receipt. */ }
  if (response.status !== 202 || !receipt || Object.keys(receipt).sort().join(",") !== "accessRevoked,requestId,status,version" ||
    receipt.version !== "account-deletion.v1" || receipt.status !== "queued" || receipt.accessRevoked !== true ||
    typeof receipt.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(receipt.requestId)) {
    throw new AccountDeletionError("No pudimos confirmar la solicitud. Puedes reintentar sin duplicar el proceso.");
  }
  return { status: "queued", requestId: receipt.requestId };
}

export async function endDeletionSession(
  config: PublicSupabaseConfig,
  session: DeletionSession,
  fetcher: Fetcher = fetch,
): Promise<void> {
  deletionAttempts.delete(session);
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
