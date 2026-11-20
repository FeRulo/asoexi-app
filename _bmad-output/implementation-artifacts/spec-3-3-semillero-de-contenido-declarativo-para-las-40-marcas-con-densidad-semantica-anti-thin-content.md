---
title: 'Story 3.3: Semillero de Contenido Declarativo para las ~40 Marcas con Densidad Semántica Anti-Thin-Content'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: '12a6b978855d7cb878c15a3ed8a8572baffd03d8'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los silos canónicos de marca en `/distribuidor-[brand]-colombia` corren el riesgo de ser penalizados por Google como "Thin Content" (páginas con contenido pobre o genérico sin valor sustancial) si las marcas carecen de descripciones técnicas detalladas, familias de insumos específicas, criterios de aplicación en obra/industria o notas claras sobre la capacidad de abastecimiento integral bajo pedido.

**Approach:** Enriquecer y auditar el semillero declarativo de las 44 marcas comerciales en `src/content/brands/*.json`, expandiendo el esquema Zod en `src/content.config.ts` con el campo `sourcingNotes` (notas de abastecimiento integral) y dotando a cada registro de contenido técnico sustantivo (descripción de fabricante, familias de insumos, aplicaciones en obra y notas de suministro directo a fábrica), integrando su despliegue en la plantilla canónica `distribuidor-[brand]-colombia.astro` y blindando la suite con tests unitarios automatizados de densidad semántica.

## Boundaries & Constraints

**Always:**
- Toda la renderización debe ser 100% estática (SSG) en Astro con 0 KB de JavaScript cliente en los silos de marca.
- Cada uno de los 44 registros de marcas en `src/content/brands/*.json` debe cumplir estrictamente el esquema Zod `brandSchema` en `src/content.config.ts`.
- Cada marca debe contar con densidad semántica sustancial: descripción técnica del fabricante (≥ 60 caracteres), notas técnicas de aplicación en obra (≥ 60 caracteres), al menos 3 familias de insumos explícitas en `productFamilies`, y notas de abastecimiento integral (`sourcingNotes` ≥ 60 caracteres).
- `sourcingNotes` debe añadirse como campo opcional y nulable en `brandSchema` con compatibilidad retroactiva (`.nullable().optional().transform((v) => v ?? null)`).
- En `src/lib/brands.ts`, proveer la función pura `getBrandSourcingNotes(brand)` que devuelva las notas explícitas o un fallback institucional robusto que refuerce la distribución mayorista de ASOEXI con crédito a 45 días y facturación DIAN.
- En `src/pages/distribuidor-[brand]-colombia.astro`, renderizar una sección accesible y contrastada de *"Garantía de Abastecimiento Integral y Pedidos a Fábrica"* que informe al comprador sobre la disponibilidad de todo el portafolio de la marca bajo pedido a fábrica y despacho en obra.
- Todo cambio debe pasar limpiamente `npm test` (`vitest run && astro check && tsc --noEmit`) con 0 errores y 0 advertencias, y `npm run build` debe compilar el 100% de las rutas estáticas.

**Never:**
- No introducir dependencias de bases de datos externas ni APIs en tiempo de ejecución para servir el contenido de las marcas.
- No dejar campos vacíos, cadenas de relleno genérico (e.g. "lorem ipsum", "texto de prueba", "N/A") o familias de productos ficticias no relacionadas con el sector de la marca.
- No alterar ni romper los identificadores (`id`), sectores (`sector`) ni banderas tractoras (`isTractor`) existentes para preservar la integridad de URLs canónicas y tests de silos previos.
- No requerir JavaScript en cliente para desplegar las notas de abastecimiento integral o las familias de producto.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Marca con sourcingNotes explícito | `brand.sourcingNotes = "Suministro directo de planta en carretes..."` | Renderiza sección de Abastecimiento Integral con el texto técnico específico de la marca | Renderiza contenedor con estilo industrial y badges de confianza |
| Marca sin sourcingNotes explícito (fallback) | `brand.sourcingNotes = null` o `undefined` | `getBrandSourcingNotes` genera texto institucional mayorista parametrizado con el nombre de la marca | Retorna texto institucional seguro mencionando despacho en Bogotá/Sabana y crédito 45 días |
| Auditoría de densidad semántica válida | Registro con desc ≥ 60c, appNotes ≥ 60c, fams ≥ 3, sourcing ≥ 60c | Test de integridad y densidad semántica valida exitosamente la marca | Pasa aserción en suite unitaria de Vitest |
| Registro con contenido insuficiente ("Thin Content") | Registro con desc < 60c, appNotes vacías o fams < 3 | Suite de pruebas falla inmediatamente señalando el archivo JSON infractor | Detiene build y previene publicación de páginas de baja calidad SEO |
| Compilación SSG multimarca | 44 archivos JSON en `src/content/brands/` procesados por Astro | Genera 44 rutas estáticas canónicas `/distribuidor-[brand]-colombia` sin errores ni 404 | Error de build en caso de colisión de slugs o esquema Zod inválido |

