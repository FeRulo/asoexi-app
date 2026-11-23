---
title: 'Story 4.4: Endpoint Serverless Edge /api/quote y Flujo Unificado de Cotización Formal y Crédito Integrado en QuoteDrawer'
type: 'feature'
created: '2026-11-23'
status: 'done'
baseline_commit: '725373b733d18994c69b085f6082ba55d6c50d83'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los analistas de compras en redes corporativas con bloqueo de WhatsApp o las compañías formalmente constituidas que requieren radicar una solicitud de crédito comercial a 45 días necesitan enviar su requisición multimarca por correo institucional o adjuntar el certificado RUT de su empresa en PDF dentro de un flujo único, sin saltos entre ventanas modales y sin persistencia de datos sensibles en disco.

**Approach:** Implementar el motor de validación Zod, inspección de PDF en memoria (`ArrayBuffer` ≤ 5 MB, no vacío, firma `%PDF-` y rechazo de documentos cifrados con `/Encrypt`) y despacho transaccional vía Resend REST API hacia `serviciocliente@asoexi.com` en `src/lib/quote-formal.ts`, exponer el endpoint serverless `src/pages/api/quote.ts` compatible con Cloudflare Workers / Edge runtime, e integrar directamente dentro de la isla existente `src/islands/QuoteDrawer.tsx` (como vista/panel interno con transición fluida y retorno a la lista, sin crear un nuevo modal flotante) el formulario unificado de cotización formal y crédito a 45 días con carga de PDF del RUT, conectando también un acceso directo desde `src/islands/ContactChannelModal.tsx`.

## Boundaries & Constraints

**Always:**
- Implementar en `src/lib/quote-formal.ts` el esquema y motor de validación con `astro/zod` (`z`), constantes normativas y helpers compartidos entre cliente y servidor:
  - Constante de microcopy contractual (SEC-2): `CREDIT_CONTRACTUAL_NOTICE = "Línea de crédito comercial B2B sujeta a estudio de riesgo y verificación de RUT con antigüedad mínima de 1 año"`.
  - Límite de tamaño de archivo RUT (EDGE-3 / AD-7): `MAX_RUT_FILE_SIZE_BYTES = 5 * 1024 * 1024` (5 MB) y formato estricto PDF (`application/pdf` y/o extensión `.pdf`).
  - Validación reactiva y en servidor del binario PDF en memoria (`ArrayBuffer` / `Uint8Array`) sin escritura en disco (Zero Data-at-Rest, ADR-4): verificar que el archivo no esté vacío (`byteLength > 0`), no supere 5 MB, posea cabecera mágica `%PDF-` y no esté protegido con contraseña ni cifrado (detectando diccionario `/Encrypt` en la estructura del PDF).
  - Esquema Zod para los campos del formulario corporativo: `companyName` (Razón Social requerida), `nit` (NIT empresarial válido requerido), `contactName` (opcional/recomendado), `email` (Correo corporativo válido requerido), `phone` (Teléfono de contacto opcional/recomendado), `cityOrAddress` (Ciudad/Dirección de entrega requerida), `creditRequested` (booleano), `notes` (observaciones opcionales) e `items` (arreglo de ítems de requisición o nota de requerimiento). Cuando `creditRequested === true`, el adjunto RUT en PDF válido es estrictamente obligatorio.
- Implementar el endpoint `src/pages/api/quote.ts` (handler `POST: APIRoute`):
  - Soportar peticiones `multipart/form-data` (con o sin archivo `rutFile` adjunto) y JSON.
  - Procesar el archivo RUT exclusivamente en memoria (`await file.arrayBuffer()`) codificándolo en Base64 para el payload de Resend REST API (`https://api.resend.com/emails`) sin escribir archivos temporales en disco.
  - Despachar el correo estructurado HTML y texto plano al destinatario oficial principal `serviciocliente@asoexi.com` (con `reply_to` configurado al correo del comprador corporativo), empleando un timeout defensivo (`AbortController`, ej. 8000 ms) y lectura segura de `RESEND_API_KEY` desde `context.locals?.runtime?.env?.RESEND_API_KEY` o `import.meta.env.RESEND_API_KEY` (con manejo explícito de errores de red, configuración o upstream).
  - Retornar respuestas JSON estructuradas `{ ok: boolean, message?: string, referenceId?: string, error?: { code: string, message: string, fieldErrors?: Record<string, string> } }` con códigos HTTP semánticos (`200`, `400`, `413`, `502`/`504`).
