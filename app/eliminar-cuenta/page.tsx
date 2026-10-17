import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, LockKeyhole, Trash2 } from "lucide-react";

export const metadata = {
  title: "Eliminar cuenta | Creciendo",
  description:
    "Información sobre la eliminación permanente de tu cuenta de Creciendo.",
};

export default function EliminarCuentaPage() {
  return (
    <div>
      <header className="navbar-header">
        <div className="container navbar-container">
          <Link href="/" className="logo" aria-label="Creciendo, inicio">
            <Image
              src="/images/creciendo-logo.png"
              alt="Creciendo"
              width={200}
              height={52}
              className="logo-img"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <nav className="nav-menu" aria-label="Navegación principal">
            <Link href="/#funciones" className="nav-link">Producto</Link>
            <Link href="/legal/terminos" className="nav-link">Términos</Link>
            <Link href="/legal/privacidad" className="nav-link">Privacidad</Link>
          </nav>
          <div className="nav-actions">
            <Link href="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Volver a Creciendo
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section account-delete-hero">
          <div className="container max-800">
            <div className="badge-pill"><Trash2 size={15} /> CUENTA</div>
            <h1 className="hero-title">Eliminar cuenta</h1>
            <p className="hero-subtitle">
              Tienes el control de tu cuenta. Aquí puedes revisar qué implica
              eliminarla de Creciendo.
            </p>

            <div className="account-delete-card">
              <div className="account-delete-icon"><AlertTriangle size={24} /></div>
              <div>
                <h2>Esta acción es permanente</h2>
                <p>
                  Al eliminar tu cuenta, perderás el acceso a Creciendo y a la
                  información asociada. No podrás recuperar la cuenta una vez
                  completado el proceso.
                </p>
              </div>
            </div>

            <div className="account-delete-details">
              <div className="account-delete-detail">
                <span className="essential-icon"><LockKeyhole size={20} /></span>
                <div>
                  <h3>Tu acceso</h3>
                  <p>Ya no podrás iniciar sesión en tu cuenta de Creciendo.</p>
                </div>
              </div>
              <div className="account-delete-detail">
                <span className="essential-icon"><Trash2 size={20} /></span>
                <div>
                  <h3>Tu información</h3>
                  <p>
                    La información personal asociada a tu cuenta será tratada
                    conforme a nuestra{" "}
                    <Link href="/legal/privacidad">Política de Privacidad</Link>.
                  </p>
                </div>
              </div>
            </div>

            <div className="account-delete-action">
              <button className="btn btn-danger btn-lg" type="button" disabled>
                <Trash2 size={18} /> Eliminar mi cuenta
              </button>
              <p>La eliminación es permanente y no se puede deshacer.</p>
            </div>

            <div className="account-delete-back">
              <Link href="/legal/privacidad" className="doc-nav-btn">
                <ArrowLeft size={16} /> Volver a Privacidad
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <Image src="/images/creciendo-logo.png" alt="Creciendo" width={200} height={52} className="logo-img" style={{ width: "auto" }} />
            </Link>
            <p className="brand-desc">Organización, claridad y acompañamiento en el crecimiento de tus hijos de 0 a 14 años.</p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h5>Transparencia</h5>
              <Link href="/legal/privacidad">Política de Privacidad</Link>
              <Link href="/legal/terminos">Términos del Servicio</Link>
              <Link href="/eliminar-cuenta">Eliminar cuenta</Link>
            </div>
            <div className="link-col">
              <h5>Contacto</h5>
              <a href="mailto:estebanp192001@gmail.com">estebanp192001@gmail.com</a>
              <a href="tel:+573168858161">+57 316 885 8161</a>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>&copy; 2026 Creciendo App. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
