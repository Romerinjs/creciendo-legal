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

Se usa Auth REST de Supabase para `grant_type=password` o Google mediante OAuth
con PKCE S256. Apple no está integrado; las cuentas exclusivamente Apple deben
continuar desde la aplicación. Cuentas con MFA verificado no pueden borrar mediante
este login de un solo factor; se remiten a la app. No se cambian Auth, las plantillas
de correo ni las RPC del proyecto.

### Configurar Google (sin modificar el acceso móvil)

1. Confirmar que Google está habilitado en **Supabase → Authentication → Providers**
   con un cliente OAuth web de Google válido. Las credenciales del proveedor se
   configuran en Supabase, nunca en este repositorio o en el navegador.
2. En **Authentication → URL Configuration → Redirect URLs**, permitir exactamente
   `https://www.creciendo.com.co/eliminar-cuenta`. Si se usa otro dominio canónico,
   añadir también su ruta exacta: la web vuelve al mismo origen donde empezó.
   Para desarrollo, permitir `http://localhost:3000/eliminar-cuenta` por separado.
   No usar comodines amplios en producción ni cambiar el destino de la app móvil.
3. En Google Cloud, comprobar que el cliente web tiene autorizado el callback
   de Supabase: `https://yapjiinrjsrothzgzxsv.supabase.co/auth/v1/callback`.
4. Probar Google y cancelar en la confirmación final antes de probar ningún borrado.

El usuario elige su cuenta de Google; se intercambia el código de un solo uso con
el verificador de esta pestaña y se valida `/auth/v1/user`. El retorno solo muestra
la cuenta y la confirmación sin marcar; nunca llama a la RPC de eliminación.
Se rechazan callbacks sin flujo local, expirados, repetidos o con tokens implícitos.
El código y los errores se retiran de la URL inmediatamente al procesar el retorno.

El acceso OAuth de Supabase puede crear una cuenta si la identidad de Google todavía
no existe y el proyecto permite registros. No hay una opción cliente equivalente a
`shouldCreateUser: false` para OAuth. No se borra esa cuenta automáticamente. Si se
requiere impedir esos registros, debe aprobarse una política/hook del backend;
esta integración no cambia globalmente los registros ni la vinculación de identidades.

## Protecciones y límites

- Token de acceso solo en memoria; sin tokens de sesión en localStorage,
  sessionStorage o cookies, sin refresh token persistente ni credenciales en logs.
  Solo el verificador PKCE y metadatos del flujo Google viven temporalmente en
  sessionStorage durante la redirección (máximo diez minutos); se consumen al
  volver o cancelar. No hay tokens de sesión en la URL; el código OAuth temporal
  se retira mediante replaceState. La contraseña se retira del formulario al
  enviar el acceso y no se guarda en estado React.
- Sesión web de máximo diez minutos, sin renovación automática. Cancelar elimina
  la referencia local y solicita logout de esa sesión, no de otros dispositivos.
  Descargar/cerrar la pestaña descarta la memoria, pero no garantiza logout remoto;
  un JWT ya emitido puede seguir válido hasta su expiración en Supabase.
- Antes del borrado se valida la identidad mediante `/auth/v1/user` y se llama
  a `POST /rest/v1/rpc/delete_user_account` con `{}` y el bearer del usuario.
  No se mandan email ni user_id como objetivo de la RPC ni hay clave privilegiada.
- No se elimina nada por GET, al abrir la página, al iniciar sesión o al cancelar.
  Sin cookies automáticas, las peticiones exigen el bearer en memoria. La RPC
  debe seguir comprobando `auth.uid()` en el servidor: el frontend no sustituye
  sus controles de autorización ni arregla grants/RLS existentes.
- Comprobación HTTP y respuesta void de la RPC; ante timeout o error desconocido no
  se anuncia éxito ni se reintenta automáticamente. Un timeout puede ocurrir después del commit:
  comprobar el estado antes de repetir. No se prueban borrados sobre cuentas reales.
- Supabase debe tener configurados sus límites de intentos, protección contra
  fuerza bruta y, si procede, CAPTCHA (requiere integrar un proveedor en este flujo).
  Los botones deshabilitados evitan doble envío local, no sustituyen rate limiting
  distribuido ni autorización del backend.
- Cabeceras contra framing/clickjacking, sniffing de contenido, envío de referrer y
  uso de cámara/micrófono/geolocalización. La CSP configurada es una base, no una
  protección completa contra XSS; una CSP con nonces requiere trabajo adicional.

