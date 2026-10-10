# Propuesta de Cambio de Sprint (Sprint Change Proposal)
**Fecha:** 10 de Octubre de 2026  
**Proyecto:** asoexi-app  
**Autor:** John (Product Manager) / Antigravity  
**Estado:** Propuesto (Pendiente de Aprobación Final)  
**Alcance del Cambio:** Moderado (Ajuste de Reglas de Negocio, Directrices de Gerencia y Canales de Contacto)

---

## 1. Resumen del Problema (Issue Summary)

### Contexto y Disparador
Durante la fase de revisión del **Epic 1** (Identidad Corporativa, Hero, Prueba Social y Canales de Contacto Directo), la gerencia general de ASOEXI S.A.S. identificó y determinó los siguientes ajustes estratégicos y operativos para la plataforma:

1. **Riesgo Comercial por Canales Personales:** Actualmente existen números telefónicos y accesos de WhatsApp asociados a líneas personales de asesoras comerciales (Geraldine y Sonia). Esto genera riesgo de fuga o dispersión de clientes corporativos y fricción de marca. Se define **mantener exclusivamente la Línea Corporativa oficial (+57 304 401 3761)** y habilitar sobre ella el canal de WhatsApp directo, prescindiendo del algoritmo de balanceo y rotación 50/50 entre asesoras.
2. **Dominio de Correo Institucional:** Reemplazar el buzón de Gmail (`servicioclienteasoexi@gmail.com`) por el correo con dominio propio institucional: `serviciocliente@asoexi.com`.
3. **Compromiso y SLA de Cotización en Canales de Contacto:** Establecer formalmente de cara al usuario una promesa de servicio de **respuesta casi inmediata en un tiempo máximo garantizado de 5 minutos** dentro del horario hábil establecido. Esta promesa debe ubicarse contextualmente en **todo punto donde el usuario interactúa para cotizar o contactar** (modal de canales, botón flotante de WhatsApp, barra móvil sticky, CTA de cotización), en lugar de figurar como un pilar en la grilla.
4. **Reenfoque de Pilares de Valor (Value Proposition):** Consolidar los dos pilares logísticos en la cima de la propuesta de valor:
   - **Pilar #1 (Insignia):** Logística y Transporte Rápido (24–48h estándar y 6h urgencias en obra/bodega), por ser el diferencial decisivo de conversión B2B.
   - **Pilar #2:** Logística 100% a Domicilio (despacho directo en obra/bodega sin venta presencial por mostrador ni retiro en bodega).
   - **Pilar #3:** Marcas 100% Originales.
   - **Pilar #4:** Crédito Comercial hasta 45 Días.
   - **Pilar #5:** Mínimos desde $200.000 COP (despriorizado respecto a la versión anterior de $50k).
5. **Ajuste de Ticket Mínimo de Despacho:** Modificar la política de pedido mínimo para Bogotá de $50.000 COP a **$200.000 COP**, despriorizando visualmente este pilar frente a los valores de rapidez, solvencia y garantía.

---

## 2. Análisis de Impacto (Impact Analysis)

### Impacto en Épicas e Historias
- **Epic 1 (En curso):**
  - **Historia 1.1 (Setup, Header & Footer):** Actualizar enlaces de contacto en barra superior, modal y pie de página para reflejar `serviciocliente@asoexi.com` y únicamente la Línea Corporativa (+57 304 401 3761).
  - **Historia 1.2 (Hero Banner, Pilares de Valor):** Reordenar los 5 pilares situando "Logística y Despacho Rápido" en el primer lugar con insignias de alto impacto. Modificar el pilar de mínimos de compra de $50.000 COP a $200.000 COP y desplazarlo al final.
  - **Historia 1.3 (Selector de Canales / WhatsApp):** Simplificar la arquitectura: en lugar de balancear tráfico 50/50 entre Geraldine y Sonia, la interfaz conecta directamente con la Línea Corporativa oficial con WhatsApp, integrando el microcopy del SLA de 5 minutos.
  - **Historia 1.4 (Página Nosotros & Metadatos):** Actualizar cifras de ticket mínimo ($200k), correo oficial y canales corporativos en el bloque de modelo logístico.
- **Epic 4 (Cajón de Cotización B2B):**
  - Actualizar la validación de ticket sugerido de $50.000 COP a $200.000 COP en el `QuoteDrawer`.
- **Epic 5 (SEO y Telemetría):**
  - La telemetría de clics de WhatsApp (`lead_whatsapp_click`) ya no requiere reportar `advisor_name` rotativo, sino canal corporativo unificado.

