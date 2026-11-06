---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/prd.md
  - _bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/addendum.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-10-10.md
  - _bmad-output/planning-artifacts/architecture/architecture-asoexi-app-2026-09-07/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-asoexi-app-2026-09-07/container-diagram.md
  - _bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-mascota-floating-dock-2026-10-11/ux-design-spec.md
  - _bmad-output/implementation-artifacts/spec-mascota-animada-cotizacion.md
  - _bmad-output/implementation-artifacts/spec-cambio-numero-corporativo-asoexi.md
  - _bmad-output/implementation-artifacts/spec-ajuste-canales-contacto-whatsapp-email.md
---

# asoexi-app - Epic Breakdown

## Overview

Este documento proporciona el desglose integral de épicas e historias de usuario para **asoexi-app**, descomponiendo los requerimientos del PRD (actualizado con directrices gerenciales, propuesta de cambio de sprint y especificaciones técnicas de ajuste operativo), la Arquitectura de Islas (Astro 7 + Cloudflare Pages) y las especificaciones de diseño UX en historias implementables con criterios de aceptación estructurados (Given / When / Then).

> [!IMPORTANT]
> **Invariantes Operativos Entregados (Obligatorios para Todas las Épicas):**
> Los siguientes ajustes ya fueron construidos, probados y entregados en la Epic 1 y deben **mantenerse como invariantes estrictos** en todas las historias y componentes de las Épicas 2, 3, 4 y 5:
> 1. **Línea Corporativa Única (+57 301 419 1344):** No existen líneas personales ni rotación entre asesoras; todas las acciones de cotización y contacto canalizan exclusivamente a este número oficial.
> 2. **Canal Activo Exclusivo por WhatsApp:** Se retiraron temporalmente los enlaces de llamada telefónica (`tel:`) para evitar llamadas no atendidas; todos los accesos rápidos y CTAs de cotización abren WhatsApp.
> 3. **Correos Oficiales Autorizados:** El directorio contempla exclusivamente `serviciocliente@asoexi.com` (principal), `asesorventas1@asoexi.com` y `asesorventas3@asoexi.com`.
> 4. **Promesa de Servicio (SLA ≤ 5 min):** Todo punto de contacto y modal de cotización comunica el tiempo de respuesta garantizado en horario hábil (L-V 7:30-16:30, Sáb 8:00-12:00; fuera de horario, atención prioritaria a primera hora hábil).
> 5. **Widget y Mascota Técnica Singleton:** El widget flotante unificado y avatar de cotización respeta el principio Singleton y la jerarquía visual de WhatsApp; se oculta y suspende automáticamente ante modales o cajones activos (LiveSearchModal, QuoteDrawer) para prevenir solapamientos visuales.
> 6. **Política de Despacho:** Mínimo de $200.000 COP en Bogotá ($100k moto / $300k carro en Sabana) y modelo 100% a domicilio sin mostrador.

Siguiendo una estrategia de entrega continua e incremental, la **Epic 1** se encuentra completamente entregada y auditada en el **Sprint 1** (Historias 1.1 a 1.5 en estado `done`), consolidando la identidad corporativa, la línea oficial unificada (+57 301 419 1344), la promesa de servicio SLA ≤ 5 min, los pilares logísticos y el widget interactivo singleton con la mascota técnica. Las **Épicas 2 a 5** conservan su alcance estratégico para ser desglosadas en historias de usuario ejecutables en los sprints sucesivos.

## Requirements Inventory

### Functional Requirements

