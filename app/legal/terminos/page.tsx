"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Heart,
  Cpu,
  Shield,
  PlusCircle,
  AlertTriangle,
  PhoneCall,
  CreditCard,
  ChevronDown,
  ArrowUp,
} from "lucide-react";

export default function TerminosPage() {
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
    { id: "sec-01", label: "1. Quiénes somos y aceptación" },
    { id: "sec-02", label: "2. Qué es Creciendo" },
    { id: "sec-03", label: "3. Quién puede usar Creciendo" },
    { id: "sec-04", label: "4. Aviso médico importante" },
    { id: "sec-05", label: "5. Asistente con IA" },
    { id: "sec-06", label: "6. Tu cuenta" },
    { id: "sec-07", label: "7. Tu información y tus documentos" },
    { id: "sec-08", label: "8. Suscripción Creciendo+" },
    { id: "sec-09", label: "9. Uso permitido" },
    { id: "sec-10", label: "10. Propiedad intelectual" },
    { id: "sec-11", label: "11. Disponibilidad y cambios" },
    { id: "sec-12", label: "12. Limitación de responsabilidad" },
    { id: "sec-13", label: "13. Terminación" },
    { id: "sec-14", label: "14. Cambios a estos Términos" },
    { id: "sec-15", label: "15. Ley aplicable y reclamos" },
    { id: "sec-16", label: "16. Usuarios de iPhone y iPad" },
    { id: "sec-17", label: "17. Contacto" },
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
            <Link
              href="/legal/terminos"
              className="nav-link"
              style={{ color: "var(--brand-primary)", fontWeight: 700 }}
            >
              Términos
            </Link>
            <Link href="/legal/privacidad" className="nav-link">
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
        {/* HERO LEGAL */}
        <section className="hero-section" style={{ padding: "48px 0 32px 0" }}>
          <div className="container max-800">
            <div className="badge-pill">LEGAL</div>
            <h1 className="hero-title" style={{ fontSize: "2.75rem" }}>
              Términos de Uso
            </h1>
            <p className="hero-subtitle">
              Las reglas para utilizar Creciendo, explicadas de forma clara y
              disponibles siempre que las necesites.
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
              <Link href="/legal/terminos" className="segmented-tab active">
                Términos de Uso
              </Link>
              <Link href="/legal/privacidad" className="segmented-tab">
                Política de Privacidad
              </Link>
            </div>

            {/* Editorial Hero Image */}
            <div className="legal-hero-img-box">
              <Image
                src="/images/legal_hero_minimal_1790440471779.jpg"
                alt="Composición editorial minimalista sobre organización y serenidad"
                width={800}
                height={220}
                style={{ width: "100%", height: "220px", objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </section>

        {/* BLOQUE "LO ESENCIAL" */}
        <section className="essential-section">
          <div className="container">
            <div
              className="section-header max-800 reveal-on-scroll"
              style={{ marginBottom: "24px" }}
            >
              <div className="section-tag">En resumen</div>
              <h2>Lo esencial</h2>
              <p className="section-subtitle">
                Este resumen facilita la lectura, pero no reemplaza los Términos
                completos que encuentras a continuación.
              </p>
            </div>

            <div className="essential-grid">
              {/* Card 1 */}
              <div className="essential-card reveal-on-scroll reveal-delay-1">
                <div className="card-step-num">01</div>
                <div className="essential-icon">
                  <Heart size={20} />
                </div>
                <h3>No somos un servicio médico</h3>
                <p>
                  Creciendo organiza información y ofrece contenido educativo.
                  No reemplaza la atención ni el diagnóstico de un profesional de
                  la salud.
                </p>
              </div>

              {/* Card 2 */}
              <div className="essential-card reveal-on-scroll reveal-delay-2">
                <div className="card-step-num">02</div>
                <div className="essential-icon">
                  <Cpu size={20} />
                </div>
                <h3>La IA puede equivocarse</h3>
                <p>
                  El asistente con IA ofrece orientación exclusivamente
                  educativa y no constituye una consulta médica con el pediatra.
                </p>
              </div>

              {/* Card 3 */}
              <div className="essential-card reveal-on-scroll reveal-delay-3">
                <div className="card-step-num">03</div>
                <div className="essential-icon">
                  <Shield size={20} />
                </div>
                <h3>Tus datos siguen siendo tuyos</h3>
                <p>
                  Mantienes el control absoluto. Puedes gestionar, exportar o
                  eliminar tu información de la app cuando lo desees.
                </p>
              </div>

              {/* Card 4 */}
              <div className="essential-card reveal-on-scroll reveal-delay-4">
                <div className="card-step-num">04</div>
                <div className="essential-icon">
                  <PlusCircle size={20} />
                </div>
                <h3>Suscripción Creciendo+</h3>
                <p>
                  Cuesta US$10 al mes, procesado a través de Apple o Google, con
                  renovación automática hasta que decidas cancelarla.
                </p>
              </div>
            </div>

            {/* Emergency Callout Card */}
            <div
              className="emergency-callout-card max-800 reveal-on-scroll"
              style={{ marginLeft: "auto", marginRight: "auto" }}
            >
              <div className="emergency-callout-icon">
                <AlertTriangle size={20} />
              </div>
              <div className="emergency-callout-text">
                <h4>Emergencias de salud</h4>
                <p>
                  Creciendo no debe utilizarse para situaciones urgentes o
                  críticas. Ante una emergencia médica, llama de inmediato al{" "}
                  <strong>123</strong> o acude al servicio de urgencias más
                  cercano.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN LEGAL LAYOUT */}
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
              <div className="sidebar-title">Índice de contenido</div>
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

            {/* LEGAL MAIN CONTENT */}
            <article className="legal-main-content">
              {/* Mobile Dropdown Index Button */}
              <div className="mobile-index-toggle">
                <button
                  className="mobile-index-btn"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span>Navegar secciones legales</span>
                  <ChevronDown size={18} />
                </button>
              </div>

              {/* Section 01 */}
              <section id="sec-01" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 01</span>
                <h2 className="legal-article-title">
                  Quiénes somos y aceptación de estos Términos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Estos Términos de Uso regulan el acceso y uso de la
                    aplicación móvil Creciendo y de los servicios relacionados
                    ofrecidos a través de la aplicación. Al crear una cuenta,
                    descargar la aplicación o utilizar Creciendo, confirmas que
                    has leído, entendido y aceptado estos Términos de Uso en su
                    totalidad.
                  </p>
                  <p>
                    Si no estás de acuerdo con estos Términos, no debes
                    descargar, instalar ni utilizar la aplicación.
                  </p>
                </div>
              </section>

              {/* Section 02 */}
              <section id="sec-02" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 02</span>
                <h2 className="legal-article-title">Qué es Creciendo</h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo es una herramienta tecnológica para dispositivos
                    móviles diseñada para ayudar a padres, madres y cuidadores
                    adultos a organizar, guardar y realizar un seguimiento
                    personal de la información relacionada con el crecimiento, la
                    salud y el desarrollo de sus hijos de 0 a 14 años.
                  </p>
                  <p>Las funciones principales de Creciendo incluyen, entre otras:</p>
                  <ul>
                    <li>
                      Registro e historial de vacunas aplicadas y recordatorios de
                      vacunas pendientes.
                    </li>
                    <li>
                      Registro de controles médicos, observaciones y notas
                      personales.
                    </li>
                    <li>
                      Seguimiento de datos de peso, talla y percentiles con fines
                      puramente informativos.
                    </li>
                    <li>
                      Almacenamiento y organización de documentos, exámenes e
                      imágenes cargados por el usuario.
                    </li>
                    <li>
                      Creación de recordatorios de citas, tratamientos y eventos
                      familiares.
                    </li>
                    <li>
                      Interacción con un asistente basado en inteligencia
                      artificial para consultar información general sobre
                      crianza y salud infantil.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 03 */}
              <section id="sec-03" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 03</span>
                <h2 className="legal-article-title">
                  Quién puede usar Creciendo
                </h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo está diseñada exclusivamente para ser utilizada
                    por personas adultas (mayores de edad según la ley aplicable
                    en su país de residencia) que actúen como padres, madres,
                    tutores legales o cuidadores autorizados de un niño o niña de
                    0 a 14 años.
                  </p>
                  <p>
                    Los niños no son los usuarios finales ni deben usar la
                    aplicación directamente. El adulto responsable es quien
                    administra la cuenta, carga la información y toma las
                    decisiones sobre el uso del servicio.
                  </p>
                  <p>
                    Al registrarte en Creciendo, declaras que tienes al menos 18
                    años (o la mayoría de edad aplicable) y que cuentas con la
                    facultad legal o autorización suficiente para gestionar la
                    información del menor que registras en la aplicación.
                  </p>
                </div>
              </section>

              {/* Section 04 */}
              <section id="sec-04" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 04</span>
                <h2 className="legal-article-title">
                  Aviso médico importante: Creciendo NO es un servicio de salud
                </h2>
                <div className="legal-content-body">
                  <p>Por favor, lee este apartado con especial atención:</p>

                  <div className="callout-card">
                    <h4>
                      <AlertCircle size={18} /> Descargo de responsabilidad
                      médica
                    </h4>
                    <p>
                      Creciendo NO es un prestador de servicios de salud, NO es
                      una clínica, NO es una EPS, NO ofrece diagnósticos médicos,
                      NO prescribe medicamentos ni tratamientos, y NO reemplaza
                      las consultas, revisiones, diagnósticos o recomendaciones
                      de un médico pediatra o profesional de la salud
                      cualificado.
                    </p>
                  </div>

                  <p>
                    La información, gráficos, alertas de vacunas, percentiles,
                    recordatorios y contenidos generados por la inteligencia
                    artificial de Creciendo tienen carácter únicamente
                    informativo, organizativo y educativo.
                  </p>

                  <div
                    className="emergency-callout-card"
                    style={{ margin: "24px 0" }}
                  >
                    <div className="emergency-callout-icon">
                      <PhoneCall size={18} />
                    </div>
                    <div className="emergency-callout-text">
                      <h4>¿Qué hacer en caso de emergencia?</h4>
                      <p>
                        Si tu hijo o cualquier persona presenta síntomas graves,
                        fiebre alta persistente, dificultad para respirar,
                        accidentes, convulsiones o cualquier situación de
                        emergencia médica, debes llamar inmediatamente a la línea
                        de emergencias <strong>123</strong> o acudir al centro de
                        salud o urgencias más cercano. Nunca uses Creciendo para
                        buscar auxilio médico de urgencia.
                      </p>
                    </div>
                  </div>

                  <p>
                    Nunca ignores, postergues o desatiendas un consejo médico
                    profesional ni evites acudir al pediatra por causa de algo
                    que hayas leído o consultado dentro de Creciendo.
                  </p>
                </div>
              </section>

              {/* Section 05 */}
              <section id="sec-05" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 05</span>
                <h2 className="legal-article-title">
                  Asistente con Inteligencia Artificial (IA)
                </h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo incluye una función de asistente basado en modelos
                    de inteligencia artificial para ayudarte a responder
                    preguntas generales sobre etapas de desarrollo, vacunas,
                    alimentación y cuidados infantiles.
                  </p>

                  <div className="callout-card">
                    <h4>
                      <Cpu size={18} /> Naturaleza del Asistente IA
                    </h4>
                    <p>
                      La inteligencia artificial genera respuestas automatizadas
                      procesando lenguaje natural. La IA NO es un médico, NO
                      conoce el examen físico del niño y puede cometer errores,
                      generar información incompleta o desactualizada.
                    </p>
                  </div>

                  <p>
                    Las respuestas del asistente con IA deben tomarse
                    exclusivamente como una guía educativa y punto de referencia
                    para conversar posteriormente con tu pediatra. Creciendo no
                    se hace responsable de las decisiones de salud tomadas de
                    forma autónoma con base en las respuestas del asistente de
                    IA.
                  </p>
                </div>
              </section>

              {/* Section 06 */}
              <section id="sec-06" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 06</span>
                <h2 className="legal-article-title">Tu cuenta y seguridad</h2>
                <div className="legal-content-body">
                  <p>
                    Para utilizar Creciendo debes crear una cuenta personal. Eres
                    responsable de mantener la confidencialidad de tus
                    credenciales de acceso (correo, contraseña o métodos de
                    autenticación mediante terceros como Apple o Google) y de
                    todas las actividades que ocurran bajo tu cuenta.
                  </p>
                  <p>
                    Te comprometes a notificar de inmediato a Creciendo si
                    sospechas un uso no autorizado de tu cuenta o cualquier falla
                    de seguridad.
                  </p>
                </div>
              </section>

              {/* Section 07 */}
              <section id="sec-07" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 07</span>
                <h2 className="legal-article-title">
                  Tu información y tus documentos
                </h2>
                <div className="legal-content-body">
                  <p>
                    La información, datos de salud, textos, fotos y documentos
                    que registres o cargues en Creciendo son de tu propiedad.
                    Creciendo no reclama la propiedad de tus datos personales ni
                    de los de tus hijos.
                  </p>
                  <p>
                    Al ingresar información en la app, nos otorgas una licencia
                    limitada, no exclusiva, mundial y libre de regalías
                    únicamente para almacenar, procesar, transmitir y mostrar
                    dicha información con la finalidad estricta de prestarte los
                    servicios de la aplicación, de conformidad con nuestra
                    Política de Privacidad.
                  </p>
                  <p>
                    Puedes exportar tu información o solicitar la eliminación
                    completa de tu cuenta en cualquier momento desde los ajustes
                    de la aplicación.
                  </p>
                </div>
              </section>

              {/* Section 08 */}
              <section id="sec-08" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 08</span>
                <h2 className="legal-article-title">Suscripción Creciendo+</h2>
                <div className="legal-content-body">
                  <p>
                    Creciendo ofrece una versión con funciones básicas y una
                    modalidad de suscripción premium denominada{" "}
                    <strong>Creciendo+</strong>.
                  </p>

                  <div className="callout-card">
                    <h4>
                      <CreditCard size={18} /> Condiciones de Creciendo+
                    </h4>
                    <p>
                      El precio actual de Creciendo+ es de{" "}
                      <strong>US$10 mensuales</strong> (o el equivalente en
                      moneda local más impuestos aplicables según la tienda de
                      aplicaciones de tu país).
                    </p>
                  </div>

                  <ul>
                    <li>
                      <strong>Cobro y renovación:</strong> El pago se procesará a
                      través de tu cuenta de Apple App Store o Google Play Store
                      al confirmar la compra. La suscripción se renueva
                      automáticamente cada mes a menos que la desactives al menos
                      24 horas antes del final del periodo vigente.
                    </li>
                    <li>
                      <strong>Cancelación:</strong> Puedes cancelar tu
                      suscripción en cualquier momento desde los ajustes de
                      suscripción de tu dispositivo Apple o Google. Si cancelas,
                      mantendrás el acceso a Creciendo+ hasta que finalice el
                      ciclo mensual pagado. No se realizan reembolsos parciales
                      por periodos no utilizados salvo que la ley local disponga
                      expresamente lo contrario.
                    </li>
                    <li>
                      <strong>Pruebas gratuitas:</strong> Si se ofrece un periodo
                      de prueba gratuita, este se convertirá automáticamente en
                      una suscripción de pago al finalizar el plazo, a menos que
                      canceles antes de que expire dicho periodo de prueba.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 09 */}
              <section id="sec-09" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 09</span>
                <h2 className="legal-article-title">
                  Uso permitido de la aplicación
                </h2>
                <div className="legal-content-body">
                  <p>
                    Te comprometes a hacer un uso diligente y legal de Creciendo.
                    Queda expresamente prohibido:
                  </p>
                  <ul>
                    <li>
                      Utilizar Creciendo para fines ilícitos, ilegales o no
                      autorizados por estos Términos.
                    </li>
                    <li>
                      Cargar datos de menores sobre los cuales no poseas la
                      representación legal o autorización necesaria.
                    </li>
                    <li>
                      Intentar descompilar, realizar ingeniería inversa, hackear o
                      vulnerar la seguridad de la aplicación.
                    </li>
                    <li>
                      Cargar virus, código malicioso o archivos que puedan
                      interrumpir el correcto funcionamiento de la plataforma.
                    </li>
                    <li>
                      Utilizar herramientas automatizadas (bots o scrapers) para
                      extraer datos de la plataforma.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 10 */}
              <section id="sec-10" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 10</span>
                <h2 className="legal-article-title">Propiedad intelectual</h2>
                <div className="legal-content-body">
                  <p>
                    Todos los derechos de propiedad intelectual sobre la
                    aplicación Creciendo, sus marcas, logos, diseño de interfaz,
                    código fuente, textos explicativos, gráficos e iconos son
                    propiedad exclusiva de Creciendo o de sus licenciantes.
                  </p>
                  <p>
                    El uso de la aplicación no te concede ningún derecho de
                    propiedad ni licencia sobre nuestras marcas o activos
                    visuales fuera del uso estrictamente personal de la
                    aplicación conforme a estos Términos.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section id="sec-11" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 11</span>
                <h2 className="legal-article-title">
                  Disponibilidad y cambios en el servicio
                </h2>
                <div className="legal-content-body">
                  <p>
                    Trabajamos constantemente para garantizar la disponibilidad
                    continua de Creciendo. No obstante, el servicio puede verse
                    interrumpido ocasionalmente por labores de mantenimiento,
                    actualizaciones técnicas o fallas en las redes de
                    telecomunicaciones ajenas a nuestro control.
                  </p>
                  <p>
                    Nos reservamos el derecho de modificar, actualizar, añadir o
                    retirar funciones de la aplicación para mejorar el servicio o
                    adaptarlo a exigencias legales y técnicas.
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section id="sec-12" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 12</span>
                <h2 className="legal-article-title">
                  Limitación de responsabilidad
                </h2>
                <div className="legal-content-body">
                  <p>
                    En la máxima medida permitida por la legislación aplicable,
                    Creciendo no será responsable por daños directos, indirectos,
                    incidentales o consecuentes que resulten de:
                  </p>
                  <ul>
                    <li>
                      La falta de atención médica oportuna por confiar
                      indebidamente en la información de la app.
                    </li>
                    <li>
                      Decisiones médicas tomadas sin consultar a un profesional
                      de la salud.
                    </li>
                    <li>
                      Imprecisiones o errores en las respuestas generadas por la
                      inteligencia artificial.
                    </li>
                    <li>
                      Pérdida de datos derivada del mal uso del dispositivo por
                      parte del usuario o de fallas en el almacenamiento local
                      del dispositivo.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 13 */}
              <section id="sec-13" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 13</span>
                <h2 className="legal-article-title">Terminación</h2>
                <div className="legal-content-body">
                  <p>
                    Puedes dejar de utilizar Creciendo en cualquier momento
                    eliminando tu cuenta y desinstalando la aplicación.
                  </p>
                  <p>
                    Creciendo se reserva el derecho de suspender o cerrar tu
                    cuenta en caso de incumplimiento grave de estos Términos de
                    Uso o por requerimiento de autoridad competente.
                  </p>
                </div>
              </section>

              {/* Section 14 */}
              <section id="sec-14" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 14</span>
                <h2 className="legal-article-title">
                  Cambios a estos Términos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Podemos modificar estos Términos de Uso periódicamente para
                    reflejar cambios en la aplicación o en la normativa
                    aplicable. Cuando realicemos cambios sustanciales, te lo
                    notificaremos dentro de la aplicación o mediante el correo
                    registrado.
                  </p>
                  <p>
                    El uso continuado de Creciendo tras la entrada en vigor de
                    los Términos modificados implica tu aceptación de los mismos.
                  </p>
                </div>
              </section>

              {/* Section 15 */}
              <section id="sec-15" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 15</span>
                <h2 className="legal-article-title">
                  Ley aplicable, protección al consumidor y reclamos
                </h2>
                <div className="legal-content-body">
                  <p>
                    Estos Términos se rigen e interpretan de conformidad con las
                    leyes vigentes de la República de Colombia, sin perjuicio de
                    los derechos imperativos de protección al consumidor que
                    correspondan al usuario según la legislación de su país de
                    residencia.
                  </p>
                  <p>
                    Para cualquier inquietud, petición, queja o reclamo
                    relacionado con el servicio, puedes comunicarte con nuestro
                    equipo a través del correo de contacto habilitado.
                  </p>
                </div>
              </section>

              {/* Section 16 */}
              <section id="sec-16" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 16</span>
                <h2 className="legal-article-title">
                  Términos adicionales para usuarios de iPhone y iPad (Apple App
                  Store)
                </h2>
                <div className="legal-content-body">
                  <p>
                    Si descargaste la aplicación desde el App Store de Apple,
                    reconoces que estos Términos se celebran entre tú y
                    Creciendo, y no con Apple Inc. Apple no es responsable de la
                    aplicación ni de su contenido ni tiene obligación de prestar
                    servicios de mantenimiento respecto de la misma.
                  </p>
                </div>
              </section>

              {/* Section 17 */}
              <section id="sec-17" className="legal-article-block">
                <span className="legal-num-badge">SECCIÓN 17</span>
                <h2 className="legal-article-title">Contacto</h2>
                <div className="legal-content-body">
                  <p>
                    Si tienes alguna pregunta o inquietud sobre estos Términos de
                    Uso, estamos a tu disposición en:
                  </p>
                  <p>
                    <strong>Correo electrónico:</strong>{" "}
                    <a
                      href="mailto:soporte@creciendo.app"
                      style={{ color: "var(--brand-primary)", fontWeight: 700 }}
                    >
                      soporte@creciendo.app
                    </a>{" "}
                    /{" "}
                    <a
                      href="mailto:info@creciendo.com.co"
                      style={{ color: "var(--brand-primary)", fontWeight: 700 }}
                    >
                      info@creciendo.com.co
                    </a>
                  </p>
                </div>
              </section>

              {/* Document Navigation Link */}
              <div className="doc-navigation-bar">
                <span>¿Deseas consultar cómo protegemos tu información?</span>
                <Link href="/legal/privacidad" className="doc-nav-btn">
                  Siguiente: Política de Privacidad <ArrowRight size={16} />
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
              <Link href="/legal/privacidad">Política de Privacidad</Link>
              <Link
                href="/legal/terminos"
                style={{ color: "#FFF", fontWeight: 700 }}
              >
                Términos del Servicio
              </Link>
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
