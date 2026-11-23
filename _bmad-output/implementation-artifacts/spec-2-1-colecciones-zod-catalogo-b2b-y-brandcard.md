---
title: 'Story 2.1: Colecciones Zod del Catálogo B2B y Componente Tarjeta de Marca (BrandCard)'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'b92917754ecc858762c955c7d4b4c18ef941ba80'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La plataforma carece de esquemas declarativos tipados para gestionar el catálogo B2B de marcas y sectores, así como del componente de tarjeta de marca (`BrandCard`) con normalización visual y enlace directo de cotización, impidiendo avanzar en las vitrinas de productos y hubs temáticos de la Épica 2.

**Approach:** Definir las colecciones de contenido en `src/content.config.ts` utilizando esquemas Zod rigurosos para `brands` y `categories` con archivos de datos JSON locales en `src/content/`, e implementar el componente presentacional estático `src/components/catalog/BrandCard.astro` con tratamiento visual industrial, badge de contingencia sin imágenes rotas (EDGE-2) y enlace a WhatsApp corporativo con mensaje contextualizado.

## Boundaries & Constraints

**Always:**
- Cumplir el estándar TDD: concebir y ejecutar tests unitarios de validación de esquemas Zod y generación de URLs de cotización antes/durante la implementación.
- La interactividad y renderizado de `BrandCard.astro` deben ser 100% estáticos (SSG, 0 KB JavaScript cliente).
- Validar rigurosamente los campos del esquema de marcas: `id` (string), `name` (string), `sector` (`'electrico' | 'ferretero-construccion' | 'hidraulico-pinturas'`), `isTractor` (boolean), `logo` (string opcional/nullable), `description` (string), `applicationNotes` (string), `pdfCatalogUrl` (string opcional/nullable).
- Enlazar la acción de cotización exclusivamente a la Línea Corporativa Oficial unificada (`+57 301 419 1344`) con SLA ≤ 5 min.
- Aplicar tokens corporativos y el radio industrial (`rounded-industrial`) según `src/styles/global.css`.
- Si una marca carece de asset o ruta de logo (EDGE-2), renderizar un badge tipográfico corporativo en Montserrat que garantice estética limpia sin provocar errores 404 ni iconos rotos.

**Never:**
- No introducir dependencias de bases de datos externas, APIs remotas ni llamadas dinámicas en cliente; el catálogo es puramente Git-based.
- No utilizar números personales de asesoras comerciales ni lógicas de rotación que dispersen las solicitudes.
- No alterar ni romper los componentes existentes de la Epic 1 (`Header`, `Footer`, `Hero`, `ValuePillars`).
- No omitir `astro check` o `tsc --noEmit`; el estado final debe mantener 0 errores y 0 warnings en diagnósticos.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Marca válida con logo vectorial | Objeto Brand con `logo: '/brands/panduit.svg'`, `isTractor: true`, `sector: 'electrico'` | Renderiza tarjeta con contenedor blanco, logo centrado con efecto `grayscale hover:grayscale-0 transition-all`, pill de sector, badge sutil de Marca Tractora y botón *"Cotizar Panduit"* hacia WhatsApp oficial | N/A |
| Marca sin logotipo vectorial (EDGE-2) | Objeto Brand con `logo: ''` o `logo: null` o sin archivo de imagen | Renderiza un badge tipográfico corporativo en Montserrat con iniciales/nombre de marca estilizado sobre fondo neutro industrial sin icono de imagen rota | Fallback visual limpio en CSS/HTML |
| Validación Zod con sector inválido | Objeto Brand con `sector: 'automotriz'` | Zod lanza `ZodError` indicando valor inválido en el enum del sector | Validación rechazada en build-time con mensaje descriptivo |
| Validación Zod con campos faltantes | Objeto Brand sin `name` o sin `description` | Zod lanza `ZodError` indicando campo obligatorio ausente | Build se detiene antes de generar páginas inválidas |
| Generación de mensaje WhatsApp para marca | Marca con nombre `"Centelsa by Nexans"` | Enlace `https://wa.me/573014191344?text=...` con texto codificado conteniendo el nombre exacto de la marca | Fallback seguro al mensaje corporativo por defecto si el nombre está vacío |

</frozen-after-approval>

## Code Map

