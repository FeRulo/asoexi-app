---
title: 'Story 5.3: Telemetría de Conversión por Canal Corporativo y Auditoría de Prospectos Calificados'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
baseline_commit: '2d94118ef83fb72ddea4d6a56ddbff6e4083d020'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los CTAs de cotización a WhatsApp corporativo (`+57 301 419 1344`) no envían telemetría a GA4, impidiendo atribuir leads por página, sector y tipo de marca (tractora vs. secundaria).

**Approach:** Crear un módulo defensivo `src/lib/analytics.ts` para disparar `lead_whatsapp_click` en `window.gtag`, cargar `gtag.js` de forma condicional y asíncrona en `BaseLayout.astro` vía `PUBLIC_GA4_MEASUREMENT_ID`, e instrumentar todos los enlaces estáticos (`data-wa-*` + delegación) y las islas Preact sin duplicar eventos ni bloquear WhatsApp bajo bloqueadores de anuncios.

## Boundaries & Constraints

**Always:**
- Emitir `lead_whatsapp_click` en todo clic/toque hacia WhatsApp corporativo con: `channel: 'corporate'`, `origin_page`, `brand_origin`, `sector_origin`, `brand_tier` (`'tractor' | 'secondary' | 'general'`) y `cta_location` opcional.
- Inyectar `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` en `BaseLayout.astro` solo si `PUBLIC_GA4_MEASUREMENT_ID` cumple `/^G-[A-Z0-9]{4,20}$/i`.
- Envolver todo acceso a `window.gtag`, `document` y `window.location` en `try/catch` verificando `typeof window.gtag === 'function'`, degradando silenciosamente (< 50 ms) ante AdBlock/uBlock/Brave Shields o SSR.
- Marcar los enlaces WhatsApp gestionados por islas Preact con `data-wa-managed="island"` para que el listener delegado global los omita y nunca haya doble disparo.
- Propagar `data-page-brand`, `data-page-sector` y `data-page-tractor` en `<body>` desde `BaseLayout.astro` para que CTAs globales hereden el contexto de marca/sector.
- Cumplir TDD, `npm test` (`vitest run && astro check && tsc --noEmit`) y `npm run build` con 0 errores y 0 warnings.

**Never:**
- No bloquear la navegación ni usar `event_callback` de GA4 para abrir WhatsApp.
- No enviar PII (teléfonos de clientes, correos, NITs ni nombres personales) en parámetros de GA4.
- No alterar `[data-open-contact-modal]`, `[data-direct-whatsapp]` ni el salvaguarda EDGE-3 de `QuoteDrawer` / `LiveSearchModal`.
- No adelantar GSC/GBP (5.4) ni etiquetas Google Ads `AW-*` (5.5).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Marca tractora | `brandOrigin: '3M'`, `sectorOrigin: 'ferretero-construccion'`, `isTractor: true` | Llama `gtag('event', 'lead_whatsapp_click', { channel: 'corporate', origin_page, brand_origin: '3M', sector_origin: 'ferretero-construccion', brand_tier: 'tractor', cta_location })`, retorna `true` | Si `gtag` no existe retorna `false` |
| Marca secundaria / general | `isTractor: false` vs sin marca | `brand_tier: 'secondary'` o `'general'`; strings vacíos normalizan a `'general'` | N/A |
| Bloqueador (EDGE-4) | `window.gtag` es `undefined` o lanza excepción | Retorna `false` en < 5 ms sin error en consola | Capturado en `try/catch`; WhatsApp abre normal |
| Requisición multimarca | `deriveRequisitionAnalyticsContext(items)` (1 marca, varias, o solo libres) | 1 marca → su `name`/`sector`/`brand_tier`; varias → `'multi_brand'` (`'multi_sector'` si difieren; `'tractor'` si incluye ≥1 tractora); solo libres/vacío → `'general'` | Tolera `null`, vacío o ítems sin `sector` |
| Validación ID GA4 | `sanitizeGa4MeasurementId('G-ABC12345')` vs `'"><script>'` / `''` | Retorna `'G-ABC12345'` o `null` | Si es `null`, no inyecta `<script>` de GA4 |
| Anti-duplicación | Clic en enlace con `data-wa-managed="island"` | Solo la isla llama `trackWhatsAppLead`; listener global lo ignora | 1 evento por clic |

