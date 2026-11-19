---
title: 'Story 3.1: Plantilla Dinámica Canónica SSG para Silos de Marca (/distribuidor-[brand]-colombia)'
type: 'feature'
created: '2026-11-19'
status: 'done'
baseline_commit: '8eec1a91646676f2808f43e9f4a4375768f7660d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores y contratistas corporativos que buscan distribuidores mayoristas de marcas técnicas autorizadas en Google necesitan aterrizar en páginas dedicadas con estructura canónica, metadatos estructurados para SEO B2B y navegación contextual clara, evitando búsquedas dispersas o páginas 404.

**Approach:** Implementar la plantilla dinámica SSG en Astro `src/pages/distribuidor-[brand]-colombia.astro` con `getStaticPaths()` alimentada por la colección `brands`, inyectando el componente centralizado `<SEOHead />` con marcado JSON-LD (`BreadcrumbList`), navegación de migas de pan accesible (`Inicio > Sector > [Marca]`), y cabecera visual de marca con H1 display, logotipo normalizado (o fallback tipográfico corporativo EDGE-2), sellos de facturación electrónica / crédito a 45 días y botón de cotización contextual directa por WhatsApp corporativo (+57 301 419 1344) con SLA ≤ 5 min.

## Boundaries & Constraints

**Always:**
- Toda la generación de páginas de marca debe ser 100% SSG (estática en build time) con 0 KB de JavaScript cliente por defecto.
- La URL canónica debe ser absoluta y referenciada estrictamente al dominio de producción `https://asoexi.com/distribuidor-[brand]-colombia` sin barras duplicadas ni query params.
- La jerarquía de migas de pan debe reflejar `Inicio (/) > [Sector] (/sector-[slug]) > [Nombre de Marca]`, tanto en la UI accesible como en el esquema estructurado Schema.org `BreadcrumbList`.
- El encabezado principal H1 debe formularse exactamente como: `Distribuidor Autorizado [Nombre de Marca] en Colombia e Insumos Mayoristas`.
- Resiliencia de logotipo (EDGE-2): si `brand.data.logo` es nulo, vacío o no existe archivo de imagen, renderizar fallback con badge tipográfico corporativo en Montserrat sin generar iconos rotos de imagen.
- Los botones y llamadas a la acción deben tener áreas táctiles accesibles (≥ 48px de altura) y cumplir WCAG 2.2 AA.
- El botón de cotización por WhatsApp debe usar la línea corporativa oficial `+57 301 419 1344` con mensaje pre-cargado vía `generateBrandQuoteWhatsAppUrl(brand.data.name)` y promesa SLA ≤ 5 min.
- Todo cambio debe pasar limpiamente `npm test` (`vitest run && astro check && tsc --noEmit`) con 0 errores y 0 advertencias.

**Never:**
- No implementar bases de datos ni llamadas a endpoints dinámicos del servidor en tiempo de ejecución para servir las páginas de marca.
- No generar enlaces rotos 404 ni botones de descarga PDF no funcionales en esta historia (la lógica condicional de descarga/solicitud de PDF se especializa en la Story 3.2).
- No utilizar JavaScript de cliente para renderizar metadatos SEO o migas de pan; deben estar presentes en el HTML estático inicial.
- No romper ni alterar los hubs de sector existentes ni los componentes del Home.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Generación SSG canónica | `brand.id = "panduit"`, `name = "Panduit"`, `sector = "electrico"` | Genera `/distribuidor-panduit-colombia` con canonical `https://asoexi.com/distribuidor-panduit-colombia` y H1 correspondiente | Si el id viene con mayúsculas/espacios, normalizar a minúsculas y trim |
| Migas de pan y JSON-LD | Marca con sector `ferretero-construccion` (`Stanley`) | UI renderiza `Inicio > Sector Ferretero & Construcción > Stanley`; JSON-LD inyecta `BreadcrumbList` con 3 items numerados del 1 al 3 | Si sector no está en SECTORS_META, fallback seguro a nombre genérico |
| Fallback de logotipo (EDGE-2) | `brand.data.logo = null` o `""` | Renderiza badge tipográfico en contenedor estilizado con tipografía Montserrat y nombre de marca visible | No renderizar tag `<img>` vacío |
| Logotipo válido presente | `brand.data.logo = "/images/brands/panduit.svg"` | Renderiza tag `<img>` con `alt="Logotipo oficial de Panduit"` y filtro grayscale con hover a color | Cargar dimensiones o clases que eviten layout shift (CLS < 0.05) |
| CTA WhatsApp contextual | Clic en botón "Cotizar portafolio de [Marca] por WhatsApp" | Enlace `href` generado por `generateBrandQuoteWhatsAppUrl` hacia `+57 301 419 1344` con mensaje de cotización formal | Si nombre es nulo/vacío, fallback seguro a mensaje institucional base |

