---
name: asoexi-app
description: Sistema de diseño y especificación visual para la plataforma web corporativa, catálogo multimarca B2B y motor de conversión de ASOEXI S.A.S.
status: final
sources:
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/prd.md
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/briefs/brief-asoexi-app-2026-08-21/brief.md
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/imports/brochure-portada.jpeg
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/imports/banner-solicita-cotizacion.jpeg
colors:
  primary: '#E51A24'
  primary-hover: '#C8101A'
  primary-foreground: '#FFFFFF'
  primary-subtle: '#FEE2E2'
  secondary: '#1E2229'
  secondary-hover: '#14171C'
  secondary-foreground: '#FFFFFF'
  surface: '#FFFFFF'
  surface-subtle: '#F8FAFC'
  surface-card: '#FFFFFF'
  surface-dark: '#16191F'
  text-primary: '#111827'
  text-secondary: '#4B5563'
  text-muted: '#6B7280'
  text-inverse: '#FFFFFF'
  border: '#E5E7EB'
  border-subtle: '#F3F4F6'
  border-strong: '#D1D5DB'
  whatsapp: '#25D366'
  whatsapp-hover: '#20BA5C'
  whatsapp-foreground: '#FFFFFF'
  accent-amber: '#F59E0B'
  accent-amber-subtle: '#FEF3C7'
  badge-electrico: '#DC2626'
  badge-ferretero: '#D97706'
  badge-hidraulico: '#2563EB'
typography:
  display:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '44px'
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: '-0.02em'
  h1:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '36px'
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.015em'
  h2:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '28px'
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: '-0.01em'
  h3:
    fontFamily: 'Montserrat, system-ui, sans-serif'
    fontSize: '20px'
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '1.5'
  body-medium:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: '500'
    lineHeight: '1.5'
  body-sm:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '1.45'
  caption:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: '0.04em'
rounded:
  none: '0px'
  sm: '4px'
  md: '8px'
  lg: '12px'
  xl: '16px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '8': '32px'
  '10': '40px'
  '12': '48px'
  '16': '64px'
  '20': '80px'
  '24': '96px'
components:
  button-primary:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    hover: '{colors.primary-hover}'
    radius: '{rounded.md}'
  button-whatsapp:
    background: '{colors.whatsapp}'
    foreground: '{colors.whatsapp-foreground}'
    hover: '{colors.whatsapp-hover}'
    radius: '{rounded.full}'
  brand-card:
    background: '{colors.surface-card}'
    border: '1px solid {colors.border}'
    radius: '{rounded.lg}'
    shadow: '0 1px 3px rgba(0,0,0,0.06)'
    hover-shadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
  sector-pill:
    radius: '{rounded.full}'
    padding: '4px 12px'
    typography: '{typography.caption}'
created: 2026-09-07
updated: 2026-09-07
---

# ASOEXI S.A.S. — Design Specification (DESIGN.md)

## Brand & Style

**ASOEXI S.A.S.** es un distribuidor mayorista y comercializador de insumos industriales, eléctricos, ferreteros e hidráulicos con más de 7 años abasteciendo a grandes compañías y proyectos en Colombia. 

La postura estética del producto refleja **solidez corporativa B2B, dinamismo logístico y máxima agilidad en la cotización**. A diferencia de un e-commerce minorista genérico, la interfaz transmite la precisión y la confianza de un aliado estratégico de suministros para contratistas, ferreterías y jefes de compras.

La identidad toma como punto de partida el brochure oficial y los recursos institucionales:
1. **Cortes Geométricos y Dinámicos:** Inspirados en los ángulos a 45° del brochure, los bloques de encabezado y las transiciones entre secciones emplean diagonales y acentos que evocan infraestructura, herramientas y arquitectura.
2. **Contraste de Alto Rendimiento:** Fondo blanco inmaculado en las áreas de catálogo para que los logotipos de marcas reconocidas destaquen con nitidez absoluta, combinado con superficies antracita oscuro (`#1E2229`) para transmitir autoridad institucional y rojo industrial (`#E51A24`) para detonar acciones comerciales inmediatas.
3. **Mascota Institucional (Asesor Técnico):** Empleada de manera estratégica en el banner y cards de cotización (*"Solicita tu cotización"* y badges de atención ágil) para humanizar el servicio y brindar calidez, reservando las fichas y tablas de marcas para una experiencia sobria y técnica.

## Colors