### Respaldo directo solicitado por el propietario

Ante **solo** el error HTTP 500 / PostgreSQL 55000 con mensaje exacto
`cannot delete from view "growth_series_points"`, se ejecuta la limpieza directa
portada del móvil. Otros errores, fallos de autenticación, respuestas desconocidas
y timeouts no la activan. Después de la limpieza se llama una vez más a la RPC para
completar Auth: si sigue fallando, nunca se presenta como cuenta eliminada.

Se enumeran con paginación y conteo exacto los espacios/menores creados por el
usuario autenticado. Antes de escribir se comprueba que los espacios pertenecen
al usuario y no hay otros miembros, otros accesos al menor, menores de otros
creadores o legal holds. Se bloquea todo el respaldo si el alcance es compartido,
incompleto o no se puede consultar. Todas las escrituras se filtran por el UUID
verificado y/o los UUID de esos menores/espacios, usando solo su bearer.

No se exige una membresía propia para limpiar un espacio cuyo `created_by`
corresponde al usuario autenticado: una respuesta vacía de `care_space_members`
no bloquea por sí sola ese caso. Siguen comprobándose el propietario, los menores,
sus accesos y las retenciones, y se bloquea si aparecen miembros ajenos.
Una respuesta vacía solo describe las filas visibles al token; no demuestra la
ausencia global de miembros bajo RLS. Los permisos efectivos de borrado deben
estar correctamente restringidos en el servidor; no se elevan privilegios aquí.

Se copian los borrados de tablas dependientes del móvil, pero con las columnas
actuales `actor_user_id` y `audit_events` en lugar de `sender_id`/`audit_logs`, sin
borrar vistas. El archivado tiene un resultado separado y no sustituye una
eliminación completa de cuenta. Los avatares se enumeran y
eliminan mediante Storage API únicamente bajo `<userId>/`, antes de retirar el
acceso. Cada respuesta debe ser correcta; un error detiene el proceso y se informa
si hubo escrituras parciales. Son operaciones independientes, **no una transacción**.
La confirmación del usuario advierte ese riesgo.

### Archivado compatible con el móvil, sin cambiar el backend

Si el borrado directo recibe exactamente HTTP 403 / PostgreSQL 42501 con mensaje
`anthropometry_history_immutable`, se detiene la limpieza destructiva. Se archivan
el perfil afectado y los perfiles pendientes del alcance ya comprobado, mediante
`PATCH children` con `status: archived`, filtros por `id`, `care_space_id` y
`created_by` del usuario autenticado. Cada respuesta debe confirmar exactamente
el ID y el nuevo estado. Un permiso denegado genérico, timeout o respuesta vacía
no se transforma en un archivado exitoso.

El resultado es `{ status: 'archived', archivedProfiles: n }`, no `deleted`. No se
invoca nuevamente la RPC, no se retiran membresías/perfil ni se borran archivos
después de este resultado. La sesión web se cierra y la vista dice explícitamente
que la cuenta **no se eliminó**, que hay datos conservados y que algunas operaciones
anteriores sí pudieron borrar datos. La confirmación previa explica esta alternativa.
Los perfiles solo desaparecerán de las pantallas móviles que filtren por estado
activo; el archivado no garantiza por sí solo ocultarlos de todas las consultas.

La cuenta Auth sigue existiendo y permite autenticarse nuevamente. Este flujo
no es una revocación de acceso ni satisface por sí solo la eliminación total
de datos; finalizarla sigue requiriendo corregir el backend. No se cambian triggers,
RLS, funciones desplegadas ni se simula éxito incondicional como en el móvil.

**Límite conocido:** copiar el respaldo no corrige la RPC desplegada ni sus otros
errores de columnas, restricciones o triggers de inmutabilidad. Tampoco elimina
Auth directamente (eso sigue dependiendo de la RPC), ni demuestra que los objetos
clínicos vinculados a `documents` se hayan borrado de Storage. Estos puntos requieren
resolver el backend; no se copian los errores ignorados ni el éxito incondicional
del móvil. Los filtros y verificaciones frontend no sustituyen RLS/autorización
del servidor ni impiden una modificación concurrente del alcance compartido.

El propietario reporta que el flujo móvil elimina Auth, datos y fotos. Es imprescindible
verificar con cuenta de prueba autorizada que el flujo real completa ese alcance
y no afecta registros de otros usuarios. Un HTTP exitoso no acredita
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
