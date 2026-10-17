"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle, LockKeyhole, Trash2 } from "lucide-react";
import {
  AccountDeletionError,
  deleteAuthenticatedAccount,
  endDeletionSession,
  signInForDeletion,
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

  function cancel() {
    if (locked.current) return;
    const active = session.current;
    session.current = null;
    if (config && active) void endDeletionSession(config, active);
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
      session.current = null;
      setAccountEmail("");
      setConfirmed(false);
      setStep("success");
      void endDeletionSession(config, active);
    } catch (cause) {
      // A timeout can mean the server completed. Never retry the RPC automatically.
      session.current = null;
      setAccountEmail("");
      setConfirmed(false);
      setStep("login");
      setError(cause instanceof AccountDeletionError ? cause.message : "No pudimos confirmar el borrado. Contacta a soporte.");
      void endDeletionSession(config, active);
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
        <p>Usa el correo y la contraseña de tu cuenta de Creciendo. Iniciar sesión no elimina tu cuenta.</p>
        <label htmlFor="deletion-email">Correo electrónico</label>
        <input id="deletion-email" name="email" type="email" autoComplete="username" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
        <label htmlFor="deletion-password">Contraseña</label>
        <input id="deletion-password" name="password" type="password" autoComplete="current-password" maxLength={4096} required disabled={busy} />
        <div className="account-flow-buttons">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Verificando…" : "Iniciar sesión"}</button>
          <button type="button" className="btn btn-secondary" onClick={cancel} disabled={busy}>Cancelar</button>
        </div>
        <p className="account-auth-help">Si usas Google o Apple sin contraseña, puedes eliminar tu cuenta desde la aplicación.</p>
      </form>}

      {step === "confirm" && <form className="account-auth-form" onSubmit={remove}>
        <h2 ref={title} tabIndex={-1}>¿Eliminar tu cuenta definitivamente?</h2>
        <p>Has iniciado sesión como <strong className="account-email">{accountEmail}</strong>. Se eliminarán tu cuenta y los datos asociados, incluidos los documentos y las fotos. Esta acción no se puede deshacer.</p>
        <label className="account-confirm-check">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required disabled={busy} />
          <span>Entiendo que perderé mi cuenta y los datos asociados de forma permanente.</span>
        </label>
        <div className="account-flow-buttons">
          <button className="btn btn-danger" type="submit" disabled={busy || !confirmed}><Trash2 size={18} aria-hidden="true" />{busy ? "Eliminando…" : "Eliminar definitivamente"}</button>
          <button className="btn btn-secondary" type="button" disabled={busy} onClick={cancel}>Conservar mi cuenta</button>
        </div>
      </form>}

      {step === "success" && <div className="account-auth-form" role="status">
        <span className="essential-icon"><CheckCircle size={22} aria-hidden="true" /></span>
        <h2 ref={title} tabIndex={-1}>Tu cuenta se eliminó correctamente</h2>
        <p>La operación de eliminación de tu cuenta y los datos asociados se completó. Tu sesión en esta página se ha cerrado.</p>
      </div>}
      {error && <p className="account-flow-error" role="alert">{error}</p>}
    </div>
  );
}
