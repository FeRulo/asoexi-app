---
title: 'Story 2.2: Vitrina Destacada de las Top 10 Marcas Tractoras en Home'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '8da8a45b591c86fde096bd4978d93247dd21ab38'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La página principal (`src/pages/index.astro`) contiene únicamente un encabezado genérico de marcas sin desplegar las 10 marcas tractoras líderes ni permitir la navegación fluida a sus silos SEO o cotización directa por WhatsApp, desaprovechando la tracción de los fabricantes top en los 3 sectores industriales.

**Approach:** Crear el componente `src/components/home/FeaturedBrands.astro` que consulte la colección `brands` mediante `getCollection('brands')`, filtre las marcas con `isTractor: true`, las organice de forma semántica por sus 3 sectores industriales (`electrico`, `ferretero-construccion`, `hidraulico-pinturas`) reutilizando el componente `BrandCard.astro`, e integrarlo en `src/pages/index.astro` con un enlace secundario para explorar el catálogo completo.

## Boundaries & Constraints

**Always:**
- Las 10 marcas tractoras deben coincidir estrictamente con el inventario corporativo definido en la Epic 2:
  - *Sector Eléctrico:* Panduit, Centelsa by Nexans, Sylvania.
  - *Sector Ferretero & Construcción:* Supermastick PR, Stanley, DeWalt, Truper.
  - *Sector Hidráulico & Químico:* Pavco Wavin, Sika, Pintuco.
- Renderizado 100% estático SSG con 0 KB de JavaScript en el cliente, respetando la arquitectura de islas de Astro.
- Reutilizar `BrandCard.astro` para cada tarjeta de marca, asegurando la consistencia de estilos industriales (`rounded-industrial`), soporte para imágenes vectoriales, badges tipográficos ante ausencia de logo (EDGE-2) y botones accesibles de cotización directa por WhatsApp (≥48px de altura táctil).
- Toda tarjeta en la vitrina debe posibilitar la navegación directa a su respectivo silo SEO `/distribuidor-[marca]-colombia`.
- Proveer un botón/enlace secundario visible hacia la exploración general del catálogo o sectores (`#sectores`).
- Cumplir el principio TDD agregando pruebas automatizadas que validen la distribución, agrupación por sector y presencia de las 10 marcas tractoras.
- Mantener 0 errores y 0 warnings en `npm test` (`vitest run && astro check && tsc --noEmit`) y compilar limpiamente con `npm run build`.

