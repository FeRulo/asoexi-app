# Deferred Work
	
## Deferred from: code review of spec-1-4-pagina-institucional-nosotros-protocolos-operativos-metadatos.md (2026-10-10)

- `src/layouts/BaseLayout.astro:83`: Hidratación innecesaria de `ContactChannelModal` — Pre-existente desde Story 1.3, optimización para refactor general de bundles client-side.
- `src/pages/nosotros.astro:1`: Integración de Schema.org JSON-LD corporativo (`Organization` / `AboutPage`) — Fuera de alcance de Story 1.4 (enfocada en Open Graph, Twitter Cards y canonical URLs).

## Deferred from: planning of spec-4-1 (2026-11-20)

- [x] `src/islands/LiveSearchModal.tsx` & `src/lib/search.ts`: Integración visual de logotipos de marca en las tarjetas de resultados de búsqueda (`SearchIndexItem.logo`). **Resuelto en Story 4.2 (QuoteDrawer & Brand Cards UI)**.

## Deferred from: code review of spec-4-2-isla-preact-cajon-de-cotizacion-persistente-quotedrawer-y-badge-flotante.md (2026-11-23)

- source_spec: `_bmad-output/implementation-artifacts/spec-4-2-isla-preact-cajon-de-cotizacion-persistente-quotedrawer-y-badge-flotante.md`
  summary: Configurar entorno DOM/Preact (`jsdom`/`happy-dom` y `@testing-library/preact`) o tests E2E Playwright para probar el montaje e interacción DOM de las islas (`QuoteDrawer`, `LiveSearchModal`, `ContactChannelModal`, `MobileStickyBar`) y scripts de `BaseLayout.astro`.
  evidence: El runner Vitest actual se ejecuta en entorno Node puro validando funciones puras, stores y endpoints SSG; la verificación automatizada de eventos DOM y ciclo de vida de componentes Preact requiere incorporar un entorno DOM o suite E2E (planificada en `bmad-qa-generate-e2e-tests`).

## Deferred from: code review of spec-4-4-endpoint-serverless-edge-api-quote-y-modal-unificado-de-cotizacion-formal-y-credito.md (2026-11-23)

- [x] source_spec: `_bmad-output/implementation-artifacts/spec-4-4-endpoint-serverless-edge-api-quote-y-modal-unificado-de-cotizacion-formal-y-credito.md`
  summary: Instalar y configurar `@astrojs/cloudflare` en `astro.config.mjs` y agregar `export const prerender = false` en `src/pages/api/quote.ts` al habilitar el despliegue live en Cloudflare Pages (ARCH-7). **Resuelto en fix(spec-4-4).**
  evidence: Actualmente `astro.config.mjs` compila con `output: 'static'` sin adaptador de servidor, por lo que `astro build` prerenderiza únicamente `GET /api/quote` (405) en `dist/api/quote` hasta habilitar el adaptador Cloudflare Workers/Pages.
- source_spec: `_bmad-output/implementation-artifacts/spec-4-4-endpoint-serverless-edge-api-quote-y-modal-unificado-de-cotizacion-formal-y-credito.md`
  summary: Añadir protección anti-abuso (Cloudflare Turnstile o honeypot, rate limiting y validación de `Origin`/`Referer`) en `POST /api/quote` antes de exponer el envío público con Resend en producción.
  evidence: El endpoint `POST /api/quote` actualmente acepta peticiones públicas sin mitigación de spam/flooding contra la cuota de Resend ni el buzón `serviciocliente@asoexi.com`.
