# Análisis Técnico, Estrategia SEO y Cotización de Desarrollo - ASOEXI S.A.S.

**Fecha:** 21 de agosto de 2026  
**Elaborado y Presentado por:** Ing. Fernando Páez  
**Proyecto:** Sitio Web Corporativo, Catálogo B2B de Insumos & Presencia SEO  
**Cliente:** ASOEXI S.A.S.  
**Referencia del Brief:** [`_bmad-output/planning-artifacts/briefs/brief-asoexi-app-2026-08-21/brief.md`](file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/briefs/brief-asoexi-app-2026-08-21/brief.md)

---

## 1. Resumen Ejecutivo y Alcance Técnico

Basado en el análisis del brief institucional de **ASOEXI S.A.S.**, el objetivo es desarrollar una plataforma web corporativa a la medida optimizada para motores de búsqueda (SEO) en Colombia, enfocada en la comercialización B2B de insumos eléctricos, ferreteros e hidráulicos.

### Características Clave del Proyecto:
- **Modelo de Cotización Directa:** Sin publicación de precios ni carrito de compras (protegiendo la dinámica comercial B2B y maximizando la conversión por cotización).
- **Canales de Conversión Contextual:** Integración directa con WhatsApp pre-configurado por producto/marca, 3 líneas telefónicas institucionales y correos corporativos.
- **Arquitectura Silo por Marcas & Categorías:** Cobertura de las 40+ marcas representadas (Panduit, DeWalt, Pavco, Schneider, Stanley, Argos, Bosch, etc.) divididas en 3 grandes sectores (Eléctrico, Ferretero, Hidráulico/Construcción).
- **SEO de Alta Intención Transaccional:** Optimización de infraestructura para posicionar en búsquedas como *"distribuidor mayorista de ferretería en Colombia"* o *"proveedor de insumos eléctricos para obras"*.

---

## 2. Comparativa de Implementaciones Técnicas en el Mercado

| Opción Técnica | Descripción | Pros | Contras | Recomendación |
| :--- | :--- | :--- | :--- | :--- |
| **Plataformas SaaS Builder** *(GoDaddy, Wix, Squarespace)* | Creadores visuales con hosting cerrado de arrastrar y soltar. | Rápido despliegue inicial. | SEO limitado, rendimiento deficiente, código inflado y cobro mensual vitalicio. | ❌ No recomendada |
| **Plataformas E-commerce SaaS** *(Shopify)* | Sistema enfocado en tiendas virtuales con pasarela de pagos. | Gestión de inventario y pagos. | Inadecuada para ASOEXI (se paga mensualidad en dólares por funciones de carrito que no se usarán). | ❌ No recomendada |
| **CMS Auto-hospedado** *(WordPress optimizado)* | Sistema de gestión de contenidos con plugins SEO. | Administrable por el cliente, costo de hosting bajo. | Requiere mantenimiento periódico de seguridad y plugins. | ⚠️ Opción Secundaria |
| **Página Autónoma / Desarrollo a la Medida** *(Next.js / SSG / HTML+Tailwind)* | Sitio web moderno de ultra alta velocidad (Jamstack). | Máxima velocidad de carga, SEO técnico 100/100, sin mensualidades de plataforma, diseño único. | Requiere CMS headless si el cliente desea editar textos por sí mismo. | **✅ Opción Recomendada** |

---

## 3. Benchmark de Mercado en Colombia (Tarifas 2025 - 2026)

De acuerdo con los análisis comerciales de mercado en Colombia para el periodo 2025-2026:

* **Sitio Web Plantilla / Básico Freelance (4-8 páginas sencillas):** $1.200.000 – $1.800.000 COP.
* **Sitio Web B2B Profesional a la Medida + SEO Técnico (Next.js / Astro):** **$2.500.000 – $4.500.000+ COP**.
* **Desarrollo Corporativo Enterprise en Agencia:** $5.500.000 – $12.000.000+ COP.

> **Aclaración sobre el costo de este proyecto:** Los **$1.800.000 COP a $2.100.000 COP** corresponden al **VALOR TOTAL DE TODO EL PROYECTO COMPLETO** (es decir, cubriendo la totalidad de los 3 entregables), **NO a un valor de $1.800.000 COP por cada entregable individual**.

---

## 4. Estrategia SEO B2B & Explicación Detallada de Entregables

### 4.1. ¿Por qué ~40 Landing Pages por Marca? (Arquitectura Silo B2B)
* **El Problema en Google:** Los encargados de compras no buscan "sitio web ASOEXI", sino *"distribuidor autorizado Panduit Bogotá"* o *"tubería Pavco al por mayor"*. Google indexa **páginas individuales**, no secciones ocultas dentro de una sola página.
* **La Solución:** Crear páginas de aterrizaje dedicadas para cada una de las 40+ marcas representadas (ej. `asoexi.com/distribuidor-panduit-colombia`), creando **40 puertas de entrada distintas en Google**.