- `src/content.config.ts` -- Definición oficial de colecciones de contenido (`brands`, `categories`) y esquemas Zod exportados.
- `src/content/brands/*.json` -- Archivos declarativos de marcas del catálogo (incluyendo las 10 marcas tractoras oficiales).
- `src/content/categories/*.json` -- Archivos declarativos de los 3 sectores industriales (`electrico`, `ferretero-construccion`, `hidraulico-pinturas`).
- `src/components/catalog/BrandCard.astro` -- Componente presentacional estático de tarjeta de marca con normalización visual y botón de cotización.
- `src/lib/whatsapp.ts` -- Helper `generateBrandQuoteWhatsAppUrl(brandName: string)` o extensión para cotizaciones específicas por marca.
- `tests/unit/catalog-schema.test.ts` -- Tests unitarios que auditan la integridad de los esquemas Zod de marcas y categorías.
- `tests/unit/brand-quote.test.ts` -- Tests unitarios para la generación de enlaces contextualizados de cotización por marca.

## Tasks & Acceptance

**Execution:**
- [x] `src/content.config.ts` -- Definir colecciones `brands` y `categories` con sus loaders (`glob` de JSON) y esquemas Zod estrictos -- Establecer la fuente de verdad tipada para el catálogo B2B.
- [x] `src/content/categories/*.json` -- Crear los archivos de sector para `electrico`, `ferretero-construccion` y `hidraulico-pinturas` -- Base de categorización industrial de la plataforma.
- [x] `src/content/brands/*.json` -- Crear los registros declarativos iniciales de marcas (priorizando las 10 marcas tractoras) -- Proveer datos oficiales para verificación y componentes.
- [x] `src/lib/whatsapp.ts` -- Añadir función auxiliar tipada para generar enlaces de WhatsApp contextualizados por marca hacia la línea unificada (+57 301 419 1344) -- Estandarizar la conversión comercial.
- [x] `src/components/catalog/BrandCard.astro` -- Implementar el componente presentacional con fondo blanco, normalización `grayscale`, pill de sector, fallback tipográfico corporativo (EDGE-2) y CTA de cotización -- Elemento reutilizable para Home, Hubs y Catálogo.
- [x] `tests/unit/catalog-schema.test.ts` -- Crear suite de pruebas unitarias para esquemas Zod de marcas y sectores -- Garantizar cobertura TDD y validación estricta de contratos de datos.
- [x] `tests/unit/brand-quote.test.ts` -- Crear suite de pruebas unitarias para la construcción de URLs de cotización por marca -- Validar que el canal oficial y los parámetros URI se formateen con exactitud.

**Acceptance Criteria:**
- Given el archivo `src/content.config.ts`, when Astro compila o ejecuta validación de colecciones, then las colecciones `brands` y `categories` cargan sin errores y rechazan estructuras que violen los tipos obligatorios.
- Given el componente `src/components/catalog/BrandCard.astro`, when se renderiza con una marca válida, then genera marcado semántico accesible con clases de Tailwind v4, radio `--radius-industrial` y botón a WhatsApp corporativo.
- Given una marca sin archivo de logo, when `BrandCard.astro` la renderiza, then despliega el badge tipográfico corporativo en Montserrat sin etiquetas `<img>` con rutas inexistentes.
- Given la suite de pruebas automatizadas, when se ejecuta `npm test`, then pasa al 100% (Vitest + Astro Check + TypeScript) con 0 errores y 0 advertencias.

## Implementation Notes

