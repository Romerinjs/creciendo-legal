# Eliminación de cuenta web

La página `/eliminar-cuenta` permanece pública. El recorrido es **Eliminar mi
cuenta → iniciar sesión → confirmar eliminación → solicitud recibida**. Abrir
la página, autenticarse o cancelar no solicita ningún borrado.

## Configuración

En el entorno de compilación de Next.js establecer `SUPABASE_URL` y
`SUPABASE_PUBLISHABLE_KEY` del proyecto Creciendo. Solo se admiten HTTPS y claves
públicas publishable/anon correspondientes al proyecto. Nunca usar service_role,
claves secretas o credenciales administrativas. Reconstruir tras cambiar estas
variables, ya que la página se prerenderiza.

Google usa PKCE S256, verificador de un solo uso en sessionStorage y retorno
exacto al mismo origen `/eliminar-cuenta`. Eliminar el código OAuth del historial
antes de procesarlo. Supabase debe permitir la URL canónica exacta. Las cuentas
exclusivamente Apple y las que requieren MFA continúan desde la aplicación.

## Contrato vigente

Tras confirmar, se vuelve a validar la identidad con Auth. El cliente llama a
`POST /api/account-deletion`, con el bearer únicamente en memoria y una clave
idempotente aleatoria por sesión. El servidor Next reenvía exclusivamente esa
credencial, la clave y `{version:"account-deletion.v1",confirmed:true}` a
`https://agent.creciendo.com.co/creciendo/v1/account/deletion`.

No se aceptan objetivos de borrado suministrados por el navegador, ni se reenvían
cookies, claves privilegiadas o cabeceras arbitrarias. El proxy exige mismo
origen, limita el cuerpo a 256 bytes, impide redirecciones y aplica timeout de
20 segundos. Las respuestas no se almacenan en caché y los errores no exponen
información del proveedor.

Solo un HTTP 202 con recibo estricto `account-deletion.v1`, `status:"queued"`,
`requestId` UUID y `accessRevoked:true` produce la pantalla de solicitud recibida.
Esto confirma el bloqueo del acceso y el inicio del proceso, **no** que todos los
datos ya desaparecieron. Se borran por lotes periódicos los accesos, chats/copias
internas y finalmente los datos de niños sin otro tutor. Los perfiles compartidos
se conservan para los demás tutores.

Se retiraron la RPC antigua `delete_user_account`, el borrado directo de tablas y
Storage y el respaldo que archivaba perfiles. La autorización y el aislamiento
siguen perteneciendo al backend y sus políticas RLS.

Un fallo de red conserva la sesión ya validada y la misma clave para un reintento
explícito; no hay reintentos automáticos. Una respuesta perdida puede ocurrir
después del bloqueo, por lo que no se consulta de nuevo Auth en ese reintento.
La sesión web caduca como máximo en diez minutos, sin renovación ni refresh token
persistido. Cancelar descarta la memoria y cierra solo esta sesión web, no las de
otros dispositivos.

## Validación

- `npm test`: autenticación, PKCE, confirmación, aislamiento, recibos estrictos,
  reintentos idempotentes, proxy, redacción de errores y ausencia de fallback.
- `npx tsc --noEmit`, `npm run lint` y `npm run build`.
- Verificar en navegador el acceso público, inicio de sesión, confirmación y
  cancelación. Para ejecutar un borrado real usar exclusivamente una cuenta
  sintética y desechable autorizada; nunca cuentas habituales ni niños reales.

El despliegue debe mantener las variables públicas existentes. No cambia Auth,
RLS, el calendario del worker ni las políticas legales publicadas.
Validated 2026-10-30:
- npm test: 23 passed, including Google PKCE, Auth identity, strict queued receipt, idempotent retry, proxy origin/body/actor guards and no direct cleanup.
- npx tsc --noEmit: passed.
- npm run lint: 0 errors, 3 pre-existing unused import warnings.
- npx next build --webpack: passed, route /api/account-deletion dynamic.
- Default Turbopack on this Windows host failed while creating the CSS worker; no product code or deployment bundler setting changed to hide it.
Production browser verification and deployment remain pending.
