---
title: 'Story 1.4: Página Institucional "Nosotros", Protocolos Operativos y Metadatos Open Graph'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: 'dcff52e5a99e2220a6034969fae30480c0acb5bc'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-1-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los analistas de compras, jefes de adquisiciones y residentes de obra no disponen actualmente de una página institucional dedicada (`/nosotros`) para verificar la personería jurídica, trayectoria de 7+ años, misión, visión, protocolos de seguridad física y laboral de ASOEXI S.A.S., ni cuentan con previsualizaciones enriquecidas (Open Graph y Twitter Cards) al compartir enlaces del sitio por WhatsApp, Slack o correo corporativo.

**Approach:** Implementar el módulo de utilidades puras `src/lib/seo.ts` para resolución y formateo de metadatos Open Graph, Twitter Cards y canonical URLs; actualizar `src/layouts/BaseLayout.astro` para inyectar las etiquetas de metadatos globales y por página; crear la estructura de datos institucionales en `src/lib/constants.ts`; desarrollar la página SSG `src/pages/nosotros.astro` con narrativa corporativa, protocolos operativos, confirmación estricta de despacho a domicilio sin venta en mostrador, y franja de clientes corporativos; todo validado con pruebas unitarias TDD en Vitest.

## Boundaries & Constraints

**Always:**
- Metodología TDD estricta: concebir y escribir pruebas unitarias en `tests/unit/seo.test.ts` y `tests/unit/nosotros-data.test.ts` antes de instanciar la lógica de metadatos y datos institucionales.
- WCAG 2.2 AA: contrastes cromáticos ≥ 4.5:1, etiquetas ARIA, jerarquía semántica H1-H3, textos legibles en móvil y escritorio, y áreas táctiles ≥ 48x48px (`min-h-[48px]`).
- Estética de precisión industrial: token `--radius-industrial` (clase `rounded-industrial`), paleta corporativa (Rojo ASOEXI `#E51A24`, Secundario `#1E2229`, Superficie `#FFFFFF` / `#F8FAFC`).
- Protocolo logístico inviolable: reiteración clara y explícita de que la sede administrativa (`Carrera 55 A No. 51 A 28 Sur, Bogotá`) opera exclusivamente para coordinación y despacho 100% a domicilio en obra y empresas, sin venta presencial por mostrador ni retiro en bodega.
- Metadatos Open Graph completos: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale` (`es_CO`), `canonical`, `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`.
- Canales de contacto y balanceo: integración de los canales oficiales (Geraldine `+57 318 639 7212`, Sonia `+57 320 449 8881`, Línea Corporativa `+57 304 401 3761`) y correos autorizados.

**Ask First:**
- Alterar la información legal de ASOEXI S.A.S. (NIT 900480460-8, dirección o correos).
- Modificar los pilares de la política logística o tiempos de despacho garantizados.

**Never:**
- No omitir la política de despacho a domicilio sin mostrador en la página institucional.
- No utilizar URLs relativas para `og:image` u `og:url` (deben ser absolutas con protocolo `https://asoexi.com`).
- No introducir JavaScript cliente innecesario para el contenido estático de `/nosotros` (0 KB JS adicional).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Acceso a `/nosotros` | Navegación a la URL `/nosotros` | Renderiza página institucional con H1 corporativo, historia, misión/visión, protocolos operativos, clientes corporativos y CTA de cotización. | Página estática SSG siempre disponible (código 200). |
| Enlace activo en navegación | Viewport desktop o móvil en `/nosotros` | Enlace "Nosotros" en el menú Header aparece con estilo activo (`text-primary border-b-2`). | Resuelto por prop `currentPath="/nosotros"`. |
| Compartir enlace en WhatsApp/Redes (Home) | URL `https://asoexi.com/` | Etiquetas Open Graph y Twitter Cards muestran título institucional, descripción de insumos mayoristas e imagen corporativa absoluta. | Si no se pasa imagen específica, fallback automático a `https://asoexi.com/og-image.jpg`. |
| Compartir enlace en WhatsApp/Redes (Nosotros) | URL `https://asoexi.com/nosotros` | Open Graph con `og:title="Nosotros | ASOEXI S.A.S."`, descripción de trayectoria/seguridad y `og:url="https://asoexi.com/nosotros"`. | Fallback a valores por defecto institucionales si alguna propiedad no es provista. |
| Consulta de logística en `/nosotros` | Scroll a sección de protocolos logísticos | Destaca recuadro con alerta visual indicando sede administrativa centralizada y despacho 100% a obra/bodega sin venta presencial en mostrador. | N/A |
| Requerimiento de contacto desde `/nosotros` | Clic en botones de WhatsApp o teléfono en `/nosotros` | Dispara enlace directo wa.me balanceado (Geraldine/Sonia) o llamada `tel:` correspondiente. | Integración con interceptor global y `whatsapp.ts`. |