### Impacto en Artefactos de Planificación
- **PRD (`prd.md` y `addendum.md`):** Actualizar FR-1, FR-7, FR-9, directorio de canales oficiales, política de mínimos y agregar SLA explícito de 5 minutos.
- **Arquitectura (`ARCHITECTURE-SPINE.md`):** `src/lib/whatsapp.ts` se simplifica al no requerir rotación en `sessionStorage`; las constantes en `src/lib/constants.ts` unifican los teléfonos a un único contacto corporativo con WhatsApp.
- **UX/UI (`DESIGN.md`, `EXPERIENCE.md`):** El modal de contacto y los botones de WhatsApp comunican la promesa "Respuesta en < 5 min en horario laboral".

---

## 3. Enfoque Recomendado (Recommended Approach)

**Ajuste Directo (Direct Adjustment - Opción 1):**
- No se requiere rollback ni refactorización estructural profunda. La arquitectura de Astro + Preact e islas modulares permite actualizar los datos maestros en `src/lib/constants.ts`, simplificar `src/lib/whatsapp.ts` y adaptar los componentes visuales existentes (`ValuePillars.astro`, `ContactChannelModal.tsx`, `Header.astro`, `Footer.astro`, `FloatingWhatsAppButton.astro`).
- **Esfuerzo estimado:** Bajo-Medio (1-2 días de desarrollo e integración de tests).
- **Riesgo:** Bajo. El cambio simplifica el código al eliminar la lógica de rotación y previene incidencias operativas.

---

## 4. Propuestas Específicas de Cambio (Detailed Change Proposals)

### 4.1 Cambios en el PRD (`_bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/prd.md`)

```markdown
<!-- SECCIÓN: Requerimientos Funcionales (FR-1, FR-7, FR-9) -->

OLD:
- FR-1: ... montos mínimos desde $50.000 COP en Bogotá y modelo operativo 100% logística a domicilio ...
- FR-7: Selector Interactivo de Canales de Contacto con Balanceo Inteligente (Modal / Bottom Sheet en móvil con las 3 líneas comerciales oficiales: Geraldine +57 318 639 7212, Sonia Franco +57 320 449 8881, Línea Corporativa +57 304 401 3761; orden rotativo/balanceado 50/50 por sesión).
- FR-9: Directorio Corporativo ... correos asesorventas1@asoexi.com, asesorventas3@asoexi.com, servicioclienteasoexi@gmail.com ...

NEW:
- FR-1: Visualización prioritaria de Logística y Transporte Rápido a Domicilio (24-48h Bogotá, 6h urgencias en obra, sin venta en mostrador), 7+ años de experiencia, crédito hasta 45 días, marcas 100% originales, montos mínimos desde $200.000 COP en Bogotá y SLA de atención a cotizaciones en máximo 5 minutos en horario laboral.
- FR-7: Canal Oficial de Contacto Directo Corporativo y WhatsApp Único (Acceso inmediato a la Línea Corporativa oficial +57 304 401 3761 con llamada y WhatsApp directo, eliminando números personales de asesoras y asegurando un SLA de respuesta en máximo 5 minutos).
- FR-9: Directorio Corporativo Institucional (Línea Corporativa +57 304 401 3761 con llamada y WhatsApp, correos asesorventas1@asoexi.com, asesorventas3@asoexi.com y serviciocliente@asoexi.com, NIT 900480460-8, sede administrativa sin mostrador ni retiro en bodega).
```

### 4.2 Cambios en Épicas e Historias (`epics.md` & `spec-1-*.md`)

```markdown
<!-- ARCHIVO: _bmad-output/implementation-artifacts/spec-1-3-selector-canales-balanceo-whatsapp.md -->

OLD:
Título: Historia 1.3 - Selector Interactivo de Canales de Contacto con Balanceo Inteligente de Asesoras
Alcance: Modal con balanceo rotativo 50/50 en sessionStorage entre Geraldine y Sonia; Línea Corporativa únicamente para llamadas telefónicas.

NEW:
Título: Historia 1.3 - Canal Corporativo de Contacto Directo con WhatsApp Oficial y SLA 5 Minutos
Alcance: Modal y accesos directos unificados hacia la Línea Corporativa (+57 304 401 3761) con botones de WhatsApp directo y llamada telefónica. Badge y microcopy omnipresente de SLA: "Respondemos en menos de 5 minutos (horario hábil)" integrado en cada punto de cotización o contacto (ContactChannelModal, FloatingWhatsAppButton, MobileStickyBar y CTAs de cotización). Se retira la persistencia de rotación entre asesoras individuales.
```