- Integrar el flujo de cotización formal y crédito directamente dentro de `src/islands/QuoteDrawer.tsx` (sin crear una segunda ventana modal separada):
  - Mantener las 3 acciones comerciales de la barra inferior del `QuoteDrawer`: al pulsar *"¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com"* o *"Solicitar Crédito a 45 Días con RUT"*, transicionar internamente el `QuoteDrawer` a su vista integrada de **Cotización Formal / Crédito 45 Días** (con botón *"← Volver a la lista"* para revisar/editar materiales sin perder datos diligenciados), pre-seleccionando o no la casilla *"Solicitar línea de crédito a 45 días"* según el botón pulsado.
  - Soportar también la apertura directa de esta vista integrada mediante el evento global `open-quote-formal-modal` (cancelable, leyendo `event.detail.creditRequested`) para que cualquier acceso externo (como el enlace en `ContactChannelModal.tsx`) abra el `QuoteDrawer` directamente en el formulario formal/crédito.
  - Cuando la casilla *"Solicitar línea de crédito a 45 días"* está activa: exhibir el microcopy contractual exacto (SEC-2) y desplegar el campo de adjunto PDF del RUT con validación reactiva inmediata en el navegador (formato PDF, `<= 5 MB` y no protegido con contraseña).
  - Mostrar un resumen compacto de los ítems de `$cartStore` incluidos en la requisición (y permitir enviar incluso con notas/especificaciones si el carrito está vacío).
  - Al recibir respuesta HTTP 200 de `/api/quote`: mostrar vista de confirmación formal dentro del `QuoteDrawer` notificando que recibirá respuesta en su correo institucional en horario hábil, y vaciar el cajón de cotización (`$cartStore.clear()`).
  - Mantener cumplimiento estricto WCAG 2.2 AA (foco atrapado, `Escape`, áreas táctiles `min-h-[48px]`) y convivencia Singleton con `#floating-whatsapp-widget` y `#mobile-sticky-bar`.
- Añadir en `src/islands/ContactChannelModal.tsx` un enlace/acceso discreto secundario (*"¿Sin WhatsApp o necesitas Crédito a 45 Días con RUT? Enviar solicitud formal →"*) que despache `open-quote-formal-modal` para abrir el flujo integrado en `QuoteDrawer`.
- Seguir metodología TDD estricta creando `tests/unit/quote-formal.test.ts` y actualizando `tests/unit/quote-drawer.test.ts`, verificando que `npm test` y `npm run build` terminen con 0 errores y 0 warnings.

