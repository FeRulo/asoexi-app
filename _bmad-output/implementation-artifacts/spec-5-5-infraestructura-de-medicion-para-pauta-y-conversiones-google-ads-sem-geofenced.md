---
title: 'Story 5.5: Infraestructura de Medición para Pauta y Conversiones Google Ads (SEM Geofenced)'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
baseline_commit: 'c2f722b5463b19a8235e3381c8bb7a04eacc2de2'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La capa de telemetría (`src/lib/analytics.ts` y `BaseLayout.astro`) solo soporta GA4 (`PUBLIC_GA4_MEASUREMENT_ID`) y clics a WhatsApp, careciendo de inicialización condicional de Google Ads (`AW-*`) y del disparo no bloqueante del evento `conversion` tanto en clics de WhatsApp como en envíos exitosos del formulario formal/crédito (`/api/quote`).

**Approach:** Extender `src/env.d.ts`, `src/lib/analytics.ts` y `BaseLayout.astro` para cargar `gtag.js` de forma asíncrona y única cuando existan `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` válidos, emitir `conversion` (`send_to: AW-XXXXXXXXX/LABEL`) con contexto sin PII desde `trackWhatsAppLead` y desde el éxito de `submitFormalQuoteRequest` en `QuoteDrawer.tsx`, manteniendo degradación silenciosa bajo bloqueadores.

## Boundaries & Constraints

**Always:**
- Validar `PUBLIC_GOOGLE_ADS_ID` con `/^AW-[A-Z0-9]{6,20}$/i` (normalizado a mayúsculas `AW-...`) y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` con `/^[A-Za-z0-9_-]{4,64}$/` antes de inyectar scripts o construir `send_to`.
- Cargar `https://www.googletagmanager.com/gtag/js?id=...` una sola vez en `BaseLayout.astro` (priorizando `ga4MeasurementId ?? googleAdsId` con `async`) y configurar `window.gtag('config', googleAdsId, { transport_type: 'beacon' })` cuando `googleAdsId` sea válido.
- Emitir `window.gtag('event', 'conversion', { send_to, origin_page, brand_origin, sector_origin, brand_tier, conversion_source, transport_type: 'beacon' })` de forma no bloqueante (< 50 ms) dentro de `try/catch` ante: (1) `trackWhatsAppLead` y (2) envío exitoso (`outcome.ok === true`) del formulario formal/crédito en `QuoteDrawer.tsx`.
- Capturar el contexto de requisición (`deriveRequisitionAnalyticsContext` + `readPageAnalyticsContext`) antes de limpiar `$cartStore` tras `/api/quote`, sin enviar PII (ni NIT, correo, teléfono, razón social o contacto).
- Cumplir TDD, `npm test` (`vitest run && astro check && tsc --noEmit`) y `npm run build` con 0 errores y 0 warnings.

**Never:**
- No duplicar la etiqueta `<script async src="https://www.googletagmanager.com/gtag/js...">` si GA4 y Google Ads están ambos configurados.
- No usar `event_callback` bloqueante ni retrasar la apertura de WhatsApp o la confirmación visual de `QuoteDrawer`.
- No emitir `conversion` si falla la validación de `/api/quote` o si falta alguno de `PUBLIC_GOOGLE_ADS_ID` o `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`.
- No modificar los 13 archivos de UI estáticos ya instrumentados en Story 5.3 ni alterar `QuoteFormalModal` / `/api/quote` en el servidor.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Credenciales Google Ads válidas | `PUBLIC_GOOGLE_ADS_ID='aw-123456789'`, `LABEL='AbCd_12-x'` | `sanitizeGoogleAdsId` retorna `'AW-123456789'`; `buildGoogleAdsSendTo` retorna `'AW-123456789/AbCd_12-x'` | N/A |
| Credencial inválida / inyección | `'"><script>'`, `'G-12345'`, `''`, `undefined` | Sanitizadores retornan `null`; `buildGoogleAdsSendTo` retorna `null`; no inyecta `AW-*` ni dispara `conversion` | Omisión silenciosa |
| Clic WhatsApp con Ads activo | `trackWhatsAppLead(ctx)` con `send_to` válido | Llama `gtag('event', 'lead_whatsapp_click', ...)` y `gtag('event', 'conversion', { send_to, conversion_source: 'whatsapp', ... })` | Si `gtag` falta o lanza, retorna `false` sin error |
| Envío formal `/api/quote` exitoso | `outcome.ok === true` en `QuoteDrawer.tsx` | Llama `trackFormalQuoteConversion` con contexto pre-clear (`credit_requested`, `conversion_source: 'formal_quote'`) y dispara `conversion` | Si `gtag` falta o lanza, la UI muestra confirmación normal |
| Envío formal `/api/quote` fallido | `outcome.ok === false` (error 400/502) | No dispara `conversion` hacia Google Ads | N/A |
| Bloqueador (AdBlock / Brave) | `window.gtag` es `undefined` o lanza excepción | `try/catch` captura en < 5 ms sin errores en consola ni bloqueo de UI | Degradación silenciosa |