</frozen-after-approval>

## Code Map

- `src/lib/seo.ts` -- Funciones para metadatos, canónicas y generador de esquema JSON-LD `BreadcrumbList` (`generateBreadcrumbListSchema`).
- `src/components/seo/SEOHead.astro` -- Componente centralizado de `<head>` que unifica `<title>`, `<meta>`, `<link rel="canonical">`, Open Graph, Twitter Cards y scripts `<script type="application/ld+json">`.
- `src/components/common/Breadcrumbs.astro` -- Componente UI accesible de migas de pan con microformato y estilos industriales (`rounded-industrial`, WCAG 2.2 AA).
- `src/layouts/BaseLayout.astro` -- Integración del componente `SEOHead.astro` con soporte para esquemas JSON-LD y migas de pan opcionales.
- `src/pages/distribuidor-[brand]-colombia.astro` -- Ruta dinámica SSG con `getStaticPaths()` que consume `getCollection('brands')` y renderiza el silo canónico de marca.
- `src/lib/brands.ts` -- Metadatos de sectores (`SECTORS_META`), resolución de URLs de silos (`getBrandSiloUrl`) y orden canónico.
- `tests/unit/brand-silo.test.ts` -- Suite de pruebas unitarias para validación de datos de ruta de silos, generación de esquemas JSON-LD y metadatos canónicos.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/seo.ts` -- Implementar tipos y función pura `generateBreadcrumbsSchema(items: { name: string; url: string }[])` retornando objeto Schema.org `BreadcrumbList` con URLs canónicas absolutas.
- [x] `src/components/seo/SEOHead.astro` -- Crear componente centralizado que renderiza etiquetas de título, descripción, canonical, meta robots, Open Graph, Twitter Cards y bloques `<script type="application/ld+json">` opcionales.
- [x] `src/layouts/BaseLayout.astro` -- Actualizar el layout para utilizar `SEOHead.astro` delegando la inyección de metadatos y schemas estructurados de forma unificada.
- [x] `src/components/common/Breadcrumbs.astro` -- Implementar componente de migas de pan accesible (`<nav aria-label="Migas de pan">`) con separador chevron, enlaces semánticos y estilo industrial.
- [x] `src/pages/distribuidor-[brand]-colombia.astro` -- Implementar plantilla SSG dinámica con `getStaticPaths()` para la colección `brands`:
  - Inyección de SEOHead con canónica `https://asoexi.com/distribuidor-[brand]-colombia`, Open Graph y BreadcrumbList.
  - Renderizado de migas de pan UI `Inicio > Sector > [Marca]`.
  - Header Hero de marca: H1 display `"Distribuidor Autorizado [Nombre] en Colombia e Insumos Mayoristas"`, sector pill, tractor badge (si aplica), logotipo normalizado con fallback tipográfico EDGE-2, sellos de facturación electrónica DIAN y crédito a 45 días.
  - Botón primario de cotización directa por WhatsApp con `generateBrandQuoteWhatsAppUrl(brand.name)` y SLA ≤ 5 min.
  - Bloque descriptivo y de notas técnicas de aplicación (`description`, `applicationNotes`).
- [x] `tests/unit/brand-silo.test.ts` -- Crear pruebas unitarias con Vitest verificando la resolución de rutas de marca, la generación del esquema JSON-LD `BreadcrumbList`, el fallback defensivo de logotipos y la consistencia de URLs canónicas.

