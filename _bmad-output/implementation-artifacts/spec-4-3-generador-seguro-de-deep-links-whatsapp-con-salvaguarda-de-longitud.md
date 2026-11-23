---
title: 'Story 4.3: Generador Seguro de Deep Links WhatsApp con Salvaguarda de Longitud'
type: 'feature'
created: '2026-11-23'
status: 'done'
baseline_commit: '23d8754a06e5fc138bcbc3019c047ea9a20a3d0b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores corporativos que cotizan requisiciones multimarca por WhatsApp necesitan que su mensaje llegue pre-formateado con la plantilla de 6 datos clave para que las asesoras comerciales (Geraldine y Sonia) respondan en ≤ 5 minutos, pero cuando la lista supera 8 ítems o 1.200 caracteres (EDGE-3), los límites de longitud de URL en navegadores móviles pueden truncar o corromper el enlace `wa.me`.

**Approach:** Extender `src/lib/whatsapp.ts` con un generador estructurado de requisiciones B2B que formatee la plantilla de 6 datos clave (Razón Social, NIT, Teléfono, Dirección de entrega, Referencias con cantidades y Notas de insumos libres), evalúe los umbrales de salvaguarda EDGE-3 (`> 8` ítems o `> 1200` caracteres) y provea un manejador de copiado al portapapeles con fallback visual a modal/panel de texto pre-seleccionado cuando el navegador bloquee permisos, integrando el flujo y el aviso confirmatorio (*"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"*) en `QuoteDrawer.tsx` y `LiveSearchModal.tsx`.

## Boundaries & Constraints

**Always:**
- Centralizar el destinatario al 100% en la Línea Corporativa Oficial de WhatsApp `+57 301 419 1344` (`WHATSAPP_ADVISORS[0]`), manteniendo el saludo al equipo comercial (`Geraldine y Sonia`) y la promesa `SLA ≤ 5 min`.
- Implementar en `src/lib/whatsapp.ts` la plantilla estructurada de 6 datos clave para requisiciones B2B:
  1. **Razón Social** (con valor proporcionado o placeholder listo para completar en el chat).
  2. **NIT** (con valor proporcionado o placeholder listo para completar).
  3. **Teléfono** (con valor proporcionado o placeholder listo para completar).
  4. **Dirección de entrega** (ciudad/obra con valor proporcionado o placeholder listo para completar).
  5. **Referencias con cantidades** (desglose numerado de ítems con sus cantidades en unidades y sector/marca cuando aplique).
  6. **Notas de insumos libres** (consolidado explícito de las notas de insumos libres o especificaciones adicionales de obra; si no hay notas personalizadas, indicarlo limpia y estructuradamente en el campo).
- Implementar la salvaguarda de longitud EDGE-3 en `src/lib/whatsapp.ts`:
  - Exportar constantes configurables `WHATSAPP_MAX_SAFE_ITEMS = 8` y `WHATSAPP_MAX_SAFE_CHARS = 1200`.
  - Si la lista es estándar (`items.length <= 8` y longitud del mensaje completo `<= 1200` caracteres): generar el deep link `https://wa.me/573014191344?text=...` con el mensaje completo de 6 datos clave pre-cargado directamente (`requiresSafeguard: false`).
  - Si la lista es extensa (`items.length > 8` o longitud del mensaje completo `> 1200` caracteres): activar la salvaguarda (`requiresSafeguard: true`), retornando:
    - `fullMessage`: el mensaje completo con la plantilla de 6 datos clave y la totalidad de los ítems para copiar al portapapeles.
    - `safeIntroMessage` y `whatsappUrl`: deep link hacia `+57 301 419 1344` con un mensaje introductorio seguro y corto (indicando la cantidad total de materiales/unidades y que el listado completo se pega a continuación, más los campos de datos de empresa) que jamás supere los límites de URL móvil.
    - `confirmationNotice`: el texto normativo exacto `"¡Lista de ${items.length} materiales copiada al portapapeles! Pégala en el chat de WhatsApp"`.
