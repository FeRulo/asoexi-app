---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/prd.md
  - _bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-asoexi-app-2026-09-07/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-asoexi-app-2026-09-07/container-diagram.md
  - _bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-asoexi-app-2026-09-07/EXPERIENCE.md
---

# asoexi-app - Epic Breakdown

## Overview

Este documento proporciona el desglose integral de épicas e historias de usuario para **asoexi-app**, descomponiendo los requerimientos del PRD (actualizado con datos oficiales y políticas logísticas), la Arquitectura de Islas (Astro 7 + Cloudflare Pages) y las especificaciones de diseño UX en historias implementables con criterios de aceptación estructurados (Given / When / Then).

Siguiendo una estrategia de entrega continua e incremental, la **Epic 1** se encuentra completamente detallada en historias de usuario listas para desarrollo inmediato en el **Sprint 1** (sitio base corporativo, Hero de credenciales, clientes corporativos y canales directos balanceados), mientras que las **Épicas 2 a 5** conservan su alcance y objetivos estratégicos aprobados para su posterior desarrollo iterativo.

## Requirements Inventory

### Functional Requirements

FR-1: Visualización de Diferenciales, Credenciales de Confianza y Modelo Logístico a Domicilio (7+ años abasteciendo grandes compañías, entrega en Bogotá en 24-48h y 6h urgencias, entrega Sabana ~48h, crédito comercial de hasta 45 días para empresas, marcas 100% originales con certificados y facturación electrónica, montos mínimos desde $50.000 COP en Bogotá y modelo operativo 100% logística a domicilio sin venta en mostrador ni retiro en bodega).
FR-2: Vitrina Destacada de las Top 10 Marcas Tractoras agrupadas por sector (Eléctrico: Panduit, Centelsa by Nexans, Sylvania; Ferretero: Supermastick PR, Stanley, DeWalt, Truper; Hidráulico/Químico: Pavco Wavin, Sika, Pintuco; visualización en SVG/WebP optimizado con navegación directa a su silo de marca).
FR-2b: Sección de Clientes Corporativos y Prueba Social (franja institucional destacando empresas y centros comerciales abastecidos: Casalimpia, Centro Comercial Andino, Centro Comercial Unicentro, Winner Group, Multiplika, en Home y sección Nosotros).
FR-3: Despliegue de Hubs de Sector (/sector-electrico, /sector-ferretero-construccion, /sector-hidraulico-pinturas; despliegue completo de marcas por rubro, llamado a la acción para cotizar listas multimarca en una sola orden con jerarquía piramidal hacia silos de marca).
FR-4: Contenido Semántico de Insumos para Mantenimiento y Abastecimiento Integral (texto técnico estructurado que responde a intenciones de búsqueda de mantenimiento industrial, correctivo y locativo; insignias de capacidad de suministro integral para cualquier referencia bajo pedido).
FR-5: Landings Especializadas por Marca (Silos canónicos dedicados /distribuidor-[marca]-colombia para ~40 marcas; metadatos transaccionales, condiciones de crédito a 45 días, entrega 6h urgencias en tractoras vs confirmación con planta en secundarias, y facturación electrónica).
FR-6: Orientación a Cotización, Vitrina de Portafolio por Marca y Acceso Completo a Fábrica (enfoque 100% orientado a solicitud de cotización formal; botón principal "Cotizar por WhatsApp productos de [Marca]"; renderizado condicional de ficha técnica PDF sin enlaces rotos 404; microcopy aclaratorio de que se suministra el portafolio completo de la marca aunque una referencia puntual no esté listada).
FR-7: Selector Interactivo de Canales de Contacto con Balanceo Inteligente (Modal / Bottom Sheet en móvil con las 3 líneas comerciales oficiales: Geraldine +57 318 639 7212, Sonia Franco +57 320 449 8881, Línea Corporativa +57 304 401 3761; botones táctiles mínimos de 48px y orden de visualización dinámico/balanceado por sesión para evitar saturación de una sola asesora).
FR-8: Plantilla Estructurada con los Datos Indispensables para las Vendedoras (pre-carga automática de los 6 datos clave: Empresa/Razón Social, NIT, Teléfono, Ciudad/Dirección exacta de entrega, Referencias y cantidades, incluyendo insumos libres adicionales; degradación elegante para listas extensas >8 ítems con botón de copiado al portapapeles y microtexto informativo para adjuntar listas completas en Excel o PDF).
FR-9: Directorio Corporativo, Teléfonos, Correos y Canales Oficiales (enlaces directos tel:+57..., correos asesorventas1@asoexi.com, asesorventas3@asoexi.com, servicioclienteasoexi@gmail.com, NIT 900480460-8, sede administrativa Carrera 55 A No. 51 A 28 Sur con aclaración explícita de no mostrador, horarios comerciales y políticas de entrega).
FR-10: Sitemap XML Dinámico & Clúster Semántico de Búsqueda (sitemap.xml dinámico con términos de alta intención de compra; URLs canónicas, metadatos y jerarquía semántica h1/h2 piramidal).
FR-11: Marcado Estructurado Schema JSON-LD B2B (esquemas Organization, B2BSupplier, WholesaleStore, LocalBusiness con georreferenciación Bogotá/Sabana, BreadcrumbList y OfferCatalog).
FR-12: Metadatos Open Graph y Previews Enriquecidas (tarjetas para WhatsApp, LinkedIn y redes con logotipo corporativo, titular formal y promesa de valor).
FR-13: Telemetría de Conversión por Asesora y Marca (eventos lead_whatsapp_click y lead_phone_click con parámetros advisor_name, brand_origin, sector_origin en GA4/GTM para auditar balance comercial).
FR-14: Integración con Google Maps & Google Search Console (metadatos de verificación GSC y enlace a perfil Google Business Profile para la sede administrativa sin mostrador).