</frozen-after-approval>

## Code Map

- `src/content.config.ts` -- Incorporar `sourcingNotes: z.string().nullable().optional().transform((v) => v ?? null)` en `brandSchema`.
- `src/content/brands/*.json` -- Auditar y enriquecer los 44 archivos declarativos de marca con descripciones técnicas especializadas, notas de aplicación en obra/industria, familias de productos completas (3 a 5 por marca) y notas de abastecimiento integral.
- `src/lib/brands.ts` -- Implementar funciones puras: `getBrandSourcingNotes(brand: Brand | Partial<Brand>): string` y `isBrandContentSubstantial(brand: Brand | Partial<Brand>): boolean`.
- `src/pages/distribuidor-[brand]-colombia.astro` -- Integrar el bloque accesible de *"Garantía de Abastecimiento Integral y Pedidos a Fábrica"* consumiendo `getBrandSourcingNotes(data)`.
- `tests/unit/catalog-schema.test.ts` -- Incorporar suite de validación en disco para las 44 marcas auditando cumplimiento estricto del esquema Zod, unicidad de IDs y densidad semántica anti-thin-content (longitud de textos, mínimo de familias).
- `tests/unit/brand-silo.test.ts` -- Tests unitarios para `getBrandSourcingNotes` e `isBrandContentSubstantial`.

## Tasks & Acceptance

**Execution:**
- [x] `src/content.config.ts` -- Añadir campo `sourcingNotes` a `brandSchema` con tipo opcional y nulable normalizado.
- [x] `src/lib/brands.ts` -- Añadir funciones de dominio `getBrandSourcingNotes` y `isBrandContentSubstantial` para auditoría y fallbacks.
- [x] `src/content/brands/*.json` -- Poblar y auditar las 44 marcas garantizando alta densidad semántica (descripción técnica, aplicaciones en obra, familias de insumos y notas de abastecimiento).
- [x] `src/pages/distribuidor-[brand]-colombia.astro` -- Incorporar la sección de *"Garantía de Abastecimiento Integral y Pedidos a Fábrica"* con diseño industrial y áreas táctiles accesibles.
- [x] `tests/unit/catalog-schema.test.ts` -- Crear pruebas de integración en disco para auditar las 44 marcas contra thin-content y esquema Zod.
- [x] `tests/unit/brand-silo.test.ts` -- Añadir pruebas unitarias para `getBrandSourcingNotes` e `isBrandContentSubstantial`.

**Acceptance Criteria:**
- Given el directorio `src/content/brands/`, when se valida contra `brandSchema`, then el 100% de los 44 archivos JSON compilan limpiamente sin errores de validación.
- Given cualquier marca del catálogo, when se audita su densidad semántica, then cuenta con `description` ≥ 60 caracteres, `applicationNotes` ≥ 60 caracteres, al menos 3 `productFamilies` y `sourcingNotes` sustantivo.
- Given la visita a cualquier landing canónica `/distribuidor-[brand]-colombia`, when el usuario revisa el contenido, then se despliegan las familias de productos, notas de aplicación y la garantía de abastecimiento integral bajo pedido a fábrica.
- Given la ejecución de `npm test`, when se ejecutan Vitest, Astro Check y TSC, then el 100% de las pruebas pasan con 0 errores y 0 advertencias en el diagnóstico.
- Given `npm run build`, when se generan las páginas estáticas, then se generan todas las landings canónicas sin enlaces rotos ni advertencias.

## Implementation Notes

