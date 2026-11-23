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
