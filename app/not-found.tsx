import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home, FileText, Shield, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar simplificada */}
      <header className="navbar-header">
        <div className="container navbar-container">
          <Link href="/" className="logo">
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

          <nav className="nav-menu">
            <Link href="/#funciones" className="nav-link">
              Funciones
            </Link>
            <Link href="/legal/terminos" className="nav-link">
              Términos
            </Link>
            <Link href="/legal/privacidad" className="nav-link">
              Privacidad
            </Link>
          </nav>

          <div className="nav-actions">
            <Link href="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Volver al Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", padding: "80px 0" }}>
        <div className="container center max-700">
          <div className="badge-pill" style={{ backgroundColor: "var(--brand-accent-light)", color: "var(--brand-accent)" }}>
            ERROR 404
          </div>
          <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "16px" }}>
            Página no encontrada
          </h1>
          <p className="hero-subtitle" style={{ margin: "0 auto 36px auto", maxWidth: "520px" }}>
            La ruta a la que intentas acceder no existe, ha cambiado de lugar o no está disponible en este momento.
          </p>

          <div className="hero-cta-group center" style={{ justifyContent: "center" }}>
            <Link href="/" className="btn btn-primary btn-lg">
              <Home size={18} /> Ir a la página principal
            </Link>
            <Link href="/legal/terminos" className="btn btn-secondary btn-lg">
              <FileText size={18} /> Términos de Uso
            </Link>
          </div>

          <div className="hero-trust-row" style={{ justifyContent: "center", gap: "32px", marginTop: "48px" }}>
            <Link href="/legal/privacidad" className="trust-item" style={{ color: "var(--text-muted)" }}>
              <Shield size={18} color="var(--brand-primary)" />
              <span>Política de Privacidad</span>
            </Link>
            <a href="mailto:soporte@creciendo.app" className="trust-item" style={{ color: "var(--text-muted)" }}>
              <PhoneCall size={18} color="var(--brand-primary)" />
              <span>soporte@creciendo.app</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <Image
                src="/images/creciendo-logo.png"
                alt="Creciendo"
                width={200}
                height={52}
                className="logo-img"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="brand-desc">
              Organización, claridad y acompañamiento en el crecimiento de tus hijos de 0 a 14 años.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-col">
              <h5>Producto</h5>
              <Link href="/#como-funciona">Cómo funciona</Link>
              <Link href="/#funciones">Funciones</Link>
              <Link href="/#asistente-ia">Asistente IA</Link>
              <Link href="/#creciendo-plus">Creciendo+</Link>
            </div>

            <div className="link-col">
              <h5>Transparencia</h5>
              <Link href="/legal/privacidad">Política de Privacidad</Link>
              <Link href="/legal/terminos">Términos del Servicio</Link>
            </div>

            <div className="link-col">
              <h5>Contacto</h5>
              <a href="mailto:soporte@creciendo.app">soporte@creciendo.app</a>
              <span className="footer-emergency-box">
                <PhoneCall size={16} /> Emergencias: Llama al 123
              </span>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>&copy; 2026 Creciendo App. Todos los derechos reservados. Diseñado para padres y cuidadores.</p>
        </div>
      </footer>
    </div>
  );
}
