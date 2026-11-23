# Epic 5 Context: Infraestructura SEO B2B, Esquemas Estructurados, Medición y Presencia Local

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Consolidar la visibilidad orgánica, local y en motores de búsqueda de IA (AEO) de ASOEXI S.A.S. en Bogotá, Sabana y Colombia, y habilitar la medición confiable del embudo comercial B2B. Esta épica entrega el `sitemap.xml` dinámico y `robots.txt`, el marcado estructurado Schema.org JSON-LD (`Organization`, `HardwareStore`, `WholesaleStore` y `BreadcrumbList`), la telemetría defensiva de conversiones en GA4/GTM atribuida a la línea corporativa única, la verificación en Google Search Console con optimización local en Barrio Venecia y Google Business Profile, y la infraestructura no intrusiva para medir futuras campañas geolocalizadas en Google Ads.

## Stories

- Story 5.1: Sitemap XML Dinámico & Optimización Semántica para Motores de Búsqueda e IA (AEO)
- Story 5.2: Marcado Estructurado Schema.org JSON-LD LocalBusiness (`HardwareStore`) y Jerarquía de BreadcrumbList
- Story 5.3: Telemetría de Conversión por Canal Corporativo y Auditoría de Prospectos Calificados
- Story 5.4: Verificación en Google Search Console, SEO On-Page Local (Bogotá / Venecia) y Google Business Profile
- Story 5.5: Infraestructura de Medición para Pauta y Conversiones Google Ads (SEM Geofenced)

## Requirements & Constraints

- **Invariantes Corporativos Obligatorios (NAP y Canales):** Todo marcado estructurado, telemetría y contenido local debe respetar estrictamente los datos oficiales vigentes:
  - Razón social: `ASOEXI S.A.S.` (nombre comercial `ASOEXI`), NIT `900480460-8`, dominio canónico `https://asoexi.com`.
  - Línea corporativa única por WhatsApp: `+57 301 419 1344` (`+573014191344`), sin líneas personales ni rotación entre asesoras y sin enlaces `tel:`.
  - Correo principal oficial: `serviciocliente@asoexi.com` (adicionales autorizados: `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`; nunca cuentas `@gmail.com`).
  - Sede administrativa y logística: `Carrera 55 A No. 51 A 28 Sur`, Barrio Venecia, Bogotá D.C., código postal `110611`, coordenadas `4.5899661`, `-74.1472122`. Modelo 100% despacho a domicilio (sin venta en mostrador ni retiro en bodega).
- **Indexación y Clúster Semántico B2B/AEO:**
  - Generar `sitemap.xml` dinámico en compilación con URLs canónicas absolutas sobre `https://asoexi.com` cubriendo Home, Nosotros, los 3 hubs de sector y los ~40 silos de marca con prioridades adecuadas, más `public/robots.txt` con acceso público y enlace directo al sitemap.
  - Reflejar en encabezados (`h1`/`h2`) y metadatos los clústeres de alta intención mayorista (mantenimiento industrial, conductores y breakers en Bogotá, distribuidor autorizado por marca en Colombia) y términos locales B2B de Bogotá y Barrio Venecia. Meta: 100% de silos indexados en Google Search Console en los primeros 45 días.
- **Datos Estructurados Schema.org JSON-LD:**
  - Inyectar en Home y páginas institucionales las entidades `Organization` y `@type: ["HardwareStore", "WholesaleStore"]` con `PostalAddress`, `GeoCoordinates`, canales oficiales, parámetros comerciales (`priceRange: "$$"`, `currenciesAccepted: "COP"`, `paymentAccepted: "Cash, Credit Card, Bank Transfer"`) y `areaServed` (Bogotá, Sabana de Bogotá, Colombia).
  - Inyectar `BreadcrumbList` piramidal (`Inicio > Sector > [Marca]`) en hubs de sector y silos de marca. Todo esquema debe validar al 100% en Rich Results Test y Schema Markup Validator sin errores críticos ni advertencias de campos requeridos.
- **Telemetría de Conversión y Calidad de Leads (GA4 / GTM):**
  - Disparar el evento `lead_whatsapp_click` en todo CTA de WhatsApp con parámetros `channel: 'corporate'`, `origin_page`, `brand_origin` y `sector_origin`, permitiendo segmentar volumen por sector y por marcas tractoras vs. secundarias para auditar tasa de conversión (objetivo ≥ 4.5%) y controlar consultas fuera de rango (< 10%).
