"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  UserCheck,
  Slash,
  EyeOff,
  ShieldOff,
  Heart,
  Cpu,
  Lock,
  Key,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  CornerUpLeft,
  ChevronDown,
  ArrowUp,
  PhoneCall,
} from "lucide-react";

export default function PrivacidadPage() {
  const [activeSection, setActiveSection] = useState<string>("sec-01");
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".legal-article-block");
      let current = "sec-01";

      sections.forEach((section) => {
        const el = section as HTMLElement;
        const sectionTop = el.offsetTop - 140;
        if (window.scrollY >= sectionTop) {
          current = el.id;
        }
      });

      setActiveSection(current);
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "sec-01", label: "1. Responsable del tratamiento" },
    { id: "sec-02", label: "2. Datos que recogemos" },
    { id: "sec-03", label: "3. Datos sensibles y de niños" },
    { id: "sec-04", label: "4. Para qué usamos los datos" },
    { id: "sec-05", label: "5. Con quién compartimos los datos" },
    { id: "sec-06", label: "6. Inteligencia artificial" },
    { id: "sec-07", label: "7. Transferencias internacionales" },
    { id: "sec-08", label: "8. Seguridad" },
    { id: "sec-09", label: "9. Cuánto tiempo conservamos los datos" },
    { id: "sec-10", label: "10. Tus derechos" },
    { id: "sec-11", label: "11. Cómo ejercer tus derechos" },
    { id: "sec-12", label: "12. Permisos del dispositivo" },
    { id: "sec-13", label: "13. Cambios y vigencia" },
  ];

  return (
    <div>
      {/* Header Legal */}
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
              Producto
            </Link>
            <Link href="/legal/terminos" className="nav-link">
              Términos
            </Link>
            <Link
              href="/legal/privacidad"
              className="nav-link"
              style={{ color: "var(--brand-primary)", fontWeight: 700 }}
            >
              Privacidad
            </Link>
          </nav>

          <div className="nav-actions">
            <Link href="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Volver a Creciendo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO PRIVACIDAD */}
        <section className="hero-section" style={{ padding: "48px 0 32px 0" }}>
          <div className="container max-800">
            <div className="badge-pill">PRIVACIDAD</div>
            <h1 className="hero-title" style={{ fontSize: "2.75rem" }}>
              Política de Privacidad y Tratamiento de Datos Personales
            </h1>
            <p className="hero-subtitle">
              Qué información utiliza Creciendo, para qué se utiliza y qué
              control tienes sobre ella.
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-light)",
                fontWeight: 600,
              }}
            >
              Última actualización · 24 de septiembre de 2026
            </p>

            {/* Segmented Control Tabs */}
            <div className="segmented-control">
              <Link href="/legal/terminos" className="segmented-tab">
                Términos de Uso
              </Link>
              <Link href="/legal/privacidad" className="segmented-tab active">
                Política de Privacidad
              </Link>
            </div>

            {/* Editorial Hero Image */}
            <div className="legal-hero-img-box">
              <Image
                src="/images/legal_hero_minimal_1790440471779.jpg"
                alt="Composición editorial minimalista sobre privacidad y datos seguros"
                width={800}
                height={220}
                style={{ width: "100%", height: "220px", objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </section>

        {/* RESUMEN VISUAL DE PRIVACIDAD */}
        <section className="essential-section">
          <div className="container">
            <div
              className="section-header max-800 reveal-on-scroll"
              style={{ marginBottom: "24px" }}
            >
              <div className="section-tag">En resumen</div>
              <h2>Tu información, de forma sencilla</h2>
              <p className="section-subtitle">
                Un resumen visual para entender nuestros principios clave de
                privacidad antes de consultar la política completa.
              </p>
            </div>

            <div className="essential-grid">
              {/* Bloque 01 */}
              <div className="essential-card reveal-on-scroll reveal-delay-1">
                <div className="card-step-num">BLOQUE 01</div>
                <div className="essential-icon">
                  <UserCheck size={20} />
                </div>
                <h3>Tus datos siguen siendo tuyos</h3>
                <p>
                  La información que registras se utiliza exclusivamente para
                  prestarte las funciones organizativas de Creciendo.
                </p>
              </div>

              {/* Bloque 02 */}
              <div className="essential-card reveal-on-scroll reveal-delay-2">
                <div className="card-step-num">BLOQUE 02</div>
                <div className="essential-icon">
                  <Slash size={20} />
                </div>
                <h3>No vendemos tus datos</h3>
                <p>
                  No vendemos ni comercializamos información personal ni la
                  utilizamos para crear perfiles publicitarios de los niños.
                </p>
              </div>

              {/* Bloque 03 */}
              <div className="essential-card reveal-on-scroll reveal-delay-3">
                <div className="card-step-num">BLOQUE 03</div>
                <div className="essential-icon">
                  <EyeOff size={20} />
                </div>
                <h3>Sin publicidad basada en datos</h3>
                <p>
                  Creciendo es una experiencia limpia. No utilizamos tus datos
                  personales para mostrar anuncios o publicidad focalizada.
                </p>
              </div>

              {/* Bloque 04 */}
              <div className="essential-card reveal-on-scroll reveal-delay-4">
                <div className="card-step-num">BLOQUE 04</div>
                <div className="essential-icon">
                  <ShieldOff size={20} />
                </div>
                <h3>Puedes ejercer tus derechos</h3>
                <p>
                  Puedes solicitar acceso, corrección, actualización,
                  eliminación definitiva de cuenta y otras acciones previstas
                  por la ley.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN PRIVACY LAYOUT */}
        <section className="legal-layout-section">
          <div className="container legal-grid-container">
            {/* SIDEBAR INDEX (Sticky) */}
            <aside
              className="legal-sidebar"
              style={
                mobileMenuOpen
                  ? { display: "block", position: "relative", top: 0 }
                  : {}
              }
            >
              <div className="sidebar-title">Índice de privacidad</div>
              <nav>
                <ul className="legal-nav-list">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`legal-nav-link ${
                          activeSection === item.id ? "active" : ""
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* PRIVACY MAIN CONTENT */}
            <article className="legal-main-content">
              {/* Mobile Dropdown Index Button */}
              <div className="mobile-index-toggle">
                <button
                  className="mobile-index-btn"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span>Navegar política de privacidad</span>
                  <ChevronDown size={18} />
                </button>
              </div>

              {/* Section 01 */}
              <section id="sec-01" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 01</span>
                <h2 className="legal-article-title">
                  Responsable del tratamiento de tus datos
                </h2>
                <div className="legal-content-body">
                  <p>
                    El responsable del tratamiento de los datos personales
                    recabados a través de la aplicación Creciendo es la sociedad
                    desarrolladora de la plataforma Creciendo App (en adelante,
                    &ldquo;Creciendo&rdquo;).
                  </p>
                  <p>
                    Esta Política de Privacidad describe cómo recopilamos,
                    utilizamos, almacenamos, transmitimos y protegemos la
                    información personal de los usuarios adultos y de los menores
                    de 0 a 14 años registrados bajo su tutoría.
                  </p>
                </div>
              </section>

              {/* Section 02 */}
              <section id="sec-02" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 02</span>
                <h2 className="legal-article-title">Datos que recogemos</h2>
                <div className="legal-content-body">
                  <p>
                    Recopilamos la información estrictamente necesaria para
                    ofrecerte las funciones de organización y seguimiento de
                    Creciendo.
                  </p>

                  <div className="table-responsive-wrapper">
                    <table className="legal-table">
                      <thead>
                        <tr>
                          <th>Categoría</th>
                          <th>Qué datos incluye</th>
                          <th>Cómo los obtenemos</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-label="Categoría">
                            <strong>Datos del cuidador (Adulto)</strong>
                          </td>
                          <td data-label="Qué datos incluye">
                            Nombre, correo electrónico, método de autenticación
                            (Apple, Google o email) e idioma de preferencia.
                          </td>
                          <td data-label="Cómo los obtenemos">
                            Proporcionados voluntariamente al crear la cuenta.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Categoría">
                            <strong>Datos del menor (Hijo/a)</strong>
                          </td>
                          <td data-label="Qué datos incluye">
                            Nombre o seudónimo, fecha de nacimiento, sexo,
                            registros de peso, talla, fechas de vacunas e hitos
                            del desarrollo.
                          </td>
                          <td data-label="Cómo los obtenemos">
                            Ingresados voluntariamente por el
                            padre/madre/cuidador.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Categoría">
                            <strong>Documentos e imágenes</strong>
                          </td>
                          <td data-label="Qué datos incluye">
                            Fotografías de carnets de vacunación, recetas
                            médicas, certificaciones y órdenes médicas cargadas
                            por el usuario.
                          </td>
                          <td data-label="Cómo los obtenemos">
                            Subidos activamente por el usuario desde la cámara o
                            galería.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Categoría">
                            <strong>Interacciones con IA</strong>
                          </td>
                          <td data-label="Qué datos incluye">
                            Consultas y preguntas realizadas en el chat del
                            Asistente IA.
                          </td>
                          <td data-label="Cómo los obtenemos">
                            Procesados al usar el módulo de consulta interactiva.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Categoría">
                            <strong>Datos técnicos y de uso</strong>
                          </td>
                          <td data-label="Qué datos incluye">
                            Modelo de dispositivo, sistema operativo,
                            identificadores anónimos de fallos y registros de
                            rendimiento.
                          </td>
                          <td data-label="Cómo los obtenemos">
                            Recopilados automáticamente para el mantenimiento
                            técnico.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Section 03 */}
              <section id="sec-03" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 03</span>
                <h2 className="legal-article-title">
                  Datos sensibles e información de niños
                </h2>
                <div className="legal-content-body">
                  <div className="callout-card">
                    <h4>
                      <Heart size={18} /> Protección prioritaria de menores y
                      datos de salud
                    </h4>
                    <p>
                      Creciendo trata determinados registros sobre vacunas, peso,
                      talla y documentos médicos como información de categoría
                      sensible. Solicitamos la autorización explícita del adulto
                      responsable antes de procesar dichos registros y aplicamos
                      medidas reforzadas de confidencialidad.
                    </p>
                  </div>

                  <p>
                    Los menores de edad de 0 a 14 años no crean cuentas ni
                    utilizan directamente la aplicación. El tratamiento de los
                    datos del menor se realiza exclusivamente bajo la
                    representación, consentimiento explícito e instrucción
                    directa del adulto titular de la cuenta.
                  </p>
                  <p>
                    Creciendo no solicita ni recopila datos directamente de los
                    niños ni utiliza la información de los menores para fines
                    distintos al seguimiento autorizado por sus cuidadores.
                  </p>
                </div>
              </section>

              {/* Section 04 */}
              <section id="sec-04" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 04</span>
                <h2 className="legal-article-title">
                  Para qué usamos los datos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Utilizamos la información personal únicamente para las
                    siguientes finalidades explícitas:
                  </p>
                  <ul>
                    <li>
                      Prestar, gestionar y mantener activos las funciones y
                      servicios de Creciendo.
                    </li>
                    <li>
                      Generar curvas de crecimiento y percentiles visuales
                      basados en los datos ingresados.
                    </li>
                    <li>
                      Enviar notificaciones y recordatorios programados por el
                      usuario para vacunas y citas.
                    </li>
                    <li>
                      Procesar las consultas educativas realizadas a través del
                      Asistente con IA.
                    </li>
                    <li>
                      Procesar las compras y verificar el estado de la
                      suscripción Creciendo+.
                    </li>
                    <li>
                      Atender solicitudes de soporte técnico y peticiones de los
                      usuarios.
                    </li>
                    <li>
                      Garantizar la seguridad de la plataforma y cumplir
                      obligaciones legales aplicables.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 05 */}
              <section id="sec-05" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 05</span>
                <h2 className="legal-article-title">
                  Con quién compartimos los datos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo <strong>NO vende, NO alquila y NO comercializa</strong>{" "}
                    los datos personales de los usuarios ni de sus hijos con
                    terceros ni con agencias de publicidad.
                  </p>
                  <p>
                    Para la correcta prestación técnica del servicio, compartimos
                    datos mínimos estrictamente necesarios con proveedores de
                    infraestructura tecnológica bajo contratos de confidencialidad
                    y procesamiento de datos:
                  </p>

                  <div className="table-responsive-wrapper">
                    <table className="legal-table">
                      <thead>
                        <tr>
                          <th>Proveedor</th>
                          <th>Para qué se utiliza</th>
                          <th>Datos compartidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-label="Proveedor">
                            <strong>Supabase Inc.</strong>
                          </td>
                          <td data-label="Para qué se utiliza">
                            Almacenamiento en base de datos cifrada y
                            autenticación segura de usuarios.
                          </td>
                          <td data-label="Datos compartidos">
                            Credenciales cifradas, datos del perfil y registros
                            del usuario.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Proveedor">
                            <strong>Google LLC (Gemini API)</strong>
                          </td>
                          <td data-label="Para qué se utiliza">
                            Procesamiento de preguntas en el Asistente IA y
                            lectura de documentos.
                          </td>
                          <td data-label="Datos compartidos">
                            Texto de las consultas enviadas voluntariamente por
                            el usuario.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Proveedor">
                            <strong>Apple Inc. / Google LLC</strong>
                          </td>
                          <td data-label="Para qué se utiliza">
                            Autenticación de inicio de sesión rápido (Sign in
                            with Apple / Google).
                          </td>
                          <td data-label="Datos compartidos">
                            Token de autenticación e identificador único de
                            usuario.
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Proveedor">
                            <strong>
                              Apple App Store / Google Play
                            </strong>
                          </td>
                          <td data-label="Para qué se utiliza">
                            Procesamiento de pagos y gestión de la suscripción
                            Creciendo+.
                          </td>
                          <td data-label="Datos compartidos">
                            Estado de la transacción e ID de compra (sin ver
                            datos bancarios).
                          </td>
                        </tr>
                        <tr>
                          <td data-label="Proveedor">
                            <strong>APNs (Apple) / FCM (Google)</strong>
                          </td>
                          <td data-label="Para qué se utiliza">
                            Envío de notificaciones push de recordatorios al
                            dispositivo.
                          </td>
                          <td data-label="Datos compartidos">
                            Token anónimo del dispositivo para entrega de la
                            notificación.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Section 06 */}
              <section id="sec-06" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 06</span>
                <h2 className="legal-article-title">
                  Tratamiento mediante Inteligencia Artificial
                </h2>
                <div className="legal-content-body">
                  <div className="callout-card">
                    <h4>
                      <Cpu size={18} /> Garantías de Privacidad en el módulo de
                      IA
                    </h4>
                    <p>
                      El uso del chat interactivo y la lectura inteligente de
                      documentos requieren el procesamiento del texto ingresado
                      para generar respuestas orientativas. El permiso se otorga
                      al interactuar con el módulo y puede retirarse no
                      utilizando la función o eliminando el historial.
                    </p>
                  </div>

                  <p>
                    Las consultas enviadas al Asistente IA son procesadas a
                    través de la infraestructura segura de nuestro proveedor de
                    IA (Google Gemini Enterprise). Garantizamos que:
                  </p>
                  <ul>
                    <li>
                      Los datos de las consultas de nuestros usuarios{" "}
                      <strong>
                        NO se utilizan para entrenar modelos públicos de IA
                      </strong>
                      .
                    </li>
                    <li>
                      La interacción se limita a responder la pregunta
                      específica del usuario con fines estrictamente educativos.
                    </li>
                    <li>
                      No se vincula la identidad completa del menor en los
                      prompts enviados al procesador.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 07 */}
              <section id="sec-07" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 07</span>
                <h2 className="legal-article-title">
                  Transferencias internacionales de datos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Nuestros proveedores de infraestructura en la nube (como
                    Supabase y Google Cloud) pueden almacenar datos en servidores
                    ubicados en Estados Unidos o la Unión Europea. Nos
                    aseguramos de que todos los proveedores internacionales
                    cumplan con estándares adecuados de protección de datos
                    personales mediante cláusulas contractuales tipo o
                    certificaciones equivalentes.
                  </p>
                </div>
              </section>

              {/* Section 08 */}
              <section id="sec-08" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 08</span>
                <h2 className="legal-article-title">Medidas de Seguridad</h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo implementa medidas de seguridad técnicas, humanas
                    y administrativas para proteger la información contra acceso
                    no autorizado, pérdida, alteración o divulgación indebida:
                  </p>

                  <div className="rights-grid">
                    <div className="right-card">
                      <Lock size={20} />
                      <div>
                        <h5>Cifrado en tránsito y reposo</h5>
                        <p>
                          Uso de protocolos SSL/TLS de 256 bits para
                          transmisiones y cifrado en base de datos.
                        </p>
                      </div>
                    </div>
                    <div className="right-card">
                      <Key size={20} />
                      <div>
                        <h5>Control de accesos</h5>
                        <p>
                          Autenticación segura y aislamiento estricto de cuentas
                          entre usuarios.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 09 */}
              <section id="sec-09" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 09</span>
                <h2 className="legal-article-title">
                  Cuánto tiempo conservamos tus datos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Conservamos tu información únicamente mientras tu cuenta
                    permanezca activa y sea necesaria para prestarte el servicio.
                  </p>

                  <div className="timeline-complementary">
                    <div className="timeline-step">
                      <div className="step-circle">1</div>
                      <span className="step-label">Cuenta Activa</span>
                      <span className="step-subtext">
                        Datos disponibles y sincronizados
                      </span>
                    </div>
                    <div className="timeline-arrow">
                      <ArrowRight size={18} />
                    </div>
                    <div className="timeline-step">
                      <div className="step-circle">2</div>
                      <span className="step-label">
                        Solicitud de Eliminación
                      </span>
                      <span className="step-subtext">
                        Borrado inmediato o en máx. 30 días
                      </span>
                    </div>
                    <div className="timeline-arrow">
                      <ArrowRight size={18} />
                    </div>
                    <div className="timeline-step">
                      <div className="step-circle">3</div>
                      <span className="step-label">Registros Mínimos</span>
                      <span className="step-subtext">
                        Solo lo exigido por ley fiscal o contable
                      </span>
                    </div>
                  </div>

                  <p>
                    Si eliminas tu cuenta, tus datos personales y los de tus
                    hijos serán borrados de nuestros servidores activos en un
                    plazo máximo de 30 días, salvo aquella información financiera
                    mínima que debamos conservar por mandato legal.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="sec-10" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 10</span>
                <h2 className="legal-article-title">
                  Tus derechos sobre tus datos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Como titular de los datos personales, tienes garantizados los
                    siguientes derechos de conformidad con la ley de protección
                    de datos (Habeas Data):
                  </p>

                  <div className="rights-grid">
                    <div className="right-card">
                      <Eye size={20} />
                      <div>
                        <h5>Derecho de Conocer y Acceder</h5>
                        <p>
                          Consultar de forma gratuita qué datos personales
                          tenemos en nuestras bases de datos.
                        </p>
                      </div>
                    </div>

                    <div className="right-card">
                      <Edit2 size={20} />
                      <div>
                        <h5>Derecho de Actualizar y Rectificar</h5>
                        <p>
                          Corregir datos inexactos, parciales, incompletos o
                          desactualizados.
                        </p>
                      </div>
                    </div>

                    <div className="right-card">
                      <Trash2 size={20} />
                      <div>
                        <h5>Derecho de Supresión / Eliminación</h5>
                        <p>
                          Solicitar la eliminación definitiva de tu cuenta y de
                          los datos asociados.
                        </p>
                      </div>
                    </div>

                    <div className="right-card">
                      <CornerUpLeft size={20} />
                      <div>
                        <h5>Revocación de Autorización</h5>
                        <p>
                          Retirar el consentimiento otorgado para el tratamiento
                          de datos sensibles o funciones optativas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 11 */}
              <section id="sec-11" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 11</span>
                <h2 className="legal-article-title">
                  Cómo ejercer tus derechos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Puedes ejercer la actualización o eliminación de datos
                    directamente desde el menú de Ajustes dentro de Creciendo.
                  </p>
                  <p>
                    Para peticiones formales, consultas o reclamos de privacidad,
                    puedes escribir a nuestro Oficial de Protección de Datos al
                    correo:
                  </p>
                  <p>
                    <strong>Correo de Privacidad:</strong>{" "}
                    <a
                      href="mailto:info@creciendo.com.co"
                      style={{ color: "var(--brand-primary)", fontWeight: 700 }}
                    >
                      info@creciendo.com.co
                    </a>{" "}
                    o{" "}
                    <a
                      href="mailto:soporte@creciendo.app"
                      style={{ color: "var(--brand-primary)", fontWeight: 700 }}
                    >
                      soporte@creciendo.app
                    </a>
                  </p>
                  <p>
                    Tu solicitud será atendida dentro de los plazos legales
                    establecidos (máximo 15 días hábiles).
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section id="sec-12" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 12</span>
                <h2 className="legal-article-title">
                  Permisos requeridos en el dispositivo
                </h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo puede solicitar los siguientes permisos en tu
                    sistema operativo, los cuales puedes activar o desactivar en
                    cualquier momento desde los ajustes de tu teléfono:
                  </p>
                  <ul>
                    <li>
                      <strong>Cámara y Galería:</strong> Únicamente para capturar
                      o subir imágenes de documentos y carnets.
                    </li>
                    <li>
                      <strong>Notificaciones:</strong> Para entregarte
                      recordatorios oportunos de vacunas y citas programadas.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 13 */}
              <section id="sec-13" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 13</span>
                <h2 className="legal-article-title">
                  Cambios y vigencia de la Política
                </h2>
                <div className="legal-content-body">
                  <p>
                    Esta Política de Privacidad rige a partir del 24 de
                    septiembre de 2026. Nos reservamos el derecho de modificarla
                    en cualquier momento. Notificaremos cualquier cambio
                    relevante mediante la aplicación o por correo electrónico
                    antes de que surta efectos.
                  </p>
                </div>
              </section>

              {/* Document Navigation Link */}
              <div className="doc-navigation-bar">
                <span>¿Deseas consultar las reglas de uso del servicio?</span>
                <Link href="/legal/terminos" className="doc-nav-btn">
                  <ArrowLeft size={16} /> Volver a Términos de Uso
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* Floating Back to Top Button */}
      <button
        className={`back-to-top-btn ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Volver arriba"
      >
        <ArrowUp size={20} />
      </button>

      {/* FOOTER */}
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
              Organización, claridad y acompañamiento en el crecimiento de tus
              hijos de 0 a 14 años.
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
              <Link
                href="/legal/privacidad"
                style={{ color: "#FFF", fontWeight: 700 }}
              >
                Política de Privacidad
              </Link>
              <Link href="/legal/terminos">Términos del Servicio</Link>
              <Link href="/legal/privacidad#sec-10">Eliminar cuenta</Link>
            </div>

            <div className="link-col">
              <h5>Contacto y Emergencia</h5>
              <a href="mailto:soporte@creciendo.app">soporte@creciendo.app</a>
              <span className="footer-emergency-box">
                <PhoneCall size={16} /> Emergencias: Llama al 123
              </span>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>
            &copy; 2026 Creciendo App. Todos los derechos reservados. Diseñado
            para padres y cuidadores.
          </p>
          <p className="legal-notice">
            Descargo de responsabilidad: Creciendo es una aplicación
            organizativa e informativa. No brinda diagnósticos médicos ni
            sustituye la atención presencial de un profesional de la salud.
          </p>
        </div>
      </footer>
    </div>
  );
}