- Mantener compatibilidad hacia atrás en `generateRequisitionWhatsAppUrl(items, storage)` para que continúe retornando un `string` con la URL `wa.me` válida (usando la plantilla de 6 datos clave para listas estándar, o la URL con mensaje introductorio seguro si excede los umbrales EDGE-3, o `DEFAULT_WHATSAPP_MESSAGE` si la lista está vacía).
- Implementar la utilidad de portapapeles `copyTextToClipboard(text)` en `src/lib/whatsapp.ts` que intente copiar de forma inmediata en el gesto del clic (vía `document.execCommand('copy')` síncrono con `<textarea>` temporal y/o `navigator.clipboard.writeText`), retornando un booleano de éxito sin lanzar excepciones no controladas.
- Integrar el flujo interactivo de salvaguarda en `src/islands/QuoteDrawer.tsx` y `src/islands/LiveSearchModal.tsx` al presionar *"Cotizar por WhatsApp"*:
  - Para listas estándar (`!requiresSafeguard`): abrir WhatsApp directamente con el mensaje completo pre-cargado.
  - Para listas extensas (`requiresSafeguard === true`):
    1. Ejecutar en el manejador del clic la copia de `fullMessage` al portapapeles.
    2. Si la copia tiene éxito: mantener visible el aviso visual confirmatorio *"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"* y abrir WhatsApp con el mensaje introductorio seguro.
    3. Si el navegador bloquea permisos de portapapeles (`copied === false`): desplegar el modal/panel visual de respaldo con el texto completo pre-seleccionado (`<textarea readOnly>`), instrucción clara para copiar manualmente y botón directo para continuar al chat de WhatsApp (`whatsappUrl`).
- Seguir metodología TDD estricta creando pruebas unitarias exhaustivas en `tests/unit/whatsapp.test.ts` y `tests/unit/quote-drawer.test.ts`, verificando que `npm test` y `npm run build` finalicen con 0 errores y 0 warnings.

**Never:**
- No truncar ni descartar ítems de la requisición del usuario cuando supere 8 ítems o 1.200 caracteres; el listado íntegro debe preservarse en `fullMessage` para el portapapeles o fallback visual.
- No utilizar números telefónicos distintos a `+57 301 419 1344`.
- No bloquear la apertura de WhatsApp si `navigator.clipboard` no está disponible o falla; el fallback visual con texto seleccionado debe garantizar que el comprador siempre pueda copiar su lista y abrir el chat.
- No modificar ni implementar en esta historia el endpoint `/api/quote.ts` ni el modal `QuoteFormalModal.tsx` (alcance exclusivo de Story 4.4).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lista vacía o nula | `items = []` o `null` | `requiresSafeguard: false`, `whatsappUrl` apunta a `+57 301 419 1344` con `DEFAULT_WHATSAPP_MESSAGE` | Fallback limpio sin errores |
| Lista estándar (≤ 8 ítems y ≤ 1.200 chars) | 3 ítems (2 de catálogo + 1 insumo libre con nota) | `requiresSafeguard: false`; mensaje completo pre-cargado en `whatsappUrl` con los 6 datos clave (Razón Social, NIT, Teléfono, Dirección de entrega, Referencias con cantidades, Notas de insumos libres) | Apertura directa en un solo toque |
| Lista extensa por cantidad de ítems (> 8 ítems) | 9 ítems en `$cartStore` (aunque tenga < 1.200 chars) | `requiresSafeguard: true`; copia `fullMessage` al portapapeles, muestra aviso `"¡Lista de 9 materiales copiada al portapapeles! Pégala en el chat de WhatsApp"` y abre `whatsappUrl` con mensaje introductorio seguro | Evita URL excesivamente larga |
| Lista extensa por longitud de caracteres (> 1.200 chars) | 4 ítems con descripciones/notas técnicas que suman 1.350 caracteres | `requiresSafeguard: true`; copia `fullMessage` al portapapeles, muestra aviso `"¡Lista de 4 materiales copiada al portapapeles! Pégala en el chat de WhatsApp"` y abre `whatsappUrl` con mensaje introductorio seguro | Salvaguarda por límite de caracteres (EDGE-3) |
| Bloqueo de permisos de portapapeles en navegador | Lista extensa + `navigator.clipboard` / `execCommand` rechazado o no soportado | `copyTextToClipboard` retorna `false`; la UI despliega vista/modal de fallback con `<textarea>` pre-seleccionado conteniendo `fullMessage` y botón para abrir WhatsApp con el mensaje introductorio | Degradación elegante sin pérdida de datos |

