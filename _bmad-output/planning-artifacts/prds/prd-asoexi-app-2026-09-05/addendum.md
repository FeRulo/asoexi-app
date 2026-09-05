# Addendum: PRD ASOEXI S.A.S.

Este documento preserva decisiones técnicas, comparativas de arquitectura tecnológica, consideraciones comerciales de mercado y detalles operacionales de cara a las fases posteriores de arquitectura (`bmad-architecture`), diseño UX (`bmad-ux`) y desglose de historias de desarrollo.

---

## 1. Comparativa de Alternativas Tecnológicas Consideradas

| Opción Técnica Evaluada | Descripción | Pros | Contras | Veredicto / Razón de Descarte o Elección |
| :--- | :--- | :--- | :--- | :--- |
| **Plataformas SaaS Builder** *(GoDaddy, Wix, Squarespace)* | Creadores visuales con hosting cerrado de arrastrar y soltar. | Rápido despliegue inicial. | SEO técnico deficiente, código inflado, rendimiento móvil bajo y mensualidad vitalicia obligatoria. | ❌ **Descartada:** No cumple los estándares de SEO ni la agilidad requerida para un silo B2B de 40+ páginas. |
| **Plataformas E-commerce SaaS** *(Shopify)* | Sistema enfocado en tiendas virtuales con carrito de compras y pasarela de pago. | Gestión integrada de catálogo transaccional. | Cobro mensual en USD por funcionalidades de carrito transaccional que ASOEXI no utiliza (la dinámica B2B de la empresa es por cotización y negociación de volumen). | ❌ **Descartada:** Genera costos fijos injustificados y fricción en el modelo de cotización corporativa. |
| **CMS Auto-hospedado** *(WordPress + Elementor / WooCommerce)* | Sistema de gestión de contenidos tradicional con plugins SEO. | Administrable por personal no técnico, ecosistema amplio de plugins. | Vulnerabilidad de seguridad ante plugins desactualizados, rendimiento variable en Core Web Vitals, sobrecarga de base de datos. | ⚠️ **Alternativa Secundaria:** Descartada a favor de Jamstack/SSG por velocidad y simplicidad de mantenimiento. |
| **Página Autónoma / Desarrollo a la Medida** *(Next.js / SSG / Jamstack)* | Sitio web corporativo estático generado en compilación (Static Site Generation). | Máxima velocidad de carga (<1s), Core Web Vitals 95-100/100, cero costos recurrentes de plataforma, arquitectura limpia de silos SEO, seguridad total. | Requiere un esquema de actualización técnica o CMS headless si el cliente requiere editar textos autónomamente. | **✅ Elección Seleccionada:** Máximo rendimiento SEO y propiedad 100% de ASOEXI S.A.S. |

---

## 2. Marco Técnico y Mecanismos de Transporte (Downstream Architecture)

### 2.1 Enfoque de Generación de Páginas
- **Framework:** Next.js con Static Site Generation (SSG).
- **Rendimiento Objetivo:** Google Core Web Vitals con puntaje de 95 a 100 en Performance móvil y desktop.
- **Hosting & Despliegue:** Plataforma de borde (Vercel / Cloudflare Pages / AWS S3 + CloudFront) con costo de plataforma cero o marginal, sin dependencias de base de datos activa para servir páginas.

### 2.2 Especificación del Silo SEO y Schema
- **Generación Dinámica de Rutas:** Generación de rutas estáticas a partir de un archivo de datos estructurado (`brands.json` o equivalente) con ~40 landings por marca (ej. `/distribuidor-[marca]-colombia`).
- **Schema JSON-LD:** Marcado estructurado incrustado a nivel de layout y landings bajo esquemas `B2BSupplier`, `WholesaleStore` y `Organization`.
- **Sitemap XML Dinámico:** Regeneración automática del sitemap incluyendo URLs canónicas y fechas de última modificación.

### 2.3 Enrutamiento Contextual de WhatsApp y Canales de Contacto
- Formato de URL de WhatsApp: `https://wa.me/{numero}?text={mensaje_url_encoded}`
- Parámetros dinámicos:
  - Asesora de destino: Geraldine / Sonia Franco / Línea de Servicio Rotativa.
  - Marca visitada (ej. "Panduit", "Supermastick", "DeWalt").
  - Sector de origen (ej. "Eléctrico", "Ferretero e Hidráulico").
  - Parámetros de plantilla: Nombre de empresa, dirección de entrega, referencias y cantidades.

---

## 3. Consideraciones Comerciales y Alcance por Fases

### 3.1 Cronograma de Entregables Acordado
- **Mes 1 (Entregable 1 - Sitio Base Funcional en Vivo):** Plataforma base en Next.js, identidad visual corporativa, presentación institucional de 7+ años, integración de selector de canales (Geraldine, Sonia, Corporativo) y vitrina de Top 5 Marcas Tractoras.
- **Mes 2 (Entregable 2 - Catálogo y Silo de ~40 Marcas):** Despliegue de los 3 Hubs de Sector, ~40 páginas de marcas dedicadas, catálogos en PDF descargables y WhatsApp contextual con plantilla estructurada.
- **Mes 3 (Entregable 3 - SEO Técnico, Google Maps & Medición):** Alta y verificación en Google Search Console, optimización de perfil de empresa en Google Maps, marcado Schema e instrumentación de analítica de eventos para clics a WhatsApp y llamadas telefónicas desglosado por asesora.

### 3.2 Alcance Presupuestal
- El proyecto se cotizó bajo una modalidad de valor global fijo por el desarrollo integral de los 3 entregables, sin licenciamiento periódico ni comisiones sobre ventas.

---

## 4. Hallazgos Operativos Comerciales (Entrevistas de Ventas - Septiembre 2026)

### 4.1 Esquema de Operación de Canales y Asesoras
- **3 Canales Telefónicos y WhatsApp:** Las 3 líneas cuentan con capacidad y facultad plena para cotizar y atender solicitudes comerciales.
- **Distribución en Selector Web:** Asesora Geraldine, Asesora Sonia Franco y Línea Corporativa / Servicio al Cliente (rotativa cada 3 días entre las asesoras).

### 4.2 Logística y Políticas de Despacho
- **Bogotá Urbana:** Entrega estándar de 24 a 48 horas tras aprobación formal (Orden de Compra o confirmación por correo). Despacho exprés de urgencia en **6 horas** para emergencias en obra. Monto mínimo de despacho: **$50.000 COP** (IVA incluido).
- **Sabana de Bogotá y Alrededores:** Entrega en ~48 horas. Monto mínimo de despacho: **$100.000 COP** en moto y **$300.000 COP** en vehículo de carga (IVA incluido).
- **Despacho Nacional:** Envíos a nivel nacional coordinados con empresas transportadoras de carga.
- **Cotizaciones:** No se aplica ningún monto mínimo para emitir ofertas comerciales.

### 4.3 Diferenciales Competitivos Consolidados vs Grandes Superficies (Homecenter)
- Portafolio multilínea integral (eléctrico + hidráulico + ferretero) en una sola factura.
- Precios mayoristas más económicos que grandes superficies.
- Transporte y logística directa propia.
- Facilidades de crédito comercial de hasta 45 días para cuentas corporativas creadas.
- Facturación electrónica y marcas 100% originales garantizadas.

### 4.4 Top 10 Marcas Estrella / Tractoras
- **Eléctrico:** Panduit, Centelsa by Nexans, Sylvania.
- **Ferretero & Construcción:** Supermastick PR, Stanley, DeWalt, Truper.
- **Hidráulico & Químicos:** Pavco Wavin, Sika, Pintuco.
