# Deferred Work
	
## Deferred from: code review of spec-1-4-pagina-institucional-nosotros-protocolos-operativos-metadatos.md (2026-10-10)

- `src/layouts/BaseLayout.astro:83`: Hidratación innecesaria de `ContactChannelModal` — Pre-existente desde Story 1.3, optimización para refactor general de bundles client-side.
- `src/pages/nosotros.astro:1`: Integración de Schema.org JSON-LD corporativo (`Organization` / `AboutPage`) — Fuera de alcance de Story 1.4 (enfocada en Open Graph, Twitter Cards y canonical URLs).