</frozen-after-approval>

## Code Map

- `src/lib/whatsapp.ts` -- Añadir constantes `WHATSAPP_MAX_SAFE_ITEMS = 8` y `WHATSAPP_MAX_SAFE_CHARS = 1200`, tipos `RequisitionWhatsAppItem`, `RequisitionCustomerData` y `RequisitionWhatsAppPayload`, funciones `formatRequisitionFullMessage`, `formatRequisitionSafeIntroMessage`, `buildRequisitionWhatsAppPayload`, `copyTextToClipboard` y actualizar `generateRequisitionWhatsAppUrl`.
- `src/islands/QuoteDrawer.tsx` -- Integrar `buildRequisitionWhatsAppPayload` y `copyTextToClipboard` en el botón primario de WhatsApp, mostrando el banner/toast confirmatorio (`"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"`) o el modal/panel de fallback con texto pre-seleccionado cuando el navegador bloquee el portapapeles.
- `src/islands/LiveSearchModal.tsx` -- Conectar el botón `"Cotizar lista (...) en WhatsApp"` de la barra inferior de requisición con la misma salvaguarda de longitud y fallback visual para garantizar comportamiento consistente desde cualquier punto de entrada.
- `tests/unit/whatsapp.test.ts` -- Ampliar suite TDD para validar la plantilla de 6 datos clave, el umbral exacto de 8 ítems vs 9 ítems, el umbral de 1.200 caracteres, el mensaje introductorio seguro, el texto confirmatorio y el helper `copyTextToClipboard` (éxito y bloqueo de permisos).
- `tests/unit/quote-drawer.test.ts` -- Añadir pruebas unitarias verificando la integración de los payloads de salvaguarda y estados de confirmación/fallback con ítems del `$cartStore`.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/whatsapp.test.ts` & `tests/unit/quote-drawer.test.ts` -- Escribir pruebas unitarias TDD para la plantilla de 6 datos clave, umbrales EDGE-3 (`<= 8` vs `> 8` ítems, `<= 1200` vs `> 1200` caracteres), aviso confirmatorio y copiado al portapapeles con fallback -- Garantizar ciclo Red-Green-Refactor estricto.
- [x] `src/lib/whatsapp.ts` -- Implementar `WHATSAPP_MAX_SAFE_ITEMS`, `WHATSAPP_MAX_SAFE_CHARS`, `formatRequisitionFullMessage`, `formatRequisitionSafeIntroMessage`, `buildRequisitionWhatsAppPayload`, `copyTextToClipboard` y actualizar `generateRequisitionWhatsAppUrl` -- Motor central de generación segura de deep links WhatsApp (Story 4.3).
- [x] `src/islands/QuoteDrawer.tsx` & `src/islands/LiveSearchModal.tsx` -- Conectar el manejador de clic de cotización por WhatsApp con la salvaguarda de longitud, mostrando el aviso confirmatorio cuando se copia al portapapeles y el panel/modal con texto pre-seleccionado si el navegador bloquea permisos -- Experiencia completa de usuario sin truncamiento ni cierre abrupto.
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Sincronizar el estado de la historia 4.3 en el seguimiento del sprint -- Mantener trazabilidad del proyecto.

**Acceptance Criteria:**
- Given la función generadora en `src/lib/whatsapp.ts`, when se activa la cotización de la requisición hacia el número oficial `+57 301 419 1344`, then estructura el mensaje con la plantilla de 6 datos clave: Razón Social, NIT, Teléfono, Dirección de entrega, Referencias con cantidades y Notas de insumos libres.
- Given una lista extensa de materiales (más de 8 ítems o más de 1.200 caracteres, EDGE-3), when el usuario presiona *"Cotizar por WhatsApp"*, then el sistema ejecuta en el manejador del clic la copia de la lista al portapapeles del dispositivo (con fallback visual a modal con texto seleccionado si el navegador bloquea permisos), despliega el aviso visual confirmatorio (*"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"*), y abre WhatsApp con un mensaje introductorio seguro para evitar truncamiento por límites de URL en navegadores móviles.
- Given una lista estándar (≤ 8 ítems y ≤ 1.200 caracteres), when se abre WhatsApp, then el mensaje completo aparece pre-cargado directamente en el campo de texto listo para ser enviado con un solo toque.

## Implementation Notes

- Se extendió `src/lib/whatsapp.ts` con las constantes `WHATSAPP_MAX_SAFE_ITEMS = 8` y `WHATSAPP_MAX_SAFE_CHARS = 1200`, los tipos `RequisitionWhatsAppItem`, `RequisitionCustomerData` y `RequisitionWhatsAppPayload`, y las funciones `formatRequisitionFullMessage`, `formatRequisitionSafeIntroMessage`, `buildRequisitionWhatsAppPayload`, `copyTextToClipboardSync`, `copyTextToClipboard` y `generateRequisitionWhatsAppUrl`.
- La plantilla de requisición formatea los 6 datos clave corporativos (Razón Social, NIT, Teléfono, Dirección de entrega, Referencias con cantidades y Notas de insumos libres) dirigidos exclusivamente a la Línea Corporativa Oficial (`+57 301 419 1344`).
- Se implementó `copyTextToClipboardSync` con limpieza DOM en bloque `finally` y restauración de `document.activeElement` para no interferir con la trampa de foco WCAG 2.2 AA, permitiendo que cuando el copiado síncrono tiene éxito el enlace `<a target="_blank">` navegue nativamente dentro del user gesture sin bloqueo de popups en iOS Safari / móviles.
- Se integró `executeRequisitionWhatsAppAction` en `src/islands/QuoteDrawer.tsx` y `src/islands/LiveSearchModal.tsx`, desplegando el banner confirmatorio (`"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"`) o el panel visual de respaldo con `<textarea readOnly>` pre-seleccionado cuando el navegador bloquea permisos de portapapeles.
- Se ampliaron `tests/unit/whatsapp.test.ts` y `tests/unit/quote-drawer.test.ts` alcanzando 265 pruebas unitarias en 13 suites con 0 errores y 0 warnings en `astro check` y `tsc --noEmit`.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / Route |
|---------|---------|------------------|
| `src/islands/QuoteDrawer.tsx:461-496` & `src/islands/LiveSearchModal.tsx:222-257` -- `e.preventDefault()` llamado incondicionalmente antes de `await copyTextToClipboard` y `window.open` ejecutado tras el `await`, causando bloqueo de popups en iOS Safari/móviles al perder el user gesture | high | `patch` -- Verificado por las 3 capas (`blind-hunter`, `edge-case-hunter`, `verification-gap`). Implementar copia síncrona primero; si la copia síncrona tiene éxito, permitir la navegación nativa de `<a href={payload.whatsappUrl} target="_blank">` sin `e.preventDefault()`; solo llamar `e.preventDefault()` si la copia síncrona no tuvo éxito (intentando `navigator.clipboard.writeText` o abriendo el fallback visual). |
| `src/islands/QuoteDrawer.tsx:34-54,461` & `src/islands/LiveSearchModal.tsx:222` -- `executeRequisitionWhatsAppAction` es exportada y probada en `tests/unit/quote-drawer.test.ts` pero los manejadores `handlePrimaryWhatsAppClick` y `handleRequisitionWhatsAppClick` duplican la lógica inline sin invocarla | high | `patch` -- Verificado por `verification-gap` y `blind-hunter`. Hacer que ambos componentes deleguen su evento de clic a `executeRequisitionWhatsAppAction` (o helper compartido) y probar las transiciones de evento, estado y fallback en `tests/unit/quote-drawer.test.ts`. |
| `src/lib/whatsapp.ts:399-449` -- En `copyTextToClipboard`: (1) `textarea.focus()` roba el foco del modal/drawer sin restaurar `document.activeElement`, (2) falta bloque `finally` para remover el `<textarea>` si ocurre excepción, y (3) ejecuta `navigator.clipboard.writeText` redundantemente incluso cuando `execCommand('copy')` ya tuvo éxito (`copiedSync === true`) | medium | `patch` -- Verificado por las 3 capas. Guardar `previousActiveElement`, limpiar el `<textarea>` y restaurar el foco en `finally`, y retornar `true` inmediatamente cuando `copiedSync === true`. |
| `src/islands/QuoteDrawer.tsx:1217` & `src/islands/LiveSearchModal.tsx:723` -- Al hacer clic en `"Abrir WhatsApp para pegar lista →"` dentro del panel de fallback (cuando falló el portapapeles), se asigna `setSafeguardConfirmationNotice(payload.confirmationNotice)` afirmando falsamente que la lista fue copiada al portapapeles | medium | `patch` -- Verificado por las 3 capas. Al pulsar el enlace en el panel de fallback, intentar copiar primero o simplemente cerrar el panel de fallback (`setSafeguardFallbackPayload(null)`) sin mostrar el aviso de copiado automático a menos que la copia haya retornado `true`. |
| `src/islands/LiveSearchModal.tsx:689-732` & `src/islands/QuoteDrawer.tsx:1168,1194` -- El panel de fallback en `LiveSearchModal` carece del botón `"Seleccionar y copiar lista"` (y el enlace usa `min-h-[44px]` en vez de `min-h-[48px]`), mientras que `QuoteDrawer` dice en el texto `"Copiar texto seleccionado"` pero el botón se llama `"Seleccionar y copiar lista"` | medium | `patch` -- Verificado por `blind-hunter`. Añadir el botón `"Seleccionar y copiar lista"` con `min-h-[48px]` en `LiveSearchModal.tsx` y alinear el microcopy con la etiqueta del botón en `QuoteDrawer.tsx`. |
| `src/islands/QuoteDrawer.tsx:190` & `src/islands/LiveSearchModal.tsx:38` -- `safeguardFallbackPayload` y `safeguardConfirmationNotice` quedan desactualizados si el usuario agrega, modifica o vacía ítems de `$cartStore` mientras el banner o panel de fallback está abierto | medium | `patch` -- Verificado por `blind-hunter`. Al cambiar `cartState.items`, limpiar `safeguardConfirmationNotice` y recalcular o limpiar `safeguardFallbackPayload`. |
| `src/lib/whatsapp.ts:254,307,375` -- En `formatRequisitionFullMessage`, `formatRequisitionSafeIntroMessage` y `buildRequisitionWhatsAppPayload`: (1) `item.quantity = Infinity` pasa `typeof === 'number' && !isNaN`, y (2) campos `customer` extremos (>1.200 chars) en `formatRequisitionSafeIntroMessage` no tienen límite de longitud | low | `patch` -- Verificado por `edge-case-hunter` y `blind-hunter`. Usar `Number.isFinite(item.quantity)` y truncar defensivamente los campos opcionales de `customer` en `formatRequisitionSafeIntroMessage` (máx 120 chars por campo) para garantizar que el mensaje introductorio seguro nunca exceda `WHATSAPP_MAX_SAFE_CHARS`. |
| `src/islands/QuoteDrawer.tsx:489` & `src/islands/LiveSearchModal.tsx:214` -- El `setTimeout` de 40ms para enfocar `safeguardTextareaRef` no se guarda en un `useRef` ni se limpia al cerrar/desmontar | low | `patch` -- Verificado por `blind-hunter`. Almacenar el timer en un `useRef` y limpiarlo al cerrar y desmontar. |

## Design Notes

- **Ejecución síncrona en el gesto de usuario (`onClick`) para portapapeles y apertura de pestaña:** Los navegadores móviles (iOS Safari, Chrome Android) exigen que tanto la copia al portapapeles como la navegación a `wa.me` ocurran dentro del user gesture. `copyTextToClipboard` intenta primero el copiado síncrono mediante un `<textarea>` temporal + `document.execCommand('copy')` (y encadena `navigator.clipboard.writeText` si está disponible). Si el copiado tiene éxito, el enlace `<a href={payload.whatsappUrl} target="_blank">` navega normalmente al mensaje introductorio seguro mientras el cajón permanece abierto mostrando el banner confirmatorio *"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"*. Si el copiado falla por bloqueo de permisos, se hace `e.preventDefault()`, se muestra el modal de fallback con el `<textarea>` auto-seleccionado y un botón directo *"Abrir WhatsApp para pegar lista"*.

## Verification

**Commands:**
- `npm test` -- expected: 100% de las suites en Vitest pasan, `astro check` y `tsc --noEmit` con 0 errores y 0 warnings.
- `npm run build` -- expected: Compilación SSG limpia en Astro sin errores ni advertencias.
