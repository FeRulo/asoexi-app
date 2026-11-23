---
title: 'Story 5.1: Sitemap XML Dinámico & Optimización Semántica para Motores de Búsqueda e IA (AEO)'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
baseline_commit: '0a4b023017238b6dad0942cd9723b67c548e5a12'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El sitio estático de ASOEXI S.A.S. carece de `sitemap.xml` dinámico y de `public/robots.txt`, impidiendo a Google y motores de IA (AEO) descubrir y priorizar las 49 páginas públicas (Home, Nosotros, 3 Hubs de Sector y 44 silos de marca). Además, los metadatos y encabezados de Home y del Hub Eléctrico no consolidan explícitamente los clústeres semánticos mayoristas requeridos para mantenimiento industrial y Bogotá.

**Approach:** Implementar un generador puro de `sitemap.xml` en `src/lib/sitemap.ts` expuesto mediante un endpoint estático (`src/pages/sitemap.xml.ts`), crear `public/robots.txt` con acceso público y enlace al sitemap, declarar `<link rel="sitemap">` en `<SEOHead />`, y alinear `title`, `description` y `h2` de Home y Hub Eléctrico con los clústeres B2B/AEO sin alterar el diseño visual.

## Boundaries & Constraints

**Always:**
- Generar URLs canónicas absolutas sobre `https://asoexi.com` usando `resolveCanonicalUrl` (`src/lib/seo.ts`) y `getBrandSiloUrl` (`src/lib/brands.ts`).
- Incluir solo rutas HTML públicas: Home (`1.0`), 3 Hubs de Sector (`0.9`), Marcas Tractoras (`0.85`), Marcas Secundarias (`0.8`) y Nosotros (`0.7`), con `changefreq`, `lastmod` ISO `YYYY-MM-DD`, escape XML y orden determinista sin duplicados.
- Permitir rastreo público y de bots AEO (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`) en `public/robots.txt`, bloquear `/api/` y declarar `Sitemap: https://asoexi.com/sitemap.xml`.
- Mantener invariantes corporativos (NIT `900480460-8`, `+57 301 419 1344`, despacho a domicilio sin mostrador) y pasar `npm test` + `npm run build` con 0 errores/warnings.

**Never:**
- No incluir `/api/quote`, `/search-index.json` ni rutas `noindex` en `sitemap.xml`.
- No instalar `@astrojs/sitemap`; usar endpoint nativo prerenderizado (`export const prerender = true`).
- No implementar Schema.org `HardwareStore` (5.2), GA4 (5.3), GSC (5.4) ni Google Ads (5.5).
- No modificar estilos Tailwind, layout visual ni islas Preact.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sitemap estándar | 44 marcas + 3 sectores + `/` + `/nosotros` | XML 1.0 UTF-8 con `<urlset>`, 49 `<url>` absolutas en `https://asoexi.com`, prioridades jerárquicas y `<lastmod>` `YYYY-MM-DD` | N/A |
| Marca duplicada o sucia | `[{ id: ' Dewalt ' }, { id: 'dewalt' }]` | Normaliza a `/distribuidor-dewalt-colombia` y deduplica conservando mayor prioridad | Ignora `id` vacío/inválido sin fallar |
| `baseUrl` `http://` o `/` final | `'http://asoexi.com/'` | Emite `<loc>` en `https://asoexi.com/...` sin dobles barras | Fallback a `SITE_METADATA.siteUrl` |
| Caracteres XML o fecha inválida | URL con `&` o `lastmod` inválida | Escapa `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`; normaliza u omite fecha inválida | Nunca produce XML malformado |
| Rastreo `public/robots.txt` | Bots Google / IA (AEO) | `Allow: /`, `Disallow: /api/`, `Sitemap: https://asoexi.com/sitemap.xml` | Servido estáticamente desde `public/` |

</frozen-after-approval>

## Code Map

- `src/lib/sitemap.ts` *(nuevo)* -- Funciones puras `buildSitemapEntries`, `escapeXml` y `renderSitemapXml`.
- `src/pages/sitemap.xml.ts` *(nuevo)* -- Endpoint estático (`prerender = true`) que lee `getCollection('brands')` y retorna `application/xml; charset=utf-8` (patrón `src/pages/search-index.json.ts`).
- `public/robots.txt` *(nuevo)* -- Directivas públicas SEO/AEO, `Disallow: /api/` y `Sitemap: https://asoexi.com/sitemap.xml`.
- `src/components/seo/SEOHead.astro` -- Añadir `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />`. No alterar OG ni `jsonLd`.
- `src/pages/index.astro` -- Alinear `title`, `description` y `<h2>` de `#sectores` con `"distribuidor mayorista de insumos para mantenimiento"` y Bogotá.
- `src/lib/brands.ts` -- Actualizar `SECTOR_TECHNICAL_CONTENT['electrico']` (`seo.title`, `seo.description`, `technicalCategoriesHeading`, `b2bKeywords`) para `"breakers y conductores eléctricos en Bogotá"` sin romper `tests/unit/sector-hubs.test.ts`. `getBrandH1Title` ya cubre `"Distribuidor Autorizado [Marca] en Colombia"`.
- `src/lib/constants.ts` -- Enriquecer `SITE_METADATA.defaultDescription` con `"insumos para mantenimiento industrial"` preservando contratos de `tests/unit/seo.test.ts`.
- `tests/unit/sitemap-aeo.test.ts` *(nuevo)* -- Suite TDD para sitemap, matriz I/O, `robots.txt`, `<link rel="sitemap">` y los 3 clústeres AEO.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/sitemap-aeo.test.ts` -- Escribir tests TDD para `src/lib/sitemap.ts` (49 URLs reales, prioridades, XML, casos borde), `public/robots.txt`, `SEOHead.astro` y los 3 clústeres semánticos -- Garantizar ciclo Red-Green-Refactor.
- [x] `src/lib/sitemap.ts` -- Implementar `buildSitemapEntries`, `escapeXml` y `renderSitemapXml` reutilizando `resolveCanonicalUrl`, `getBrandSiloUrl` y `SECTORS_META` -- Lógica pura, determinista y testeable.
- [x] `src/pages/sitemap.xml.ts` -- Crear endpoint `prerender = true` con header `application/xml; charset=utf-8` -- Emitir `sitemap.xml` en build.
- [x] `public/robots.txt` -- Crear directivas públicas SEO/AEO, `Disallow: /api/` y `Sitemap: https://asoexi.com/sitemap.xml` -- Habilitar rastreo inmediato.
- [x] `src/components/seo/SEOHead.astro` -- Añadir `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />` -- Descubrimiento desde HTML.
- [x] `src/pages/index.astro`, `src/lib/brands.ts`, `src/lib/constants.ts` -- Alinear metadatos y `h2` de Home y Hub Eléctrico con los clústeres B2B/AEO preservando tests existentes -- Cumplir optimización semántica sin regresiones.

**Acceptance Criteria:**
- Given el proyecto compilado con `npm run build`, when se inspecciona `sitemap.xml`, then es XML válido con las 49 URLs canónicas absolutas de `https://asoexi.com` (Home, Nosotros, 3 Hubs y 44 marcas), prioridades jerárquicas y sin `/api/` ni `/search-index.json`.
- Given `public/robots.txt` y `<SEOHead />`, when bots de Google o IA rastrean el sitio, then encuentran permiso público, exclusión de `/api/` y enlace a `https://asoexi.com/sitemap.xml`.
- Given Home, Hub Sector Eléctrico y silos de marca, when se auditan `h1`, `h2` y metadatos, then incluyen `"distribuidor mayorista de insumos para mantenimiento"`, `"breakers y conductores eléctricos"` en Bogotá y `"distribuidor autorizado [marca] en colombia"`.

## Implementation Notes

- Implementado generador puro en [sitemap.ts](../../src/lib/sitemap.ts) y endpoint estático prerenderizado en [sitemap.xml.ts](../../src/pages/sitemap.xml.ts) emitiendo 49 URLs canónicas absolutas (1 Home, 3 Hubs de Sector, 10 Marcas Tractoras, 34 Marcas Secundarias y 1 Nosotros) sin dependencias externas.
- Creado [robots.txt](../../public/robots.txt) con acceso público, directivas AEO (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`), `Disallow: /api/` y `Sitemap: https://asoexi.com/sitemap.xml`; añadido `<link rel="sitemap">` en [SEOHead.astro](../../src/components/seo/SEOHead.astro).
- Alineados metadatos y `h2` en [index.astro](../../src/pages/index.astro), [brands.ts](../../src/lib/brands.ts) y [constants.ts](../../src/lib/constants.ts) con los 3 clústeres semánticos B2B/AEO.
- Verificado con `npm test` (15/15 archivos, 316/316 tests, 0 errores en `astro check` y `tsc --noEmit`) y `npm run build` (`dist/client/sitemap.xml` con 49 `<loc>`).

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind-hunter | `sitemap.xml.ts` ignora `site` de `APIContext` | `false` | reject | `SEOHead.astro` y `resolveCanonicalUrl` anclan todas las canónicas a `SITE_METADATA.siteUrl` (`https://asoexi.com`); usar un `site` de preview rompería consistencia canónica. |
| 2 | blind-hunter | `buildSitemapEntries` no hace fallback a `item.id` si `item.data.id` falta | `low` | patch | Inconsistencia menor frente a `distribuidor-[brand]-colombia.astro` (`brand.data.id \|\| brand.id`); corrección directa de 2 líneas. |
| 3 | blind-hunter | `buildSitemapEntries` usa `new Date()` como `lastmod` por defecto | `false` | reject | Las colecciones y páginas SSG no tienen campo `updatedAt` por ruta; emitir fecha de compilación `YYYY-MM-DD` es el comportamiento esperado del spec. |
| 4 | blind-hunter | `localeCompare` sin locale fijo en ordenamiento de marcas | `low` | patch | Puede variar entre configuraciones ICU de SO/CI; comparación lexicográfica por unidad de código garantiza determinismo. |
| 5 | blind-hunter | `normalizeBaseUrl` sin ancla y `renderSitemapXml` sin validar `changefreq` | `medium` | patch | `normalizeBaseUrl` acepta `?foo=bar` o espacios tras el host generando `<loc>` corruptas, y `changefreq` no valida contra los 7 valores de sitemaps.org. |
| 6 | blind-hunter | `formatPriority` mezcla `Math.round` con `priority.toFixed` sin redondear | `low` | patch | En flotantes límite (ej. `0.855`) la decisión de redondeo y la salida pueden divergir; formatear `hundredths / 100` lo corrige en 1 línea. |
| 7 | blind-hunter | `public/robots.txt` no bloquea `/search-index.json` | `low` | patch | Evita indexación del payload JSON interno de búsqueda sin afectar la carga desde el navegador. |
| 8 | blind-hunter | `<link rel="sitemap">` usa `href="/sitemap.xml"` relativo | `false` | reject | Convención estándar HTML5/Astro consistente con `<link rel="icon" href="/logo.svg">` en `BaseLayout.astro`. |
| 9 | blind-hunter | Títulos (80–89 chars) y descripciones (185 chars) largos para SERP | `low` | patch | Riesgo real de truncamiento en resultados de Google; ajuste directo de redacción preservando todos los clústeres AEO. |
| 10 | blind-hunter | Faltan tests del endpoint `sitemap.xml.ts`, ruta por defecto de `lastmod` y conteos dinámicos | `medium` | patch | `src/pages/sitemap.xml.ts` no tiene cobertura directa en Vitest (a diferencia de `search-index.json.ts`) y los conteos literales son frágiles ante nuevas marcas. |
| 11 | edge-case-hunter | `normalizeBaseUrl` acepta query/fragment/espacios tras el host | `medium` | patch | Misma causa raíz que #5; resuelto validando con `new URL(...)` y tomando `u.origin`. |
| 12 | edge-case-hunter | `normalizeLastmod` no valida años fuera de `0000-9999` | `low` | reject | Escenario altamente improbable en uso real y requeriría guardia adicional para un estado no alcanzable en build. |
| 13 | edge-case-hunter | `item.data` parcial enmascara `item.id`/`item.isTractor` | `low` | patch | Misma causa raíz que #2; resuelto con `item.data?.id \|\| item.id` y `item.data?.isTractor ?? item.isTractor`. |
| 14 | edge-case-hunter | `renderSitemapXml` lanza `TypeError` si `entries` es `null`/no iterable | `false` | reject | TypeScript exige `readonly SitemapEntry[]` y el único consumidor pasa el arreglo retornado por `buildSitemapEntries`. |
| 15 | edge-case-hunter | `renderSitemapXml` emite `changefreq` fuera de sitemaps.org 0.9 | `medium` | patch | Misma causa raíz que #5; resuelto filtrando contra el conjunto de 7 valores permitidos. |
| 16 | verification-gap | Endpoint `src/pages/sitemap.xml.ts` y `lastmod` por defecto sin cobertura | `medium` | patch | Pre-verificado; misma causa raíz que #10. Añadir test de `GET` y `prerender` con mock de `astro:content`. |
| 17 | verification-gap | `changefreq` por nivel solo verificado con `toBeDefined()` | `low` | patch | Pre-verificado; invertir `weekly`/`monthly` pasaría los tests. Añadir aserciones exactas por nivel. |

## Verification

**Commands:**
- `npm test` -- expected: 100% Vitest en verde, 0 errores en `astro check` y `tsc --noEmit`.
- `npm run build` -- expected: genera `sitemap.xml` y `robots.txt` en `dist/client/` (o `dist/`).
- `grep -c "<loc>" dist/client/sitemap.xml 2>/dev/null || grep -c "<loc>" dist/sitemap.xml` -- expected: `49`.