- **FR-1:** Visualización prioritaria de Logística y Transporte Rápido a Domicilio (entrega en Bogotá en 24-48h regular y 6h urgencias en obra, entrega Sabana ~48h, modelo 100% despacho a domicilio sin venta en mostrador ni retiro en bodega), 7+ años de experiencia abasteciendo grandes compañías, crédito comercial hasta 45 días para empresas con RUT, marcas 100% originales con certificados y facturación electrónica, montos mínimos desde $200.000 COP en Bogotá ($100.000 COP moto / $300.000 COP carro en Sabana), y promesa de atención a cotizaciones en máximo 5 minutos en horario hábil.
- **FR-2:** Vitrina Destacada de las Top 10 Marcas Tractoras agrupadas por sector en Home (Eléctrico: Panduit, Centelsa by Nexans, Sylvania; Ferretero: Supermastick PR, Stanley, DeWalt, Truper; Hidráulico/Químico: Pavco Wavin, Sika, Pintuco; visualización en SVG/WebP optimizado con navegación directa a su silo de marca).
- **FR-2b:** Sección de Clientes Corporativos y Prueba Social (franja institucional destacando empresas y centros comerciales abastecidos: Casalimpia, Centro Comercial Andino, Centro Comercial Unicentro, Winner Group, Multiplika, en Home y sección Nosotros).
- **FR-3:** Despliegue de Hubs de Sector (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`; despliegue completo de marcas por rubro, llamado a la acción para cotizar listas multimarca en una sola orden con jerarquía piramidal hacia silos de marca).
- **FR-4:** Contenido Semántico de Insumos para Mantenimiento y Abastecimiento Integral (texto técnico estructurado que responde a intenciones de búsqueda de mantenimiento industrial, correctivo y locativo; insignias de capacidad de suministro integral para cualquier referencia bajo pedido).
- **FR-5:** Landings Especializadas por Marca (Silos canónicos dedicados `/distribuidor-[marca]-colombia` para ~40 marcas; metadatos transaccionales, condiciones de crédito a 45 días, entrega 6h urgencias en tractoras vs confirmación con planta en secundarias, y facturación electrónica).
- **FR-6:** Orientación a Cotización, Vitrina de Portafolio por Marca y Acceso Completo a Fábrica (enfoque 100% orientado a solicitud de cotización formal; botón principal "Cotizar por WhatsApp productos de [Marca]"; renderizado condicional de ficha técnica PDF sin enlaces rotos 404; microcopy aclaratorio de que se suministra el portafolio completo de la marca aunque una referencia puntual no esté listada).
- **FR-7:** Canal Oficial de Contacto Directo Corporativo y WhatsApp Único (acceso centralizado a la Línea Corporativa oficial `+57 301 419 1344` exclusivamente por WhatsApp, retirando enlaces `tel:` de llamada telefónica no asistida para evitar llamadas desatendidas; promesa visible de SLA ≤ 5 minutos en modal, sticky bar y puntos de cotización).
- **FR-8:** Plantilla Estructurada con los Datos Indispensables para las Vendedoras (pre-carga automática de los 6 datos clave: Empresa/Razón Social, NIT, Teléfono, Ciudad/Dirección exacta de entrega, Referencias y cantidades, incluyendo insumos libres adicionales; degradación elegante para listas extensas >8 ítems con botón de copiado al portapapeles y microtexto informativo para adjuntar listas completas en Excel o PDF).
- **FR-9:** Directorio Corporativo, Correos y Canales Oficiales (enlace WhatsApp oficial `+57 301 419 1344`, correos autorizados `serviciocliente@asoexi.com` [principal], `asesorventas1@asoexi.com` y `asesorventas3@asoexi.com`, NIT 900480460-8, sede administrativa Carrera 55 A No. 51 A 28 Sur con aclaración explícita de no mostrador ni retiro en bodega, horarios comerciales y políticas de entrega).
- **FR-10:** Sitemap XML Dinámico & Clúster Semántico de Búsqueda (sitemap.xml dinámico con términos de alta intención de compra; URLs canónicas, metadatos y jerarquía semántica h1/h2 piramidal).
- **FR-11:** Marcado Estructurado Schema JSON-LD B2B (esquemas Organization, B2BSupplier, WholesaleStore, LocalBusiness con georreferenciación Bogotá/Sabana, BreadcrumbList y OfferCatalog).
- **FR-12:** Metadatos Open Graph y Previews Enriquecidas (tarjetas para WhatsApp, LinkedIn y redes con logotipo corporativo, titular formal y promesa de valor).
- **FR-13:** Telemetría de Conversión por Asesora y Marca (eventos lead_whatsapp_click con parámetros de canal corporativo, brand_origin, sector_origin en GA4/GTM para auditar volumen de cotizaciones).
- **FR-14:** Integración con Google Maps & Google Search Console (metadatos de verificación GSC y enlace a perfil Google Business Profile para la sede administrativa sin mostrador).

### NonFunctional Requirements

- **NFR-1:** Rendimiento Web (Arquitectura Astro 7 SSG sobre Cloudflare Pages CDN; TTFB < 200ms, LCP < 1.5s en 4G móvil; Core Web Vitals > 90 en móviles y > 98 en desktop).
- **NFR-2:** Optimización y Normalización de Recursos Gráficos (Logotipos oficiales en SVG/WebP; pipeline de normalización para logos de clientes y marcas: eliminación de artefactos, escala uniforme, contenedores con fondo neutro y filtro monocromo/escala de grises con transición a color en hover `grayscale hover:grayscale-0`, CLS < 0.05).
- **NFR-3:** Accesibilidad & Mobile First (Cumplimiento WCAG 2.1 / 2.2 AA; ratio de contraste validado en paleta corporativa, áreas de toque mínimas de 48x48px para todos los botones táctiles y enlaces).
- **NFR-4:** Seguridad y Privacidad (HTTPS estricto con TLS vigente; cabeceras HTTP de seguridad X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN; sanitización estricta de adjuntos en API Edge máx 5MB en memoria sin persistencia en disco).
- **NFR-5:** Disponibilidad (Uptime mensual del 99.9% garantizado en plataforma Edge serverless sin dependencias de base de datos activa para servir páginas públicas).

### Additional Requirements

- **ARCH-1:** Starter Template y Setup de Proyecto Astro 7 (Configuración base con @astrojs/cloudflare, @astrojs/preact, @tailwindcss/vite con Tailwind CSS v4, @nanostores/persistent, nanostores, resend, zod, typescript; estructura modular src/{assets, components, islands, content, layouts, pages, stores, lib, styles}).
- **ARCH-2:** Catálogo de Contenido Git-based con Esquema Zod y Densidad Semántica (Colecciones en src/content/products/, src/content/brands/, src/content/categories/ validadas con defineCollection y Zod en src/content.config.ts; exigencia de campos de densidad semántica mínima para silos de marca —familias, aplicación técnica y promesa logística— para prevenir penalizaciones de thin content por Google; referencias relacionales mediante reference()).
- **ARCH-3:** Gestión de Estado Compartido Nano Stores ($cartStore persistente en src/stores/cart.ts con soporte para ítems del catálogo e ítems de texto libre personalizados; mutadores addItem, removeItem, updateQuantity, addCustomItem, clearCart sincronizado con localStorage sin fallos de hidratación).
- **ARCH-4:** Endpoint Serverless Edge /api/quote para Solicitudes Formales y Crédito (Cloudflare Workers runtime en src/pages/api/quote.ts para procesar solicitudes multipart con validación Zod reactiva en cliente antes del envío —PDF estricto máx 5MB en memoria sin persistencia en disco, validación contra archivos corruptos/protegidos—, exigencia estricta de NIT empresarial y RUT para crédito o envío directo de requisiciones sin RUT para usuarios con restricciones de WhatsApp, y envío vía Resend REST API a serviciocliente@asoexi.com).
- **ARCH-5:** Generador Puro de Deep Links WhatsApp wa.me y Salvaguarda de Longitud (Función pura en src/lib/whatsapp.ts para estructurar el mensaje dinámico con datos fiscales, canal oficial unificado, productos cotizados y notas de insumos adicionales; manejo seguro de listas largas con umbral de 8 ítems o 1.200 caracteres activando copiado al portapapeles para evitar errores de URI too long en navegadores móviles).
- **ARCH-6:** Componente Centralizado SEOHead y Esquemas JSON-LD (src/components/seo/SEOHead.astro inyectando URLs canónicas absolutas vinculadas al dominio canónico de producción https://asoexi.com, OpenGraph, Twitter Cards y Schema.org estructurado incluyendo BreadcrumbList).
- **ARCH-7:** Configuración de Despliegue en Cloudflare Pages (Modo híbrido output: 'static' con funciones API bajo demanda, inyección segura de variables de entorno como RESEND_API_KEY en runtime edge).
- **ADR-1 (Técnico Epic 2):** Índice de búsqueda en tiempo real pre-compilado en build time (<35 KB) servido estáticamente en CDN y consumido bajo demanda por `LiveSearchModal` al hacer foco, evitando latencia y cuota de CPU de Workers.
- **ADR-2 (Técnico Epic 3):** Generación SSG de ~40 silos de marca mediante ruta dinámica única `src/pages/distribuidor-[brand]-colombia.astro` con `getStaticPaths()` alimentada por Content Collections (`src/content/brands/`) validadas con Zod.
- **ADR-3 (Técnico Epic 4):** Gestión de estado del `QuoteDrawer` centralizada en Nano Stores (`$cartStore` en `src/stores/cart.ts`) persistente en `localStorage`, compartiendo estado instantáneo entre islas sin rehidratación.
- **ADR-4 (Técnico Epic 4):** Procesamiento de solicitudes de crédito con RUT PDF directamente en memoria (`ArrayBuffer` ≤ 5MB) en Cloudflare Workers y despacho inmediato vía Resend REST API (Zero Data-at-Rest, sin buckets R2/S3 intermedios).
- **EDGE-1 (Casos Límite Buscador):** Sanitización defensiva de términos de búsqueda con `trim()` y escape de metacaracteres de Regex; estado sin coincidencias proactivo que transforma búsquedas vacías en un atajo para cotizar el insumo bajo pedido por WhatsApp.
- **EDGE-2 (Casos Límite Silos de Marca):** Renderizado condicional estricto de botones de catálogo PDF (cero botones rotos 404 ante `pdfCatalogUrl: null`) y fallback a badge tipográfico corporativo en marcas sin logotipo vectorial.
- **EDGE-3 (Casos Límite Cotización y Crédito):** Coerción estricta de cantidades en rango entero `[1, 99999]` (restaurando a 1 valores nulos o negativos); salvaguarda de URL wa.me que copia la requisición al portapapeles si supera 8 ítems o 1.200 caracteres; y validación dual de archivo RUT (cliente Preact y servidor Edge) restringido a PDF de máximo 5 MB.
- **EDGE-4 (Casos Límite Telemetría):** Ejecución defensiva desacoplada de eventos analíticos (`try/catch` con validación `typeof window.gtag === 'function'`), garantizando que bloqueadores de anuncios o scripts de analítica nunca impidan la apertura de WhatsApp ni la experiencia de usuario.
- **SEC-1 (Filtro Preventivo B2B en Silos SEO):** Metadatos y titulares transaccionales `<title>` y OpenGraph que declaran inequívocamente el carácter mayorista institucional, pedido mínimo desde $200.000 COP y crédito a 45 días, filtrando tráfico de menudeo antes del contacto.
- **SEC-2 (Microcopy Contractual en Solicitud de Crédito):** Microcopy explícito en el formulario formal indicando que la línea de crédito comercial a 45 días está sujeta a validación tributaria de RUT y estudio de riesgo financiero.
- **SEC-3 (Monitoreo de Calidad de Conversión):** Telemetría GA4 alineada a la contra-métrica CM-2 para auditar la proporción de prospectos mayoristas calificados vs consultas fuera de rango.

### UX Design Requirements

- **UX-DR1:** Tokens de Diseño Visual y Paleta Tailwind v4 (Rojo ASOEXI #E51A24, Primario Hover #C8101A, Secundario Antracita #1E2229, Superficie #FFFFFF, Superficie Alterna #F8FAFC, Acento Ámbar #F59E0B, Verde WhatsApp #25D366; tipografía Montserrat para titulares e Inter para textos y datos técnicos).
- **UX-DR2:** Layout Base y Header Institucional Responsive (Barra superior con acceso directo a WhatsApp Corporativo, barra principal blanca con logotipo vectorial SVG assets/logo.svg, menú de sectores, nosotros, marcas, enlace "¿Tienes un listado en Excel/PDF? Cotízalo aquí" y CTA de cotización).
- **UX-DR3:** Hero Banner con Cortes Angulares y Propuesta de Valor (Composición visual con diagonales a 45° inspiradas en el brochure institucional, destacando la logística rápida 24-48h / 6h urgencias como Pilar #1, despacho 100% a domicilio sin mostrador, marcas 100% originales, crédito a 45 días y mínimos desde $200k).
- **UX-DR4:** Grilla y Tratamiento Armonioso de Logos de Clientes Corporativos (Social Proof en Home y Nosotros: optimización y normalización previa de los logos de Casalimpia, Andino, Unicentro, Winner Group y Multiplika; contenedores uniformes con filtro `grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all`).
- **UX-DR5:** Componente Tarjeta de Marca (BrandCard) (Fondo blanco, borde sutil, logotipo centrado, pill de sector, elevación suave al hover, microcopy de portafolio integral y botón primario de cotización por WhatsApp).
- **UX-DR6:** Isla Preact Buscador en Tiempo Real (LiveSearchModal) (Debounce de 150ms con carga diferida on-demand de índice estático comprimido <40 KB para cero impacto en INP/LCP móvil; filtrado instantáneo por nombre o sector en /catalogo y modal de cabecera; estado sin coincidencias proactivo: "¿No encuentras lo que buscas en pantalla? Suministramos más de 40 fabricantes bajo pedido. Pregunta por este insumo en WhatsApp" con botón directo con el término pre-cargado).
- **UX-DR7:** Isla Preact Modal de Contacto y Cotización con SLA ≤ 5 min (Modal/Bottom-sheet táctil centrado en WhatsApp corporativo, botones táctiles ≥48px y microcopy de promesa de respuesta en menos de 5 min en horario hábil).
- **UX-DR8:** Isla Preact Cajón de Cotización Persistente (QuoteDrawer) (Gestión interactiva de ítems agregados, control de cantidades, validación de ticket sugerido $200k Bogotá / $100k-$300k Sabana, campo de texto libre "+ Agregar insumo o referencia adicional no listada en el catálogo", atajo para adjuntar listas de obra en Excel/PDF, salvaguarda de degradación para listas >8 ítems o >1.200 caracteres con copiado seguro al portapapeles, y bifurcación a WhatsApp o solicitud formal con RUT adjunto validado reactivamente).
- **UX-DR9:** Barra Inferior Fija en Móviles (Mobile Sticky Bar) (Barra persistente en pantallas < 768px con avatar de mascota técnica y botón destacado a ancho completo para cotización directa en WhatsApp).
- **UX-DR10:** Widget Flotante Unificado con Mascota Técnica Singleton y Sub-Badge de WhatsApp (Unidad interactiva de 88-96px con loop de video optimizado de la mascota saludando, sub-badge inferior derecho de WhatsApp en #25D366, tooltip contextual, apertura directa de chat y principio Singleton para suspenderse/ocultarse dinámicamente ante modales de búsqueda o cajones activos como LiveSearchModal y QuoteDrawer).
- **UX-DR11:** Footer Institucional con Microcopy Logístico (Datos legales de ASOEXI S.A.S., NIT 900480460-8, 3 correos oficiales autorizados con serviciocliente@asoexi.com como principal, asesorventas1@asoexi.com y asesorventas3@asoexi.com, horarios comerciales L-V 7:30-16:30, Sáb 8:00-12:00, y nota enfática de sede administrativa y despacho logístico sin mostrador ni retiro en bodega).
- **UX-DR12:** Accesibilidad WCAG 2.2 AA y Navegación Asistida (Contrastes cromáticos validados, alt text descriptivo en todos los logotipos de marcas y clientes, etiquetas aria-label en botones de contacto y contorno de foco accesible outline: 2px solid #E51A24).

### FR Coverage Map

- **FR-1:** Epic 1 - Visualización de Diferenciales, Credenciales de Confianza y Modelo Logístico a Domicilio (Story 1.2, Story 1.4, Story 1.5).
- **FR-2:** Epic 2 - Vitrina Destacada de las Top 10 Marcas Tractoras agrupadas por sector en Home.
- **FR-2b:** Epic 1 - Sección de Clientes Corporativos y Prueba Social con normalización visual en Home y Nosotros (Story 1.2, Story 1.4).
- **FR-3:** Epic 2 - Despliegue de Hubs de Sector (/sector-electrico, /sector-ferretero-construccion, /sector-hidraulico-pinturas) con arquitectura piramidal.
- **FR-4:** Epic 2 - Contenido Semántico de Insumos para Mantenimiento y Abastecimiento Integral bajo pedido.
- **FR-5:** Epic 3 - Landings Especializadas por Marca (~40 silos SEO canónicos con diferenciación logística entre tractoras y bajo pedido).
- **FR-6:** Epic 3 - Orientación a Cotización, Vitrina de Portafolio por Marca y Acceso Completo a Fábrica (descarga condicional de PDF).
- **FR-7:** Epic 1 - Canal Oficial de Contacto Directo Corporativo y WhatsApp Único (Story 1.3, Story 1.5).
- **FR-8:** Epic 4 - Plantilla Estructurada multi-ítem para WhatsApp con notas libres y degradación elegante para listas extensas.
- **FR-9:** Epic 1 - Directorio Corporativo, Correos oficiales y Políticas de despacho sin mostrador (Story 1.1, Story 1.4, Story 1.5).
- **FR-10:** Epic 5 - Sitemap XML Dinámico & Clúster Semántico de Búsqueda para mantenimiento y marcas.
- **FR-11:** Epic 5 - Marcado Estructurado Schema JSON-LD B2B (Organization, B2BSupplier, LocalBusiness y BreadcrumbList).
- **FR-12:** Epic 1 - Metadatos Open Graph y Previews Enriquecidas para compartir en WhatsApp y redes sociales (Story 1.4).
- **FR-13:** Epic 5 - Telemetría de Conversión por Canal Corporativo y Marca (eventos GA4/GTM para auditoría comercial).
- **FR-14:** Epic 5 - Integración con Google Maps & Google Search Console para la sede administrativa sin mostrador.

## Epic List

### Epic 1: Identidad Corporativa, Hero, Prueba Social y Canales de Contacto Directo (Completada - Sprint 1)
Los compradores corporativos, analistas de compras y residentes de obra pueden validar inmediatamente la trayectoria de ASOEXI (7+ años, crédito a 45 días, entregas en 24-48h y 6h urgencias, marcas 100% originales, sellos de facturación electrónica y clientes destacados como Casalimpia y Unicentro), comprender la política logística de despacho a domicilio sin mostrador, y contactar directamente a la línea corporativa oficial por WhatsApp (+57 301 419 1344) con respuesta garantizada en ≤ 5 minutos y avatar interactivo singleton de la mascota técnica.
- **FRs cubiertos:** FR-1, FR-2b, FR-7, FR-9, FR-12
- **Requisitos técnicos y UX asociados:** ARCH-1, ARCH-5, UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR7, UX-DR9, UX-DR10, UX-DR11, UX-DR12, NFR-2, NFR-3, NFR-4, NFR-5.

### Epic 2: Catálogo B2B por Sectores, Vitrina de Marcas Tractoras y Búsqueda Instantánea con "Fallo Cero"
Los analistas de compras y contratistas pueden explorar las marcas y referencias organizadas en los 3 sectores industriales (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`), acceder a la vitrina de las 10 marcas estrella tractoras en Home, filtrar instantáneamente cualquier insumo mediante un buscador en tiempo real (LiveSearchModal con debounce 150ms), y ante referencias no listadas en el índice estático, recibir una experiencia proactiva de "fallo cero" que convierte la búsqueda fallida en un botón directo para cotizar el insumo exacto por WhatsApp (+57 301 419 1344) con garantía de abastecimiento integral.
- **FRs cubiertos:** FR-2, FR-3, FR-4
- **Requisitos técnicos y UX asociados:** ARCH-2, UX-DR5, UX-DR6, NFR-1, NFR-2.