**Acceptance Criteria:**
- Given la colección `brands` con marcas registradas, when se compila el proyecto con `getStaticPaths()`, then genera una página estática `/distribuidor-[brand]-colombia` por cada marca registrada sin errores de compilación.
- Given cualquier landing de marca generada, when se analiza el HTML estático resultante, then contiene `<link rel="canonical" href="https://asoexi.com/distribuidor-[brand]-colombia">` y un bloque `<script type="application/ld+json">` con `BreadcrumbList` que mapea `Inicio (/) > Sector (/sector-xxx) > [Marca]`.
- Given la cabecera visual de la landing de marca, when el usuario ingresa, then visualiza el H1 display con el nombre de la marca, sellos de facturación electrónica DIAN / crédito a 45 días, y botón funcional hacia WhatsApp con mensaje contextualizado de cotización y promesa de respuesta en ≤ 5 minutos.
- Given una marca sin logotipo vectorial (`logo: null`), when se renderiza la cabecera, then exhibe un badge tipográfico corporativo estilizado en Montserrat sin renderizar tags `<img>` con fuentes rotas.
- Given la ejecución de `npm test`, when se ejecutan Vitest, Astro Check y TSC, then el 100% de los tests pasan con 0 errores y 0 warnings en el diagnóstico del proyecto.

## Implementation Notes

- Implementada la ruta dinámica SSG `src/pages/distribuidor-[brand]-colombia.astro` con `getStaticPaths()` consumiendo la colección `brands` de Astro Content Collections.
- Creado el componente centralizado `src/components/seo/SEOHead.astro` con inyección de `<title>`, canonical, meta robots, Open Graph, Twitter Cards y esquemas Schema.org JSON-LD con escape seguro de tags `<script>`.
- Actualizado `src/layouts/BaseLayout.astro` para delegar la inyección de metadatos y JSON-LD a `SEOHead.astro`.
- Implementado el componente UI accesible de migas de pan `src/components/common/Breadcrumbs.astro` con áreas táctiles accesibles (≥ 48px, WCAG 2.2 AA).
- Extraídos y testeados los helpers de dominio puro en `src/lib/brands.ts`: `getBrandH1Title`, `buildBrandBreadcrumbs`, `hasValidBrandLogo` y `getBrandSiloUrl`.
- Suite de pruebas unitarias implementada en `tests/unit/brand-silo.test.ts` (17 tests) y `tests/unit/seo.test.ts` (19 tests) con 100% de éxito.

## Spec Change Log

## Review Triage Log

| Finding Location | Verdict | Evidence & Action |
|---|---|---|
| `tests/unit/brand-silo.test.ts:36-131` | `medium` | Lógica de dominio (H1, migas de pan y validación de logo) testeada contra mocks privados locales en vez de código de producción. Corregido extrayendo funciones puras a `src/lib/brands.ts` e importándolas en los tests. |
| `src/components/seo/SEOHead.astro:65` | `low` | Inyección de JSON-LD sin escapar caracteres `<` (`\u003c`) para prevenir cierre prematuro de tags `<script>`. Corregido aplicando `.replace(/</g, '\\u003c')`. |
| `src/lib/seo.ts:209` | `low` | Ítems de migas de pan sin URL resolvían a la raíz del dominio `https://asoexi.com/`. Corregido omitiendo la propiedad `item` en hojas o ítems sin URL según estándar Schema.org. |
| `src/components/common/Breadcrumbs.astro:12-25` | `low` | Interfaz `BreadcrumbItem` duplicada, posible renderizado de `<nav>` vacío y área táctil de enlaces sub-48px. Corregido unificando la interfaz en `src/lib/seo.ts`, agregando early return defensivo y clases accesibles `min-h-[48px] inline-flex items-center`. |
| `src/pages/distribuidor-[brand]-colombia.astro:25-55` | `low` | Inyección inlined de lógica de H1 y migas de pan, y ausencia de pase de `image`/`imageAlt` para metadatos OG. Corregido integrando helpers de `src/lib/brands.ts` y pasando `image`/`imageAlt` a `BaseLayout`. |
| `tests/unit/brand-silo.test.ts:195-197` | `low` | Aserción tautológica en bucle de colección. Corregido verificando el resultado real de `getBrandH1Title(content.name)`. |
| `src/components/common/Breadcrumbs.astro:1-5` | `false` | Solicitud de microdata HTML en Breadcrumbs.astro; desestimado dado que Google Search Central recomienda formalmente Schema.org JSON-LD (inyectado limpiamente por `SEOHead.astro`). |

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las pruebas unitarias (incluyendo `tests/unit/brand-silo.test.ts`), `astro check` y `tsc --noEmit` completan con 0 errores y 0 advertencias.
- `npm run build` -- expected: Compilación SSG completa y limpia en Astro, generando las rutas estáticas `/distribuidor-[brand]-colombia` para todas las marcas de la colección.