</frozen-after-approval>

## Code Map

- `src/env.d.ts` -- Añadir `PUBLIC_GOOGLE_ADS_ID?: string` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?: string` a `ImportMetaEnv`.
- `src/lib/analytics.ts` -- Añadir `sanitizeGoogleAdsId`, `sanitizeGoogleAdsConversionLabel`, `buildGoogleAdsSendTo`, `resolvePrimaryGtagScriptId`, `trackGoogleAdsConversion`, `trackFormalQuoteConversion` y conectar el disparo condicional de Google Ads dentro de `trackWhatsAppLead`.
- `src/layouts/BaseLayout.astro` -- Usar `resolvePrimaryGtagScriptId(ga4MeasurementId, googleAdsId)` para cargar `gtag.js` una sola vez y ejecutar `window.gtag('config', googleAdsId, { transport_type: 'beacon' })` cuando `googleAdsId` esté presente.
- `src/islands/QuoteDrawer.tsx` -- En `handleFormalQuoteSubmit`, capturar `deriveRequisitionAnalyticsContext(cartState.items)` antes de `submitFormalQuoteRequest` y llamar `trackFormalQuoteConversion(...)` cuando `outcome.ok` sea `true`.
- `tests/unit/google-ads-telemetry.test.ts` *(nuevo)* -- Suite TDD para matriz I/O de Google Ads, carga única en `BaseLayout.astro`, disparo en `trackWhatsAppLead` y `QuoteDrawer.tsx`, simulación de bloqueadores (< 50 ms) y auditoría de HTML compilado en `dist/client/`.

## Tasks & Acceptance

**Execution:**
- [ ] `tests/unit/google-ads-telemetry.test.ts` -- Escribir tests TDD cubriendo sanitización `AW-*`/label, `buildGoogleAdsSendTo`, `resolvePrimaryGtagScriptId`, `trackWhatsAppLead` + `conversion`, `trackFormalQuoteConversion`, degradación bajo bloqueadores y verificación de `BaseLayout.astro` / `QuoteDrawer.tsx` / `dist/client/` -- Cumplir ciclo Red-Green-Refactor y matriz I/O.
- [ ] `src/env.d.ts` -- Declarar `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` en `ImportMetaEnv` -- Tipar configuración pública de Google Ads.
- [ ] `src/lib/analytics.ts` -- Implementar funciones puras/defensivas de Google Ads (`sanitizeGoogleAdsId`, `sanitizeGoogleAdsConversionLabel`, `buildGoogleAdsSendTo`, `resolvePrimaryGtagScriptId`, `trackGoogleAdsConversion`, `trackFormalQuoteConversion`) e integrar en `trackWhatsAppLead` -- Centralizar medición no bloqueante sin PII.
- [ ] `src/layouts/BaseLayout.astro` -- Cargar `gtag.js` una sola vez con `resolvePrimaryGtagScriptId` y configurar `googleAdsId` condicionalmente -- Soportar Google Ads solo o junto a GA4 sin penalizar CWV.
- [ ] `src/islands/QuoteDrawer.tsx` -- Invocar `trackFormalQuoteConversion` tras `outcome.ok === true` usando el contexto de ítems capturado antes de limpiar el carrito -- Medir conversiones de cotización formal y crédito 45 días.

**Acceptance Criteria:**
- Given `npm run build` sin `PUBLIC_GOOGLE_ADS_ID`, when se inspecciona `dist/client/index.html`, then no se inyecta ninguna configuración `AW-*` ni script adicional de Google Ads.
- Given `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GA4_MEASUREMENT_ID` configurados simultáneamente, when `BaseLayout.astro` renderiza el `<head>`, then incluye exactamente un `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` y ejecuta `config` para ambos IDs.
- Given un navegador con bloqueador donde `window.gtag` no existe o lanza error, when el usuario cotiza por WhatsApp o radica una cotización formal exitosa, then ambos flujos completan en < 50 ms sin errores en consola.

## Implementation Notes

- Declaradas `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` en [env.d.ts](../../src/env.d.ts).
- Implementadas en [analytics.ts](../../src/lib/analytics.ts) las utilidades `sanitizeGoogleAdsId`, `sanitizeGoogleAdsConversionLabel`, `buildGoogleAdsSendTo`, `resolvePrimaryGtagScriptId`, `trackGoogleAdsConversion` y `trackFormalQuoteConversion`, conectando además el disparo condicional de `conversion` dentro de `trackWhatsAppLead` sin PII y bajo `try/catch`.
- Actualizado [BaseLayout.astro](../../src/layouts/BaseLayout.astro) para cargar `gtag.js` una sola vez (`resolvePrimaryGtagScriptId`) y emitir `config` condicional para `googleAdsId`.
- Actualizado [QuoteDrawer.tsx](../../src/islands/QuoteDrawer.tsx) para capturar el contexto de requisición antes de limpiar `$cartStore` y disparar `trackFormalQuoteConversion` solo cuando `outcome.ok === true`.
- Verificado con [google-ads-telemetry.test.ts](../../tests/unit/google-ads-telemetry.test.ts) (21/21 tests), [quote-drawer.test.ts](../../tests/unit/quote-drawer.test.ts) (26/26 tests), `astro check` (0 errores, 0 warnings), `tsc --noEmit` (0 errores) y `npm run build`.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind-hunter | `getDefaultGoogleAdsConfig` usa optional chaining (`import.meta.env?.PUBLIC_*`) que puede impedir reemplazo estático de Vite | `medium` | patch | Verificado en `src/lib/analytics.ts:216-217`; acceder directamente a `import.meta.env.PUBLIC_GOOGLE_ADS_ID` y `import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` dentro del `try/catch`. |
| 2 | blind-hunter | `whatsapp` y `formal_quote` comparten un único `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | `false` | reject | El spec congelado y `epics.md` (Story 5.5) definen explícitamente `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` como únicas variables; `conversion_source` diferencia ambos flujos. |
| 3 | blind-hunter | `trackFormalQuoteConversion` no reenvía `transaction_id` (`outcome.referenceId`) | `low` | reject | `QuoteDrawer.tsx` cambia de inmediato a la vista `'success'` y limpia el formulario tras `outcome.ok`; además `transaction_id` no forma parte del contrato de payload del spec. |
| 4 | blind-hunter | Envío exitoso de `/api/quote` no emite evento GA4 adicional | `false` | reject | Fuera de alcance de la intención de Story 5.5, centrada en infraestructura de conversión Google Ads (`AW-*`). |
| 5 | blind-hunter | Merge `{ ...readPageAnalyticsContext(), ...deriveRequisitionAnalyticsContext(cartState.items) }` conserva `isTractor` de página si el carrito está vacío/libre | `false` | reject | `deriveRequisitionAnalyticsContext` fija `brandTier: 'general'` en ítems vacíos/libres y `buildWhatsAppLeadPayload` prioriza `brandTier` sobre `isTractor`; el override `'general'` es intencional. |
| 6 | blind-hunter | Ningún test prueba `getDefaultGoogleAdsConfig()` con `vi.stubEnv` omitiendo `adsOptions` | `medium` | patch | Misma causa raíz que #9 (verification-gap); añadir tests con `vi.stubEnv` sin `adsOptions`. |
| 7 | blind-hunter | Falta test de `handleDelegatedWhatsAppClick` con Ads y el test de `QuoteDrawer.tsx` solo usa `indexOf` | `medium` | patch | Misma causa raíz que #10 (verification-gap) más cobertura de `handleDelegatedWhatsAppClick` con `vi.stubEnv`. |
| 8 | blind-hunter | Comprobación de `dist/client/index.html` hace `return` silencioso si no existe el archivo | `false` | reject | Guarda intencional compartida con `analytics.test.ts` porque `npm test` corre antes de `npm run build` en `package.json`. |
| 9 | verification-gap | Ruta de fallback por env vars en `getDefaultGoogleAdsConfig` sin cobertura ejecutada | `medium` | patch | Pre-verificado; añadir tests con `vi.stubEnv('PUBLIC_GOOGLE_ADS_ID', ...)` y `vi.stubEnv('PUBLIC_GOOGLE_ADS_CONVERSION_LABEL', ...)` en `tests/unit/google-ads-telemetry.test.ts`. |
| 10 | verification-gap | Cableado de `QuoteDrawer.tsx` (`handleFormalQuoteSubmit`) solo verificado por texto fuente | `medium` | patch | Pre-verificado; extraer helper ejecutable para orquestación formal + telemetría y probar `outcome.ok === true` (pre-clear + `creditRequested`) y `outcome.ok === false` (sin conversión). |
| 11 | verification-gap | Inyección de `gtag.js` y `config` de Google Ads en `BaseLayout.astro` sin verificación ejecutada con env vars | `medium` | defer | Pre-verificado; el entorno Vitest (`node`) no incluye Astro Container API ni E2E navegador para renderizar `.astro` con `PUBLIC_GOOGLE_ADS_ID` activo. Diferido a `deferred-work.md`. |