### Epic 3: Silos SEO de Marca, Vitrina de Portafolio y Descarga Condicional de Catálogos
Los compradores que buscan distribuidores autorizados en Google aterrizan en ~40 páginas dedicadas canónicas (`/distribuidor-[marca]-colombia`) optimizadas para captación orgánica, donde visualizan la vitrina de productos de la marca, cuentan con una promesa logística transparente y diferenciada (despacho regular 24-48h y 6h urgencias en Marcas Tractoras vs suministro bajo pedido a fábrica en Marcas Secundarias), acceden de forma condicional a fichas técnicas PDF sin enlaces rotos 404, y disponen del botón de cotización contextual directa hacia WhatsApp oficial.
- **FRs cubiertos:** FR-5, FR-6
- **Requisitos técnicos y UX asociados:** ARCH-2, ARCH-6, NFR-1, NFR-2.

### Epic 4: Generador de Requisiciones B2B Multimarca (Quote Drawer) y Solicitudes Formales de Crédito a 45 Días
Los compradores corporativos pueden consolidar listas de abastecimiento de múltiples marcas y sectores en un cajón interactivo persistente (QuoteDrawer con Nano Stores), combinando con igual jerarquía: (a) referencias del catálogo web, (b) insumos y notas libres agregados a mano por el comprador, y (c) atajo directo para adjuntar listas de obra preparadas en Excel o PDF. Además, verifican el ticket mínimo sugerido ($200.000 COP en Bogotá / $100k-$300k Sabana) y bifurcan su requerimiento: enviando la requisición estructurada a WhatsApp (+57 301 419 1344) con SLA ≤ 5 min o radicando una solicitud formal de crédito a 45 días con RUT adjunto a través del endpoint serverless Edge (`/api/quote`).
- **FRs cubiertos:** FR-8
- **Requisitos técnicos y UX asociados:** ARCH-3, ARCH-4, ARCH-5, UX-DR8, NFR-4.