- Configuración de colecciones en `src/content.config.ts` utilizando `glob` de JSON (`astro/loaders`) y esquemas Zod rigurosos (`astro/zod`).
- Se crearon los 3 archivos de sector industrial en `src/content/categories/`: `electrico.json`, `ferretero-construccion.json`, `hidraulico-pinturas.json`.
- Se crearon los 10 archivos de marcas tractoras en `src/content/brands/`: `panduit.json`, `centelsa.json`, `sylvania.json`, `supermastick.json`, `stanley.json`, `dewalt.json`, `truper.json`, `pavco-wavin.json`, `sika.json`, `pintuco.json`.
- Implementado helper `generateBrandQuoteWhatsAppUrl(brandName?: string | null)` en `src/lib/whatsapp.ts` con sanitización, fallback al mensaje corporativo oficial ante valores vacíos y canal unificado `+57 301 419 1344`.
- Componente `src/components/catalog/BrandCard.astro` creado con 0 KB de JS cliente, marcado semántico, radio corporativo `rounded-industrial`, pill de sector, fallback tipográfico corporativo en Montserrat para logos ausentes (EDGE-2) y botón de cotización directa con altura táctil accesible ≥ 48px.
- Alias `'astro:content': 'astro/content/config'` añadido a `vitest.config.ts` para ejecución nativa en Vitest.
- Suite de pruebas completa: `tests/unit/catalog-schema.test.ts` (10 tests) y `tests/unit/brand-quote.test.ts` (6 tests). Totalizando 77 pruebas unitarias pasando al 100% con 0 diagnósticos en Astro check y TypeScript.

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Unused `pdfCatalogUrl` in `BrandCard.astro` | `false` | reject | En Story 2.1 solo se exigía definir el campo en el esquema Zod; la descarga condicional de catálogos PDF corresponde explícitamente a la Story 3.2. |
| 2 | Enlace canónico hacia `/distribuidor-${id}-colombia` | `low` | patch | Responde a la arquitectura canónica para Story 3.1; se protegió defensivamente a `#` si `id` está vacío. |
| 3 | Soporte directo para `CollectionEntry<'brands'>` en `BrandCard.astro` | `medium` | patch | Se extrajo el objeto desestructurando tanto `Brand` plano como `CollectionEntry<'brands'>` (`'data' in brand`) garantizando ergonomía completa. |
| 4 | Cumplimiento WCAG 2.5.3 (Label in Name) en botón WhatsApp | `low` | patch | Se alineó `aria-label` para iniciar con la cadena exacta visible `Cotizar ${displayName} por WhatsApp oficial`. |
| 5 | Atributos `width` y `height` en `<img>` de logotipo | `low` | patch | Se añadieron atributos explícitos `width="160"` y `height="48"` para prevenir Cumulative Layout Shift (CLS). |
| 6 | Marcas tractoras con `"logo": null` en JSON | `false` | reject | Es el comportamiento esperado y auditado bajo el criterio EDGE-2 mientras se incorporan los assets vectoriales finales. |
| 7 | Estado en `sprint-status.yaml` | `false` | reject | La sincronización de estado de sprint se realiza de forma protocolaria al completar las fases de review y cierre. |
| 8 | Tests de renderizado de componentes para `BrandCard.astro` | `false` | reject | El proyecto evalúa los contratos de esquema y helpers con Vitest; el harness no dispone de `@astrojs/container`. |
| 9 | Validación de todos los `SECTOR_IDS` en archivos de categorías | `low` | patch | Se incorporó aserción en `catalog-schema.test.ts` para verificar la existencia exacta de cada sector de `SECTOR_IDS`. |
| 10 | Discrepancia en `applicationNotes` requerida vs componente | `false` | reject | No hay discrepancia; el componente aplica una guarda defensiva contra cadenas vacías sobre un string tipado obligatoriamente. |
| 11 | ID de marca vacío o indefinido en `BrandCard.astro` | `low` | patch | Se añadió guarda `data.id ? /distribuidor-${data.id}-colombia : '#'` evitando rutas vacías. |
| 12 | Notas de aplicación compuestas solo por espacios en blanco | `low` | patch | Se añadió guarda con `.trim().length > 0` evitando contenedores vacíos. |
| 13 | Nombre de marca vacío o nulo en link de título | `low` | patch | Se implementó fallback accesible `displayName = data.name \|\| 'Marca'`. |
| 14 | Verificación de gaps de testing | `false` | reject | Verification Gap Reviewer auditó la cobertura y confirmó: "No verification gaps found". |

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las pruebas unitarias (anteriores + nuevas de catálogo), `astro check` y `tsc --noEmit` reportan 0 diagnósticos.
- `npm run build` -- expected: Compilación exitosa en Astro SSG sin advertencias ni rutas rotas.

**Manual checks (if no CLI):**
- Verificar en navegador o render estático que `BrandCard.astro` despliega correctamente el pill de sector, el efecto hover sobre el logotipo y el badge tipográfico en casos sin imagen.
