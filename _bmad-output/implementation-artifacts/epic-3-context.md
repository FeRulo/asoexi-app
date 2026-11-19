# Epic 3 Context: Silos SEO de Marca, Vitrina de Portafolio y Descarga Condicional de Catálogos

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Generar landings canónicas dedicadas (`/distribuidor-[brand]-colombia`) para las ~40 marcas comercializadas por ASOEXI S.A.S. mediante generación estática SSG en Astro, optimizadas para posicionamiento orgánico en Google (captura de intención de búsqueda de distribuidores mayoristas autorizados). Cada landing expone la vitrina de portafolio de la marca, una promesa logística diferenciada (despacho 24-48h regular y 6h urgencias en Marcas Tractoras vs abastecimiento bajo pedido a fábrica en Marcas Secundarias), acceso condicional a fichas técnicas PDF (sin botones rotos 404 ante ausencia de catálogo) y llamado a la acción contextual directo a la línea corporativa de WhatsApp (+57 301 419 1344) con SLA ≤ 5 min.

## Stories

- Story 3.1: Plantilla Dinámica Canónica SSG para Silos de Marca (`/distribuidor-[brand]-colombia`)
- Story 3.2: Vitrina de Portafolio de Marca, Promesa Logística Diferenciada y Descarga Condicional de PDFs
- Story 3.3: Semillero de Contenido Declarativo para las ~40 Marcas con Densidad Semántica Anti-Thin-Content

## Requirements & Constraints

- **Ruta Dinámica Única SSG (ADR-2):** Archivo `src/pages/distribuidor-[brand]-colombia.astro` que implementa `getStaticPaths()` alimentado por la colección `brands` (`src/content/brands/`) validada con Zod.
- **Generación Canónica de Silos SEO (FR-5):** Rutas individuales limpias del tipo `/distribuidor-panduit-colombia`, `/distribuidor-sika-colombia`, etc., asociadas a su sector correspondiente (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`).
- **Metadatos y Marcado Estructurado (ARCH-6, SEC-1):** Inyección del componente `<SEOHead />` con:
  - Canonical URL absoluta referenciada al dominio oficial de producción (`https://asoexi.com/distribuidor-[brand]-colombia`).
  - Open Graph y Twitter Cards transaccionales mayoristas.
  - Esquema JSON-LD `BreadcrumbList` semántico (`Inicio > Sector > [Marca]`) y datos estructurados de proveedor B2B.
- **Encabezado y Elementos Visuales Institucionales:**
  - H1 display: *"Distribuidor Autorizado [Nombre de Marca] en Colombia e Insumos Mayoristas"*.
  - Logotipo oficial de la marca (con fallback a badge tipográfico corporativo en Montserrat si no existe imagen vectorial, EDGE-2).
  - Sello de facturación electrónica DIAN y crédito comercial a 45 días para empresas.
  - Botón de cotización contextual directa por WhatsApp corporativo (`+57 301 419 1344`) con SLA ≤ 5 min.
- **Promesa Logística Diferenciada (FR-5, FR-6):**
  - *Marcas Tractoras (`isTractor: true`):* "Entrega 24-48h regular en Bogotá y 6h urgencias en obra".
  - *Marcas Secundarias/Bajo Pedido (`isTractor: false`):* "Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)".
- **Descarga Condicional de Catálogo PDF (FR-6, EDGE-2):**
  - Si `pdfCatalogUrl` tiene URL válida: botón accesible secundario "Descargar Ficha Técnica / Catálogo PDF" abriendo en pestaña nueva con `target="_blank"` y `rel="noopener noreferrer"`.
  - Si `pdfCatalogUrl` es `null` o indefinido: omitir completamente el botón del DOM (cero enlaces 404). Mostrar acción proactiva "Solicitar catálogo técnico de fábrica por WhatsApp".
- **Tokens de Diseño y Geometría Angular:** Tailwind CSS v4, radio corporativo unificado `--radius-industrial` (`rounded-industrial`), paleta corporativa (Blanco, Negro, Rojo Corporativo, Gris Industrial), cumplimiento WCAG 2.2 AA (áreas táctiles ≥ 48px).

## Technical Decisions

- **Arquitectura de Islas Estáticas:** Plantilla 100% SSG con 0 KB JavaScript cliente para los silos de marca.
- **Colección de Marcas Zod:** Consumo de `getCollection('brands')` definida en `src/content.config.ts`.
- **Integración con Generador Puro de WhatsApp:** Uso de `buildWhatsAppUrl` (`src/lib/whatsapp.ts`) para parametrizar el mensaje pre-cargado de cotización por marca.

## UX & Interaction Patterns

- **Migas de Pan Accesibles (Breadcrumbs):** Jerarquía navegable `Inicio > Sector ([Nombre de Sector]) > [Nombre de Marca]`.
- **Acciones Claras de Conversión B2B:** CTA primario prominente para cotizar por WhatsApp la marca seleccionada; CTA secundario para descarga de catálogo (o solicitud de catálogo si no existe PDF).
- **Consistencia Visual con BrandCard:** La identidad gráfica de la marca en la cabecera respeta la normalización estética definida en Epic 2.

## Cross-Story Dependencies

- **Dependencia de Epic 2:** Utiliza la colección `brands` y el esquema Zod de marcas en `src/content.config.ts` creado en Story 2.1.
- **Secuencia en Epic 3:**
  - Story 3.1 establece la plantilla dinámica base `distribuidor-[brand]-colombia.astro`, SEOHead, breadcrumbs y cabecera.
  - Story 3.2 profundiza en la vitrina de familias de producto de la marca, insignias logísticas diferenciadas y botón condicional de PDF.
  - Story 3.3 completa y audita el semillero declarativo de las ~40 marcas en `src/content/brands/` para evitar penalizaciones por "Thin Content".
