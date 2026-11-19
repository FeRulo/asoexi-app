---
title: 'Story 3.2: Vitrina de Portafolio de Marca, Promesa Logística Diferenciada y Descarga Condicional de PDFs'
type: 'feature'
created: '2026-11-19'
status: 'done'
baseline_commit: '34c0dfbd9beddafa7697b4cd11e39bf217e0dde6'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores corporativos que visitan los silos canónicos de marca en `/distribuidor-[brand]-colombia` necesitan conocer con exactitud la promesa logística de entrega (tiempos para marcas tractoras con inventario local vs marcas complementarias bajo pedido a fábrica) y las familias de insumos disponibles, así como acceder a catálogos técnicos oficiales sin toparse con enlaces rotos 404 o botones inactivos.

**Approach:** Implementar en `src/pages/distribuidor-[brand]-colombia.astro` una vitrina estructurada de familias de productos suministradas, insignias destacadas de promesa logística diferenciada (Bogotá 24-48h regular y 6h urgencias en obras para `isTractor: true` vs suministro bajo pedido a fábrica ~48-72h para `isTractor: false`), y un mecanismo condicional estricto para catálogos PDF (EDGE-2): si `pdfCatalogUrl` es válido se despliega el botón accesible de descarga; si es nulo o indefinido se omite por completo del DOM y se despliega una acción proactiva para solicitar ficha técnica oficial por WhatsApp con SLA ≤ 5 min.

## Boundaries & Constraints

**Always:**
- Toda la renderización debe ser 100% estática (SSG) en Astro con 0 KB de JavaScript cliente en el silo de marca.
- Para Marcas Tractoras (`isTractor: true`): Exhibir de forma visible y contrastada la insignia prioritaria: *"Entrega 24-48h regular en Bogotá y 6h urgencias en obra"* acompañada de los avales de crédito comercial a 45 días y facturación electrónica DIAN.
- Para Marcas Secundarias o Complementarias (`isTractor: false`): Exhibir con total transparencia la insignia: *"Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)"*, alineando expectativas logísticas.
- Descarga condicional de PDF (EDGE-2): si `pdfCatalogUrl` contiene una URL o ruta válida, renderizar botón secundario accesible *"Descargar Ficha Técnica / Catálogo PDF"* con `target="_blank"` y `rel="noopener noreferrer"`.
- Omisión de botón roto (EDGE-2): si `pdfCatalogUrl` es `null`, vacío o indefinido, nunca renderizar un enlace roto ni botón deshabilitado; en su lugar, omitirlo del DOM y ofrecer el botón secundario *"Solicitar catálogo técnico de fábrica por WhatsApp"* usando `generateBrandCatalogRequestWhatsAppUrl(brand.name)` hacia la línea corporativa oficial `+57 301 419 1344` con promesa de respuesta SLA ≤ 5 min.
- Las familias de productos deben mostrarse en una grilla/vitrina visual con estilo industrial (`rounded-industrial`, WCAG 2.2 AA), consumiendo el campo `productFamilies` del esquema Zod de marcas o fallback defensivo estructurado a partir de `applicationNotes`.
- Todos los botones y llamadas a la acción deben tener áreas táctiles accesibles (≥ 48px de altura).
- Todo cambio debe pasar limpiamente `npm test` (`vitest run && astro check && tsc --noEmit`) con 0 errores y 0 advertencias.