### 4.2. Entregables Técnicos
* **⚡ Google PageSpeed (Core Web Vitals 95+):** Desarrollo en **Next.js SSG** (*Static Site Generation*) que carga las páginas en <1 segundo.
* **🗺️ Sitemap Dinámico (XML):** Notificación automática a Googlebot sobre nuevas páginas y marcas.
* **🏷️ Schema JSON-LD (`B2BSupplier` & `WholesaleStore`):** Código estructurado para aparecer en Google e inteligencias artificiales (ChatGPT, Perplexity, Google AI Overviews).
* **📂 Hubs de Categoría:** 3 páginas principales (Eléctrico, Ferretero, Hidráulico) que organizan las marcas por sector.
* **💬 WhatsApp Contextual:** Integración que envía la marca de origen en el mensaje inicial de cotización.

---

## 5. Cronograma & Justificación por Entregables (Meses 1, 2 y 3)

```
MES 1 / ENTREGABLE 1              MES 2 / ENTREGABLE 2              MES 3 / ENTREGABLE 3
[Sitio Base Funcional en Vivo] →  [Catálogo 40+ Marcas Funcional] → [Indexación Google & Analítica]
  • Base Next.js SSG                • 3 Hubs de Categorías            • Registro Google Search Console
  • PageSpeed 95+                   • 40 Landing Pages por Marca      • Ficha Google Maps / Local SEO
  • Botones WhatsApp & 3 Líneas     • Catálogos PDF y Cotización      • Medición de llamadas y leads
```

### 📦 ENTREGABLE 1 (Mes 1): Infraestructura Base & Sitio Web Funcional en Vivo
* **Estado al finalizar:** **100% Funcional y en Vivo.** Página corporativa oficial en internet con diseño corporativo (Blanco, Negro, Rojo, Gris), trayectoria de 7+ años, 3 líneas telefónicas directas y botón de WhatsApp.

### 📦 ENTREGABLE 2 (Mes 2): Despliegue de la Arquitectura Silo por Marca & Catálogo Completo
* **Estado al finalizar:** **100% Funcional y Utilizable.** Catálogo completo desplegado en 3 Hubs (Eléctrico, Ferretero, Hidráulico), ~40 sub-páginas por marca, catálogos PDF descargables y WhatsApp contextual.

### 📦 ENTREGABLE 3 (Mes 3): Indexación en Google, SEO Local (Google Maps) & Analítica de Conversión
* **Estado al finalizar:** **100% Operativo.** Registro formal en **Google Search Console**, optimización de la ficha en **Google Maps** (Google Business Profile), código de datos estructurados para IA (**Schema B2BSupplier**) e instalación del sistema de medición de llamadas y mensajes de WhatsApp recibidos.

---

## 6. Esquema de Pago Preferencial: 50% Anticipo / 50% Contra Entrega por Entregable

Para garantizar el equilibrio perfecto entre liquidez de desarrollo y seguridad para **ASOEXI S.A.S.**, se adopta la modalidad más conveniente del mercado: **50% de anticipo al iniciar cada entregable y 50% restante al finalizar y probar cada entregable**.

* **Valor Fijo por Entregable:** **$700.000 COP** (Dividido en $350.000 COP al inicio del mes y $350.000 COP a la entrega).
* **Valor Total de la Inversión (Proyecto Completo Llave en Mano - 3 Entregables):** **$2.100.000 COP**.

### Tabla Detallada del Esquema de Pagos:

| Entregable / Período | Entregable Funcional Incluido | Anticipo (50%) al Inicio del Entregable | Saldo (50%) a la Entrega del Entregable | Total por Entregable (COP) |
| :--- | :--- | :---: | :---: | :---: |
| **Mes 1 / Entregable 1** | Sitio Web Base Funcional en Vivo + Carga Ultrarrápida + WhatsApp y 3 Líneas | $350.000 COP | $350.000 COP | **$700.000 COP** |
| **Mes 2 / Entregable 2** | Catálogo Completo Desplegado + 3 Hubs + ~40 Páginas de Marca + PDFs | $350.000 COP | $350.000 COP | **$700.000 COP** |
| **Mes 3 / Entregable 3** | Registro en Google + Ficha Google Maps + Medición de Llamadas/Leads | $350.000 COP | $350.000 COP | **$700.000 COP** |
| **TOTAL PROYECTO** | **Desarrollo a la Medida + Arquitectura Silo 40+ Marcas + SEO B2B Completo** | **$1.050.000 COP** | **$1.050.000 COP** | **$2.100.000 COP** |

> **Beneficios de esta modalidad para ASOEXI S.A.S.:**
> 1. No compromete capital por adelantado de todo el proyecto.
> 2. Cada pago parcial de $350.000 COP inicia un bloque de trabajo claro.
> 3. El saldo final de cada mes ($350.000 COP) se cancela únicamente cuando ASOEXI prueba y aprueba que el entregable está funcionando al 100%.

*(No incluye costos de dominio `.com` / `.com.co` ni inversión en pauta publicitaria).*

---

**Elaborado y Presentado por:**  
**Ing. Fernando Páez**  
*Asesor de Desarrollo & Estrategia Digital*
