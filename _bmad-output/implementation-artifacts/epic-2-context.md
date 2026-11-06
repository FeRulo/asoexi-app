# Epic 2 Context: Catálogo B2B por Sectores, Vitrina de Marcas Tractoras y Búsqueda Instantánea con "Fallo Cero"

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Permitir a compradores corporativos, contratistas y jefes de mantenimiento explorar el catálogo mayorista multimarca de ASOEXI estructurado en 3 sectores industriales (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`), acceder a la vitrina preferencial de las 10 marcas tractoras líderes en Home y buscar cualquier insumo en tiempo real mediante un modal interactivo de alto rendimiento. Además, transformar cualquier consulta sin resultados directos en una oportunidad de conversión inmediata mediante el mecanismo proactivo de "fallo cero" hacia la línea corporativa de WhatsApp (+57 301 419 1344) con respuesta garantizada en ≤ 5 minutos.

## Stories

- Story 2.1: Colecciones Zod del Catálogo B2B y Componente Tarjeta de Marca (BrandCard)
- Story 2.2: Vitrina Destacada de las Top 10 Marcas Tractoras en Home
- Story 2.3: Hubs de los 3 Sectores Industriales y Contenido Semántico de Mantenimiento
- Story 2.4: Isla Preact Buscador en Tiempo Real (LiveSearchModal) con Carga Diferida y "Fallo Cero"

## Requirements & Constraints

- **Gestión Declarativa Git-based:** El catálogo se gestiona sin bases de datos externas mediante Astro Content Collections (`src/content.config.ts`), con archivos de datos locales tipados para marcas (`src/content/brands/`) y sectores/categorías (`src/content/categories/`).
- **Esquema de Validación Zod:** Validación estricta de marcas con campos: `id`, `name`, `sector` (`'electrico' | 'ferretero-construccion' | 'hidraulico-pinturas'`), `isTractor` (boolean), `logo` (ruta o asset), `description`, `applicationNotes` y `pdfCatalogUrl` (opcional/nullable).
- **Las 10 Marcas Tractoras Insignia:**
  - *Sector Eléctrico:* Panduit, Centelsa by Nexans, Sylvania.
  - *Sector Ferretero y Construcción:* Supermastick PR, Stanley, DeWalt, Truper.
  - *Sector Hidráulico y Pinturas:* Pavco Wavin, Sika, Pintuco.
- **Normalización Visual de Marca:** Tarjetas con fondo blanco inmaculado, logotipo centrado con filtro monocromo en reposo y transición a color en hover (`grayscale hover:grayscale-0 transition-all`), pill identificador del sector, microcopy y botón de cotización directa.
- **Resiliencia ante Ausencia de Logotipo (EDGE-2):** Si una marca no dispone de archivo de imagen vectorial en assets, renderizar un badge tipográfico corporativo elegante en Montserrat sin generar iconos de imagen rota.
- **Invariantes Comerciales y de Contacto:**
  - Línea Corporativa Oficial unificada: `+57 301 419 1344` para todas las acciones de WhatsApp.
  - Promesa de servicio SLA ≤ 5 minutos en horario hábil (L-V 7:30-16:30, Sáb 8:00-12:00).
  - Despacho 100% a domicilio (Bogotá desde $200.000 COP, Sabana según municipio).
- **Buscador en Tiempo Real con Carga Diferida:** Isla Preact montada on-demand/`client:idle`, índice estático precompilado `search-index.json` (< 35 KB), debounce de 150ms, respuesta < 30ms y atajo de teclado `/`.
- **Estrategia "Fallo Cero":** Ante términos sin coincidencia, nunca mostrar un estado vacío frío; presentar tarjeta comercial proactiva que canaliza la cotización de fábrica del término ingresado vía WhatsApp.
- **Coordinación de Interfaz con Widget Flotante:** Al abrirse el modal de búsqueda, el widget flotante unificado de la mascota técnica debe ocultarse automáticamente (`opacity: 0; pointer-events: none`) para evitar solapamientos visuales.

## Technical Decisions

- **Arquitectura de Islas Estáticas:** `BrandCard.astro` y las páginas de sector son 100% estáticas (0 KB JS cliente). La interactividad de búsqueda reside aislada en `src/islands/LiveSearchModal.tsx`.
- **Tokens y Estilos:** Tailwind CSS v4, radio corporativo unificado `--radius-industrial` (clase `.rounded-industrial`), tipografía Montserrat para nombres de marcas y badges, e Inter para datos y botones.
- **Dirección de Enlaces:** Las tarjetas de marca enlazan a sus silos SEO canónicos (`/distribuidor-[marca]-colombia`) o activan cotización directa en WhatsApp con mensaje parametrizado.

## Cross-Story Dependencies

- **Story 2.1 es la base:** Define los esquemas Zod en `src/content.config.ts`, las colecciones de datos y el componente `BrandCard.astro`. Las Historias 2.2 (Home), 2.3 (Hubs de Sector) y 2.4 (LiveSearch) dependen directamente de las colecciones y componentes creados en la 2.1.