**Never:**
- No crear un segundo modal flotante separado (`QuoteFormalModal.tsx`) que genere saltos entre ventanas modales; todo el flujo formal y carga de PDF del RUT vive integrado en `QuoteDrawer.tsx`.
- No escribir ni almacenar archivos RUT en sistema de archivos local ni buckets externos (Zero Data-at-Rest estricto en memoria).
- No exponer `RESEND_API_KEY` en código cliente ni bundles de Preact.
- No enviar correos a cuentas `@gmail.com` ni usar teléfonos distintos a `+57 301 419 1344`; el destinatario principal es `serviciocliente@asoexi.com`.
- No permitir el envío de una solicitud con crédito a 45 días activado si falta el archivo RUT, si supera 5 MB, si no es un PDF válido o si está cifrado con contraseña.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Activación desde `QuoteDrawer` (Correo estándar vs Crédito 45 días) | Clic en botón secundario (`creditRequested: false`) o enlace de crédito (`creditRequested: true`) | El `QuoteDrawer` cambia a la vista interna de formulario formal sin cerrar el cajón ni abrir otro modal, sincronizando la casilla de crédito | Botón `"← Volver a la lista"` regresa a la vista de ítems preservando los datos ingresados |
| Activación externa desde `ContactChannelModal` o evento `open-quote-formal-modal` | Disparo de `CustomEvent('open-quote-formal-modal', { detail: { creditRequested } })` | `QuoteDrawer` intercepta el evento (`preventDefault()`), cierra otros modales y abre directamente en la vista de formulario formal con el estado `creditRequested` | Conserva convivencia Singleton y trampa de foco WCAG 2.2 AA |
| Cotización estándar por correo (`creditRequested: false`) | Razón Social, NIT, Correo corporativo, Ciudad/Dirección + ítems del `$cartStore`, sin adjunto RUT | `POST /api/quote` valida con Zod, despacha correo a `serviciocliente@asoexi.com`, retorna HTTP 200, muestra confirmación formal y ejecuta `$cartStore.clear()` | Si faltan campos obligatorios o el email es inválido, muestra errores por campo (HTTP 400 / validación cliente) |
| Solicitud de crédito a 45 días con RUT PDF válido (`creditRequested: true`) | Datos corporativos + casilla crédito activa + archivo PDF ≤ 5 MB no cifrado (`%PDF-1.7...`) | Muestra microcopy SEC-2, valida binario PDF reactivamente en cliente y en `/api/quote`, adjunta como Base64 desde `ArrayBuffer` a Resend y retorna HTTP 200 | Limpia `$cartStore` tras confirmación exitosa |
| Archivo RUT inválido: no es PDF, vacío o supera 5 MB (EDGE-3) | Archivo `.xlsx`/`.png` o PDF de 6 MB o 0 bytes | Rechazo reactivo inmediato en el input del navegador y rechazo en `/api/quote` (HTTP 400/413) | Mensaje claro indicando que el RUT debe ser estrictamente PDF válido y ≤ 5 MB |
| Archivo RUT PDF protegido con contraseña / cifrado (EDGE-3) | Archivo PDF cuyo contenido contiene `/Encrypt` | `inspectPdfBuffer` detecta protección por contraseña en cliente y servidor; bloquea el envío | Mensaje claro pidiendo subir un PDF del RUT sin contraseña de apertura |
| Timeout o fallo en servicio externo de correo (Resend API) | Petición a Resend excede el timeout defensivo o retorna error 5xx | `/api/quote` aborta limpiamente y responde HTTP 502/504 con mensaje comprensible | La vista formal informa el error sin borrar `$cartStore` y ofrece enlace `mailto:serviciocliente@asoexi.com` de respaldo |

</frozen-after-approval>

## Code Map