</frozen-after-approval>

## Code Map

- `src/lib/constants.ts` (L1-114) -- Incorporación de interfaces y constantes institucionales: `ABOUT_DATA` (misión, visión, historia, protocolos de entrega oportuna, protocolos de seguridad y salud en el trabajo SG-SST) y `SITE_METADATA` (URL base `https://asoexi.com`, imagen OG por defecto, nombre de sitio, locale).
- `src/lib/seo.ts` [NUEVO] -- Funciones puras de utilidades SEO: `resolveCanonicalUrl`, `buildPageMetadata` y `generateOpenGraphTags` para normalizar URLs absolutas y atributos Open Graph / Twitter Cards.
- `tests/unit/seo.test.ts` [NUEVO] -- Pruebas TDD unitarias para utilidades SEO: resolución canónica absoluta, formateo de metadatos Open Graph, Twitter Cards y fallbacks seguros.
- `tests/unit/nosotros-data.test.ts` [NUEVO] -- Pruebas unitarias para validar la integridad de `ABOUT_DATA`: textos requeridos de historia, misión, visión, protocolos SG-SST y advertencia de no mostrador.
- `public/og-image.jpg` [NUEVO] -- Imagen oficial de 1200x630 para visualización de tarjetas sociales y previsualizaciones en WhatsApp.
- `src/layouts/BaseLayout.astro` (L9-39) -- Actualización de `Props` (`image`, `type`, `canonicalUrl`) e inyección estandarizada de `<link rel="canonical">`, `<meta property="og:*">` y `<meta name="twitter:*">`.
- `src/pages/nosotros.astro` [NUEVO] -- Página estática SSG de Nosotros: Hero institucional, bloques de Misión/Visión, Protocolos Operativos y de Seguridad, reutilización de `ClientLogos.astro` y llamada a la acción comercial con los canales oficiales.
- `src/pages/index.astro` (L9-12) -- Especificación explícita de `currentPath="/"` y metadatos optimizados.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/seo.test.ts` -- Crear suite TDD de utilidades SEO validando resolución de URLs canónicas, generación de tags Open Graph y Twitter Cards.
- [x] `tests/unit/nosotros-data.test.ts` -- Crear suite TDD validando los datos institucionales de misión, visión, trayectoria y protocolos de seguridad.
- [x] `src/lib/seo.ts` -- Implementar funciones puras de utilidades SEO y Open Graph con manejo de fallbacks.
- [x] `src/lib/constants.ts` -- Definir constantes `SITE_METADATA` y `ABOUT_DATA` con contenido institucional oficial de ASOEXI.
- [x] `public/og-image.jpg` -- Crear asset de imagen Open Graph corporativo con logotipo y branding para previews sociales.
- [x] `src/layouts/BaseLayout.astro` -- Inyectar etiquetas canónicas y de Open Graph / Twitter Cards usando `src/lib/seo.ts`.
- [x] `src/pages/nosotros.astro` -- Construir la página institucional con historia, misión, visión, protocolos de seguridad, política de despacho sin mostrador y franja de clientes.
- [x] `src/pages/index.astro` -- Ajustar llamada a BaseLayout con props completas de SEO y canonical.

**Acceptance Criteria:**
- Given la suite `tests/unit/seo.test.ts` y `tests/unit/nosotros-data.test.ts`, When se ejecuta `npm test`, Then todas las pruebas pasan con 0 fallos.
- Given la compilación del proyecto con `npm run build`, When se genera la distribución estática, Then finaliza con código 0 y produce `/nosotros/index.html` sin errores.
- Given la página `/nosotros`, When se inspecciona el HTML generado, Then contiene las secciones de historia corporativa, misión, visión, protocolos operativos con aclaración obligatoria de despacho sin mostrador, y logotipos de clientes corporativos.
- Given cualquier página del sitio (`/` o `/nosotros`), When se inspeccionan las etiquetas `<head>`, Then se encuentran presentes `canonical`, `og:title`, `og:description`, `og:image` (URL absoluta), `og:url`, `og:site_name`, `twitter:card`, `twitter:title`, `twitter:description` y `twitter:image`.

## Spec Change Log

_None._

## Design Notes

- Estructura visual de `/nosotros`:
  - Hero Institucional: Encabezado con badge industrial `Trayectoria y Solvencia B2B`, H1 `Más de 7 Años Abasteciendo a la Industria y Grandes Superficies`, subtítulo enfocado en garantía directa de fábrica y cumplimiento de entregas.
  - Misión & Visión: Dos tarjetas simétricas con fondo blanco, borde industrial `border border-slate-200 rounded-industrial`, cabecera acentuada con Rojo ASOEXI y Secundario.
  - Protocolos Operativos & Logísticos: Contenedor con fondo alterno `bg-surface-subtle` y banner informativo destacado sobre el modelo logístico a domicilio en obra/empresa (`Carrera 55 A No. 51 A 28 Sur, Bogotá`) aclarando enérgicamente: "Atención centralizada sin venta por mostrador ni entrega en bodega".
  - Protocolos de Seguridad y Salud en el Trabajo (SG-SST): Tarjetas de verificación con iconos técnicos (EPPs homologados, trazabilidad de lotes, fichas técnicas SDS y entrega segura en obra).
  - Prueba Social: Integración del componente `ClientLogos.astro` con filtro en escala de grises y transición interactiva.
- Tarjetas Open Graph:
  - Dimensión estándar: 1200 x 630 píxeles.
  - Atributos requeridos: `og:image:width="1200"` y `og:image:height="630"`.

## Verification

**Commands:**
- `npm test` -- expected: Vitest ejecuta todas las suites unitarias (`constants`, `home-data`, `whatsapp`, `seo`, `nosotros-data`) con 100% de éxito y exit code 0.
- `npm run build` -- expected: Astro compila el sitio completo generando estáticamente `/` y `/nosotros` con exit code 0.

**Manual checks (if no CLI):**
- Abrir `/nosotros` en navegador y verificar visualización del menú activo en el Header.
- Verificar presencia de etiquetas `<meta property="og:...">` en el código fuente de `/` y `/nosotros`.
- Comprobar accesibilidad y áreas táctiles ≥ 48px en los enlaces de contacto.

## Suggested Review Order

**Página Institucional Nosotros**

- Estructura principal, hero institucional y configuración de metadatos de la página.
  [`nosotros.astro:1`](../../src/pages/nosotros.astro#L1)

- Alerta visual y protocolos de entrega a domicilio sin venta en mostrador.
  [`nosotros.astro:205`](../../src/pages/nosotros.astro#L205)

- Cuadrícula de protocolos de seguridad y salud en el trabajo (SG-SST).
  [`nosotros.astro:247`](../../src/pages/nosotros.astro#L247)

**Utilidades SEO y Metadatos Open Graph**

- Normalización de URLs canónicas con saneamiento de parámetros y protocolo seguro.
  [`seo.ts:43`](../../src/lib/seo.ts#L43)

- Generación estructurada de etiquetas meta Open Graph y Twitter Cards.
  [`seo.ts:122`](../../src/lib/seo.ts#L122)

**Integración en Layout Base**

- Inyección dinámica de etiquetas canónicas, robots y metadatos sociales en el documento head.
  [`BaseLayout.astro:48`](../../src/layouts/BaseLayout.astro#L48)

**Contratos de Datos Institucionales**

- Estructura tipada y contenido oficial de historia, misión, logística y seguridad.
  [`constants.ts:257`](../../src/lib/constants.ts#L257)

**Pruebas Unitarias TDD**

- Suite exhaustiva de resolución SEO, fallbacks y etiquetas sociales.
  [`seo.test.ts:11`](../../tests/unit/seo.test.ts#L11)

- Verificación de invariantes legales, trayectoria y cláusula de no mostrador.
  [`nosotros-data.test.ts:9`](../../tests/unit/nosotros-data.test.ts#L9)

