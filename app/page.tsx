"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Download,
  Shield,
  UserCheck,
  CheckCircle,
  Info,
  CheckSquare,
  TrendingUp,
  Calendar,
  Star,
  Folder,
  Bell,
  Check,
  Clock,
  Cpu,
  AlertTriangle,
  BookOpen,
  UserX,
  PhoneCall,
  Slash,
  Lock,
  Trash2,
  ChevronDown,
  Apple,
  Play,
} from "lucide-react";

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div>
      {/* Navbar */}
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
            <a href="#como-funciona" className="nav-link">
              Cómo funciona
            </a>
            <a href="#funciones" className="nav-link">
              Funciones
            </a>
            <a href="#asistente-ia" className="nav-link">
              Asistente IA
            </a>
            <a href="#creciendo-plus" className="nav-link">
              Creciendo+
            </a>
            <a href="#faq" className="nav-link">
              Preguntas
            </a>
            <Link href="/legal/terminos" className="nav-link">
              Términos
            </Link>
            <Link href="/legal/privacidad" className="nav-link">
              Privacidad
            </Link>
          </nav>

          <div className="nav-actions">
            <a href="#descargar" className="btn btn-primary">
              Descargar app
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section" id="como-funciona">
          <div className="container hero-grid">
            <div className="hero-text-col reveal-on-scroll">
              <h1 className="hero-title">
                Toda la información importante del crecimiento de tus hijos,{" "}
                <span className="highlight">en un solo lugar.</span>
              </h1>
              <p className="hero-subtitle">
                Organiza vacunas, peso, talla, registros de desarrollo,
                documentos y recordatorios con total serenidad, claridad y
                estricta privacidad familiar.
              </p>

              <div className="hero-cta-group">
                <a href="#descargar" className="btn btn-primary btn-lg">
                  <Download size={18} /> Descargar Creciendo
                </a>
                <a href="#funciones" className="btn btn-secondary btn-lg">
                  Conocer más
                </a>
              </div>

              <div className="hero-trust-row">
                <div className="trust-item">
                  <Shield size={18} />
                  <span>100% Privado y seguro</span>
                </div>
                <div className="trust-item">
                  <UserCheck size={18} />
                  <span>Exclusivo para adultos cuidadores</span>
                </div>
              </div>
            </div>

            <div className="hero-visual-col reveal-on-scroll reveal-delay-2">
              <div className="hero-image-wrapper">
                <Image
                  src="/images/hero_family_lifestyle_1790435522953.jpg"
                  alt="Familia tranquila en un ambiente cálido y moderno"
                  width={600}
                  height={480}
                  className="hero-photo"
                  style={{ width: "100%", height: "480px" }}
                  priority
                />

                {/* Floating UI Mockup 1: Growth Card */}
                <div className="floating-ui-card hero-ui-growth">
                  <div className="ui-card-header">
                    <div className="ui-avatar">M</div>
                    <div>
                      <div className="ui-title">Mateo (4 años)</div>
                      <div className="ui-subtitle">
                        Último control hace 2 semanas
                      </div>
                    </div>
                  </div>
                  <div className="ui-card-body">
                    <div className="metric-row">
                      <div className="metric-item">
                        <span className="metric-label">Talla</span>
                        <span className="metric-value">104.5 cm</span>
                        <span className="metric-badge">Percentil 75</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Peso</span>
                        <span className="metric-value">16.8 kg</span>
                        <span className="metric-badge">Percentil 60</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating UI Mockup 2: Vaccine Reminder */}
                <div className="floating-ui-card hero-ui-vaccine">
                  <div className="ui-status-icon success">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <div className="ui-title">Esquema de Vacunas</div>
                    <div className="ui-subtitle">
                      Todas al día hasta los 4 años
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: QUE PUEDES HACER (FEATURES GRID) */}
        <section id="funciones" className="section features-section">
          <div className="container">
            <div className="section-header center reveal-on-scroll">
              <div className="section-tag">Funciones principales</div>
              <h2 className="section-title">
                Acompaña cada etapa con orden, claridad y tranquilidad
              </h2>
              <p className="section-subtitle">
                Diseñamos una interfaz limpia e intuitiva para organizar los
                aspectos esenciales de la salud y desarrollo de tu familia.
              </p>
            </div>

            <div className="features-grid">
              {/* Card 1: Vacunas */}
              <div className="feature-card reveal-on-scroll reveal-delay-1">
                <div className="feature-icon">
                  <CheckSquare size={26} />
                </div>
                <h3>Esquema de Vacunas</h3>
                <p>
                  Registra las vacunas aplicadas y recibe alertas oportunas sobre
                  las dosis pendientes según su edad.
                </p>
                <div className="mini-ui-preview">
                  <span className="mini-tag done">
                    <Check size={14} /> Triple Viral (Aplicada)
                  </span>
                  <span className="mini-tag pending">
                    <Clock size={14} /> Refuerzo 5 años (Próximo)
                  </span>
                </div>
              </div>

              {/* Card 2: Crecimiento */}
              <div className="feature-card reveal-on-scroll reveal-delay-2">
                <div className="feature-icon">
                  <TrendingUp size={26} />
                </div>
                <h3>Peso y Talla</h3>
                <p>
                  Visualiza gráficos claros de crecimiento y percentiles de la
                  OMS para dar un seguimiento continuo.
                </p>
                <div className="mini-ui-preview">
                  <div className="graph-placeholder-bar">
                    <div className="bar-fill" style={{ width: "75%" }}></div>
                  </div>
                  <span className="mini-note">
                    Evolución dentro del rango esperado
                  </span>
                </div>
              </div>

              {/* Card 3: Controles médicos */}
              <div className="feature-card reveal-on-scroll reveal-delay-3">
                <div className="feature-icon">
                  <Calendar size={26} />
                </div>
                <h3>Controles Médicos</h3>
                <p>
                  Guarda el historial de visitas al pediatra, especialistas,
                  indicaciones recibidas y dudas pendientes.
                </p>
              </div>

              {/* Card 4: Hitos del desarrollo */}
              <div className="feature-card reveal-on-scroll reveal-delay-1">
                <div className="feature-icon">
                  <Star size={26} />
                </div>
                <h3>Hitos del Desarrollo</h3>
                <p>
                  Registra los grandes logros de cada etapa (primeros pasos,
                  palabras, motricidad) de forma ordenada.
                </p>
              </div>

              {/* Card 5: Documentos */}
              <div className="feature-card reveal-on-scroll reveal-delay-2">
                <div className="feature-icon">
                  <Folder size={26} />
                </div>
                <h3>Documentos e Historial</h3>
                <p>
                  Ten a la mano exámenes de laboratorio, fórmulas médicas,
                  órdenes y certificaciones en un solo archivo seguro.
                </p>
              </div>

              {/* Card 6: Recordatorios */}
              <div className="feature-card reveal-on-scroll reveal-delay-3">
                <div className="feature-icon">
                  <Bell size={26} />
                </div>
                <h3>Recordatorios Inteligentes</h3>
                <p>
                  Notificaciones para tomar medicamentos, fechas de controles
                  futuros y trámites de salud sin olvidos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION D: VACUNAS DESTACADAS */}
        <section className="section showcase-section alt-bg">
          <div className="container showcase-grid reveal-on-scroll">
            <div className="showcase-img-col">
              <div className="image-card-frame">
                <Image
                  src="/images/vaccines_family_care_1790435534319.jpg"
                  alt="Madre e hijo disfrutando un momento cálido"
                  width={560}
                  height={440}
                  className="showcase-photo"
                  style={{ width: "100%", height: "440px" }}
                />

                <div className="floating-ui-card ui-vaccine-highlight">
                  <div className="ui-header-sm">
                    <Shield size={16} />{" "}
                    <span>Carnet Digital de Vacunación</span>
                  </div>
                  <div className="ui-vaccine-list">
                    <div className="vaccine-row done">
                      <span>Hexavalente #3</span>
                      <span className="v-date">Aplicada 12 Oct</span>
                    </div>
                    <div className="vaccine-row done">
                      <span>Neumococo #2</span>
                      <span className="v-date">Aplicada 12 Oct</span>
                    </div>
                    <div className="vaccine-row upcoming">
                      <span>SRP (Triple Viral)</span>
                      <span className="v-date">Programada 15 Nov</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="showcase-text-col">
              <div className="section-tag">Tranquilidad para tu mente</div>
              <h2>Sus vacunas, siempre al día y bajo control</h2>
              <p>
                Olvídate de buscar carnets de papel traspapelados. Creciendo te
                ofrece una vista completa del esquema de vacunación recomendado,
                permitiéndote registrar fechas, lotes y activar recordatorios
                previos a cada dosis.
              </p>
              <ul className="check-list">
                <li>
                  <CheckCircle size={20} /> Esquemas de vacunación oficiales
                  actualizados
                </li>
                <li>
                  <CheckCircle size={20} /> Registro fotográfico del carnet
                  físico si lo deseas
                </li>
                <li>
                  <CheckCircle size={20} /> Recordatorios amigables antes de cada
                  fecha de aplicación
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION E: CRECIMIENTO DESTACADO */}
        <section className="section showcase-section">
          <div className="container showcase-grid reverse reveal-on-scroll">
            <div className="showcase-text-col">
              <div className="section-tag">Seguimiento constante</div>
              <h2>Cada centímetro cuenta una historia</h2>
              <p>
                El crecimiento de los hijos ocurre a pasos agigantados.
                Creciendo te permite registrar cada medición en los controles o
                en casa, construyendo un gráfico visual que facilita la
                conversación con tu pediatra.
              </p>

              <div className="stats-counter-grid">
                <div className="stat-box">
                  <span className="stat-num">0-14</span>
                  <span className="stat-desc">Años de seguimiento integral</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num">OMS</span>
                  <span className="stat-desc">Curvas de referencia estándar</span>
                </div>
              </div>
            </div>

            <div className="showcase-img-col">
              <div className="image-card-frame">
                <Image
                  src="/images/growth_height_measurement_1790435546289.jpg"
                  alt="Padre midiendo la estatura de su hija en un gráfico de pared"
                  width={560}
                  height={440}
                  className="showcase-photo"
                  style={{ width: "100%", height: "440px" }}
                />

                <div className="floating-ui-card ui-growth-chart-mock">
                  <div className="chart-header">
                    <span className="chart-title">Curva de Talla / Edad</span>
                    <span className="chart-badge">Sofía (2 años)</span>
                  </div>
                  <div className="chart-simulated">
                    <svg viewBox="0 0 300 120" className="svg-chart">
                      <path
                        d="M 10 100 Q 100 80, 290 20"
                        fill="none"
                        stroke="#D1E2DD"
                        strokeWidth="3"
                      />
                      <path
                        d="M 10 110 Q 100 90, 290 35"
                        fill="none"
                        stroke="#3D7468"
                        strokeWidth="3"
                      />
                      <path
                        d="M 10 120 Q 100 100, 290 50"
                        fill="none"
                        stroke="#D1E2DD"
                        strokeWidth="3"
                      />
                      <circle cx="210" cy="52" r="5" fill="#3D7468" />
                    </svg>
                  </div>
                  <div className="chart-footer">
                    <span>Último dato: 87 cm (Percentil 50)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION G: ASISTENTE CON IA */}
        <section id="asistente-ia" className="section ai-section alt-bg">
          <div className="container ai-container">
            <div className="section-header center max-700 reveal-on-scroll">
              <div className="section-tag">Orientación y educación</div>
              <h2>Un asistente con IA para resolver dudas del día a día</h2>
              <p>
                Obtén respuestas claras y fundamentadas sobre pautas de
                alimentación, sueño, crianza y hábitos. Una herramienta
                educativa pensada para enriquecer tu criterio como cuidador.
              </p>
            </div>

            <div className="ai-showcase-card reveal-on-scroll reveal-delay-2">
              <div className="ai-photo-side">
                <Image
                  src="/images/parent_with_smartphone_1790435561063.jpg"
                  alt="Madre usando su teléfono tranquila en casa"
                  width={500}
                  height={400}
                />
              </div>
              <div className="ai-chat-side">
                <div className="chat-header">
                  <div className="chat-avatar">
                    <Cpu size={22} />
                  </div>
                  <div>
                    <h4>Asistente Creciendo</h4>
                    <p>Orientación educativa familiar</p>
                  </div>
                  <span className="disclaimer-pill">Solo informativo</span>
                </div>

                <div className="chat-messages">
                  <div className="chat-bubble user">
                    <p>
                      ¿A qué edad es recomendable iniciar la alimentación
                      complementaria y con qué alimentos podemos empezar?
                    </p>
                  </div>
                  <div className="chat-bubble ai">
                    <p>
                      Generalmente se recomienda alrededor de los 6 meses de
                      vida, cuando el bebé muestra señales de madurez digestiva y
                      motora. Se suele iniciar con verduras suaves, frutas o
                      cereales fortificados.
                    </p>
                    <div className="ai-note-box">
                      <AlertTriangle size={14} />
                      <span>
                        Nota: Esta información es educativa. Consulta siempre
                        con tu pediatra antes de iniciar la alimentación
                        complementaria de tu hijo.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-guarantees-grid">
              <div className="guarantee-box">
                <BookOpen size={24} />
                <h4>Fines estrictamente educativos</h4>
                <p>
                  La IA está diseñada para resumir conceptos de crianza y salud
                  infantil, no para brindar diagnósticos.
                </p>
              </div>
              <div className="guarantee-box">
                <UserX size={24} />
                <h4>No reemplaza al especialista</h4>
                <p>
                  Creciendo fomenta una relación más cercana e informada entre
                  la familia y su pediatra de confianza.
                </p>
              </div>
              <div className="guarantee-box">
                <PhoneCall size={24} />
                <h4>Ante emergencias, llama al 123</h4>
                <p>
                  Si notas síntomas de alarma o urgencias médicas, acude a un
                  centro de salud inmediatamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION H: PRIVACIDAD Y SEGURIDAD */}
        <section id="privacidad" className="section privacy-section">
          <div className="container">
            <div className="privacy-box reveal-on-scroll">
              <div className="privacy-content">
                <div className="section-tag light">Privacidad absoluta</div>
                <h2>La información de tu familia es sagrada y sigue siendo tuya</h2>
                <p>
                  Sabemos que los datos sobre la salud y crecimiento de tus
                  hijos son sumamente sensibles. Por ello, la privacidad es la
                  piedra angular sobre la que construimos Creciendo.
                </p>

                <div className="privacy-pillars">
                  <div className="pillar-item">
                    <div className="pillar-icon">
                      <Slash size={20} />
                    </div>
                    <div>
                      <h4>Cero anuncios comerciales</h4>
                      <p>
                        Tus datos jamás se venden ni se utilizan para mostrar
                        publicidad ni crear perfiles comerciales.
                      </p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4>Cifrado de extremo a extremo</h4>
                      <p>
                        La información viaja y se almacena bajo estándares
                        bancarios de seguridad y cifrado.
                      </p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h4>Control total y eliminación</h4>
                      <p>
                        Puedes exportar tu información o eliminar
                        definitivamente tu cuenta y datos en cualquier momento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION I: CRECIENDO+ */}
        <section id="creciendo-plus" className="section pricing-section alt-bg">
          <div className="container">
            <div className="section-header center max-700 reveal-on-scroll">
              <div className="section-tag">Plan Premium</div>
              <h2>Conoce Creciendo+</h2>
              <p>
                Una suscripción diseñada para familias que desean llevar la
                organización al siguiente nivel con almacenamiento ilimitado y
                funciones avanzadas.
              </p>
            </div>

            <div className="pricing-card-wrapper reveal-on-scroll reveal-delay-2">
              <div className="pricing-card">
                <div className="pricing-header">
                  <span className="pricing-badge">Membresía Familiar</span>
                  <h3 className="plan-name">Creciendo+</h3>
                  <div className="price-box">
                    <span className="currency">US$</span>
                    <span className="amount">10</span>
                    <span className="period">/ mes</span>
                  </div>
                  <p className="price-desc">
                    Cancela o pausa cuando quieras. Sin contratos ni letras
                    pequeñas.
                  </p>
                </div>

                <ul className="pricing-features">
                  <li>
                    <Check size={18} /> Múltiples perfiles de hijos sin límite
                  </li>
                  <li>
                    <Check size={18} /> Almacenamiento ilimitado de documentos
                    médicos en alta calidad
                  </li>
                  <li>
                    <Check size={18} /> Acceso ilimitado al Asistente IA
                    educativo
                  </li>
                  <li>
                    <Check size={18} /> Exportación completa de datos en formato
                    PDF para el pediatra
                  </li>
                  <li>
                    <Check size={18} /> Sincronización en tiempo real entre
                    múltiples cuidadores
                  </li>
                </ul>

                <div className="pricing-cta">
                  <a href="#descargar" className="btn btn-primary btn-block">
                    Prueba Creciendo+ gratis por 14 días
                  </a>
                  <span className="subtext">
                    También puedes disfrutar de la versión gratuita con
                    funciones esenciales.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION J: FAQ */}
        <section id="faq" className="section faq-section">
          <div className="container max-800">
            <div className="section-header center reveal-on-scroll">
              <div className="section-tag">Preguntas frecuentes</div>
              <h2>Resolvemos tus dudas</h2>
            </div>

            <div className="accordion reveal-on-scroll reveal-delay-2">
              <div className={`accordion-item ${activeFaq === 0 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleFaq(0)}
                >
                  <span>¿Quiénes deben usar la aplicación?</span>
                  <ChevronDown className="acc-icon" size={20} />
                </button>
                <div className="accordion-body">
                  <p>
                    Creciendo está diseñada exclusivamente para ser utilizada
                    por adultos: padres, madres y cuidadores de niños desde los 0
                    hasta los 14 años. Los niños no interactúan directamente con
                    la aplicación.
                  </p>
                </div>
              </div>

              <div className={`accordion-item ${activeFaq === 1 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleFaq(1)}
                >
                  <span>¿La app reemplaza las citas con el pediatra?</span>
                  <ChevronDown className="acc-icon" size={20} />
                </button>
                <div className="accordion-body">
                  <p>
                    No, bajo ninguna circunstancia. Creciendo es una herramienta
                    organizativa y de acompañamiento educativo. Las revisiones
                    médicas presenciales y el juicio del pediatra son
                    insustituibles.
                  </p>
                </div>
              </div>

              <div className={`accordion-item ${activeFaq === 2 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleFaq(2)}
                >
                  <span>¿Qué debo hacer en caso de una urgencia médica?</span>
                  <ChevronDown className="acc-icon" size={20} />
                </button>
                <div className="accordion-body">
                  <p>
                    En cualquier situación de urgencia o emergencia de salud,
                    debes acudir de inmediato al centro médico más cercano o
                    comunicarte con el servicio de emergencias locales (123).
                  </p>
                </div>
              </div>

              <div className={`accordion-item ${activeFaq === 3 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleFaq(3)}
                >
                  <span>¿Cómo funciona el Asistente IA?</span>
                  <ChevronDown className="acc-icon" size={20} />
                </button>
                <div className="accordion-body">
                  <p>
                    El asistente ofrece información general basada en guías
                    públicas de crianza y desarrollo infantil. Sus respuestas son
                    con fines puramente orientativos y pueden presentar
                    imprecisiones, por lo que siempre deben contrastarse con un
                    profesional.
                  </p>
                </div>
              </div>

              <div className={`accordion-item ${activeFaq === 4 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleFaq(4)}
                >
                  <span>
                    ¿Puedo eliminar mis datos si decido dejar de usar la app?
                  </span>
                  <ChevronDown className="acc-icon" size={20} />
                </button>
                <div className="accordion-body">
                  <p>
                    Sí. Desde los ajustes de tu cuenta puedes solicitar la
                    eliminación permanente e inmediata de toda tu información y
                    la de tu familia de nuestras bases de datos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION K: FINAL CTA */}
        <section id="descargar" className="section final-cta-section">
          <div className="container center text-center">
            <div className="cta-inner-card reveal-on-scroll">
              <h2>
                Acompaña el crecimiento de tus hijos con más serenidad y orden
              </h2>
              <p>
                Únete a miles de familias que organizan vacunas, controles e
                hitos en una sola aplicación limpia y segura.
              </p>
              <div className="hero-cta-group center">
                <a href="#" className="btn btn-primary btn-lg">
                  <Apple size={20} /> App Store
                </a>
                <a href="#" className="btn btn-primary btn-lg">
                  <Play size={20} /> Google Play
                </a>
              </div>
              <div className="disclaimer-mini">
                <span>
                  Para padres y cuidadores. Sin publicidad. Privacidad
                  garantizada.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

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
              <a href="#como-funciona">Cómo funciona</a>
              <a href="#funciones">Funciones</a>
              <a href="#asistente-ia">Asistente IA</a>
              <a href="#creciendo-plus">Creciendo+</a>
            </div>

            <div className="link-col">
              <h5>Transparencia</h5>
              <Link href="/legal/privacidad">Política de Privacidad</Link>
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