- `src/lib/quote-formal.ts` -- Nuevo módulo puro con constantes (`CREDIT_CONTRACTUAL_NOTICE`, `MAX_RUT_FILE_SIZE_BYTES`, `OFFICIAL_QUOTE_RECIPIENT_EMAIL`), esquema Zod (`quoteFormalRequestSchema`), validador de PDF en memoria (`inspectPdfBuffer`, `validateRutPdfFile`), constructor de correo HTML/texto (`buildQuoteEmailPayload`) y despachador Resend con timeout defensivo (`sendQuoteFormalEmail`).
- `src/pages/api/quote.ts` -- Nuevo endpoint API de Astro (`POST: APIRoute`) que parsea `multipart/form-data` o JSON, valida campos con Zod, inspecciona el RUT PDF como `ArrayBuffer` en memoria (Zero Data-at-Rest), invoca Resend REST API hacia `serviciocliente@asoexi.com` y retorna respuesta JSON estructurada.
- `src/islands/QuoteDrawer.tsx` -- Integrar dentro del propio cajón la vista interna de **Cotización Formal / Crédito a 45 Días** (estado `drawerView: 'list' | 'formal' | 'formal-success'`), escuchar `open-quote-formal-modal` cancelándolo con `preventDefault()`, incluir formulario corporativo con validación reactiva y carga de PDF del RUT (microcopy SEC-2 + `validateRutPdfFile`), envío multipart a `/api/quote`, vista de confirmación formal y vaciado de `$cartStore.clear()` tras HTTP 200.
- `src/islands/ContactChannelModal.tsx` -- Añadir acceso secundario discreto hacia la vista integrada de cotización formal / crédito 45 días en `QuoteDrawer` mediante `dispatchQuoteFormalModalEvent`.
- `tests/unit/quote-formal.test.ts` -- Nueva suite unitaria TDD probando exhaustivamente validación Zod, inspección de binarios PDF (válido, >5MB, no-PDF, vacío, cifrado con `/Encrypt`), construcción del correo a `serviciocliente@asoexi.com` y handler `POST` de `/api/quote` (éxito 200, errores 400/413/502/504, timeout).
- `tests/unit/quote-drawer.test.ts` -- Actualizar/ampliar pruebas para cubrir el flujo integrado de `QuoteDrawer` (construcción de `FormData` para `/api/quote`, validación de estado de crédito y transición de vista).

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/quote-formal.test.ts` & `tests/unit/quote-drawer.test.ts` -- Escribir pruebas unitarias TDD para el esquema Zod de cotización formal y crédito, inspección en memoria de archivos PDF (cabecera `%PDF-`, límite 5 MB, detección de `/Encrypt`), generación de payload Resend hacia `serviciocliente@asoexi.com`, respuestas HTTP del endpoint `/api/quote` y helpers integrados de `QuoteDrawer` -- Garantizar ciclo Red-Green-Refactor estricto.
- [x] `src/lib/quote-formal.ts` -- Implementar constantes normativas (incluyendo microcopy SEC-2), validación Zod, inspector de `ArrayBuffer` PDF sin persistencia en disco, formateador de correo HTML/texto y cliente HTTP Resend con `AbortController` timeout -- Núcleo compartido entre la vista integrada en `QuoteDrawer` y el endpoint Edge.
- [x] `src/pages/api/quote.ts` -- Implementar el endpoint `POST` procesando `multipart/form-data` y JSON en memoria, validando esquema y adjunto PDF, y despachando a `serviciocliente@asoexi.com` vía Resend REST API -- Entregable backend serverless de Story 4.4.
- [x] `src/islands/QuoteDrawer.tsx` & `src/islands/ContactChannelModal.tsx` -- Integrar la vista interna de cotización formal y crédito a 45 días con carga reactiva de PDF del RUT dentro de `QuoteDrawer.tsx` (sin crear modal aparte), escuchar `open-quote-formal-modal`, vaciar `$cartStore` tras HTTP 200 y conectar acceso directo desde `ContactChannelModal.tsx` -- Experiencia unificada sin fricción ni saltos de ventanas.
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Actualizar el estado de la historia 4.4 en el archivo de seguimiento del sprint -- Mantener trazabilidad del sprint.

**Acceptance Criteria:**
- Given el cajón interactivo `QuoteDrawer` abierto, when el usuario pulsa *"¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com"* o *"Solicitar Crédito a 45 Días con RUT"* (o accede desde `ContactChannelModal`), then el propio `QuoteDrawer` transiciona sin abrir otro modal a su vista integrada de cotización formal donde el usuario diligencia Razón Social, NIT, Correo corporativo y Ciudad/Dirección, pudiendo enviar por correo estándar a `serviciocliente@asoexi.com` o activar la casilla *"Solicitar línea de crédito a 45 días"* que despliega el campo de adjunto validando reactivamente en el navegador que sea estrictamente PDF no protegido con contraseña y ≤ 5 MB (EDGE-3).
- Given la solicitud con crédito activado, when se inspecciona el microcopy contractual (SEC-2), then exhibe la nota transparente: *"Línea de crédito comercial B2B sujeta a estudio de riesgo y verificación de RUT con antigüedad mínima de 1 año"*.
- Given el endpoint API `src/pages/api/quote.ts` (Cloudflare Workers runtime), when recibe la solicitud multipart POST (con o sin archivo adjunto), then valida el esquema con Zod, procesa el PDF en memoria como `ArrayBuffer` sin escritura en disco (Zero Data-at-Rest, ADR-4) si fue adjuntado, maneja timeouts defensivos y despacha el correo estructurado vía Resend REST API al correo principal `serviciocliente@asoexi.com`.
- Given el envío exitoso de la requisición o solicitud de crédito, when la API responde HTTP 200, then el `QuoteDrawer` muestra confirmación formal, vacía el cajón de cotización (`$cartStore.clear()`) y notifica al cliente que recibirá respuesta a su correo institucional en horario hábil.

## Implementation Notes

- Se creó `src/lib/quote-formal.ts` con constantes normativas (`CREDIT_CONTRACTUAL_NOTICE`, `MAX_RUT_FILE_SIZE_BYTES = 5 MB`, `OFFICIAL_QUOTE_RECIPIENT_EMAIL = 'serviciocliente@asoexi.com'`), esquema Zod (`quoteFormalRequestSchema`), inspector binario PDF en memoria (`inspectPdfBuffer`, `validateRutPdfFile`, `arrayBufferToBase64`, Zero Data-at-Rest), constructor de correo HTML/texto (`buildQuoteEmailPayload`) y cliente Resend con timeout defensivo (`sendQuoteFormalEmail`).
- Se implementó el endpoint serverless `src/pages/api/quote.ts` (`POST` + `GET` 405) validando `Content-Length`, `multipart/form-data` y JSON, rechazando `items` malformados, procesando el PDF en una única lectura en memoria cuando `creditRequested === true`, y enviando vía Resend REST API a `serviciocliente@asoexi.com`.
- Se integró el flujo formal y de crédito a 45 días con carga reactiva de RUT PDF directamente dentro de `src/islands/QuoteDrawer.tsx` (vistas `'list' | 'formal' | 'formal-success'`, sin segundo modal flotante, con botón `"Quitar PDF"`, guardia de secuencia contra race conditions, timeout defensivo en cliente y vaciado de `$cartStore.clear()` tras HTTP 200) y se agregó un acceso directo desde `src/islands/ContactChannelModal.tsx`.
- Se añadieron pruebas unitarias TDD en `tests/unit/quote-formal.test.ts` y `tests/unit/quote-drawer.test.ts`, alcanzando 302 pruebas pasando en 14 suites con 0 errores y 0 warnings en `astro check`, `tsc --noEmit` y `astro build`.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / Route |
|---------|---------|------------------|
| `src/pages/api/quote.ts` & `astro.config.mjs` -- El proyecto tiene `output: 'static'` sin adaptador `@astrojs/cloudflare` instalado y `quote.ts` omite `export const prerender = false`, por lo que `astro build` emite un archivo estático con el `GET` 405 y no ejecuta `POST` en producción hasta instalar el adaptador Cloudflare | medium | `defer` -- Verificado por las 3 capas. Instalar y configurar `@astrojs/cloudflare` y `export const prerender = false` corresponde a la configuración de despliegue en Cloudflare Pages (ARCH-7) para no romper el flujo actual de build estático sin Wrangler/Cloudflare. Se registra en `deferred-work.md`. |
| `src/pages/api/quote.ts` -- Ausencia de rate limiting, Turnstile/honeypot o verificación `Origin`/`Referer` en `POST /api/quote` | medium | `defer` -- Verificado (`blind-hunter`). El spec no incluyó Turnstile/rate limiting en el alcance de Story 4.4; se registra en `deferred-work.md` para hardening de producción antes de abrir el endpoint público en Cloudflare Pages. |
| `src/islands/QuoteDrawer.tsx:163-173` -- `await validateRutPdfFile(rutFile)` en `submitFormalQuoteRequest` se ejecuta fuera de `try/catch`; si `file.arrayBuffer()` rechaza, el envío falla sin capturar error ni mostrar feedback al usuario | high | `patch` -- Verificado (`blind-hunter`, `edge-case-hunter`). Envolver `validateRutPdfFile` dentro de `try/catch` en `submitFormalQuoteRequest` retornando `{ ok: false, error, fieldErrors: { rutFile }, status: 400 }`. |
| `src/pages/api/quote.ts:52-65` -- `parseItemsField` captura errores de `JSON.parse` y silenciosamente devuelve `[]`, haciendo que un campo `items` corrupto responda HTTP 200 con lista vacía en vez de HTTP 400 `VALIDATION_ERROR` | high | `patch` -- Verificado (`blind-hunter`, `edge-case-hunter`). Retornar HTTP 400 `VALIDATION_ERROR` cuando `items` sea JSON malformado o no sea un arreglo válido. |
| `src/pages/api/quote.ts:102-103` -- `POST` llama `await request.formData()` / `await request.json()` sin verificar primero `Content-Length` contra el límite de 5 MB + margen | medium | `patch` -- Verificado (`blind-hunter`, `edge-case-hunter`). Verificar `Content-Length` antes de leer el body y responder HTTP 413 `FILE_TOO_LARGE` si excede `MAX_RUT_FILE_SIZE_BYTES + 262144`. |
| `src/pages/api/quote.ts:175-225` & `src/lib/quote-formal.ts:220-290` -- Doble lectura de `uploadedRutFile.arrayBuffer()` en `POST` (una en `validateRutPdfFile` y otra para `arrayBufferToBase64`) | medium | `patch` -- Verificado (`blind-hunter`). Retornar o reutilizar el `ArrayBuffer` ya leído en una sola lectura para reducir el pico de memoria en Edge isolates. |
| `src/pages/api/quote.ts:200-225` & `src/lib/quote-formal.ts:375` -- Si `creditRequested === false` pero llega `rutFile`, el endpoint igual lo adjunta aunque el texto diga `Solicita Crédito: No`; y `buildQuoteEmailPayload` muestra `RUT_Empresa.pdf` aunque `rutAttachment` sea `undefined` | medium | `patch` -- Verificado (`blind-hunter`). Ignorar `uploadedRutFile` cuando `creditRequested === false` y condicionar la línea de RUT adjunto en `creditSectionHtml` a la existencia de `rutAttachment`. |
| `src/islands/QuoteDrawer.tsx:591-723` & `src/lib/quote-formal.ts:36-44` -- Faltan mensajes de error inline/`aria-invalid` para `contactName`, `phone` y `notes`, y el regex de `nit` `/^[0-9.\-\s]+$/` acepta `"-----"` sin dígitos | medium | `patch` -- Verificado (`blind-hunter`, `edge-case-hunter`). Renderizar `formalFieldErrors` para `contactName`, `phone` y `notes`, y exigir al menos 5 dígitos en `nit` (`.refine((v) => v.replace(/\D/g, '').length >= 5, ...)`). |
| `src/islands/QuoteDrawer.tsx:334-369` -- Race condition en `handleRutFileChange` si el usuario selecciona o limpia otro archivo antes de que resuelva `validateRutPdfFile`, y falta botón para quitar el RUT seleccionado | medium | `patch` -- Verificado (`edge-case-hunter`, `blind-hunter`). Añadir contador de secuencia `rutValidationSeqRef` para descartar validaciones obsoletas y botón `"Quitar PDF"` (`min-h-[48px]`) junto al estado de archivo verificado. |
| `src/islands/QuoteDrawer.tsx:178-183` -- `fetchFn('/api/quote', ...)` en `submitFormalQuoteRequest` no tiene `AbortController` timeout en cliente; una petición colgada deja `isSubmittingFormal = true` indefinidamente | medium | `patch` -- Verificado (`edge-case-hunter`). Añadir timeout defensivo (`AbortController`, 15000 ms) limpiado en `finally`. |
| `src/lib/quote-formal.ts:1125,1230,1298,1444` -- (1) `validateRutPdfFile` rechaza MIME parametrizados como `application/pdf; charset=binary`, (2) `subject` no sanitiza `\r`/`\n`, (3) `request.notes` en HTML colapsa saltos de línea sin `white-space: pre-line`, y (4) `sendQuoteFormalEmail` no chequea `controller.signal.aborted` al detectar timeout | medium | `patch` -- Verificado (`blind-hunter`, `edge-case-hunter`). Normalizar MIME con `split(';')[0].trim()`, limpiar `[\r\n]+` en `subject`, añadir `white-space:pre-line;` en el párrafo de `notes` y verificar `controller.signal.aborted` en `sendQuoteFormalEmail`. |
| `src/lib/quote-formal.ts:1094` -- `latin1.includes('/Encrypt')` puede dar falsos positivos si un stream de imagen contiene la secuencia `/Encrypt` y no detecta escapes hex (`/#45ncrypt`) | low | `defer` -- Verificado (`blind-hunter`). La heurística `/Encrypt` sobre el buffer cumple explícitamente las Design Notes del spec y cubre todos los PDFs estándar con contraseña sin añadir un parser PDF pesado al bundle Edge; una mejora con parser de trailer PDF queda diferida. |
| `src/islands/ContactChannelModal.tsx:53` & strings hardcoded de `serviciocliente@asoexi.com` -- El botón de `ContactChannelModal` menciona `"Crédito a 45 Días con RUT"` pero despacha `creditRequested = false`, y varias cadenas duplican el correo literal en vez de `OFFICIAL_QUOTE_RECIPIENT_EMAIL` | low | `patch` -- Verificado (`blind-hunter`). Reusar `OFFICIAL_QUOTE_RECIPIENT_EMAIL` en `ContactChannelModal.tsx` y mensajes de error de `QuoteDrawer.tsx`/`quote-formal.ts`. (Mantener `dispatchQuoteFormalModalEvent(false)` en `ContactChannelModal` porque el botón cubre tanto `"Sin WhatsApp"` como `"Crédito a 45 Días"`, permitiendo marcar la casilla dentro del cajón). |
| `tests/unit/quote-drawer.test.ts` & `tests/unit/quote-formal.test.ts` -- Faltan pruebas para: (1) inspección del `FormData` enviado por `submitFormalQuoteRequest` (ítems mapeados + RUT PDF con `creditRequested: true`), (2) `formatZodFieldErrors` / `VALIDATION_ERROR` en `POST` y `submitFormalQuoteRequest`, y (3) `GET` 405, `RESEND_API_KEY` ausente (502), `Content-Type` no soportado y `items` JSON malformado | high | `patch` -- Verificado por `verification-gap` y `blind-hunter`. Añadir todas estas pruebas unitarias en `tests/unit/quote-formal.test.ts` y `tests/unit/quote-drawer.test.ts`. |
| `tests/unit/quote-drawer.test.ts` -- El handoff por evento DOM entre `ContactChannelModal` y `QuoteDrawer` no tiene prueba de montaje de componentes Preact | medium | `defer` -- Verificado por `verification-gap`. Coincide con el trabajo diferido de entorno DOM/Preact (`jsdom`/`@testing-library/preact` o Playwright E2E) ya registrado en `deferred-work.md`. |