### NonFunctional Requirements

NFR-1: Rendimiento Web (Arquitectura Astro 7 SSG sobre Cloudflare Pages CDN; TTFB < 200ms, LCP < 1.5s en 4G móvil; Core Web Vitals > 90 en móviles y > 98 en desktop).
NFR-2: Optimización y Normalización de Recursos Gráficos (Logotipos oficiales en SVG/WebP; pipeline de pre-procesamiento y armonización para logos de clientes y marcas en JPEG/PNG: eliminación de artefactos, normalización de escala y aspect-ratio, contenedores con fondo neutro y tratamiento visual armonioso con filtro monocromo/escala de grises con transición a color en hover `grayscale hover:grayscale-0` para evitar parches discordantes con la paleta de la página, CLS < 0.05).
NFR-3: Accesibilidad & Mobile First (Cumplimiento WCAG 2.1 / 2.2 AA; ratio de contraste validado en paleta Rojo/Grafito/Blanco, áreas de toque mínimas de 48x48px).
NFR-4: Seguridad y Privacidad (HTTPS estricto con TLS vigente; cabeceras HTTP de seguridad X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN; sanitización estricta de adjuntos en API Edge máx 5MB).
NFR-5: Disponibilidad (Uptime mensual del 99.9% garantizado en plataforma Edge serverless sin dependencias de base de datos activa para servir páginas públicas).

### Additional Requirements

ARCH-1: Starter Template y Setup de Proyecto Astro 7 (Configuración base con @astrojs/cloudflare, @astrojs/preact, @tailwindcss/vite con Tailwind CSS v4, @nanostores/persistent, nanostores, resend, zod, typescript; estructura modular src/{assets, components, islands, content, layouts, pages, stores, lib, styles}).
ARCH-2: Catálogo de Contenido Git-based con Esquema Zod (Colecciones en src/content/products/, src/content/brands/, src/content/categories/ validadas con defineCollection y Zod en src/content.config.ts; referencias relacionales mediante reference()).
ARCH-3: Gestión de Estado Compartido Nano Stores ($cartStore persistente en src/stores/cart.ts con soporte para ítems del catálogo e ítems de texto libre personalizados; mutadores addItem, removeItem, updateQuantity, addCustomItem, clearCart sincronizado con localStorage sin fallos de hidratación).
ARCH-4: Endpoint Serverless Edge /api/quote para Solicitudes Formales y Crédito (Cloudflare Workers runtime en src/pages/api/quote.ts para procesar solicitudes multipart con validación Zod, exigencia estricta de NIT empresarial y RUT adjunto en PDF máx 5MB en memoria, y envío vía Resend REST API a ventas@asoexi.com).
ARCH-5: Generador Puro de Deep Links WhatsApp wa.me (Función pura en src/lib/whatsapp.ts para estructurar el mensaje dinámico con datos fiscales, vendedora balanceada o seleccionada, productos cotizados y notas de insumos adicionales; manejo de listas largas con formateo para copiado al portapapeles).
ARCH-6: Componente Centralizado SEOHead y Esquemas JSON-LD (src/components/seo/SEOHead.astro inyectando URLs canónicas absolutas, OpenGraph, Twitter Cards y Schema.org estructurado incluyendo BreadcrumbList).
ARCH-7: Configuración de Despliegue en Cloudflare Pages (Modo híbrido output: 'static' con funciones API bajo demanda, inyección segura de variables de entorno como RESEND_API_KEY en runtime edge).

