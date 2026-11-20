# Epic 4 Context: Generador de Requisiciones B2B Multimarca (Quote Drawer) y Solicitudes Formales de Crédito a 45 Días

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Permitir a compradores corporativos, ingenieros residentes y jefes de compras consolidar listas de abastecimiento multimarca y multisectorial en un cajón interactivo persistente (QuoteDrawer con Nano Stores), combinando con igual jerarquía: (a) referencias del catálogo web, (b) insumos y notas libres agregados a mano por el comprador, y (c) atajo directo para adjuntar listas de obra preparadas en Excel o PDF. Además, validar el ticket mínimo sugerido ($200.000 COP en Bogotá / $100k-$300k Sabana) y bifurcar la solicitud entre envío estructurado a la línea corporativa oficial de WhatsApp (+57 301 419 1344) con SLA ≤ 5 min o radicación formal de crédito a 45 días con RUT adjunto mediante el endpoint serverless Edge (`/api/quote`).

## Stories

- Story 4.1: Almacén Reactivo Persistente Nano Stores ($cartStore) para Requisición B2B
- Story 4.2: Isla Preact Cajón de Cotización Persistente (QuoteDrawer) y Badge Flotante
- Story 4.3: Generador Seguro de Deep Links WhatsApp con Salvaguarda de Longitud
- Story 4.4: Endpoint Serverless Edge `/api/quote` y Modal Unificado de Cotización Formal y Crédito

## Requirements & Constraints

- **Almacén Reactivo y Persistencia en Cliente (FR-8, ARCH-3, ARCH-4):**
  - Implementación en `src/stores/cart.ts` usando `@nanostores/persistent`.
  - Persistencia automática en `localStorage` bajo clave corporativa (`asoexi_cart_v1`).
  - Modelo de datos dual: `CatalogItem` (id, slug, nombre, marca, sector, categoría) y `CustomItem` (id generado, descripción libre de insumo/referencia adicional, cantidad).
  - Coerción reactiva estricta de cantidades en el rango entero positivo `[1, 99999]`, restableciendo a 1 cualquier valor no numérico, negativo o menor a 1 (EDGE-3).
  - Sincronización instantánea de eventos entre pestañas abiertas del navegador vía storage listener.
- **Cajón de Cotización B2B Multimarca (UX-DR8, FR-8):**
  - Isla interactiva Preact `QuoteDrawer.tsx` montada con directiva cliente explícita (`client:idle` / `client:visible`).
  - Gestión interactiva: adición, eliminación, incremento/decremento de cantidades y adición manual de insumos libres.
  - Indicador visual y validación informativa de ticket mínimo sugerido ($200.000 COP Bogotá / $100.000-$300.000 COP Sabana).
  - Atajo contextual y microcopy para adjuntar listados de obra en Excel o PDF tras abrir el chat en WhatsApp.
- **Canalización Bifurcada (AD-4):**
  - *Ruta 1 (WhatsApp):* Generación de deep link `wa.me/+573014191344` con plantilla estructurada de 6 datos clave (Empresa, NIT, Contacto, Teléfono, Dirección de entrega/Urgencia, Lista de ítems). Salvaguarda para listas >8 ítems o >1.200 caracteres con copiado automático al portapapeles y enlace limpio a WhatsApp.
  - *Ruta 2 (Formal / Crédito 45 días):* Modal `QuoteFormalModal.tsx` con envío multipart a `/api/quote`, validando formulario y RUT obligatorio si solicita línea de crédito.
- **Seguridad en Endpoint Edge Serverless (AD-5, AD-7, NFR-4):**
  - Endpoint `/api/quote.ts` en Cloudflare Workers runtime.
  - Validación con Zod; sanitización estricta de adjuntos (máx 5 MB en memoria como `ArrayBuffer`, tipos MIME `application/pdf`, `image/jpeg`, `image/png`).
  - Envío transaccional vía Resend REST API a correos autorizados (`serviciocliente@asoexi.com`, `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`).
- **Accesibilidad y Convivencia Visual:**
  - Cumplimiento WCAG 2.2 AA (áreas táctiles ≥ 48px, cierre con tecla Escape, foco accesible).
  - Principio Singleton con el widget flotante (`MascotFloatingWidget`) y `MobileStickyBar` para ocultarse al abrir el Drawer o modal.

## Technical Decisions

- **Nano Stores con `@nanostores/persistent`:** Gestión de estado ultraligera (~1 KB) desacoplada de frameworks, ideal para comunicación fluida entre islas Preact y componentes Astro sin re-renders innecesarios.
- **Cloudflare Edge Adapter:** Endpoint `/api/quote.ts` serverless en Cloudflare Pages (`output: 'static'` con rutas API bajo demanda).
- **Resend API:** Integración de correo transaccional en el Edge sin librerías pesadas tipo nodemailer.

## UX & Interaction Patterns

- **Badge de Cotización Reactivo:** Contador numérico en Header y navegación móvil que refleja en tiempo real el total de ítems agregados.
- **Drawer Lateral / Bottom Sheet:** Animación fluida, foco atrapado accesible y cierre por overlay o Escape.
- **Bifurcación Intuitiva de Acciones:** Botón primario de WhatsApp con SLA ≤ 5 min, botón secundario para envío por correo, y enlace directo para solicitud de crédito a 45 días con RUT.

## Cross-Story Dependencies

- **Story 4.1:** Crea el almacén reactivo base `$cartStore`, tipos e interfaces en `src/stores/cart.ts` y tests unitarios TDD. Es prerequisito indispensable para las historias 4.2, 4.3 y 4.4.
- **Story 4.2:** Consume `$cartStore` para construir la interfaz del cajón interactivo `QuoteDrawer.tsx` y el badge reactivo. Incluye la integración de logotipos de marca (`logo`) tanto en las tarjetas del `QuoteDrawer` como en los resultados de `LiveSearchModal` (extendiendo `SearchIndexItem`).
- **Story 4.3:** Consume los ítems de `$cartStore` para generar el payload y deep link seguro de WhatsApp con salvaguardas de longitud.
- **Story 4.4:** Consume `$cartStore` para pre-cargar la requisición en la solicitud formal por correo/crédito y procesarla en `/api/quote.ts`.