La paleta corporativa se estructura en torno al rojo y grafito del isotipo oficial de ASOEXI, con acentos funcionales dedicados a la conversión y la clasificación de sectores:

- **Rojo ASOEXI (`#E51A24`) [Primario]:** El color insignia de la marca. Se aplica en el isotipo de la letra "A" con flecha dinámica, en botones de llamado a la acción primarios (*"Solicitar Cotización"*, *"Ver Catálogo"*), bordes de enfoque y acentos tipográficos clave. Evoca energía, inmediatez y potencia industrial.
- **Gris Antracita / Grafito (`#1E2229`) [Secundario / Corporativo]:** Extraído de la banda institucional del NIT en el brochure. Se utiliza en el encabezado principal (navbar oscuro o con acento oscuro), pie de página, bloques de estadísticas institucionales y titulares h1/h2 cuando se busca un peso formal contundente.
- **Blanco Puro (`#FFFFFF`) [Superficie Base]:** Fondo principal de navegación y contenedor de las tarjetas de marca. Los logotipos de fabricantes (DeWalt, Pavco, Schneider, Siemens, etc.) requieren fondos neutros limpios para respetar sus manuales de identidad sin generar ruido cromático.
- **Gris Claro Neutro (`#F8FAFC` / `#F3F4F6`) [Superficie Alterna]:** Para alternar secciones informativas (e.g. sección Nosotros, franja de métricas, filtros de sector) y delimitar sutilmente los contenedores.
- **Verde WhatsApp (`#25D366`) [Conversión Rápida]:** Color funcional reservado en exclusiva para el canal de chat directo. Presente en el botón flotante persistente y en las acciones directas de cotización contextual por marca.
- **Ámbar / Amarillo Industrial (`#F59E0B`):** Acento inspirado en el casco de la mascota y en la señalética industrial. Se emplea en insignias de valor (*"7+ Años de Respaldo"*, *"Entrega Oportuna"*) y estados de advertencia.
- **Codificación por Sectores:**
  - **Sector Eléctrico:** Rojo técnico (`#DC2626`).
  - **Sector Ferretero & Construcción:** Ocre / Ámbar ferretero (`#D97706`).
  - **Sector Hidráulico, Pinturas & Suministros:** Azul industrial (`#2563EB`).

## Typography

La jerarquía tipográfica equilibra contundencia institucional con legibilidad técnica en pantallas móviles y de escritorio:

- **Titulares y Display (Montserrat):** Fuente geométrica de gran presencia industrial, con remates limpios y proporciones sólidas. Se utiliza en Display (Hero banner), H1 (nombres de página y Hubs), H2 (secciones y llamadas a la acción) y H3 (títulos de tarjetas de marca).
- **Cuerpo y Datos Técnicos (Inter):** Fuente neutra, altamente legible en pantallas de cualquier resolución, diseñada para densidades de lectura técnica, formularios, fichas técnicas y microcopy de botones.
- **Rampa Tipográfica:**
  - `Display`: 44px / bold (Hero)
  - `H1`: 36px / bold (Encabezados principales de páginas y Hubs)
  - `H2`: 28px / semibold (Títulos de bloques institucionales y secciones)
  - `H3`: 20px / semibold (Tarjetas de marcas y categorías)
  - `Body`: 16px / regular (Descripciones de servicio y catálogos)
  - `Body-sm`: 14px / regular (Fichas secundarias y metadatos)
  - `Caption`: 12px / uppercase / tracking amplio (Badges de sector y sellos técnicos)

## Layout & Spacing

Sistema basado en múltiplos de 4px / 8px:
- **Ancho Máximo de Contenedor:** `1280px` (`max-w-7xl`) con padding horizontal de `16px` en móvil, `24px` en tablet y `32px` en escritorio.
- **Grilla de Marcas (Grid Responsive):**
  - Móvil (`< 640px`): Grilla de 2 columnas para rápida exploración con scroll vertical contenido.
  - Tablet (`640px - 1023px`): 3 a 4 columnas.
  - Desktop (`≥ 1024px`): 4 a 6 columnas con espaciado uniforme de `24px` (`gap-6`).
- **Secciones:** Espaciado vertical estándar de `64px` (`py-16`) en móvil y `96px` (`py-24`) en escritorio para dar respiración al contenido.

## Elevation & Depth