### UX Design Requirements

UX-DR1: Tokens de Diseño Visual y Paleta Tailwind v4 (Rojo ASOEXI #E51A24, Primario Hover #C8101A, Secundario Antracita #1E2229, Superficie #FFFFFF, Superficie Alterna #F8FAFC, Acento Ámbar #F59E0B, Verde WhatsApp #25D366; tipografía Montserrat para titulares e Inter para textos y datos técnicos).
UX-DR2: Layout Base y Header Institucional Responsive (Barra superior oscura con teléfonos rápidos directos, barra principal blanca con logotipo vectorial SVG assets/logo.svg, menú de sectores, nosotros, marcas, llamada a la acción "¿Tienes un listado en Excel/PDF? Cotízalo aquí" y CTA de cotización).
UX-DR3: Hero Banner con Cortes Angulares y Propuesta de Valor (Composición visual con diagonales a 45° inspiradas en el brochure institucional, destacando los 5 pilares de confianza, el modelo de entrega directa en obra y el rol de abastecedor integral multimarca).
UX-DR4: Grilla y Tratamiento Armonioso de Logos de Clientes Corporativos (Social Proof en Home y /nosotros: optimización y normalización previa de los logos de Casalimpia, Andino, Unicentro, Winner Group y Multiplika; contenedores con fondo uniforme o tarjetas estandarizadas con filtro en escala de grises atenuado `grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all` para integrarse con elegancia y sin parches discordantes con la paleta de la web).
UX-DR5: Componente Tarjeta de Marca (BrandCard) (Fondo blanco, borde sutil, logotipo centrado, pill de sector, elevación suave al hover, microcopy de portafolio integral y botón primario de cotización por WhatsApp).
UX-DR6: Isla Preact Buscador en Tiempo Real (LiveSearchModal) (Debounce de 150ms, filtrado instantáneo por nombre o sector en /catalogo y modal de cabecera; estado sin coincidencias proactivo: "¿No encuentras lo que buscas en pantalla? Suministramos más de 40 fabricantes bajo pedido. Pregunta por este insumo en WhatsApp" con botón directo con el término pre-cargado).
UX-DR7: Isla Preact Selector Interactivo de Canales Comerciales con Balanceo (Modal/Bottom-sheet móvil para selección entre Geraldine 3186397212, Sonia Franco 3204498881 y Línea Corporativa 3044013761, con áreas táctiles mínimas de 48px y orden rotativo/balanceado por sesión para equidad de carga comercial).
UX-DR8: Isla Preact Cajón de Cotización Persistente (QuoteDrawer) (Gestión interactiva de ítems agregados, control de cantidades, recordatorio de montos mínimos de despacho $50k Bogotá / $100k-$300k Sabana, campo de texto libre "+ Agregar insumo o referencia adicional no listada en el catálogo", atajo para adjuntar listas de obra en Excel/PDF, degradación para listas >8 ítems con copiado de lista, y bifurcación a WhatsApp o solicitud formal con RUT).
UX-DR9: Barra Inferior Fija en Móviles (Mobile Sticky Bar) (Barra persistente en pantallas < 768px con accesos rápidos a llamada directa tel: y chat de cotización wa.me).
UX-DR10: Botón Flotante Persistente de WhatsApp (Botón circular de 60px en #25D366 con tooltip descriptivo en escritorio y posicionamiento fijo inferior derecho).
UX-DR11: Footer Institucional con Microcopy Logístico (Datos legales de ASOEXI S.A.S., NIT 900480460-8, correos, horarios y nota enfática de sede administrativa y despacho logístico sin mostrador ni retiro en bodega).
UX-DR12: Accesibilidad WCAG 2.2 AA y Navegación Asistida (Contrastes cromáticos validados, alt text descriptivo en todos los logotipos de marcas y clientes, etiquetas aria-label en botones de contacto y contorno de foco accesible outline: 2px solid #E51A24).

### FR Coverage Map

FR-1: Epic 1 - Visualización de Diferenciales, Credenciales de Confianza y Modelo Logístico a Domicilio (Story 1.2, Story 1.4).
FR-2: Epic 2 - Vitrina Destacada de las Top 10 Marcas Tractoras agrupadas por sector en Home.
FR-2b: Epic 1 - Sección de Clientes Corporativos y Prueba Social con normalización visual en Home y Nosotros (Story 1.2, Story 1.4).
FR-3: Epic 2 - Despliegue de Hubs de Sector (/sector-electrico, /sector-ferretero-construccion, /sector-hidraulico-pinturas) con arquitectura piramidal.
FR-4: Epic 2 - Contenido Semántico de Insumos para Mantenimiento y Abastecimiento Integral bajo pedido.
FR-5: Epic 3 - Landings Especializadas por Marca (~40 silos SEO canónicos con diferenciación logística entre tractoras y bajo pedido).
FR-6: Epic 3 - Orientación a Cotización, Vitrina de Portafolio por Marca y Acceso Completo a Fábrica (descarga condicional de PDF).
FR-7: Epic 1 - Selector Interactivo de Canales de Contacto con balanceo inteligente entre asesoras (Story 1.3).
FR-8: Epic 4 - Plantilla Estructurada multi-ítem para WhatsApp con notas libres y degradación elegante para listas extensas.
FR-9: Epic 1 - Directorio Corporativo, Teléfonos tel:, Correos oficiales y Políticas de despacho sin mostrador (Story 1.1, Story 1.4).
FR-10: Epic 5 - Sitemap XML Dinámico & Clúster Semántico de Búsqueda para mantenimiento y marcas.
FR-11: Epic 5 - Marcado Estructurado Schema JSON-LD B2B (Organization, B2BSupplier, LocalBusiness y BreadcrumbList).
FR-12: Epic 1 - Metadatos Open Graph y Previews Enriquecidas para compartir en WhatsApp y redes sociales (Story 1.4).
FR-13: Epic 5 - Telemetría de Conversión por Asesora y Marca (eventos GA4/GTM para auditoría comercial).
FR-14: Epic 5 - Integración con Google Maps & Google Search Console para la sede administrativa sin mostrador.

## Epic List

### Epic 1: Identidad Corporativa, Hero, Prueba Social y Canales de Contacto Directo
Los compradores corporativos, analistas de compras y residentes de obra pueden validar inmediatamente la trayectoria de ASOEXI (7+ años, crédito a 45 días, entregas en 24-48h y 6h urgencias, marcas 100% originales, sellos de facturación electrónica y clientes destacados como Casalimpia y Unicentro), comprender la política logística de despacho a domicilio sin mostrador, y contactar a un solo toque por llamada o WhatsApp a Geraldine, Sonia Franco o Línea Corporativa mediante un selector con balanceo inteligente de carga comercial.
**FRs covered:** FR-1, FR-2b, FR-7, FR-9, FR-12
**Requisitos técnicos y UX asociados:** ARCH-1, ARCH-5, UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR7, UX-DR9, UX-DR10, UX-DR11, UX-DR12, NFR-2, NFR-3, NFR-4, NFR-5.

### Epic 2: Catálogo B2B por Sectores, Vitrina de Marcas Tractoras y Búsqueda Instantánea
Los analistas y decisores de compras pueden explorar el catálogo estructurado en los 3 sectores industriales (/sector-electrico, /sector-ferretero-construccion, /sector-hidraulico-pinturas), visualizar las 10 marcas estrella en la vitrina de Home, filtrar marcas en tiempo real mediante un buscador interactivo con debounce de 150ms, y ante cualquier término sin coincidencias recibir la opción proactiva de cotizar el insumo bajo pedido por WhatsApp, con la garantía de abastecimiento integral.
**FRs covered:** FR-2, FR-3, FR-4
**Requisitos técnicos y UX asociados:** ARCH-2, UX-DR5, UX-DR6, NFR-1, NFR-2.

### Epic 3: Silos SEO de Marca, Vitrina de Portafolio y Descarga Condicional de Catálogos
Los usuarios que buscan distribuidores autorizados en Google aterrizan en ~40 páginas dedicadas (/distribuidor-[marca]-colombia) optimizadas para SEO local, con referencias visuales de producto, promesa logística diferenciada (marcas tractoras con entrega 6h/24-48h vs marcas secundarias bajo pedido a fábrica), acceso condicional a fichas técnicas PDF sin enlaces rotos, y botón de cotización contextual hacia WhatsApp.
**FRs covered:** FR-5, FR-6
**Requisitos técnicos y UX asociados:** ARCH-2, ARCH-6, NFR-1, NFR-2.

### Epic 4: Motor de Cotización Multimarca (Quote Drawer) y Solicitudes Formales de Crédito a 45 Días
Los compradores corporativos pueden agregar múltiples insumos de diferentes marcas y sectores a un cajón reactivo persistente (Quote Drawer), incluir ítems y notas libres que no estén en la grilla, avisar si tienen una lista completa en Excel/PDF, verificar los montos mínimos de despacho ($50k Bogotá / $100k-$300k Sabana), y bifurcar su orden: despachando la lista formateada a WhatsApp (con copiado al portapapeles si supera 8 ítems) o enviando una solicitud formal a ventas@asoexi.com con validación estricta de RUT y NIT para crédito a 45 días a través del endpoint serverless Edge.
**FRs covered:** FR-8
**Requisitos técnicos y UX asociados:** ARCH-3, ARCH-4, ARCH-5, UX-DR8, NFR-4.

### Epic 5: Infraestructura SEO B2B, Esquemas Estructurados, Medición y Presencia Local
La plataforma queda posicionada e indexada en Google y motores de IA con sitemap XML dinámico, jerarquía piramidal de migas de pan y esquemas Schema.org JSON-LD (Organization, B2BSupplier, LocalBusiness y BreadcrumbList), telemetría de eventos analíticos en GA4/GTM para auditar el volumen de cotizaciones por asesora y marca, y vinculación oficial con Google Search Console y Google Business Profile para la sede administrativa.
**FRs covered:** FR-10, FR-11, FR-13, FR-14
**Requisitos técnicos y UX asociados:** ARCH-6, ARCH-7, NFR-1, NFR-5.

---

## Epic 1: Identidad Corporativa, Hero, Prueba Social y Canales de Contacto Directo

Los compradores corporativos, analistas de compras y residentes de obra pueden validar inmediatamente la trayectoria de ASOEXI (7+ años, crédito a 45 días, entregas en 24-48h y 6h urgencias, marcas 100% originales, sellos de facturación electrónica y clientes destacados como Casalimpia y Unicentro), comprender la política logística de despacho a domicilio sin mostrador, y contactar a un solo toque por llamada o WhatsApp a Geraldine, Sonia Franco o Línea Corporativa mediante un selector con balanceo inteligente de carga comercial.

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
**Then** visualiza la barra superior oscura con enlaces `tel:+57...` para llamada inmediata, el logotipo vectorial SVG oficial (`assets/logo.svg`), navegación a secciones clave y un botón visible *"Cotizar Insumos"*.

**Given** el componente Footer institucional (`src/components/common/Footer.astro`),  
**When** el usuario llega al pie de página,  
**Then** encuentra el NIT `900480460-8`, correos oficiales (`asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`, `servicioclienteasoexi@gmail.com`), horarios comerciales (L-V 7:30-16:30, Sáb 8:00-12:00) y la nota expresa: *"Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)"*.

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
**Then** se exponen claramente los 5 pilares: (1) Entrega en Bogotá 24-48h regular y 6h urgencias en obra, (2) Crédito comercial hasta 45 días para empresas creadas, (3) Marcas 100% originales con certificados y facturación electrónica, (4) Despachos desde $50.000 COP en Bogotá y fletes económicos en Sabana, (5) Modelo logístico 100% entrega a domicilio sin mostrador.

**Given** la franja de prueba social (Social Proof) en el Home,  
**When** el usuario hace scroll,  
**Then** visualiza una grilla o carrusel armonizado con los logos de Casalimpia, Centro Comercial Andino, Centro Comercial Unicentro, Winner Group y Multiplika, procesados en contenedores uniformes con filtro en escala de grises suave (`grayscale opacity-75`) y transición a color completo en hover (`hover:grayscale-0 hover:opacity-100 transition-all`).

### Story 1.3: Selector Interactivo de Canales de Contacto con Balanceo Inteligente y Botón WhatsApp

As a cliente listo para cotizar o consultar insumos,  
I want activar el selector de canales comerciales y ver las opciones de WhatsApp y teléfono directo con un reparto balanceado,  
So that me atiendan rápidamente sin saturación de una sola línea comercial.

**Acceptance Criteria:**

**Given** el botón flotante de WhatsApp (`FloatingWhatsAppButton.astro`), los botones en el Header o los CTAs de cotización en el Home,  
**When** el usuario hace clic o toque,  
**Then** se despliega el componente interactivo Preact `ContactChannelModal` (modal centrado en escritorio y bottom-sheet táctil en móvil con botones táctiles ≥48px).

**Given** el selector de canales,  
**When** se renderizan las opciones de atención,  
**Then** se presentan los 3 canales oficiales: (1) Geraldine `+57 318 639 7212`, (2) Sonia Franco `+57 320 449 8881` y (3) Línea Corporativa `+57 304 401 3761`.

**Given** múltiples sesiones de usuario,  
**When** se abre el selector,  
**Then** el orden superior entre Geraldine y Sonia rota de manera equitativa por sesión para balancear la carga de mensajes y evitar la saturación de una sola ejecutiva comercial.

**Given** un dispositivo móvil (`< 768px`),  
**When** el usuario navega por la página,  
**Then** permanece fija en la parte inferior una barra de acción rápida (`MobileStickyBar`) con accesos directos a llamada telefónica inmediata (`tel:`) y apertura del selector de WhatsApp.

**Given** la selección de una asesora,  
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
**Then** se reitera explícitamente la dirección de la sede administrativa en Bogotá aclarando que la atención es exclusivamente para despachos en obra y empresa (sin venta por mostrador).

**Given** cualquier URL pública de la plataforma,  
**When** un usuario copia y comparte el enlace en WhatsApp, LinkedIn, Slack o correo,  
**Then** las etiquetas Open Graph y Twitter Cards generan una tarjeta visual enriquecida con el logotipo corporativo oficial, titular institucional y descripción del portafolio mayorista B2B.

---

<!-- Epics 2 to 5 will be detailed in subsequent sprints -->
## Epic 2: Catálogo B2B por Sectores, Vitrina de Marcas Tractoras y Búsqueda Instantánea
*Objetivo:* Navegación sectorial estructurada (/sector-electrico, /sector-ferretero-construccion, /sector-hidraulico-pinturas), vitrina de las Top 10 marcas estrella y buscador instantáneo Preact con soporte para cotizar referencias especiales sin coincidencias bajo pedido. (Planificada para Sprint 2).

## Epic 3: Silos SEO de Marca, Vitrina de Portafolio y Descarga Condicional de Catálogos
*Objetivo:* ~40 páginas dedicadas (/distribuidor-[marca]-colombia) optimizadas para SEO orgánico, con diferenciación logística entre marcas tractoras y bajo pedido, y descarga condicional de PDF. (Planificada para Sprint 3).

## Epic 4: Motor de Cotización Multimarca (Quote Drawer) y Solicitudes Formales de Crédito a 45 Días
*Objetivo:* Cajón reactivo persistente Quote Drawer para requisiciones multimarca, ítems libres, aviso de archivos Excel/PDF y endpoint Edge Serverless /api/quote con validación estricta de RUT para crédito a 45 días. (Planificada para Sprint 4).

## Epic 5: Infraestructura SEO B2B, Esquemas Estructurados, Medición y Presencia Local
*Objetivo:* Sitemap XML dinámico, marcado Schema.org JSON-LD piramidal (BreadcrumbList, B2BSupplier, LocalBusiness), analítica de conversión por asesora y verificación en Google Search Console y Google Maps. (Planificada para Sprint 5).