- Incorporado el campo `sourcingNotes` a `brandSchema` con normalización nulable y opcional para compatibilidad total con datos históricos.
- Poblados y auditados los 44 archivos JSON en `src/content/brands/` garantizando descripciones técnicas de fabricante, aplicaciones en obra, 4 familias de productos y notas sustanciales de abastecimiento de fábrica.
- Implementadas funciones de dominio puras `getBrandSourcingNotes` (con fallback institucional para crédito a 45 días y facturación DIAN) e `isBrandContentSubstantial` con validación de unicidad de familias.
- Renderizado 100% estático SSG en `src/pages/distribuidor-[brand]-colombia.astro` con sección accesible de "Garantía de Abastecimiento Integral y Pedidos a Fábrica" (0 KB JS cliente).

## Spec Change Log

## Review Triage Log

| Finding Location | Verdict | Evidence & Action |
|---|---|---|
| `src/content/brands/caribe.json:16` | `medium` | `sourcingNotes` describía válvulas hidráulicas en lugar de herramientas pesadas de albañilería (palas, llanas, palustres). Corregido a insumos de albañilería y obra civil. |
| `src/content/brands/goya.json:16` | `medium` | `sourcingNotes` describía fabricación química de pintura en lugar de herramientas aplicadoras (rodillos, brochas, espátulas). Corregido a herramientas profesionales de aplicación. |
| `src/content/brands/luminex.json:16` | `medium` | `sourcingNotes` describía placas y tomas en lugar de conductores eléctricos especiales e instrumentación. Corregido a cables y conductores especiales en carretes. |
| `src/content/brands/mercury.json:16` | `medium` | `sourcingNotes` describía material de conexión y clavijas en lugar de luminarias LED, paneles y reflectores. Corregido a iluminación LED comercial e industrial. |
| `src/content/brands/multipack.json:16` | `medium` | `sourcingNotes` describía cartuchos de silicona para ventanería en lugar de cintas de teflón y selladores de roscas hidrosanitarias. Corregido a selladores de roscas y teflón PTFE. |
| `src/content/brands/proelectricos.json:16` | `medium` | `sourcingNotes` describía cintas aislantes y terminales en lugar de tableros de distribución metálicos y encerramientos. Corregido a tableros de distribución y cajas de paso. |
| `src/lib/brands.ts:694` | `medium` | `getBrandSourcingNotes` no exigía longitud mínima (>= 60c) en notas explícitas. Corregido añadiendo `target.sourcingNotes.trim().length >= 60`. |
| `src/lib/brands.ts:697` | `low` | `target.name` sin guarda `typeof === 'string'` antes de `.trim()`. Corregido con verificación de tipo string segura. |
| `src/lib/brands.ts:738` | `low` | `isBrandContentSubstantial` no comprobaba unicidad en familias de producto. Corregido exigiendo `new Set(validFamilies).size >= 3`. |
| `src/pages/distribuidor-[brand]-colombia.astro:415` | `low` | Disparidad de tamaño tipográfico entre los `<h2>` de notas de aplicación (`text-xl`) y notas de abastecimiento (`text-xl sm:text-2xl`). Unificado a `text-xl sm:text-2xl`. |
| `src/pages/distribuidor-[brand]-colombia.astro:801` | `false` | Badges de beneficios reportados sin áreas táctiles interactivas; son microcopy informativo de confianza B2B, no botones de navegación. |
| `src/pages/distribuidor-[brand]-colombia.astro:84` | `false` | Reportada ausencia de Schema.org para abastecimiento; fuera de alcance de la historia (BreadcrumbList semántico normado por ARCH-6 / Story 3.1). |
| `src/lib/search.ts` | `false` | Reportada omisión de indexación de `sourcingNotes` en el buscador en vivo; fuera del alcance de la historia (contrato de Story 2.4). |

## Design Notes

- **Garantía de Abastecimiento Integral en Silos de Marca:**
  - Sección visualmente integrada con borde de acento neutro (`bg-white border-slate-200 rounded-industrial p-6 sm:p-8 shadow-xs`).
  - Encabezado con icono industrial de cadena de suministro / planta de producción.
  - Subtítulo aclaratorio B2B: *"Suministro mayorista directo de fábrica para referencias de catálogo o requerimientos especiales de obra"*.
  - Párrafo descriptivo con tipografía legible y microcopy institucional de solvencia logística.

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las suites (incluyendo auditoría de 44 marcas en `catalog-schema.test.ts` y helpers en `brand-silo.test.ts`), `astro check` y `tsc --noEmit` completan con 0 errores y 0 advertencias.
- `npm run build` -- expected: Compilación SSG completa en Astro, generando las 44 rutas estáticas de marca con densidad semántica completa y sin fallos.