### Epic 5: Infraestructura SEO B2B, Esquemas Estructurados, Medición y Presencia Local
La plataforma queda completamente optimizada e indexada en Google y motores de búsqueda de IA con sitemap.xml dinámico, esquemas estructurados Schema.org JSON-LD (Organization, B2BSupplier, LocalBusiness y BreadcrumbList), telemetría de eventos analíticos en GA4/GTM atribuidos al canal corporativo oficial para auditar el volumen y origen de cotizaciones por marca y sector, y vinculación oficial con Google Search Console y perfil de Google Maps para la sede administrativa sin mostrador.
- **FRs cubiertos:** FR-10, FR-11, FR-13, FR-14
- **Requisitos técnicos y UX asociados:** ARCH-6, ARCH-7, NFR-1, NFR-5.

---

## Epic 1: Identidad Corporativa, Hero, Prueba Social y Canales de Contacto Directo

*(Completada y entregada en Sprint 1)*

### Story 1.1: Setup Base de Astro 7, Tokens de Diseño Tailwind v4, Header y Footer Institucional

As a desarrollador y visitante de la web corporativa,  
I want inicializar el proyecto en Astro 7 con Tailwind CSS v4, directivas de diseño y componentes globales de Header y Footer,  
So that toda la plataforma cuente con una base visual coherente, datos de contacto oficiales accesibles a un toque y la política de sede administrativa clara.

**Acceptance Criteria:**

**Given** el repositorio base de `asoexi-app`,  
**When** se inicializa el proyecto con Astro 7, `@astrojs/preact`, `@tailwindcss/vite` y TypeScript,  
**Then** el entorno compila en modo estático limpio (`output: 'static'`) sin dependencias de base de datos activa.

**Given** la configuración de estilos globales (`src/styles/global.css`),  
**When** se declaran los tokens de diseño corporativos,  
**Then** están disponibles las clases para Rojo ASOEXI (`#E51A24`, hover `#C8101A`), Antracita (`#1E2229`), Blanco (`#FFFFFF`), Ámbar (`#F59E0B`), Verde WhatsApp (`#25D366`), y las familias tipográficas Montserrat (titulares) e Inter (cuerpo).

**Given** el componente Header institucional (`src/components/common/Header.astro`),  
**When** un usuario accede en móvil o escritorio,  
**Then** visualiza la barra superior oscura con enlaces directos para atención inmediata vía WhatsApp, el logotipo vectorial SVG oficial (`assets/logo.svg`), navegación a secciones clave y un botón visible *"Cotizar Insumos"*.

**Given** el componente Footer institucional (`src/components/common/Footer.astro`),  
**When** el usuario llega al pie de página,  
**Then** encuentra el NIT `900480460-8`, correos oficiales (`serviciocliente@asoexi.com` [principal], `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`), horarios comerciales (L-V 7:30-16:30, Sáb 8:00-12:00) y la nota expresa: *"Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)"*.

### Story 1.2: Hero Banner Institucional, Pilares de Confianza y Grilla Normalizada de Clientes Corporativos

As a comprador corporativo o residente de obra,  
I want visualizar en el Hero de la página de inicio los pilares de legitimidad de ASOEXI y las empresas que abastece,  
So that tenga la certeza inmediata de estar ante un proveedor mayorista formal, con crédito a 45 días, entrega en 6h urgencias y respaldo empresarial probado.

**Acceptance Criteria:**

**Given** la página de inicio (`src/pages/index.astro`),  
**When** el usuario ingresa desde Google o enlace directo,  
**Then** visualiza el Hero principal con corte angular decorativo a 45° y titular display en Montserrat destacando la trayectoria de más de 7 años abasteciendo grandes compañías en Colombia.

