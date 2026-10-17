export type PublicSupabaseConfig = Readonly<{ url: string; key: string }>;
export type DeletionSession = Readonly<{
  accessToken: string;
  userId: string;
  email: string;
  expiresAt: number;
}>;

type Fetcher = typeof fetch;

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
  const data = await response.json();
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

export async function deleteAuthenticatedAccount(
  config: PublicSupabaseConfig,
  session: DeletionSession,
  confirmed: boolean,
  fetcher: Fetcher = fetch,
): Promise<void> {
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
  // Password login does not satisfy an enrolled second factor. Fail closed.
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
    throw new AccountDeletionError("No se pudo completar la eliminación. No se ha confirmado el borrado de tu cuenta.");
  }
  // Existing RPC returns void (null/empty), not an application-level success object.
  const receipt = (await response.text()).trim();
  if (receipt !== "" && receipt !== "null") {
    throw new AccountDeletionError("No pudimos confirmar el resultado del borrado. Contacta a soporte antes de reintentarlo.");
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
