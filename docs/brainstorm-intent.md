# Documento de Intención: Estrategia Web & Garantía SEO B2B — ASOEXI S.A.S.

**Fecha:** 21 de agosto de 2026  
**Proyecto:** Sitio Web Corporativo & Arquitectura SEO B2B  
**Estado:** Confirmado / Listo para PRD y UX  
**Origen:** Lluvia de ideas BMad ([`brainstorm.html`](file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/brainstorming/brainstorm-asoexi-seo-2026-08-21/brainstorm.html))  

---

## 1. Visión y Principios Invariantes

1. **Modelo de Conversión por Cotización B2B:**
   - Sin publicación de precios ni carrito de compras para resguardar la dinámica comercial y aumentar el porcentaje de cotizaciones de alto valor.
   - Botón flotante persistente de WhatsApp + opción de cotizador exprés con carga de archivos de pedido (PDF/Excel de obra).
2. **Propuesta de Valor Institucional:**
   - Foco en la credibilidad: *"7+ años abasteciendo a grandes compañías en Colombia"* con entrega oportuna y catálogo certificado.
3. **Canales de Atención Comercial Directa:**
   - Integración contextual de las 3 líneas telefónicas (2 comerciales directas + 1 línea corporativa general) y correos de atención rápida.

---

## 2. Arquitectura de Información & Estrategia SEO B2B

1. **Arquitectura Silo por Marca (~40 Landing Pages):**
   - Creación de sub-páginas dedicadas para cada marca representada (Panduit, DeWalt, Pavco, Schneider, Stanley, Argos, Bosch, Pintuco, 3M, etc.).
   - Objetivo: Capturar intenciones de búsqueda de alta conversión (*"distribuidor autorizado Panduit Colombia"*, *"tubería Pavco al por mayor"*).
2. **3 Hubs de Categoría Principales:**
   - Sector Eléctrico.
   - Sector Ferretero & Construcción.
   - Sector Hidráulico, Pinturas & Suministros.
3. **Estándar de Rendimiento Técnico:**
   - Desarrollo en **Next.js SSG** orientando a un score de 95-100 en Google PageSpeed.
   - Carga de páginas en menos de 1 segundo en dispositivos móviles y de escritorio.
4. **Indexabilidad & AI Search (AEO):**
   - Generación de **Sitemap XML Dinámico** para notificación automática a Googlebot.
   - Marcado de datos estructurados **Schema JSON-LD (`B2BSupplier` & `WholesaleStore`)** para posicionamiento en Google y citaciones en buscadores de IA (ChatGPT, Perplexity, Google AI Overviews).
5. **WhatsApp Contextual:**
   - Parametrización del chat de WhatsApp según la página de origen (ej. *"Hola ASOEXI, vi su catálogo de DeWalt y requiero cotizar insumos para una obra..."*).

---

## 3. Estructura de Entregables del Proyecto

* **Entregable 1: Infraestructura Base & SEO Técnico**
  - Desarrollo de plantilla Next.js SSG, paleta corporativa (Blanco, Negro, Rojo, Gris), Header/Hero institucional, integración de WhatsApp y 3 líneas telefónicas, metadatos base y Sitemap XML dinámico.
* **Entregable 2: Despliegue de Arquitectura Silo (~40 Marcas) & Hubs**
  - Maquetación de los 3 Hubs de Categoría y las ~40 Landing Pages por Marca con catálogos PDF descargables y mensajes de WhatsApp contextuales.
* **Entregable 3: Indexación, SEO Local, AI Search & Analítica**
  - Alta en Google Search Console, Schema JSON-LD B2BSupplier, optimización de Google Business Profile y configuración del tracking de cotizaciones por WhatsApp.

---

## 4. Destino de Handoff (BMad Workflow)

Este documento de intención sirve como entrada directa e inmutable para las siguientes etapas del flujo de trabajo BMad:
- **`bmad-prd`:** Para la elaboración del Product Requirement Document (PRD) detallado.
- **`bmad-ux`:** Para la definición del sistema de diseño y flujos de usuario (UX/UI).
