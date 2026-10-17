# Eliminación de cuenta web

La página `/eliminar-cuenta` y el resto del sitio permanecen públicos. Solo el
botón de eliminación abre el inicio de sesión. El acceso por correo/contraseña
no crea usuarios ni ejecuta el borrado. Una segunda pantalla identifica la
cuenta autenticada, exige marcar la confirmación y pulsar el botón definitivo.

## Configuración de despliegue

Establecer estas variables en el entorno de compilación de Next.js:

```dotenv
SUPABASE_URL=https://yapjiinrjsrothzgzxsv.supabase.co
SUPABASE_PUBLISHABLE_KEY=<clave-publica-publishable-o-anon-del-proyecto>
```

La ruta se prerenderiza: reconstruir/republicar tras cambiar las variables.
No guardar valores reales en el repositorio. Nunca usar una clave `service_role`,
`sb_secret_*`, access token de administración o contraseña de base de datos.
La configuración del servidor valida HTTPS, dominio Supabase y tipo de clave
antes de pasar exclusivamente la configuración pública al componente cliente.
Sin configuración válida, el botón informa un error y no envía credenciales.

Se usa Auth REST de Supabase para `grant_type=password`. Las cuentas exclusivamente
Google/Apple sin contraseña deben continuar desde la aplicación. Cuentas con MFA
verificado no pueden borrar mediante este login de un solo factor; se remiten a
la app. No se cambian Auth, las plantillas de correo ni las RPC del proyecto.

## Protecciones y límites

- Token de acceso solo en memoria; sin localStorage, sessionStorage, cookies,
  refresh token persistente ni credenciales en URLs/logs. La contraseña se retira
  del formulario al enviar el acceso y no se guarda en estado React.
- Sesión web de máximo diez minutos, sin renovación automática. Cancelar elimina
  la referencia local y solicita logout de esa sesión, no de otros dispositivos.
  Descargar/cerrar la pestaña descarta la memoria, pero no garantiza logout remoto;
  un JWT ya emitido puede seguir válido hasta su expiración en Supabase.
- Antes del borrado se valida la identidad mediante `/auth/v1/user` y se llama
  exactamente una vez a `POST /rest/v1/rpc/delete_user_account` con `{}` y el bearer
  del usuario. No se mandan email ni user_id como objetivo, no hay clave privilegiada,
  borrados REST de tablas ni fallback destructivo.
- No se elimina nada por GET, al abrir la página, al iniciar sesión o al cancelar.
  Sin cookies automáticas, las peticiones exigen el bearer en memoria. La RPC
  debe seguir comprobando `auth.uid()` en el servidor: el frontend no sustituye
  sus controles de autorización ni arregla grants/RLS existentes.
- Comprobación HTTP y respuesta void de la RPC; ante error o timeout no se anuncia
  éxito ni se reintenta automáticamente. Un timeout puede ocurrir después del commit:
  comprobar el estado antes de repetir. No se prueban borrados sobre cuentas reales.
- Supabase debe tener configurados sus límites de intentos, protección contra
  fuerza bruta y, si procede, CAPTCHA (requiere integrar un proveedor en este flujo).
  Los botones deshabilitados evitan doble envío local, no sustituyen rate limiting
  distribuido ni autorización del backend.
- Cabeceras contra framing/clickjacking, sniffing de contenido, envío de referrer y
  uso de cámara/micrófono/geolocalización. La CSP configurada es una base, no una
  protección completa contra XSS; una CSP con nonces requiere trabajo adicional.

El propietario reporta que el flujo móvil elimina Auth, datos y fotos. Esta web
reutiliza su RPC, no los borrados secundarios del cliente móvil. Es imprescindible
verificar con cuenta de prueba autorizada que **la RPC por sí sola** realiza ese
alcance y que no afecta registros de otros usuarios. Un HTTP exitoso no acredita
por sí solo la limpieza completa de archivos, copias de seguridad o datos derivados.
Los hallazgos de RLS/grants en Supabase requieren revisión independiente; esta
implementación no garantiza que el proyecto remoto esté libre de exposición.

## Verificación

`npm test` usa respuestas simuladas: no se conecta a Supabase. Cubre configuración,
login sin borrado, expiración, confirmación, identidad, MFA, errores, no reintentos
y cancelación. Ejecutar además `npm run lint` y `npm run build`.

Antes de publicar, en HTTPS y con cuentas ficticias autorizadas: comprobar login
válido/inválido, cancelación, navegación por teclado, expiración, doble clic,
errores de red y que otro usuario nunca sea afectado. La prueba destructiva requiere
aprobación específica y un entorno/cuenta descartable. No se ha ejecutado aquí.
