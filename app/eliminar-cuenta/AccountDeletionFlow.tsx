"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle, LockKeyhole, Trash2 } from "lucide-react";
import {
  AccountDeletionError,
  clearGoogleDeletionFlow,
  deleteAuthenticatedAccount,
  endDeletionSession,
  finishGoogleDeletionSignIn,
  signInForDeletion,
  startGoogleDeletionSignIn,
} from "./account-deletion";
import type { DeletionSession, PublicSupabaseConfig } from "./account-deletion";

export default function AccountDeletionFlow({ config }: { config: PublicSupabaseConfig | null }) {
  const [step, setStep] = useState<"public" | "login" | "confirm" | "success">("public");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const session = useRef<DeletionSession | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  const title = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previousStep = useRef(step);
  const googleCallback = useRef<Promise<DeletionSession> | null>(null);

  useEffect(() => {
    if (step !== "public") title.current?.focus();
    else if (previousStep.current !== "public") trigger.current?.focus();
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const active = session.current;
      session.current = null;
      if (config && active) void endDeletionSession(config, active);
    };
  }, [config]);

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      // Browser Back can restore the page from before the provider redirect.
      if (event.persisted && !session.current) {
        try { clearGoogleDeletionFlow(window.sessionStorage); } catch { /* Storage may be disabled. */ }
        locked.current = false;
        setBusy(false);
        setStep("login");
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (!googleCallback.current) {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      if (!url.searchParams.has("code") && !url.searchParams.has("error") && !hash.has("error") && !hash.has("access_token")) return;
      // Never retain OAuth codes, tokens or provider errors in history/referrers.
      window.history.replaceState(null, "", "/eliminar-cuenta");
      locked.current = true;
      googleCallback.current = Promise.resolve().then(() => {
        if (!config) throw new AccountDeletionError("No pudimos conectar con el servicio de cuentas. Contacta a soporte.");
        return finishGoogleDeletionSignIn(config, url.href, window.sessionStorage);
      });
    }
    let listening = true;
    void Promise.resolve().then(() => {
      if (listening) {
        setStep("login");
        setBusy(true);
        setError("");
      }
    });
    void googleCallback.current.then((active) => {
      if (!listening) {
        if (!mounted.current && config) void endDeletionSession(config, active);
        return;
      }
      session.current = active;
      setAccountEmail(active.email);
      setConfirmed(false);
      setStep("confirm");
    }).catch((cause) => {
      if (listening) {
        setStep("login");
        setError(cause instanceof AccountDeletionError ? cause.message : "No pudimos completar el acceso con Google. Vuelve a intentarlo.");
      }
    }).finally(() => {
      if (listening) {
        locked.current = false;
        setBusy(false);
      }
    });
    // Reuse the same exchange during StrictMode effect replay; codes are one-use.
    return () => { listening = false; };
  }, [config]);

  useEffect(() => {
    if (step !== "confirm" || busy) return;
    const timeout = window.setTimeout(() => {
      const active = session.current;
      session.current = null;
      if (config && active) void endDeletionSession(config, active);
      setAccountEmail("");
      setConfirmed(false);
      setError("Tu sesión expiró. Vuelve a iniciar sesión para continuar.");
      setStep("login");
    }, Math.max(0, (session.current?.expiresAt ?? Date.now()) - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [step, config, busy]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config || locked.current) return;
    const form = event.currentTarget;
    const passwordField = form.elements.namedItem("password") as HTMLInputElement;
    const password = passwordField.value;
    passwordField.value = "";
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const active = await signInForDeletion(config, email, password);
      if (!mounted.current) {
        void endDeletionSession(config, active);
        return;
      }
      session.current = active;
      setEmail("");
      setAccountEmail(active.email);
      setConfirmed(false);
      setStep("confirm");
    } catch (cause) {
      setError(cause instanceof AccountDeletionError ? cause.message : "No pudimos iniciar sesión. Inténtalo de nuevo.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function loginWithGoogle() {
    if (!config || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const destination = await startGoogleDeletionSignIn(config, window.location.origin, window.sessionStorage);
      if (!mounted.current) return;
      window.location.assign(destination);
    } catch {
      // Do not expose provider details or browser storage errors.
      setError("No pudimos abrir el acceso con Google. Permite el almacenamiento de esta pestaña e inténtalo de nuevo.");
      locked.current = false;
      setBusy(false);
    }
  }

  function cancel() {
    if (locked.current) return;
    const active = session.current;
    session.current = null;
    if (config && active) void endDeletionSession(config, active);
    try { clearGoogleDeletionFlow(window.sessionStorage); } catch { /* No credentials stored. */ }
    setEmail("");
    setAccountEmail("");
    setConfirmed(false);
    setError("");
    setStep("public");
  }

  async function remove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config || !session.current || !confirmed || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    const active = session.current;
    try {
      await deleteAuthenticatedAccount(config, active, confirmed);
      if (!mounted.current || session.current !== active) return;
      session.current = null;
      setAccountEmail("");
      setConfirmed(false);
      setStep("success");
      void endDeletionSession(config, active);
    } catch (cause) {
      if (!mounted.current || session.current !== active) return;
      // Keep the verified session and stable key after an ambiguous response.
      // The user can retry the same request without creating another job.
      if (cause instanceof AccountDeletionError && cause.requiresSignIn) {
        session.current = null;
        setAccountEmail("");
        setConfirmed(false);
        setStep("login");
        void endDeletionSession(config, active);
      }
      setError(cause instanceof AccountDeletionError ? cause.message : "No pudimos confirmar la solicitud. Puedes reintentar.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="account-delete-action" aria-busy={busy}>
      {step === "public" && <>
        <button ref={trigger} className="btn btn-danger btn-lg" type="button" onClick={() => {
          if (!config) {
            setError("No pudimos conectar con el servicio de cuentas. Contacta a soporte.");
            return;
          }
          setError("");
          setStep("login");
        }}><Trash2 size={18} aria-hidden="true" /> Eliminar mi cuenta</button>
        <p>Primero iniciarás sesión. Tu cuenta no se eliminará hasta que lo confirmes.</p>
      </>}

      {step === "login" && <form className="account-auth-form" onSubmit={login}>
        <span className="essential-icon"><LockKeyhole size={20} aria-hidden="true" /></span>
        <h2 ref={title} tabIndex={-1}>Inicia sesión para continuar</h2>
        <p>Usa la misma cuenta con la que entras a Creciendo. Iniciar sesión no elimina tu cuenta.</p>
        <button className="btn btn-secondary account-google-button" type="button" disabled={busy} onClick={loginWithGoogle}>
          <span className="account-google-mark" aria-hidden="true">G</span>
          Continuar con Google
        </button>
        <div className="account-auth-divider"><span>o con tu correo y contraseña</span></div>
        <label htmlFor="deletion-email">Correo electrónico</label>
        <input id="deletion-email" name="email" type="email" autoComplete="username" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
        <label htmlFor="deletion-password">Contraseña</label>
        <input id="deletion-password" name="password" type="password" autoComplete="current-password" maxLength={4096} required disabled={busy} />
        <div className="account-flow-buttons">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Verificando…" : "Iniciar sesión"}</button>
          <button type="button" className="btn btn-secondary" onClick={cancel} disabled={busy}>Cancelar</button>
        </div>
        <p className="account-auth-help">Si tu cuenta usa exclusivamente Apple, continúa desde la aplicación.</p>
      </form>}

      {step === "confirm" && <form className="account-auth-form" onSubmit={remove}>
        <h2 ref={title} tabIndex={-1}>¿Seguro que quieres eliminar tu cuenta?</h2>
        <p>Has iniciado sesión como <strong className="account-email">{accountEmail}</strong>.</p>
        <p>Al confirmar, se bloqueará tu acceso. Después se eliminarán los chats y sus copias internas y, por último, los datos y fotos de los niños de los que eres el único tutor. El proceso se ejecuta por lotes periódicos.</p>
        <p>Los perfiles compartidos con otro tutor se conservarán para esa persona. Los datos eliminados no podrán recuperarse.</p>
        <label className="account-confirm-check">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required disabled={busy} />
          <span>Confirmo que quiero eliminar mi cuenta y entiendo que esta acción es irreversible.</span>
        </label>
        <div className="account-flow-buttons">
          <button className="btn btn-danger" type="submit" disabled={busy || !confirmed}><Trash2 size={18} aria-hidden="true" />{busy ? "Confirmando…" : "Confirmar eliminación"}</button>
          <button className="btn btn-secondary" type="button" disabled={busy} onClick={cancel}>Conservar mi cuenta</button>
        </div>
      </form>}

      {step === "success" && <div className="account-auth-form" role="status">
        <span className="essential-icon"><CheckCircle size={22} aria-hidden="true" /></span>
        <h2 ref={title} tabIndex={-1}>Solicitud de eliminación recibida</h2>
        <p>Tu acceso quedó bloqueado y cerramos la sesión de esta página. El borrado de los chats y los datos continúa por etapas; no necesitas enviar otra solicitud.</p>
      </div>}
      {error && <p className="account-flow-error" role="alert">{error}</p>}
    </div>
  );
}