**Given** la sección de diferenciales en el Home,  
**When** se inspeccionan las tarjetas de valor,  
**Then** se exponen claramente los 5 pilares priorizados: (1) Entrega en Bogotá 24-48h regular y 6h urgencias en obra (Logística Rápida como Pilar #1 Insignia), (2) Logística 100% a domicilio sin venta en mostrador ni retiro en bodega, (3) Marcas 100% originales con certificados y facturación electrónica, (4) Crédito comercial hasta 45 días para empresas creadas, (5) Despachos desde $200.000 COP en Bogotá y fletes económicos en Sabana.

**Given** la franja de prueba social (Social Proof) en el Home,  
**When** el usuario hace scroll,  
**Then** visualiza una grilla o carrusel armonizado con los logos de Casalimpia, Centro Comercial Andino, Centro Comercial Unicentro, Winner Group y Multiplika, procesados en contenedores uniformes con filtro en escala de grises suave (`grayscale opacity-75`) y transición a color completo en hover (`hover:grayscale-0 hover:opacity-100 transition-all`).

### Story 1.3: Selector Interactivo de Canales de Contacto y Botón WhatsApp con SLA ≤ 5 Minutos

As a cliente listo para cotizar o consultar insumos,  
I want activar el selector de canales comerciales y acceder al canal oficial de WhatsApp corporativo con garantía de atención rápida,  
So that me atiendan en menos de 5 minutos directamente en la línea oficial.

**Acceptance Criteria:**

**Given** el botón flotante de WhatsApp (`FloatingWhatsAppButton.astro`), los botones en el Header o los CTAs de cotización en el Home,  
**When** el usuario hace clic o toque,  
**Then** se despliega el componente interactivo Preact `ContactChannelModal` (modal centrado en escritorio y bottom-sheet táctil en móvil con botones táctiles ≥48px).

**Given** el selector de canales,  
**When** se renderizan las opciones de atención,  
**Then** se presenta el canal oficial corporativo unificado con la promesa visible de SLA adaptativo: *"Respondemos tus cotizaciones en menos de 5 minutos (Lunes a Viernes 7:30 a 16:30, Sábados 8:00 a 12:00; fuera de horario hábil, atención prioritaria a primera hora hábil)"*.

**Given** el widget flotante de la mascota técnica y la `MobileStickyBar`,  
**When** se activa el `ContactChannelModal` o cualquier modal a pantalla completa,  
**Then** el widget flotante suspende su interacción y se oculta dinámicamente (`opacity: 0; pointer-events: none`) para evitar colisiones con los controles táctiles.

**Given** un dispositivo móvil (`< 768px`),  
**When** el usuario navega por la página,  
**Then** permanece fija en la parte inferior una barra de acción rápida (`MobileStickyBar`) con acceso directo a WhatsApp corporativo y avatar integrado de la mascota técnica.

**Given** la activación del canal de cotización,  
**When** se abre WhatsApp en móvil o web,  
**Then** se ejecuta la función pura `src/lib/whatsapp.ts`, pre-cargando el mensaje de saludo institucional: *"Hola ASOEXI, vi su página web y deseo solicitar una cotización formal"*.

### Story 1.4: Página Institucional "Nosotros", Protocolos Operativos y Metadatos Open Graph

As a analista de adquisiciones auditando proveedores,  
I want consultar la página institucional de Nosotros y compartir enlaces del sitio con vista previa formal,  
So that pueda validar la historia de ASOEXI, sus políticas de seguridad física/laboral y enviar la referencia a mi equipo por chat o correo corporativo.

**Acceptance Criteria:**

**Given** la ruta `/nosotros` (`src/pages/nosotros.astro`),  
**When** un visitante ingresa,  
**Then** visualiza la historia corporativa de ASOEXI S.A.S., su misión, visión, política de cumplimiento de entregas oportunas y protocolos de seguridad física y laboral.

**Given** la página Nosotros,  
**When** el usuario revisa la logística,  
**Then** se reitera explícitamente la dirección de la sede administrativa en Bogotá aclarando que la atención es exclusivamente para despachos en obra y empresa (sin venta por mostrador ni retiro en bodega).

**Given** cualquier URL pública de la plataforma,  
**When** un usuario copia y comparte el enlace en WhatsApp, LinkedIn, Slack o correo,  
**Then** las etiquetas Open Graph y Twitter Cards generan una tarjeta visual enriquecida con el logotipo corporativo oficial, titular institucional y descripción del portafolio mayorista B2B.

### Story 1.5: Unificación de Línea Corporativa, SLA ≤ 5 Minutos y Rebalanceo de Pilares Logísticos

As a decisor de compras o cliente que requiere cotizaciones ágiles,  
I want contactar directamente a la línea corporativa oficial por WhatsApp (+57 301 419 1344) con una garantía de respuesta de máximo 5 minutos, y visualizar la logística rápida como diferencial prioritario,  
So that obtenga atención comercial inmediata sin fugas a líneas personales y tenga plena certeza sobre los tiempos récord de entrega en obra y condiciones mínimas de despacho.

**Acceptance Criteria:**

**Given** el directorio corporativo de canales de contacto (`src/lib/constants.ts`),  
**When** se inspeccionan las líneas telefónicas oficiales,  
**Then** existe únicamente la Línea Corporativa (`+57 301 419 1344`) habilitada para WhatsApp directo (`hasWhatsApp: true`), eliminando números personales de asesoras comerciales y cualquier lógica de rotación 50/50.

**Given** el directorio de correos oficiales,  
**When** se revisan las direcciones de contacto,  
**Then** se incluyen las direcciones institucionales autorizadas (`serviciocliente@asoexi.com` como principal, `asesorventas1@asoexi.com` y `asesorventas3@asoexi.com`), eliminando cuentas personales o externas.

**Given** los componentes de contacto y cotización (`ContactChannelModal`, `FloatingWhatsAppButton`, `MobileStickyBar` y enlaces CTA de cotización),  
**When** el usuario visualiza o interactúa con ellos,  
**Then** se presenta de manera visible y destacada la promesa de servicio (SLA): *"Respondemos tus cotizaciones en menos de 5 minutos (L-V 7:30-16:30, Sáb 8:00-12:00; fuera de horario hábil, atención prioritaria a primera hora hábil)"*, orientando al usuario hacia el canal corporativo unificado.

**Given** la grilla de pilares de confianza (`src/components/home/ValuePillars.astro`),  
**When** el usuario examina las tarjetas de valor,  
**Then** se respeta la jerarquía priorizada: (1) Entregas 24-48h / 6h Urgencias (Logística y Transporte Rápido como Pilar #1 Insignia), (2) Logística 100% a Domicilio (sin mostrador), (3) Marcas 100% Originales con Certificados, (4) Crédito Comercial B2B hasta 45 Días, y (5) Mínimos desde $200.000 COP.

---

## Epic 2: Catálogo B2B por Sectores, Vitrina de Marcas Tractoras y Búsqueda Instantánea con "Fallo Cero"

Los analistas de compras y contratistas pueden explorar las marcas y referencias organizadas en los 3 sectores industriales (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`), acceder a la vitrina de las 10 marcas estrella tractoras en Home, filtrar instantáneamente cualquier insumo mediante un buscador en tiempo real (LiveSearchModal con debounce 150ms), y ante referencias no listadas en el índice estático, recibir una experiencia proactiva de "fallo cero" que convierte la búsqueda fallida en un botón directo para cotizar el insumo exacto por WhatsApp (+57 301 419 1344) con garantía de abastecimiento integral.

### Story 2.1: Colecciones Zod del Catálogo B2B y Componente Tarjeta de Marca (BrandCard)

As a desarrollador y comprador corporativo,  
I want definir el esquema de datos tipado para marcas y categorías en Astro Content Collections y disponer de un componente de tarjeta de marca (`BrandCard`),  
So that el catálogo se gestione de forma puramente declarativa y las marcas se desplieguen con logotipo normalizado, sector y botón de cotización directa por WhatsApp.

**Acceptance Criteria:**

**Given** el archivo de configuración de colecciones de Astro (`src/content.config.ts`),  
**When** se define la colección `brands` y `categories` con Zod,  
**Then** se validan estrictamente los campos obligatorios: `id`, `name`, `sector` (`electrico` | `ferretero-construccion` | `hidraulico-pinturas`), `isTractor` (boolean), `logo` (ruta o asset), `description`, `applicationNotes` y `pdfCatalogUrl` (opcional/nullable).

**Given** el componente presentacional `src/components/catalog/BrandCard.astro`,  
**When** se renderiza para cualquier marca autorizada,  
**Then** presenta contenedor con fondo blanco, logotipo centrado con normalización visual (`grayscale hover:grayscale-0 transition-all`), pill identificador del sector, microcopy de portafolio y botón primario *"Cotizar [Marca]"* que abre WhatsApp institucional (+57 301 419 1344).

**Given** una marca que no cuenta con archivo de logotipo vectorial en assets,  
**When** el componente `BrandCard` la procesa (EDGE-2),  
**Then** renderiza un badge tipográfico corporativo elegante en Montserrat sin generar iconos de imagen rota.

### Story 2.2: Vitrina Destacada de las Top 10 Marcas Tractoras en Home

As a comprador corporativo visitando la página principal,  
I want visualizar en una vitrina preferencial las 10 marcas estrella de mayor rotación agrupadas por sector,  
So that pueda acceder inmediatamente a los fabricantes líderes de mi industria y cotizar sus insumos sin fricción.

**Acceptance Criteria:**

**Given** la página de inicio (`src/pages/index.astro`),  
**When** el usuario hace scroll hacia la sección de marcas destacadas (`src/components/home/FeaturedBrands.astro`),  
**Then** visualiza las 10 marcas tractoras distribuidas en sus 3 sectores:  
*(1) Eléctrico: Panduit, Centelsa by Nexans, Sylvania.*  
*(2) Ferretero: Supermastick PR, Stanley, DeWalt, Truper.*  
*(3) Hidráulico/Químico: Pavco Wavin, Sika, Pintuco.*

**Given** cada tarjeta en la vitrina de Home,  
**When** el usuario hace clic en el nombre o logo de la marca,  
**Then** navega directamente a su silo SEO correspondiente (`/distribuidor-[marca]-colombia`).

**Given** la sección de marcas tractoras,  
**When** el usuario desea ver el catálogo completo,  
**Then** dispone de un enlace o botón CTA secundario hacia la exploración general del catálogo por sectores.

### Story 2.3: Hubs de los 3 Sectores Industriales y Contenido Semántico de Mantenimiento

As a analista de compras o jefe de mantenimiento industrial,  
I want navegar por páginas dedicadas a mi sector (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`) y encontrar contenido técnico de insumos,  
So that identifique rápidamente soluciones completas de mantenimiento correctivo y locativo y cotice listas multimarca en una sola orden.

**Acceptance Criteria:**

**Given** las rutas de sector en Astro (`src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro`, `src/pages/sector-hidraulico-pinturas.astro`),  
**When** un usuario o motor de búsqueda accede,  
**Then** se renderiza la grilla completa de marcas asociadas a ese sector, priorizando las marcas tractoras en la cabecera e indicando la disponibilidad bajo pedido para marcas secundarias.

**Given** cada página de sector,  
**When** se inspecciona el contenido semántico (FR-4),  
**Then** incluye encabezados técnicos optimizados (`h1`, `h2`) y textos descriptivos para intenciones de búsqueda B2B (cableado estructurado, breakers, tuberías de planta, impermeabilización y masillas).

**Given** cualquier página de sector,  
**When** el usuario visualiza el llamado a la acción principal,  
**Then** encuentra el CTA para *"Cotizar lista multimarca de este sector"* abriendo WhatsApp con el contexto del sector pre-cargado.

### Story 2.4: Isla Preact Buscador en Tiempo Real (LiveSearchModal) con Carga Diferida y "Fallo Cero"

As a comprador buscando un producto o marca específica,  
I want abrir el buscador en tiempo real, filtrar instantáneamente sin demoras y, si la referencia no está listada, recibir la opción de cotizarla de fábrica por WhatsApp,  
So that jamás llegue a un callejón sin salida y pueda solicitar cualquier insumo que requiera mi obra.

**Acceptance Criteria:**

**Given** el botón de búsqueda en el Header o navegación móvil,  
**When** el usuario interactúa o pulsa `/` o el icono de lupa,  
**Then** se abre la isla Preact `LiveSearchModal` (`src/islands/LiveSearchModal.tsx`) con foco automático en el input y bloqueo de scroll de fondo.

**Given** la apertura del modal de búsqueda,  
**When** se inicializa el componente,  
**Then** descarga de forma diferida (`client:idle` / on-demand) el índice estático pre-compilado `search-index.json` (peso < 35 KB, ADR-1), sin degradar las métricas de carga inicial de la página.

**Given** el usuario escribiendo en el buscador,  
**When** ingresa texto con metacaracteres o espacios vacíos (EDGE-1),  
**Then** el algoritmo sanitiza con `trim()`, aplica debounce de 150ms y filtra marcas, sectores e insumos clave con respuesta visual inmediata (< 30ms).

**Given** los resultados desplegados en el buscador,  
**When** el usuario identifica una marca o referencia de su interés,  
**Then** cada ítem ofrece navegación a su silo canónico y el botón de acción rápida *"+ Agregar a requisición"*, invocando `addItem` en `$cartStore` sin cerrar el buscador para armar cotizaciones multimarca con agilidad.

**Given** una búsqueda sin coincidencias en el índice (ej: *"taladro percutor hilti"*),  
**When** el filtro no arroja resultados,  
**Then** no muestra un mensaje vacío de error; despliega la tarjeta proactiva de "fallo cero": *"No encontramos esta referencia en el catálogo web, pero suministramos todo el portafolio de fábrica bajo pedido. Cotiza '[término_ingresado]' con un asesor técnico"* con botón a WhatsApp (+57 301 419 1344) pre-cargando dicho término y SLA ≤ 5 min.

**Given** el modal abierto,  
**When** el usuario presiona la tecla `Escape` o hace clic en el backdrop exterior o botón de cierre,  
**Then** el modal se cierra fluidamente devolviendo el foco accesible al elemento disparador.

**Given** el widget flotante unificado de la mascota técnica,  
**When** el modal `LiveSearchModal` se encuentra activo y visible en pantalla,  
**Then** el widget flotante se oculta dinámicamente (`opacity: 0; pointer-events: none`) evitando cualquier interferencia visual sobre la lista de resultados.

---

## Epic 3: Silos SEO de Marca, Vitrina de Portafolio y Descarga Condicional de Catálogos

Los compradores que buscan distribuidores autorizados en Google aterrizan en ~40 páginas dedicadas canónicas (`/distribuidor-[marca]-colombia`) optimizadas para captación orgánica B2B, donde visualizan la vitrina de portafolio de la marca, cuentan con una promesa logística transparente y diferenciada (despacho regular 24-48h y 6h urgencias en Marcas Tractoras vs suministro bajo pedido a fábrica en Marcas Secundarias), acceden de forma condicional a fichas técnicas PDF sin enlaces rotos 404, y disponen del botón de cotización contextual directa hacia WhatsApp oficial (+57 301 419 1344) con SLA ≤ 5 min.

### Story 3.1: Plantilla Dinámica Canónica SSG para Silos de Marca (`/distribuidor-[brand]-colombia`)

As a desarrollador y especialista en SEO B2B,  
I want implementar la plantilla de página dinámica SSG en Astro con `getStaticPaths()` consumiendo la colección `brands`,  
So that se generen automáticamente las ~40 landings canónicas con migas de pan, metadatos transaccionales y esquemas JSON-LD sin duplicidad de código.

**Acceptance Criteria:**

**Given** la ruta dinámica de Astro `src/pages/distribuidor-[brand]-colombia.astro`,  
**When** se ejecuta la compilación estática (`getStaticPaths()`),  
**Then** itera la colección `brands` y genera una página individual por cada marca registrada (`/distribuidor-panduit-colombia`, `/distribuidor-sika-colombia`, etc.) con tiempo de compilación óptimo.

**Given** cualquier landing de marca generada,  
**When** se inspecciona el encabezado HTML y las migas de pan,  
**Then** inyecta el componente `<SEOHead />` con URL canónica absoluta referenciada al dominio de producción (`https://asoexi.com/distribuidor-[brand]-colombia`), metadatos Open Graph transaccionales mayoristas (SEC-1) y BreadcrumbList semántico (`Inicio > Sector > [Marca]`).

**Given** la cabecera visual de la landing de marca,  
**When** el usuario ingresa,  
**Then** visualiza el H1 display: *"Distribuidor Autorizado [Nombre de Marca] en Colombia e Insumos Mayoristas"*, logotipo oficial normalizado, sello de facturación electrónica y botón de cotización contextual directa por WhatsApp corporativo.

### Story 3.2: Vitrina de Portafolio de Marca, Promesa Logística Diferenciada y Descarga Condicional de PDFs

As a comprador corporativo explorando una marca específica,  
I want conocer las familias de productos suministradas, la promesa logística exacta de entrega y acceder a la ficha técnica oficial en PDF si está disponible,  
So that tenga certeza sobre los tiempos de abastecimiento en obra y pueda solicitar cotización sin toparme con enlaces rotos.

**Acceptance Criteria:**

**Given** la landing de una Marca Tractora (Top 10, `isTractor: true`),  
**When** el usuario revisa la promesa logística en pantalla,  
**Then** se exhibe la insignia prioritaria: *"Entrega 24-48h regular en Bogotá y 6h urgencias en obra"* junto a sus credenciales de garantía y crédito a 45 días.

**Given** la landing de una Marca Secundaria o Complementaria (`isTractor: false`),  
**When** el usuario revisa la disponibilidad,  
**Then** se exhibe la insignia transparente: *"Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)"*, alineando expectativas y evitando reclamos comerciales.

**Given** una marca que dispone de catálogo oficial (`pdfCatalogUrl` con URL válida),  
**When** se renderiza la sección de recursos,  
**Then** se presenta el botón secundario *"Descargar Ficha Técnica / Catálogo PDF"* que abre el documento en pestaña nueva de forma accesible.

**Given** una marca que no cuenta con PDF oficial (`pdfCatalogUrl: null` o indefinido, EDGE-2),  
**When** se renderiza la página,  
**Then** el botón de descarga PDF se omite por completo del DOM (cero enlaces 404 rotos), destacando el botón primario *"Cotizar portafolio de [Marca] por WhatsApp"* y presentando la acción secundaria proactiva *"Solicitar catálogo técnico de fábrica por WhatsApp"* con mensaje pre-cargado para la marca consultada y SLA ≤ 5 min.

### Story 3.3: Semillero de Contenido Declarativo para las ~40 Marcas con Densidad Semántica Anti-Thin-Content

As a analista de contenidos y comprador corporativo,  
I want poblar los archivos declarativos en `src/content/brands/` para las ~40 marcas autorizadas con datos técnicos y familias de insumos,  
So that cada landing cuente con suficiente densidad semántica para posicionar en Google y responder a las consultas de mantenimiento de obra.

**Acceptance Criteria:**

**Given** el directorio `src/content/brands/`,  
**When** se incorporan las marcas comerciales distribuidas por ASOEXI en los 3 sectores (Panduit, Centelsa, Sylvania, Supermastick PR, Stanley, DeWalt, Truper, Pavco Wavin, Sika, Pintuco, Schneider, Siemens, Bosch, 3M, etc.),  
**Then** cada archivo YAML/Markdown cumple estrictamente el esquema Zod de `src/content.config.ts` (ARCH-2).

**Given** cada registro de marca,  
**When** se audita su contenido semántico para SEO (SEC-1, ARCH-2),  
**Then** contiene descripción técnica del fabricante, aplicaciones recomendadas en obra/industria, lista de familias de insumos representadas y notas de abastecimiento integral, superando las pruebas de calidad de contenido contra penalizaciones de Google ("Thin Content").

**Given** la ejecución de la suite de pruebas y compilación (`npm run build`),  
**When** se procesan todas las colecciones,  
**Then** el 100% de los silos de marca compilan limpiamente en modo estático sin errores de tipado Zod ni advertencias de enlaces rotos.

---

## Epic 4: Generador de Requisiciones B2B Multimarca (Quote Drawer) y Solicitudes Formales de Crédito a 45 Días

Los compradores corporativos pueden consolidar listas de abastecimiento de múltiples marcas y sectores en un cajón interactivo persistente (QuoteDrawer con Nano Stores), combinando con igual jerarquía: (a) referencias del catálogo web, (b) insumos y notas libres agregados a mano por el comprador, y (c) atajo directo para adjuntar listas de obra preparadas en Excel o PDF. Además, verifican el ticket mínimo sugerido ($200.000 COP en Bogotá / $100k-$300k Sabana) y bifurcan su requerimiento: enviando la requisición estructurada a WhatsApp (+57 301 419 1344) con SLA ≤ 5 min o radicando una solicitud formal de crédito a 45 días con RUT adjunto a través del endpoint serverless Edge (`/api/quote`).

### Story 4.1: Almacén Reactivo Persistente Nano Stores ($cartStore) para Requisición B2B

As a desarrollador y comprador corporativo,  
I want un almacén de estado reactivo y persistente en Nano Stores que soporte tanto ítems del catálogo como insumos libres escritos a mano,  
So that mi lista de obra no se pierda al navegar entre páginas estáticas o recargar el navegador.

**Acceptance Criteria:**

**Given** el módulo de estado `src/stores/cart.ts`,  
**When** se inicializa con `@nanostores/persistent`,  
**Then** expone `$cartStore` sincronizado automáticamente con `localStorage` bajo clave corporativa y soporte para tipos de ítems duales: `CatalogItem` (id, marca, nombre, sector) y `CustomItem` (texto libre descriptivo y cantidad).

**Given** las acciones puras exportadas (`addItem`, `removeItem`, `updateQuantity`, `addCustomItem`, `clearCart`),  
**When** se actualiza la cantidad de cualquier ítem (EDGE-3),  
**Then** aplica coerción reactiva estricta garantizando números enteros positivos dentro del rango `[1, 99999]`, restableciendo a 1 cualquier valor inválido o negativo.

**Given** múltiples pestañas abiertas en el navegador,  
**When** se agrega o elimina un ítem en una pestaña,  
**Then** el evento de storage actualiza instantáneamente el contador y contenido en todas las pestañas sin desfase ni errores de hidratación.

### Story 4.2: Isla Preact Cajón de Cotización Persistente (QuoteDrawer) y Badge Flotante

As a comprador corporativo armando una orden de compra,  
I want abrir el cajón interactivo de cotización, revisar mis ítems, agregar referencias adicionales que no estén en catálogo y ver el ticket mínimo sugerido,  
So that consolide todos los materiales de mi obra en un único requerimiento claro.

**Acceptance Criteria:**

**Given** el badge de cotización en el Header institucional o navegación móvil,  
**When** el usuario hace clic o toque,  
**Then** se despliega el panel lateral `QuoteDrawer` (`src/islands/QuoteDrawer.tsx`) con animación fluida, listado de materiales y botón de cierre accesible con tecla `Escape`, ocultando temporalmente el widget flotante de la mascota y la `MobileStickyBar` para evitar colisiones visuales.

**Given** el cajón de cotización abierto,  
**When** el usuario inspecciona las opciones de edición,  
**Then** dispone de controles para ajustar cantidades, eliminar ítems y el campo interactivo `+ Agregar insumo o nota libre` para referencias personalizadas fuera de catálogo.

**Given** la sección informativa del Drawer,  
**When** el usuario revisa las condiciones de despacho,  
**Then** visualiza el recordatorio de ticket mínimo sugerido ($200.000 COP en Bogotá / $100k-$300k Sabana) y el atajo contextual: *"¿Tienes listado completo en Excel o PDF? Puedes adjuntarlo directamente en WhatsApp tras abrir el chat"*.

**Given** la barra de acciones del Drawer,  
**When** el usuario decide cómo tramitar su orden,  
**Then** se presentan tres opciones claras: (1) Botón Primario *"Cotizar por WhatsApp (SLA ≤ 5 min en horario hábil)"*, (2) Botón Secundario *"¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com"* abriendo el modal reactivo unificado `QuoteFormalModal`, y (3) Enlace de acción especial *"Solicitar Crédito a 45 Días con RUT"* que abre `QuoteFormalModal` con la casilla de crédito pre-seleccionada.

### Story 4.3: Generador Seguro de Deep Links WhatsApp con Salvaguarda de Longitud

As a comprador cotizando por WhatsApp,  
I want que mi requisición se envíe formateada con todos los datos indispensables para las vendedoras sin riesgo de que el mensaje se corte por ser una lista extensa,  
So that me coticen ágilmente en menos de 5 minutos.

**Acceptance Criteria:**

**Given** la función generadora `src/lib/whatsapp.ts`,  
**When** se activa la cotización de la requisición hacia el número oficial `+57 301 419 1344`,  
**Then** estructura el mensaje con la plantilla de 6 datos clave: Razón Social, NIT, Teléfono, Dirección de entrega, Referencias con cantidades y Notas de insumos libres.

**Given** una lista extensa de materiales (más de 8 ítems o más de 1.200 caracteres, EDGE-3),  
**When** el usuario presiona *"Cotizar por WhatsApp"*,  
**Then** el sistema ejecuta de forma síncrona en el manejador del clic la copia de la lista al portapapeles del dispositivo (con fallback visual a modal con texto seleccionado si el navegador bloquea permisos), despliega un aviso visual confirmatorio (*"¡Lista de X materiales copiada al portapapeles! Pégala en el chat de WhatsApp"*), y abre WhatsApp con un mensaje introductorio seguro para evitar truncamiento por límites de URL en navegadores móviles.

**Given** una lista estándar (≤ 8 ítems y ≤ 1.200 caracteres),  
**When** se abre WhatsApp,  
**Then** el mensaje completo aparece pre-cargado directamente en el campo de texto listo para ser enviado con un solo toque.

### Story 4.4: Endpoint Serverless Edge /api/quote y Modal Unificado de Cotización Formal y Crédito (QuoteFormalModal)

As a analista de compras de una compañía formalmente constituida o usuario en red corporativa sin acceso a WhatsApp,  
I want enviar una requisición de insumos por correo o radicar una solicitud formal de crédito a 45 días adjuntando el RUT de mi empresa en PDF dentro de un único flujo intuitivo,  
So that el equipo comercial de ASOEXI reciba mi requerimiento y estudie nuestro cupo sin fricción ni duplicidad de pasos.

**Acceptance Criteria:**

**Given** el modal reactivo unificado `QuoteFormalModal` activado desde el `QuoteDrawer`,  
**When** el usuario diligencia sus datos (Razón Social, NIT, Correo corporativo, Ciudad/Dirección),  
**Then** puede tramitar la cotización estándar vía correo electrónico a `serviciocliente@asoexi.com`, o bien activar la casilla *"Solicitar línea de crédito a 45 días"*, la cual despliega el campo de adjunto donde el navegador valida reactivamente que el archivo sea estrictamente formato PDF no protegido con contraseña y ≤ 5 MB (EDGE-3).

**Given** la solicitud con crédito activado,  
**When** se inspecciona el microcopy contractual (SEC-2),  
**Then** exhibe la nota transparente: *"Línea de crédito comercial B2B sujeta a estudio de riesgo y verificación de RUT con antigüedad mínima de 1 año"*.

**Given** el endpoint API `src/pages/api/quote.ts` (Cloudflare Workers runtime),  
**When** recibe la solicitud multipart POST (con o sin archivo adjunto),  
**Then** valida el esquema con Zod, procesa el PDF en memoria como `ArrayBuffer` sin escritura en disco (Zero Data-at-Rest, ADR-4) si fue adjuntado, maneja timeouts defensivos y despacha el correo estructurado vía Resend REST API al correo principal `serviciocliente@asoexi.com`.

**Given** el envío exitoso de la requisición o solicitud de crédito,  
**When** la API responde HTTP 200,  
**Then** el modal muestra confirmación formal, vacía el cajón de cotización y notifica al cliente que recibirá respuesta a su correo institucional en horario hábil.

---

## Epic 5: Infraestructura SEO B2B, Esquemas Estructurados, Medición y Presencia Local

La plataforma queda completamente optimizada e indexada en Google y motores de búsqueda de IA con sitemap.xml dinámico, esquemas estructurados Schema.org JSON-LD (Organization, B2BSupplier, LocalBusiness y BreadcrumbList), telemetría de eventos analíticos en GA4/GTM atribuida a la línea corporativa oficial para auditar el volumen y origen de cotizaciones por marca y sector, y vinculación oficial con Google Search Console y perfil de Google Maps para la sede administrativa sin mostrador.

### Story 5.1: Sitemap XML Dinámico & Optimización Semántica para Motores de Búsqueda e IA (AEO)

As a especialista en SEO técnico y comprador corporativo,  
I want disponer de un sitemap XML dinámico y robots.txt optimizado que indexe todas las páginas, hubs de sector y silos de marca,  
So that Google y los motores de IA rastreen y comprendan inmediatamente la totalidad de nuestro catálogo mayorista.

**Acceptance Criteria:**

**Given** el proyecto Astro,  
**When** se ejecuta la compilación en producción,  
**Then** se genera el archivo `sitemap.xml` dinámico referenciando todas las URLs canónicas absolutas de `https://asoexi.com`, incluyendo Home, Nosotros, los 3 Hubs de Sector y las ~40 landings de marca con prioridades de rastreo adecuadas.

**Given** el archivo `public/robots.txt`,  
**When** los bots de Google o rastreadores de IA inspeccionan el sitio,  
**Then** encuentran directivas claras de acceso público y el enlace directo al `sitemap.xml`.

**Given** las páginas de aterrizaje,  
**When** se analizan las etiquetas `h1`, `h2` y metadatos,  
**Then** incorporan los clústeres semánticos de alta intención de compra ("distribuidor mayorista de insumos para mantenimiento", "breakers y conductores eléctricos bogota", "distribuidor autorizado [marca] colombia").

### Story 5.2: Marcado Estructurado Schema.org JSON-LD B2B y Jerarquía de BreadcrumbList

As a buscador o motor de IA procesando la web,  
I want leer datos estructurados en formato JSON-LD que identifiquen formalmente a ASOEXI como proveedor mayorista y reflejen la jerarquía del catálogo,  
So that se presenten resultados enriquecidos y precisos en las páginas de resultados de búsqueda.

**Acceptance Criteria:**

**Given** el componente central `<SEOHead />` (`src/components/seo/SEOHead.astro`),  
**When** se renderiza en cualquier página del sitio,  
**Then** inyecta el bloque `<script type="application/ld+json">` con las entidades `Organization`, `B2BSupplier` y `LocalBusiness` con los datos oficiales de ASOEXI S.A.S. (NIT 900480460-8, coordenadas de Bogotá y Sabana, y enlace a `serviciocliente@asoexi.com`).

**Given** cualquier página de sector o silo de marca,  
**When** se procesa la jerarquía de navegación,  
**Then** inyecta la entidad `BreadcrumbList` semántica mapeando la ruta piramidal (`Home > Sector > [Marca]`).

**Given** la validación en la herramienta Rich Results Test de Google,  
**When** se auditan los esquemas JSON-LD,  
**Then** pasan al 100% sin errores críticos de marcado ni advertencias de campos requeridos.

### Story 5.3: Telemetría de Conversión por Canal Corporativo y Auditoría de Prospectos Calificados

As a gerente comercial de ASOEXI,  
I want medir con precisión en Google Analytics 4 cada intención de cotización por marca y sector sin riesgo de que los bloqueadores de anuncios afecten la experiencia del usuario,  
So that pueda evaluar qué insumos generan mayor volumen de negocio y auditar la calidad de los prospectos.

**Acceptance Criteria:**

**Given** cualquier botón o enlace de cotización hacia WhatsApp (`+57 301 419 1344`),  
**When** el usuario hace clic o toque,  
**Then** se dispara el evento personalizado `lead_whatsapp_click` con parámetros: `channel: 'corporate'`, `origin_page`, `brand_origin` y `sector_origin`.

**Given** un usuario navegando con bloqueador de anuncios (AdBlock, uBlock, Brave Shields) que bloquea scripts analíticos (EDGE-4),  
**When** activa el botón de WhatsApp,  
**Then** la llamada analítica se ejecuta de forma defensiva con `try/catch`, garantizando que la apertura del chat de WhatsApp ocurra fluidamente en menos de 50ms sin errores de consola.

**Given** el panel de analítica en GA4,  
**When** se revisan las métricas de atribución (SEC-3, CM-2),  
**Then** se puede segmentar el volumen de clics por procedencia de sector y marcas tractoras vs secundarias para verificar la generación de leads mayoristas calificados.

### Story 5.4: Verificación en Google Search Console y Presencia Local en Google Maps

As a director de operaciones y comprador validando la empresa,  
I want verificar la propiedad en Google Search Console y disponer de enlace directo al perfil de Google Business Profile (Google Maps),  
So that se audite la indexación y los clientes confirmen la existencia física y legal de la sede administrativa en Bogotá.

**Acceptance Criteria:**

**Given** el componente `<SEOHead />`,  
**When** se despliega en producción,  
**Then** incluye la meta-etiqueta de verificación de propiedad de Google Search Console configurada mediante variable de entorno o constante del proyecto.

**Given** la sección de pie de página (`Footer.astro`) y página institucional `Nosotros`,  
**When** el usuario consulta los datos de contacto y ubicación física,  
**Then** encuentra el enlace directo hacia el perfil verificado en Google Business Profile / Google Maps para la sede administrativa (Carrera 55 A No. 51 A 28 Sur, Bogotá), reiterando la política de despacho a domicilio sin mostrador.

---