**Never:**
- No hardcodear datos de marcas en el componente; deben cargarse declarativamente desde la colección `brands` (`src/content/brands/*.json`).
- No alterar ni romper los componentes existentes de `Hero.astro`, `ValuePillars.astro`, `ClientLogos.astro` o el bloque de cotización con la mascota técnica en `index.astro`.
- No alterar las directrices de contacto: la cotización canaliza exclusivamente a la Línea Corporativa Oficial (`+57 301 419 1344`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Carga de marcas tractoras en Home | Colección `brands` con 10 marcas tractoras y sectores asignados | `FeaturedBrands.astro` renderiza 3 sub-secciones o pestañas por sector con sus respectivas marcas: Eléctrico (3), Ferretero (4), Hidráulico (3), cada una en un `BrandCard` | Si falta alguna marca en la colección, renderiza las disponibles sin romper la página |
| Navegación al silo SEO de marca | Clic en el nombre o logo de la marca en `BrandCard` | Redirección/enlace a `/distribuidor-[id]-colombia` (ej. `/distribuidor-centelsa-colombia`) | Fallback defensivo a `#` si `id` no estuviera definido |
| Exploración del catálogo general | Clic en el botón secundario "Ver catálogo completo por sectores" | Desplazamiento fluido o navegación hacia el ancla `#sectores` | N/A |
| Marca tractora sin logotipo | Archivo JSON con `logo: null` o cadena vacía | Renderiza `BrandCard` con badge tipográfico corporativo en Montserrat sin etiquetas de imagen rotas | Gestión nativa en `BrandCard.astro` (EDGE-2) |

</frozen-after-approval>

## Code Map

- `src/components/home/FeaturedBrands.astro` -- Nuevo componente Astro que consulta `getCollection('brands')`, agrupa las 10 marcas tractoras por sector (`electrico`, `ferretero-construccion`, `hidraulico-pinturas`) y las renderiza mediante `BrandCard.astro`.
- `src/pages/index.astro` -- Integración del componente `FeaturedBrands` en la sección de marcas destacadas, sustituyendo el encabezado estático preliminar y manteniendo la cohesión con la sección de cotización y la mascota técnica.
- `src/components/catalog/BrandCard.astro` -- Componente existente de tarjeta de marca, verificado y reutilizado sin modificaciones disruptivas.
- `src/content/brands/*.json` -- Fuente de verdad declarativa de las 10 marcas tractoras.
- `src/content/categories/*.json` -- Metadatos de los 3 sectores industriales.
- `tests/unit/featured-brands.test.ts` -- Nueva suite de pruebas unitarias que audita la pertenencia, conteo y clasificación de las marcas tractoras por sector industrial.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/featured-brands.test.ts` -- Crear pruebas unitarias que verifiquen que la colección de marcas contiene exactamente las 10 marcas tractoras, agrupadas correctamente en sus 3 sectores industriales con sus slugs y datos obligatorios -- Garantizar cumplimiento TDD antes de la integración visual.
- [x] `src/components/home/FeaturedBrands.astro` -- Implementar el componente de vitrina destacada de marcas tractoras organizadas por sectores industriales con llamadas a la acción y enlaces a silos SEO -- Proveer la sección modular para Home.
- [x] `src/pages/index.astro` -- Importar e insertar `<FeaturedBrands />` en la sección `#marcas`, conservando la sección del avatar animado de cotización `#cotizar` -- Conectar la vitrina a la página principal.
- [x] Verificación integral -- Ejecutar `npm test` y `npm run build` -- Confirmar 0 errores de TypeScript, Astro check y suite de pruebas en verde.

**Acceptance Criteria:**
- Given la página de inicio (`src/pages/index.astro`), when el usuario hace scroll hacia la sección de marcas destacadas (`src/components/home/FeaturedBrands.astro`), then visualiza las 10 marcas tractoras distribuidas en sus 3 sectores: (1) Eléctrico: Panduit, Centelsa by Nexans, Sylvania; (2) Ferretero: Supermastick PR, Stanley, DeWalt, Truper; (3) Hidráulico/Químico: Pavco Wavin, Sika, Pintuco.
- Given cada tarjeta en la vitrina de Home, when el usuario hace clic en el nombre o logo de la marca, then el enlace apunta a su silo SEO correspondiente (`/distribuidor-[marca]-colombia`).
- Given la sección de marcas tractoras, when el usuario desea ver el catálogo completo, then dispone de un enlace o botón CTA secundario hacia la exploración general del catálogo por sectores (`#sectores`).
- Given la suite de verificación automatizada, when se corre `npm test` y `npm run build`, then pasan al 100% con 0 diagnósticos adversos.

## Implementation Notes

- Creado `src/lib/brands.ts` con funciones puras `filterTractorBrands`, `groupBrandsBySector` y `getBrandSiloUrl`, así como metadatos tipados `SECTORS_META` y constantes canónicas `EXPECTED_TRACTOR_BRANDS_BY_SECTOR`.
- Creada suite de pruebas `tests/unit/featured-brands.test.ts` con 13 pruebas que validan los inventarios de las 10 marcas tractoras, su distribución en los 3 sectores (Eléctrico: 3, Ferretero: 4, Hidráulico: 3), manejo defensivo de colecciones vacías o marcas sin ID, y resolución canónica de silos SEO.
- Implementado el componente modular `src/components/home/FeaturedBrands.astro` que consulta `getCollection('brands')`, agrupa las marcas tractoras por sector con indicadores visuales (`border-t-sector-*`), renderiza cada marca usando `BrandCard.astro`, y provee el CTA secundario hacia `#sectores`.
- Integrado `<FeaturedBrands />` en `src/pages/index.astro` dentro de `<section id="marcas">`, conservando íntegro el bloque de cotización con avatar animado (`#cotizar`).

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Estructura Astro CollectionEntry sin cobertura en filterTractorBrands y groupBrandsBySector | `medium` | patch | Resuelto añadiendo tests unitarios en tests/unit/featured-brands.test.ts con fixtures tipo { id, data: Brand }. |
| 2 | getBrandSiloUrl no importada en BrandCard.astro | `low` | patch | Resuelto importando y utilizando getBrandSiloUrl en BrandCard.astro, eliminando duplicación de URLs. |
| 3 | filterTractorBrands y groupBrandsBySector ante arrays con elementos null/undefined | `low` | patch | Resuelto añadiendo comprobación defensiva Boolean(item && typeof item === 'object') antes de acceder a data. |
| 4 | getBrandSiloUrl manejo de mayúsculas y caracteres | `low` | patch | Resuelto normalizando el id con trim().toLowerCase(). |
| 5 | Dirección invertida de flecha chevron en CTA hacia #sectores | `low` | patch | Resuelto actualizando el path SVG a flecha arriba (d="M5 15l7-7 7 7") congruente con la posición de #sectores. |
| 6 | Ausencia de navegación contextual desde sub-bloques de sector hacia anclas | `low` | patch | Resuelto enlazando el título de cada sector a su ancla correspondendiente #{sector.anchor}. |
| 7 | Manejo de sectores con 0 marcas tractoras | `low` | patch | Resuelto filtrando sectorGroups con brands.length > 0 antes de renderizar contenedores. |
| 8 | Jerarquía de encabezados WCAG entre FeaturedBrands y BrandCard | `low` | patch | Jerarquía validada con h2 para sección principal, h3 para sectores y BrandCard como tarjeta independiente. |
| 9 | Ordenamiento determinista de marcas tractoras por sector | `low` | patch | Resuelto ordenando marcas según su índice en EXPECTED_TRACTOR_BRANDS_BY_SECTOR[sectorId]. |
| 10 | Divergencia de metadatos de sector frente a src/content/categories/*.json | `false` | reject | SECTORS_META contiene clases y tokens visuales de Tailwind v4 específicos de la vitrina industrial. |
| 11 | Estado sprint-status.yaml no sincronizado a review durante triaje | `false` | reject | La sincronización de estado de sprint se realiza formalmente en las fases de cierre y presentación. |
| 12 | Propiedades en SectorMeta interface | `low` | patch | La propiedad anchor se utilizó para navegación a anclas y badgeClass para el pill superior. |
| 13 | Falta de tests de renderizado de componentes Astro con @astrojs/container | `false` | reject | El proyecto audita la lógica, helpers y esquemas con Vitest y la integridad de componentes con astro check. |

## Design Notes

La vitrina de marcas tractoras en Home combina claridad técnica y solvencia corporativa:
- Sub-bloques por sector con indicadores cromáticos sutiles (`border-t-sector-electrico`, `border-t-sector-ferretero`, `border-t-sector-hidraulico`) consistentes con la sección de sectores.
- Grilla adaptativa responsive (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` o `lg:grid-cols-4`) para garantizar lectura impecable en móviles y escritorios.
- Reutilización de `BrandCard.astro` para 0 duplicación de lógica de tarjeta, accesibilidad y normalización visual.

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las pruebas (incluyendo `featured-brands.test.ts`), `astro check` y `tsc --noEmit` reportan 0 diagnósticos.
- `npm run build` -- expected: Compilación exitosa de Astro SSG sin rutas rotas ni errores de renderizado.

**Manual checks (if no CLI):**
- Inspeccionar en `index.astro` que las 10 marcas tractoras aparecen bajo sus sectores correspondientes, con sus logos/badges, enlace al silo `/distribuidor-[id]-colombia` y botón para cotizar en WhatsApp.