```markdown
<!-- ARCHIVO: _bmad-output/implementation-artifacts/spec-1-2-hero-banner-pilares-confianza-clientes-corporativos.md -->

OLD:
Pilares de Confianza:
1. Entregas 24-48h / 6h Urgencias
2. Crédito Comercial hasta 45 Días
3. Marcas 100% Originales
4. Mínimos desde $50.000 COP
5. Logística 100% a Domicilio

NEW:
Pilares de Confianza (Jerarquía Rebalanceada):
1. Entregas 24-48h / 6h Urgencias (Logística y Transporte Rápido: despachos programados y atención prioritaria en obra) [Pilar Insignia #1]
2. Logística 100% a Domicilio (Despacho directo en tu obra o bodega a nivel nacional; sin venta por mostrador ni retiro en bodega) [Pilar #2]
3. Marcas 100% Originales (Garantía directa de fábrica, fichas técnicas y certificados de conformidad) [Pilar #3]
4. Crédito Comercial hasta 45 Días (Financiación corporativa con RUT para empresas y contratistas) [Pilar #4]
5. Mínimos desde $200.000 COP (Despachos accesibles para compras corporativas desde $200.000 COP en Bogotá) [Pilar #5 - Prioridad ajustada]

*Nota: La promesa de SLA de respuesta en < 5 minutos NO forma parte de los 5 pilares, sino que se ubica de forma contextual y visible en todos los componentes de interacción de contacto y cotización.*
```

### 4.3 Cambios en Código y Constantes del Sistema (`src/lib/constants.ts`)

```typescript
// OLD:
export const CONTACT_PHONES: ContactPhone[] = [
  { id: 'geraldine', name: 'Geraldine', e164: '+573186397212', display: '+57 318 639 7212', role: 'Asesora Comercial', hasWhatsApp: true },
  { id: 'sonia', name: 'Sonia', e164: '+573204498881', display: '+57 320 449 8881', role: 'Asesora Comercial', hasWhatsApp: true },
  { id: 'corporate', name: 'Línea Corporativa', e164: '+573044013761', display: '+57 304 401 3761', role: 'Atención Institucional', hasWhatsApp: false },
];
export const OFFICIAL_EMAILS: OfficialEmail[] = [
  // ...
  { id: 'servicio', email: 'servicioclienteasoexi@gmail.com', label: 'Servicio al Cliente' },
];

// NEW:
export const CONTACT_PHONES: ContactPhone[] = [
  {
    id: 'corporate',
    name: 'Línea Corporativa',
    e164: '+573044013761',
    display: '+57 304 401 3761',
    role: 'Atención Comercial y Cotizaciones',
    hasWhatsApp: true,
  },
];
export const OFFICIAL_EMAILS: OfficialEmail[] = [
  { id: 'ventas1', email: 'asesorventas1@asoexi.com', label: 'Ventas y Cotizaciones 1' },
  { id: 'ventas3', email: 'asesorventas3@asoexi.com', label: 'Ventas y Cotizaciones 2' },
  { id: 'servicio', email: 'serviciocliente@asoexi.com', label: 'Servicio al Cliente' },
];
export const QUOTE_SLA_NOTICE = 'Respondemos tus cotizaciones en máximo 5 minutos (horario hábil)';
export const MINIMUM_ORDER_COP = 200000;
```

---

## 5. Plan de Entrega e Implementación (Implementation Handoff)

- **Clasificación de Alcance:** Moderado.
- **Responsables:**
  - **Product Manager (John):** Validar propuesta y actualizar documentos de planeación (`prd.md`, `epics.md`, `spec-1-*.md`).
  - **Developer Agent (Amelia):**
    1. Actualizar `src/lib/constants.ts` y `src/lib/whatsapp.ts`.
    2. Actualizar componentes UI (`ValuePillars.astro`, `ContactChannelModal.tsx`, `Header.astro`, `Footer.astro`, `MobileStickyBar.tsx`, `nosotros.astro`).
    3. Ajustar y ejecutar suite de pruebas unitarias (`tests/unit/*.test.ts`) para garantizar 100% de éxito.
- **Criterios de Aceptación:**
  1. No figura ningún número personal ni mención a Geraldine o Sonia en el sitio ni en los enlaces de WhatsApp.
  2. Todo enlace wa.me y tel: apunta a `+57 304 401 3761`.
  3. No figura el correo `@gmail.com`; todas las menciones apuntan a `serviciocliente@asoexi.com`.
  4. Los pilares de valor reflejan la logística rápida en primer orden y el mínimo en $200.000 COP.
  5. Se comunica claramente el SLA de atención en máximo 5 minutos en los puntos de contacto.
  6. Todas las pruebas pasan exitosamente (`npm test`).