## Design Notes

- **Vista integrada en `QuoteDrawer` sin segundo modal:** El `QuoteDrawer` maneja 3 vistas internas (`'list' | 'formal' | 'formal-success'`). Esto preserva 100% la trampa de foco WCAG 2.2 AA, la convivencia Singleton con la mascota/sticky bar y el estado de `$cartStore`, evitando el parpadeo o pérdida de contexto al pasar de un modal a otro. Además, conserva el fallback `mailto:serviciocliente@asoexi.com` en caso de error de red del endpoint.
- **Inspección de PDF en memoria (Zero Data-at-Rest y detección de contraseña):** Tanto en el navegador (`file.arrayBuffer()`) como en `/api/quote.ts`, `inspectPdfBuffer(buffer)` verifica: (1) `byteLength > 0` y `byteLength <= 5 * 1024 * 1024`, (2) firma inicial `%PDF-` en los primeros bytes, y (3) ausencia de la entrada de diccionario `/Encrypt` en el contenido ASCII/Latin1 del buffer, rechazando reactivamente PDFs cifrados o protegidos con contraseña antes y durante el envío.
- **Compatibilidad de compilación estática y Cloudflare Edge:** `src/pages/api/quote.ts` exporta `POST: APIRoute` consumiendo la interfaz estándar Web Fetch (`Request`, `FormData`, `File`, `Response`, `ArrayBuffer`, `btoa`), lo que permite invocación directa en Cloudflare Workers Edge runtime, pruebas unitarias deterministas en Vitest y compilación limpia con `astro check && astro build`.

## Verification

**Commands:**
- `npm test` -- expected: 100% de las suites en Vitest pasan, `astro check` y `tsc --noEmit` con 0 errores y 0 warnings.
- `npm run build` -- expected: Compilación limpia en Astro sin errores ni advertencias.