- **Presencia Local, Search Console y Google Business Profile:**
  - Incluir meta-etiqueta de verificación de Google Search Console configurable por variable de entorno o constante.
  - Enlazar la ficha verificada de Google Business Profile desde Footer y Nosotros/Contacto con parámetros de atribución (`?utm_source=gbp&utm_medium=organic&utm_campaign=local`), manteniendo coherencia con la categoría de ferretería/proveedor industrial y cobertura en Bogotá y Sabana.
- **Medición para Pauta Local (Google Ads):**
  - Preparar inicialización condicional y asíncrona mediante `PUBLIC_GOOGLE_ADS_ID` y `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` para disparar el evento `conversion` (`send_to: AW-XXXXXXXXX/LABEL`) con contexto de origen, sector y marca ante clics de WhatsApp y envíos exitosos del formulario formal/crédito (`/api/quote`), lista para operar sin cambios de código al activar pauta.
- **Rendimiento y Resiliencia ante Bloqueadores:**
  - Mantener el presupuesto de rendimiento SSG en Cloudflare Pages: Core Web Vitals > 90 en móvil y > 98 en escritorio (Lighthouse > 95), TTFB < 200 ms, LCP < 1.5 s y CLS < 0.05.
  - Toda invocación a `gtag` o scripts analíticos/de pauta debe cargarse de forma asíncrona/diferida y envolverse en `try/catch` verificando `typeof window.gtag === 'function'`, garantizando que bloqueadores (AdBlock, uBlock, Brave Shields, Firefox Tracking Protection) fallen silenciosamente sin errores de consola y sin retrasar la apertura de WhatsApp (< 50 ms).

## Technical Decisions

- **Centralización SEO en `<SEOHead />`:** Todas las páginas consumen un único componente para URLs canónicas absolutas, meta-etiquetas (incluida verificación GSC) y bloques `<script type="application/ld+json">`, evitando duplicidad o esquemas divergentes.
- **Generación Estática en Build Time:** Tanto el sitemap XML como los esquemas JSON-LD se producen durante la compilación SSG de Astro (`output: 'static'` con funciones API bajo demanda en Cloudflare Pages), sin dependencias de base de datos ni carga de CPU en Edge para páginas públicas.
- **Módulo de Telemetría Desacoplado:** Encapsular el despacho de eventos GA4 y conversiones de Google Ads en un módulo puro de `src/lib/` que no acople scripts de terceros al render estático y degrade de forma segura cuando falten credenciales públicas o existan bloqueadores.
- **Aislamiento de Configuración Pública vs. Secretos:** Los identificadores de GSC, GA4/GTM y Google Ads se manejan como configuración pública (`PUBLIC_*` o constantes), manteniendo estrictamente aislados los secretos del runtime Edge (como `RESEND_API_KEY`).

## UX & Interaction Patterns

- **Claridad Operativa en Presencia Local:** Toda mención a la sede en Barrio Venecia (Footer, Nosotros y enlace a Google Business Profile) debe explicitar que opera como sede administrativa y despacho logístico a domicilio sin venta por mostrador ni retiro en bodega, evitando desplazos innecesarios de clientes.
- **Cero Fricción en Puntos de Conversión:** La medición de eventos sobre botones de WhatsApp y el flujo de `QuoteFormalModal` debe ser imperceptible y no bloqueante; la apertura del chat o la confirmación de envío nunca puede quedar condicionada a una respuesta de analítica o pauta.

## Cross-Story Dependencies

- **Dependencia con Épicas 1–4 (completadas):** Construye sobre `<SEOHead />`, Footer y Nosotros (Epic 1), los 3 hubs de sector (Epic 2), los ~40 silos de marca (Epic 3) y los flujos de cotización por WhatsApp y `/api/quote` / `QuoteFormalModal` (Epic 4).
- **Story 5.1 → Story 5.4:** El sitemap XML dinámico y `robots.txt` habilitan el registro y monitoreo de indexación tras verificar la propiedad en Google Search Console.
- **Story 5.2 → Story 5.4:** Los datos de `HardwareStore`/`WholesaleStore` (dirección en Venecia, coordenadas, teléfono y horarios) deben coincidir exactamente con los textos visibles en Footer/Nosotros y la ficha de Google Business Profile.
- **Story 5.3 → Story 5.5:** La capa defensiva de telemetría GA4 (`lead_whatsapp_click`) define el punto de instrumentación sobre el que Story 5.5 añade el envío no bloqueante de conversiones a Google Ads, extendiéndolo también al envío exitoso de `/api/quote`.