La interfaz prioriza la nitidez y la carga ultrarrápida, utilizando elevación sutil para guiar la interacción:
- **Nivel 0 (Plano):** Superficies de fondo y contenedores base sin sombra.
- **Nivel 1 (Cards & Inputs):** Sombra suave `0 1px 3px rgba(0,0,0,0.06)`, borde fino de 1px (`#E5E7EB`).
- **Nivel 2 (Hover sobre Marcas / Cards activas):** `0 10px 15px -3px rgba(0,0,0,0.08)`, elevación visual con transición suave de 200ms que indica interactividad para cotizar.
- **Nivel 3 (Elementos Flotantes & Modales):** Sombra pronunciada `0 20px 25px -5px rgba(0,0,0,0.15)` aplicada al botón flotante de WhatsApp y a la barra de contacto rápido.

## Shapes

- **Contenedores y Tarjetas:** Esquinas redondeadas suaves de `8px` (`rounded-lg`) para mantener modernidad sin perder aspecto estructurado.
- **Pills y Badges:** Bordes completamente redondeados (`rounded-full`) para categorías, tags de sectores y el botón de WhatsApp.
- **Cortes Geométricos Angulares:** Franjas decorativas y divisores de sección con corte biselado/diagonal (clip-path o rotación leve) en headers oscuros y banners de cotización, replicando el patrón visual de la portada del brochure.

## Components

### 1. Header & Navegación Corporativa
- Barra superior institucional oscura (`#1E2229`) con teléfonos directos (`311...`, `312...`, `(601)...`) y enlace a WhatsApp.
- Menú principal blanco con logotipo oficial de ASOEXI a la izquierda, enlaces a los 3 Sectores (Eléctrico, Ferretero, Hidráulico), Nosotros, Marcas y botón primario *"Cotizar Insumos"*.

### 2. Tarjeta de Marca (Brand Card)
- Contenedor con fondo blanco (`#FFFFFF`), borde gris tenue (`#E5E7EB`) y radio de 8px.
- Logotipo de la marca centrado (formato SVG/WebP optimizado, fondo transparente o blanco).
- Etiqueta o pill del sector al que pertenece.
- Acciones rápidas al pasar el cursor o al tocar en móvil:
  - Botón secundario: *"Descargar Catálogo PDF"*.
  - Botón primario / WhatsApp: *"Cotizar [Marca]"*.

### 3. Banner Institucional de Cotización (con Asesor Técnico)
- Contenedor con fondo oscuro y corte angular rojo.
- A la izquierda/centro: Mascota institucional con casco ASOEXI y planilla.
- Titular: *"Solicita tu Cotización de Insumos Ferreteros e Industriales"*.
- Badge de confianza: *"Respuestas rápidas y precios competitivos"*.
- Botón de acción masiva a WhatsApp con mensaje pre-cargado.

### 4. Botón Flotante Persistente de WhatsApp
- Círculo de 60px en verde WhatsApp (`#25D366`), ícono oficial en blanco y sombra nivel 3.
- Tooltip hover en escritorio: *"¿Necesitas cotizar? Escríbenos ahora"*.
- Posicionado en la esquina inferior derecha con margen de 24px.

### 5. Footer Institucional
- Bloque oscuro en `#16191F` con los datos legales de ASOEXI S.A.S. (NIT 900480460-8).
- Resumen de líneas distribuidas, accesos directos, horarios de atención y créditos.

## Do's and Don'ts

### Do's
- **Hacer:** Mostrar siempre los logos de los fabricantes sobre fondos blancos limpios o neutros para garantizar que no se distorsionen los colores corporativos de cada marca asociada.
- **Hacer:** Incluir en cada botón de cotización el nombre exacto de la marca o sector de procedencia en el parámetro de WhatsApp (`?text=Hola ASOEXI, deseo cotizar...`).
- **Hacer:** Exponer de forma prominente los 7+ años de experiencia y la calidad garantizada en entregas en zonas visibles del encabezado y footer.
- **Hacer:** Mantener tiempos de carga inferiores a 1.5s mediante la optimización de todos los logos en SVG o WebP ligero.

### Don'ts
- **No hacer:** No publicar precios individuales de venta en el catálogo (ASOEXI maneja dinámica de cotización B2B por volumen y proyecto).
- **No hacer:** No usar carritos de compras transaccionales con pasarelas tipo Shopify que aumenten fricción al cliente corporativo.
- **No hacer:** No deformar o alterar la relación de aspecto de los logos de las marcas o del isotipo de ASOEXI.
- **No hacer:** No saturar la interfaz con elementos caricaturescos; la mascota se restringe a banners de cotización y estados de confianza comercial.