**Never:**
- No renderizar etiquetas `<a>` o botones con enlaces rotos hacia PDFs inexistentes o URLs vacías (`href="#"`, `href=""`).
- No requerir JavaScript del lado del cliente ni hidratación para conmutar la promesa logística o la visibilidad de los botones de descarga de catálogo.
- No alterar ni romper el esquema canónico JSON-LD `BreadcrumbList` ni los metadatos SEO implementados en la Story 3.1.
- No eliminar ni debilitar el CTA primario de cotización directa por WhatsApp corporativo (`+57 301 419 1344`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Marca Tractora Logística | `brand.isTractor = true` | Exhibe insignia/tarjeta destacada con: *"Entrega 24-48h regular en Bogotá y 6h urgencias en obra"* y badges de crédito a 45 días | Renderiza estilo prioritario con icono de rayo/reloj de urgencia |
| Marca Secundaria Logística | `brand.isTractor = false` | Exhibe insignia/tarjeta transparente con: *"Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)"* | Renderiza estilo informativo en gris/azul neutro sin prometer 6h |
| Marca con Catálogo PDF Válido | `brand.pdfCatalogUrl = "/catalogs/panduit-2026.pdf"` | Botón accesible *"Descargar Ficha Técnica / Catálogo PDF"* con `target="_blank"` y `rel="noopener noreferrer"` | `aria-label` descriptivo indicando apertura en nueva ventana |
| Marca sin Catálogo PDF (EDGE-2) | `brand.pdfCatalogUrl = null` o `undefined` | Cero botones de descarga PDF en el DOM. Renderiza acción secundaria *"Solicitar catálogo técnico de fábrica por WhatsApp"* con URL hacia `+57 301 419 1344` y SLA ≤ 5 min | Si el nombre de la marca es nulo/vacío, fallback seguro a mensaje general |
| Vitrina Familias declaradas | `brand.productFamilies = ["Cableado Estructurado", "Bandejas Portacables"]` | Grilla de tarjetas/badges con las familias de producto explícitas de la marca | Renderiza cada familia en contenedor con estilo industrial |
| Vitrina Familias fallback | `brand.productFamilies = undefined` o `[]`, `applicationNotes = "Categoría 6A/7, bandejas portacables, amarras"` | Helper extrae familias segmentando `applicationNotes` o asignando categorías del sector | Muestra familias legibles sin dejar bloques vacíos |

</frozen-after-approval>

## Code Map

- `src/content.config.ts` -- Incorporar `productFamilies: z.array(z.string()).optional().default([])` en `brandSchema` con compatibilidad hacia atrás completa.
- `src/lib/brands.ts` -- Funciones puras de dominio: `getBrandLogisticsPromise(isTractor: boolean)`, `hasValidPdfCatalog(pdfCatalogUrl?: string | null): boolean`, y `getBrandProductFamilies(brand: Brand | Partial<Brand>): string[]`.
- `src/lib/whatsapp.ts` -- Función pura `generateBrandCatalogRequestWhatsAppUrl(brandName?: string | null, storage?: Storage): string` con mensaje pre-cargado para solicitar ficha técnica o catálogo de fábrica.
- `src/pages/distribuidor-[brand]-colombia.astro` -- Integrar en la plantilla canónica la sección de vitrina de portafolio con familias de producto, el bloque de promesa logística diferenciada y la bifurcación condicional de descarga PDF vs solicitud por WhatsApp.
- `src/components/catalog/BrandCard.astro` -- Mantener consistencia visual y de props en caso de enriquecimiento de tarjetas.
- `tests/unit/brand-silo.test.ts` -- Pruebas unitarias para promesa logística diferenciada, validación de catálogo PDF condicional y extracción de familias de productos.
- `tests/unit/whatsapp.test.ts` -- Pruebas unitarias para `generateBrandCatalogRequestWhatsAppUrl` validando números, textos y fallbacks seguros.
- `tests/unit/catalog-schema.test.ts` -- Pruebas unitarias para el esquema Zod de marcas con y sin `productFamilies`.

## Tasks & Acceptance

**Execution:**
- [x] `src/content.config.ts` -- Añadir campo opcional `productFamilies: z.array(z.string()).optional().default([])` a `brandSchema` preservando validación estricta de marcas.
- [x] `src/lib/brands.ts` -- Implementar tipos y funciones puras: `getBrandLogisticsPromise` (retorna textos, insignias y estado de urgencia según tractor/secundaria), `hasValidPdfCatalog` (valida existencia de URL/ruta no vacía) y `getBrandProductFamilies` (extrae familias explícitas o genera fallback desde applicationNotes/sector).
- [x] `src/lib/whatsapp.ts` -- Implementar `generateBrandCatalogRequestWhatsAppUrl` generando URL hacia `+57 301 419 1344` con mensaje: *"Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar la ficha técnica o catálogo oficial de fábrica para la marca [Nombre]"*.
- [x] `src/pages/distribuidor-[brand]-colombia.astro` -- Actualizar la landing canónica de marca:
  - Renderizar sección destacada de Promesa Logística Diferenciada (insignia prioritaria 24-48h regular / 6h urgencias en obras para marcas tractoras vs ~48-72h bajo pedido directo a fábrica para marcas secundarias).
  - Renderizar Vitrina de Portafolio con las familias de insumos representadas por la marca en grilla accesible.
  - Implementar bloque condicional de recursos técnicos: botón secundario de descarga si `hasValidPdfCatalog` es verdadero; o botón de solicitud de catálogo técnico por WhatsApp si es falso (cero enlaces 404).
- [x] `tests/unit/brand-silo.test.ts` -- Incorporar tests unitarios para verificar la promesa logística diferenciada, la detección condicional de PDFs y la extracción de familias de producto.
- [x] `tests/unit/whatsapp.test.ts` -- Incorporar tests unitarios para `generateBrandCatalogRequestWhatsAppUrl` validando sanitización, codificación URI y fallback cuando el nombre está vacío.
- [x] `tests/unit/catalog-schema.test.ts` -- Actualizar tests unitarios del catálogo verificando la validez del esquema con `productFamilies` definido, vacío y omitido.

**Acceptance Criteria:**
- Given la landing de una Marca Tractora (`isTractor: true`), when se evalúa la sección de promesa logística, then contiene el texto *"Entrega 24-48h regular en Bogotá y 6h urgencias en obra"* junto a credenciales de crédito a 45 días.
- Given la landing de una Marca Secundaria (`isTractor: false`), when se evalúa la sección de promesa logística, then contiene el texto *"Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)"*.
- Given una marca con `pdfCatalogUrl` válido, when se renderiza la página, then se exhibe el botón *"Descargar Ficha Técnica / Catálogo PDF"* abriendo el documento en nueva pestaña con atributos `target="_blank"` y `rel="noopener noreferrer"`.
- Given una marca con `pdfCatalogUrl: null` o no definido, when se renderiza la página, then el botón de descarga PDF no existe en el DOM y se presenta la acción *"Solicitar catálogo técnico de fábrica por WhatsApp"* con mensaje pre-cargado hacia `+57 301 419 1344`.
- Given cualquier landing de marca, when el usuario visualiza el portafolio, then se exhiben las familias de productos correspondientes a la marca con estructura accesible.
- Given la ejecución de `npm test`, when se ejecutan Vitest, Astro Check y TSC, then el 100% de las pruebas pasan con 0 errores y 0 warnings en el diagnóstico.

## Implementation Notes

- Campo `productFamilies` incorporado en `brandSchema` con valor por defecto `[]` garantizando compatibilidad retroactiva total con las marcas declaradas previamente.
- `getBrandLogisticsPromise` entrega diferenciación estricta entre marcas tractoras (`isTractor: true`, entrega 24-48h regular en Bogotá y 6h urgencias en obra con badges de crédito y facturación DIAN) y secundarias (`isTractor: false`, entrega bajo pedido a fábrica ~48-72h).
- `hasValidPdfCatalog` garantiza que no existan enlaces rotos 404 ni botones inactivos cuando `pdfCatalogUrl` no existe o es vacío.
- `generateBrandCatalogRequestWhatsAppUrl` unifica el canal de solicitud de catálogo hacia la Línea Corporativa `+57 301 419 1344` con promesa de respuesta SLA ≤ 5 min.
- `getBrandProductFamilies` implementa fallback defensivo de 4 niveles: explícito -> segmentación de `applicationNotes` -> categorías técnicas del sector -> categorías industriales genéricas.
- Renderizado 100% estático SSG con 0 KB de JavaScript del lado del cliente.


## Spec Change Log

## Review Triage Log

| Finding Location | Verdict | Evidence & Action |
|---|---|---|
| `src/content.config.ts:22` | `medium` | `productFamilies: z.array(z.string()).optional().default([])` lanza error de validación Zod si un archivo JSON define `"productFamilies": null`. Corregir a `.nullable().optional().transform((v) => v ?? [])`. |
| `src/lib/brands.ts:139` | `medium` | La sustitución global `s.replace(/[.]/g, '')` en el fallback de extracción de familias elimina puntos decimales técnicos (e.g. "2.5 mm"). Corregir para eliminar únicamente puntos finales de puntuación `s.replace(/\.+$/, '').trim()`. |
| `src/pages/distribuidor-[brand]-colombia.astro:188` | `medium` | Si `pdfCatalogUrl` se define como ruta relativa sin barra inicial (e.g. `catalogs/panduit.pdf`), se resuelve relativo a la subruta `/distribuidor-panduit-colombia/`, generando un enlace roto 404. Corregir normalizando con `/` inicial si no es URL absoluta. |
| `src/lib/brands.ts:104` | `low` | `hasValidPdfCatalog` no filtra fragmentos `#` o esquemas `javascript:`. Corregir añadiendo guardas defensivas para cadenas que solo contengan `#` o inicien con `javascript:`. |
| `src/pages/distribuidor-[brand]-colombia.astro:310` | `low` | `logisticsPromise.headline` no se renderiza directamente, usando en su lugar un ternario inline. Corregir renderizando `logisticsPromise.headline`. |
| `src/pages/distribuidor-[brand]-colombia.astro:400` | `low` | La grilla de familias de producto utiliza elementos `<div>` genéricos en lugar de marcado semántico accesible (`<ul role="list">` y `<li>`). Corregir a lista semántica accesible. |
| `src/pages/distribuidor-[brand]-colombia.astro:185` | `low` | El enlace de descarga de PDF carece del atributo informativo `type="application/pdf"`. Corregir añadiendo el atributo. |
| `src/components/catalog/BrandCard.astro:21` | `low` | Propiedad `productFamilies` agregada a `BrandCard` para paridad de tipos pero sin renderizado en la tarjeta compacta. Se mantiene como prop opcional tipada. |
| `src/pages/distribuidor-[brand]-colombia.astro:369` | `false` | Reportado como duplicación de CTA; es intencional colocar el acceso al catálogo tanto en el Hero principal como en la cabecera de la sección de vitrina para ergonomía de conversión B2B. |
| `src/content/brands/*.json` | `false` | Reportada ausencia de datos reales de marcas para catálogos y familias; esto pertenece explícitamente al alcance de la Story 3.3 en el plan de sprint. |
| `src/lib/whatsapp.ts:187` | `false` | Saludo con asesoras hardcodeado; responde a la invariante institucional de atención comercial centralizada definida en el Contexto del Proyecto. |

## Design Notes

- **Promesa Logística Diferenciada:**
  - Para Marcas Tractoras: contenedor con borde de acento en ámbar/rojo institucional, badge con icono de entrega rápida y texto: *"Entrega 24-48h regular en Bogotá y 6h urgencias en obra"*.
  - Para Marcas Secundarias: contenedor en `bg-slate-50 border-slate-200`, badge con icono de fábrica/camión logístico y texto: *"Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)"*.
- **Descarga Condicional vs Solicitud WhatsApp:**
  - Si `pdfCatalogUrl`: Botón secundario `bg-white text-slate-800 border-slate-300 hover:bg-slate-50 min-h-[48px]`, icono de documento PDF.
  - Si `null`/indefinido: Botón secundario proactivo `bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 min-h-[48px]`, icono de WhatsApp y SLA ≤ 5 min.

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las suites (incluyendo `brand-silo.test.ts`, `whatsapp.test.ts` y `catalog-schema.test.ts`), `astro check` y `tsc --noEmit` completan con 0 errores y 0 advertencias.
- `npm run build` -- expected: Compilación SSG completa y limpia en Astro, generando las rutas estáticas `/distribuidor-[brand]-colombia` con contenido enriquecido y sin enlaces rotos.