</frozen-after-approval>

## Code Map

- `src/lib/analytics.ts` *(nuevo)* -- Exporta `GA4_WHATSAPP_EVENT_NAME`, `sanitizeGa4MeasurementId`, `buildWhatsAppLeadPayload`, `deriveRequisitionAnalyticsContext`, `readPageAnalyticsContext`, `extractWhatsAppClickContextFromElement` y `trackWhatsAppLead`.
- `src/env.d.ts` -- Tipar `ImportMetaEnv.PUBLIC_GA4_MEASUREMENT_ID` y `Window.gtag` / `Window.dataLayer`.
- `src/layouts/BaseLayout.astro` -- Props `pageBrand?`, `pageSector?`, `pageBrandIsTractor?` en `<body>` (`data-page-*`); carga condicional `async` de `gtag.js`; listener delegado en `document` (guard `__waAnalyticsBound`) para `a[href*="wa.me/"]` y `[data-direct-whatsapp]` excluyendo `[data-wa-managed="island"]` y `[data-open-contact-modal]`.
- `src/pages/distribuidor-[brand]-colombia.astro` -- Pasar props `pageBrand`/`pageSector`/`pageBrandIsTractor` a `BaseLayout` y añadir `data-wa-*` a sus 3 enlaces WhatsApp.
- `src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro`, `src/pages/sector-hidraulico-pinturas.astro` -- Pasar `pageSector` a `BaseLayout`.
- `src/components/catalog/BrandCard.astro`, `src/components/catalog/SectorHub.astro` -- Añadir `data-wa-brand`, `data-wa-sector`, `data-wa-tractor` y `data-wa-location` a sus enlaces WhatsApp.
- `src/pages/index.astro`, `src/components/home/Hero.astro`, `src/components/common/Header.astro`, `src/components/common/Footer.astro`, `src/components/common/FloatingWhatsAppButton.astro` -- Añadir `data-wa-location` a cada enlace `wa.me` (sin tocar `nosotros.astro`, cuyo botón abre `ContactChannelModal`).
- `src/islands/MobileStickyBar.tsx`, `src/islands/ContactChannelModal.tsx` -- Llamar `trackWhatsAppLead` con `readPageAnalyticsContext()` en `onClick` + `data-wa-managed="island"`.
- `src/islands/LiveSearchModal.tsx`, `src/islands/QuoteDrawer.tsx` -- Instrumentar sus CTAs WhatsApp (marca, cero-fallo, requisición y fallback EDGE-3) con `trackWhatsAppLead` + `deriveRequisitionAnalyticsContext` y `data-wa-managed="island"`.
- `tests/unit/analytics.test.ts` *(nuevo)* -- Suite TDD para la matriz I/O, bloqueadores, anti-duplicación y auditoría de cobertura en plantillas/islas.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/analytics.test.ts` -- Escribir tests TDD para `src/lib/analytics.ts`, simulación EDGE-4 (< 50 ms), delegación sin doble disparo y cobertura de instrumentación -- Cumplir Red-Green-Refactor y matriz I/O.
- [x] `src/lib/analytics.ts` y `src/env.d.ts` -- Implementar utilidades puras/defensivas de telemetría GA4 y tipos estrictos de `PUBLIC_GA4_MEASUREMENT_ID` y `window.gtag` -- Desacoplar analítica del render estático y dejar punto único extensible para Story 5.5.
- [x] `src/layouts/BaseLayout.astro` -- Propagar `data-page-*`, cargar `gtag.js` condicionalmente y agregar listener delegado global para CTAs estáticos de WhatsApp -- Asegurar cobertura total, 0 errores bajo bloqueadores y cero duplicación.
- [x] `src/pages/distribuidor-[brand]-colombia.astro`, `src/pages/sector-*.astro`, `src/pages/index.astro`, `src/components/catalog/BrandCard.astro`, `src/components/catalog/SectorHub.astro`, `src/components/home/Hero.astro`, `src/components/common/Header.astro`, `src/components/common/Footer.astro`, `src/components/common/FloatingWhatsAppButton.astro` -- Anotar contexto de página y atributos `data-wa-*` en todos los enlaces estáticos de WhatsApp -- Mantener 0 KB JS extra por componente con atribución exacta.
- [x] `src/islands/MobileStickyBar.tsx`, `src/islands/ContactChannelModal.tsx`, `src/islands/LiveSearchModal.tsx`, `src/islands/QuoteDrawer.tsx` -- Invocar `trackWhatsAppLead` y marcar `data-wa-managed="island"` en todos sus CTAs WhatsApp -- Capturar atribución de búsquedas y requisiciones multimarca sin afectar EDGE-3.

**Acceptance Criteria:**
- Given cualquier CTA de WhatsApp corporativo en páginas estáticas o islas Preact, when el usuario hace clic o toque, then `window.gtag` recibe exactamente una llamada `'event', 'lead_whatsapp_click'` con `channel: 'corporate'`, `origin_page`, `brand_origin`, `sector_origin` y `brand_tier`.
- Given un navegador con bloqueador de anuncios donde `window.gtag` no existe o lanza error, when se activa un CTA de WhatsApp, then no hay excepciones ni retrasos (< 50 ms) y WhatsApp abre normalmente.
- Given `npm run build` sin `PUBLIC_GA4_MEASUREMENT_ID`, when se inspecciona `dist/client/`, then no se inyecta ningún `<script>` de `googletagmanager.com` y los atributos `data-wa-*` / `data-page-*` quedan presentes.

## Implementation Notes

- Creado [analytics.ts](../../src/lib/analytics.ts) y tipado de entorno en [env.d.ts](../../src/env.d.ts) para telemetría defensiva GA4 (`lead_whatsapp_click`, validación estricta de `PUBLIC_GA4_MEASUREMENT_ID`, derivación multimarca y degradación silenciosa EDGE-4 < 50 ms).
- Actualizado [BaseLayout.astro](../../src/layouts/BaseLayout.astro) con `data-page-*`, carga condicional asíncrona de `gtag.js` y listener delegado global con exclusión de `[data-wa-managed="island"]` y `[data-open-contact-modal]`.
- Instrumentados los 11 archivos estáticos (silos de marca, hubs de sector, `BrandCard`, `SectorHub`, `index`, `Hero`, `Header`, `Footer`, `FloatingWhatsAppButton`) y las 4 islas Preact (`MobileStickyBar`, `ContactChannelModal`, `LiveSearchModal`, `QuoteDrawer`).
- Verificado con [analytics.test.ts](../../tests/unit/analytics.test.ts) (23/23 tests incluyendo auditoría sobre HTML compilado en `dist/client/`), `npm test` (17/17 archivos, 357/357 tests, 0 errores en `astro check` y `tsc --noEmit`) y `npm run build`.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | edge-case-hunter | `handleDelegatedWhatsAppClick` descarta nodos `Text` sin `.closest()` | `medium` | patch | Si `evt.target` es un nodo `Text`, `closest` es `undefined` y se pierde el evento; resolver vía `parentElement`. |
| 2 | edge-case-hunter | Selector delegado omite `a[href="#cotizar"]` y `a[href="/#cotizar"]` sin `data-direct-whatsapp` | `low` | patch | `BaseLayout.astro:218-220` abre WhatsApp directo en esos enlaces; alinear el selector en `handleDelegatedWhatsAppClick`. |
| 3 | edge-case-hunter | Deduplicación de marca en `deriveRequisitionAnalyticsContext` descarta `sector` de entradas duplicadas | `low` | patch | Solo fusiona `isTractor` y no rellena `sector` si la primera entrada carecía de él. |
| 4 | edge-case-hunter | Sectores duplicados con distinto casing producen `multi_sector` | `low` | patch | `distinctSectors` usa `Set<string>` sensible a mayúsculas; deduplicar por `sector.toLowerCase()`. |
| 5 | blind-hunter | Falta `transport_type: 'beacon'` para eventos salientes a WhatsApp en móvil | `medium` | patch | Al abrir `wa.me/` en móvil se cambia de app y el request puede abortarse; añadir `transport_type: 'beacon'` en `gtag('config', ...)`. |
| 6 | blind-hunter | Bootstrap GA4 llama `gtag` local en vez de `window.gtag`, usa `anonymize_ip` obsoleto y omite `page_view` de View Transitions | `low` | patch | Llamar `window.gtag(...)` y reemplazar `anonymize_ip: true` por `transport_type: 'beacon'`; View Transitions no está habilitado en el proyecto. |
| 7 | blind-hunter | Delegación ignora nodos `Text` y enlaces `#cotizar` directos | `medium` | patch | Misma causa raíz que #1 y #2; resuelto en `handleDelegatedWhatsAppClick`. |
| 8 | blind-hunter | CTAs `live_search_zero_fail` y `live_search_index_error` heredan marca/tractora de la página actual | `medium` | patch | Una búsqueda sin resultados desde un silo de marca atribuye erróneamente el lead a esa marca en vez de `'general'`. |
| 9 | blind-hunter | `auxclick` (clic central) no rastreado y teclas modificadoras en islas | `low` | reject | Impacto marginal en uso cotidiano y añadir nuevo listener/guards excede corrección directa; comportamiento de `executeRequisitionWhatsAppAction` es preexistente. |
| 10 | blind-hunter | Deduplicación de marca en `deriveRequisitionAnalyticsContext` pierde `sector` | `low` | patch | Misma causa raíz que #3; resuelto en `src/lib/analytics.ts`. |
| 11 | blind-hunter | `buildWhatsAppLeadPayload` no limpia query/hash de `originPage` ni unifica casing `'general'` | `low` | patch | Limpiar `?`/`#` en `originPage` refuerza cero PII y normalizar `'general'` evita fragmentación de cardinalidad en GA4. |
| 12 | blind-hunter | `BrandCard.astro` emite `data-wa-brand="Marca"` cuando `data.name` está vacío | `low` | patch | Desalinea telemetría con `whatsappUrl`; pasar `data-wa-brand={data.name?.trim() || undefined}`. |
| 13 | blind-hunter | Falta documentación de `PUBLIC_GA4_MEASUREMENT_ID` en `README.md`/`.env.example` | `low` | reject | Cosmético y fuera del alcance de tareas del spec; no afecta ejecución ni despliegue. |
| 14 | blind-hunter | Tests de islas usan substrings gruesos y faltan pruebas de casos borde | `medium` | patch | Misma causa raíz que #16; reforzar auditoría por enlace y tests de casos borde en `tests/unit/analytics.test.ts`. |
| 15 | blind-hunter | Tipos `GtagCommand`/`GtagFunction` en ámbito global de `src/env.d.ts` | `false` | reject | `src/env.d.ts` es archivo de declaraciones ambientales estándar de Astro; `astro check` y `tsc --noEmit` pasan con 0 errores y 0 warnings. |
| 16 | verification-gap | Instrumentación y anti-duplicación de islas verificada solo por substrings gruesos | `medium` | patch | Pre-verificado; verificar cada enlace WhatsApp en las 4 islas (`data-wa-managed="island"` y payload correcto incluyendo cero-fallo `'general'`) en `tests/unit/analytics.test.ts`. |
| 17 | verification-gap | Inyección GA4, `data-page-*` y `data-wa-*` estáticos sin verificación sobre HTML compilado | `medium` | patch | Pre-verificado; añadir auditoría sobre HTML compilado en `dist/client/` (análogo a `schema-jsonld.test.ts`) en `tests/unit/analytics.test.ts`. |

## Design Notes

- **Atribución heredada:** `extractWhatsAppClickContextFromElement` y `readPageAnalyticsContext()` priorizan atributos locales `data-wa-*` y caen a `document.body.dataset` (`data-page-*`), evitando perder atribución de marca/sector al usar botones flotantes o modales desde un silo.
- **Extensibilidad para Story 5.5:** Centralizar el disparo en `trackWhatsAppLead` permite añadir conversiones de Google Ads (`AW-*`) en un solo punto sin volver a editar los 13 archivos de UI.

## Verification

**Commands:**
- `npm test` -- expected: 100% Vitest en verde (incluyendo `tests/unit/analytics.test.ts`), 0 errores y 0 warnings en `astro check` y `tsc --noEmit`.
- `npm run build` -- expected: compilación SSG exitosa en `dist/client/` sin errores y sin script de `gtag.js` cuando `PUBLIC_GA4_MEASUREMENT_ID` no está configurada.
