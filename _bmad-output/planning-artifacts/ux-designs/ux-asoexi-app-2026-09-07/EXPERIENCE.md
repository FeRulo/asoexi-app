---
name: asoexi-app
status: final
sources:
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/prd.md
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/briefs/brief-asoexi-app-2026-08-21/brief.md
  - file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/DESIGN.md
created: 2026-09-07
updated: 2026-09-07
---

# ASOEXI S.A.S. — Experience Spine (EXPERIENCE.md)

## Foundation

Plataforma web responsiva y multisuperficie (Desktop / Tablet / Mobile-First), construida con arquitectura moderna (Astro 7 / Arquitectura de Islas SSG + Preact + Tailwind CSS v4) para optimización máxima de SEO local y posicionamiento orgánico en Colombia.

El sistema de diseño visual de referencia está especificado en [DESIGN.md](file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/DESIGN.md); este documento gobierna la arquitectura de información, interacciones, estados, comportamiento de conversión y accesibilidad.

El modelo de conversión prioritario no es la venta por carrito con pasarela de pago, sino el **enrutamiento de cotizaciones corporativas de alto volumen** hacia WhatsApp contextual, líneas telefónicas directas y correo corporativo.

## Information Architecture

| Superficie | URL / Ruta | Origen | Propósito y Contenido Principal |
| :--- | :--- | :--- | :--- |
| **Inicio (Home)** | `/` | Carga inicial del sitio | Propuesta de valor, métricas de credibilidad (7+ años, 40+ marcas), accesos directos a los 3 sectores, marcas destacadas, banner de cotización con asesor y datos de contacto. |
| **Catálogo General B2B** | `/catalogo` | Menú superior / Hero | Directorio completo multimarca con buscador en vivo y filtros rápidos por sector (Eléctrico, Ferretero, Hidráulico). |
| **Hub Sector Eléctrico** | `/sector/electrico` | Menú / Grid de Sectores | Silo temático con las marcas de iluminación, cableado y potencia (Schneider, Siemens, Centelsa, Panduit, etc.). |
| **Hub Sector Ferretero** | `/sector/ferretero` | Menú / Grid de Sectores | Silo temático con marcas de herramientas y construcción (DeWalt, Stanley, Bosch, Argos, Makita, etc.). |
| **Hub Sector Hidráulico** | `/sector/hidraulico` | Menú / Grid de Sectores | Silo temático con marcas de tubería, pinturas y grifería (Pavco Wavin, Corona, Pintuco, Sika, etc.). |
| **Landing por Marca (~40 URLs)** | `/marca/[slug]` | Búsqueda Google / Catálogo / Hub | Página dedicada optimizada para SEO (ej. `/marca/dewalt`, `/marca/pavco`). Exhibe logo oficial, reseña de productos suministrados por ASOEXI, botón de descarga de ficha técnica/catálogo en PDF y botón directo de cotización por WhatsApp con texto contextual. |
| **Nosotros (Institucional)** | `/nosotros` | Menú / Enlace Footer | Historia de la compañía, misión, visión, política de entregas oportunas y protocolos de seguridad física y laboral. |
| **Contacto & Cotización** | `/contacto` | Menú / Botones CTA | Visualización clara de los 3 teléfonos (2 directos de ejecutivos comerciales + 1 corporativo fijo/general), correos y formulario opcional de cotización formal. |

## Voice and Tone

El microcopy de la plataforma es directo, técnico, eficiente y orientado a resolver necesidades de suministro industrial con inmediatez:

| Situación | Usar (Do) | Evitar (Don't) |
| :--- | :--- | :--- |
| **Llamado a Cotizar** | *"Cotizar por WhatsApp con un Asesor"* | *"Comprar ahora"* / *"Añadir al carrito"* |
| **Disponibilidad de Precios** | *"Precios especiales por volumen y proyecto. Solicita tu cotización formal inmediata."* | *"Precios ocultos. Regístrate para ver tarifas."* |
| **Catálogos Técnicos** | *"Descargar Catálogo Oficial PDF (Ficha Técnica)"* | *"Descargar folleto publicitario"* |
| **Credibilidad Institucional** | *"Más de 7 años abasteciendo a grandes compañías en Colombia con entregas puntuales y seguras."* | *"Somos los mejores del mercado"* |
| **Respuesta Comercial** | *"Atención en tiempo real por ejecutivos comerciales dedicados."* | *"Te responderemos en 24 a 48 horas."* |

## Component Patterns

### 1. Enrutador Contextual de WhatsApp
- **Comportamiento:** Cada botón de WhatsApp lee los metadatos de la página en la que se encuentra el usuario.
- **Plantilla Dinámica:** 
  `https://wa.me/57XXXXXXXXXX?text=Hola%20ASOEXI,%20vi%20su%20cat%C3%A1logo%20de%20[Nombre_Marca_o_Sector]%20en%20la%20p%C3%A1gina%20web%20y%20deseo%20solicitar%20una%20cotizaci%C3%B3n%20formal.`
- En dispositivos móviles abre directamente la aplicación nativa de WhatsApp; en escritorio redirige fluidamente a WhatsApp Web.

### 2. Buscador y Filtro Instantáneo de Marcas
- **Ubicación:** En `/catalogo` y en el encabezado expandible.
- **Comportamiento:** Filtrado en tiempo real (debounce 150ms) por nombre de marca o por sector. Si el usuario escribe *"DeW"*, la grilla se actualiza al instante mostrando la tarjeta de DeWalt sin recargar la página.

### 3. Descarga de Catálogos PDF y Fallback (`[ASSUMPTION]`)
- **Comportamiento:** Al pulsar *"Descargar Catálogo PDF"*, el archivo se abre en una nueva pestaña optimizado para visualización o descarga.
- **Manejo de Excepción / Fallback:** Si una marca específica no cuenta con brochure digital actualizado proporcionado por el fabricante, el botón cambia dinámicamente a: *"Solicitar Ficha Técnica por WhatsApp"* con el mensaje pre-cargado: *"Hola ASOEXI, requiero la ficha técnica actualizada de [Marca]..."*. Nunca se muestra un botón inactivo ni un enlace roto 404.

### 4. Tarjetas de Acceso Telefónico Rápido
- Las 3 líneas telefónicas institucionales (las 2 líneas directas de atención comercial y la línea corporativa) cuentan con enlaces `tel:+57...` en móvil para llamada a un solo toque.

## State Patterns

| Estado | Superficie | Comportamiento en Interfaz |
| :--- | :--- | :--- |
| **Carga de Página (Loading)** | Catálogo / Páginas de Marca | Skeletons con pulsado suave en escala de grises `{colors.surface-subtle}` manteniendo la estructura exacta de las tarjetas de marca (CLS < 0.05). |
| **Búsqueda sin Coincidencias** | Catálogo B2B | Mensaje amigable: *"No encontramos marcas con el término '[búsqueda]'. Distribuimos más de 40 fabricantes líderes. Escríbenos a WhatsApp para cotizar la marca o insumo que requieres."* con botón CTA directo al chat. |
| **Error en Descarga de PDF** | Landing de Marca | Notificación toast en pantalla ofreciendo envío inmediato del PDF por WhatsApp o correo. |
| **Conexión Intermitente / Offline** | Global | Barra superior discreta en ámbar `{colors.accent-amber}`: *"Parece que perdiste conexión. Puedes comunicarte directamente a nuestras líneas telefónicas."* |

## Interaction Primitives

- **Mobile-First Touch Target:** Todos los elementos interactivos (botones de llamada, WhatsApp, filtros y enlaces) tienen una dimensión mínima táctil de `48px x 48px` para facilitar su uso con una sola mano por maestros de obra o encargados de compras en terreno.
- **Barra Inferior Flotante en Móvil (Mobile Sticky Action Bar):** En pantallas pequeñas (`< 768px`), permanece visible una barra inferior con dos accesos directos principales:
  1. Botón Llamar a Asesor (`tel:`)
  2. Botón Cotizar por WhatsApp (`wa.me`)
- **Navegación por Teclado:** Foco visible en `{colors.primary}` (`outline: 2px solid #E51A24; outline-offset: 2px`) para todos los elementos interactivos al tabular.
- **Navegación Rápida:** Atajo `Esc` cierra modales o menús desplegables inmediatamente.

## Accessibility Floor (WCAG 2.2 AA)

- **Contraste de Color:** El texto principal `{colors.text-primary}` (`#111827`) sobre fondo blanco supera el ratio de contraste 14:1 (exige 4.5:1). El texto blanco sobre rojo `{colors.primary}` (`#E51A24`) cumple con contraste AA para textos medianos y botones grandes.
- **Textos Alternativos (Alt Text) Obligatorios:** Cada logotipo de fabricante contiene la etiqueta explícita `alt="Logotipo oficial de [Nombre Marca] - Distribuidor ASOEXI S.A.S."`.
- **Estructura Semántica de Encabezados:** Exactamente un solo `<h1>` por cada landing page (optimizado para SEO B2B), seguido de una jerarquía lógica de `<h2>` y `<h3>`.
- **Accesibilidad para Lectores de Pantalla:** Enlaces de WhatsApp y teléfonos provistos de atributos `aria-label` claros (ej. `aria-label="Abrir conversación de WhatsApp para cotizar insumos de la marca DeWalt"`).

## Key Flows (Flujos Clave de Usuario)

### Flujo 1: Carlos (Director de Compras de Constructora en Obra)
- **Contexto:** Carlos se encuentra en la obra de un edificio y necesita cotizar con urgencia 150 metros de tubería y accesorios Pavco Wavin.
- **Paso 1:** Busca en Google desde su smartphone: *"distribuidores autorizados pavco colombia"* o *"cotizar tuberia pavco bogota"*.
- **Paso 2:** Hace clic en el resultado orgánico que lo lleva directamente a `/marca/pavco` de ASOEXI S.A.S.
- **Paso 3:** En la landing de Pavco, valida el logotipo oficial, la descripción de la línea hidráulica y hace clic en *"Descargar Catálogo PDF"* para confirmar la referencia exacta con el ingeniero residente.
- **Paso 4 (Clímax):** Presiona el botón flotante *"Cotizar Pavco por WhatsApp"*. Se abre su aplicación de WhatsApp con el mensaje pre-cargado: *"Hola ASOEXI, vi su catálogo de Pavco Wavin en la página web y deseo solicitar una cotización formal."*
- **Desenlace:** El asesor comercial de ASOEXI responde en menos de 5 minutos solicitando el desglose de cantidades y genera la cotización formal por volumen.

### Flujo 2: Andrea (Jefe de Suministros Industriales para Planta de Producción)
- **Contexto:** Andrea está auditando nuevos proveedores de ferretería y seguridad industrial para homologar suministros corporativos.
- **Paso 1:** Ingresa a `asoexi.com` desde su laptop en la oficina.
- **Paso 2:** Navega a la sección `/nosotros` y valida la trayectoria de más de 7 años, cumplimiento de protocolos de seguridad y política de entregas oportunas en planta.
- **Paso 3:** Ingresa a `/catalogo`, filtra por sector *"Eléctrico"* y *"Ferretero"*, validando que ASOEXI maneja simultáneamente Schneider Electric, Stanley, DeWalt, 3M y herramientas de protección.
- **Paso 4 (Clímax):** En el banner institucional con el asesor de cotización, copia las líneas directas de atención comercial y presiona *"Solicitar Cotización Corporativa"*, adjuntando su archivo de pliego de licitación.

## Responsive & Platform

| Dispositivo / Breakpoint | Adaptación de Experiencia |
| :--- | :--- |
| **Móvil (`< 768px`)** | Menú tipo hamburguesa con navegación simplificada por sectores. Grilla de marcas a 2 columnas. Barra inferior fija (Sticky Bar) con botones directos de Llamar y WhatsApp. |
| **Tablet (`768px - 1023px`)** | Grilla de marcas a 3-4 columnas. Barra superior de teléfonos visible. Buscador en catálogo con visualización de filtros en chips horizontales. |
| **Escritorio (`≥ 1024px`)** | Navegación completa desplegada en header. Grilla de marcas a 5-6 columnas con efectos hover de elevación y vista previa de acciones (PDF / WhatsApp). Banners institucionales con la mascota en disposición lateral completa. |
