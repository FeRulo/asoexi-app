---
title: 'Story 4.2: Isla Preact Cajón de Cotización Persistente (QuoteDrawer) y Badge Flotante'
type: 'feature'
created: '2026-11-23'
status: 'done'
baseline_commit: '0c0ca4056bbe463e03508423e37ad48c2ad6033d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores corporativos, ingenieros residentes y jefes de compras necesitan un panel lateral interactivo y accesible en toda la aplicación para revisar su lista de requisición multimarca, ajustar cantidades, añadir insumos o notas libres fuera de catálogo, consultar las condiciones logísticas de pedido mínimo y elegir el canal para tramitar su orden, viendo además los logotipos oficiales de cada marca tanto en el cajón como en el buscador.

**Approach:** Implementar la isla Preact `src/islands/QuoteDrawer.tsx` y el disparador reactivo con badge numérico en el `Header.astro` (escritorio y navegación móvil), conectando botones `[data-add-to-quote]` en `BrandCard.astro` y páginas de silo de marca (`/distribuidor-[brand]-colombia`), extendiendo `SearchIndexItem` y `CatalogItem` con la propiedad `logo` (renderizada con fallback tipográfico en `QuoteDrawer` y `LiveSearchModal`), e integrando el formulario de insumos libres, recordatorio de ticket mínimo ($200.000 COP Bogotá / $100k-$300k Sabana), microcopy de adjuntos Excel/PDF y la barra de triple acción comercial (WhatsApp con SLA ≤ 5 min, envío a `serviciocliente@asoexi.com` y solicitud de Crédito a 45 Días con RUT).

## Boundaries & Constraints

**Always:**
- Extender `CatalogItem` y `CartItemInput` en `src/stores/cart.ts` y `SearchIndexItem` en `src/lib/search.ts` con la propiedad opcional `logo?: string | null`, asegurando que `buildSearchIndex` y `safeDecode` preserven y saniticen la ruta del logotipo oficial de la marca.
- Renderizar el logotipo oficial de la marca (`logo` normalizado con fallback tipográfico seguro si es `null` o vacío) tanto en las tarjetas de resultados y lista de `src/islands/LiveSearchModal.tsx` como en los ítems de catálogo dentro de `src/islands/QuoteDrawer.tsx`.
- Implementar la isla Preact `src/islands/QuoteDrawer.tsx` montada con `client:idle` en `src/layouts/BaseLayout.astro`:
  - Apertura reactiva mediante evento global `open-quote-drawer` (y cierre con `close-quote-drawer`), tecla `Escape`, clic en backdrop o botón de cierre accesible (mínimo 48x48px).
  - Principio Singleton de convivencia visual: al abrirse el Drawer, ocultar dinámicamente `#floating-whatsapp-widget` y `#mobile-sticky-bar` (`opacity-0`, `pointer-events-none`) y bloquear el scroll del `body`; al cerrarse, restaurarlos y re-disparar el evento `scroll` para respetar el `IntersectionObserver` de `#cotizar`.
  - Controles por ítem para incrementar (`+`), decrementar (`−`) o editar cantidad (aplicando coerción estricta `[1, 99999]` vía `updateQuantity`), eliminar ítem individual (`removeItem`) y vaciar lista (`clearCart`).
  - Formulario interactivo `+ Agregar insumo o nota libre` que invoca `addCustomItem(description, quantity, notes)` para incorporar referencias fuera de catálogo con validación de descripción no vacía.
  - Bloque informativo de condiciones de despacho con recordatorio de ticket mínimo sugerido (`$200.000 COP en Bogotá / $100.000 - $300.000 COP Sabana`) y atajo contextual: *"¿Tienes listado completo en Excel o PDF? Puedes adjuntarlo directamente en WhatsApp tras abrir el chat"*.
  - Barra inferior con las 3 acciones comerciales de Story 4.2:
    1. Botón Primario: *"Cotizar por WhatsApp (SLA ≤ 5 min en horario hábil)"* usando `generateRequisitionWhatsAppUrl(cartState.items)` hacia `+57 301 419 1344`.
    2. Botón Secundario: *"¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com"* que dispara el evento `CustomEvent('open-quote-formal-modal', { detail: { creditRequested: false } })` (y fallback `mailto:serviciocliente@asoexi.com` con el resumen de ítems si el modal formal de Story 4.4 aún no está montado).
    3. Enlace de acción especial: *"Solicitar Crédito a 45 Días con RUT"* que dispara `CustomEvent('open-quote-formal-modal', { detail: { creditRequested: true } })` (con fallback a `mailto:serviciocliente@asoexi.com?subject=Solicitud%20de%20Credito%2045%20Dias%20con%20RUT`).
- Integrar el botón disparador del Cajón de Cotización (`[data-open-quote-drawer]`) con badge numérico reactivo (`totalItems` suscrito a `$cartStore`) en `src/components/common/Header.astro` (barra principal desktop/tablet y menú móvil), además de un acceso directo en `LiveSearchModal.tsx` para abrir el cajón completo.
- Incorporar botón secundario `"+ Agregar a requisición"` (`[data-add-to-quote]`) en `src/components/catalog/BrandCard.astro` y en `src/pages/distribuidor-[brand]-colombia.astro` para que el comprador pueda agregar marcas al `$cartStore` desde cualquier vitrina o silo de marca y abrir/actualizar el indicador reactivo.
- Cumplir metodología TDD estricta con suite unitaria en `tests/unit/quote-drawer.test.ts` y actualización de `tests/unit/search.test.ts` y `tests/unit/cart.test.ts`, pasando `npm test` y `npm run build` con 0 errores y 0 warnings.

**Never:**
- No utilizar números telefónicos personales ni correos `@gmail.com`; centralizar exclusivamente en `+57 301 419 1344` y `serviciocliente@asoexi.com`.
- No permitir colisiones visuales entre el `QuoteDrawer` abierto y el widget flotante de la mascota o la `MobileStickyBar`.
- No romper la hidratación ni el rendimiento SSG (0 KB JS síncrono bloqueante; islas montadas con `client:idle`).
- No implementar en esta historia el endpoint serverless `/api/quote.ts` ni el procesamiento multipart de archivos PDF (alcance exclusivo de Story 4.4).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Apertura del Drawer | Clic en `[data-open-quote-drawer]` o evento `open-quote-drawer` | Abre `QuoteDrawer`, atrapa el foco, bloquea scroll y oculta mascota y sticky bar móvil | Si otro modal (`LiveSearchModal`) está abierto, lo cierra limpiamente antes de abrir el Drawer |
| Renderizado de logo en catálogo y buscador | Marca con `logo: "/brands/panduit.png"` vs `logo: null` | Si `logo` es válido, muestra `<img>` optimizado; si es `null` o vacío, muestra badge tipográfico con inicial/nombre | Prevención de imágenes rotas (EDGE-2) |
| Adición de insumo libre manual | Usuario ingresa `"20 tubos conduit EMT 3/4"`, cantidad `15`, nota `"Urgente obra"` | Invoca `addCustomItem`, limpia los campos y renderiza el ítem con etiqueta `"Insumo Libre"` | Si la descripción está vacía tras `trim()`, muestra feedback y no agrega ítem vacío |
| Ajuste de cantidades en Drawer | Clic en `+`, `−` o cambio en input numérico | Actualiza cantidad en `$cartStore` en rango `[1, 99999]` o elimina si baja de 1 en botón `−` | Coerción automática EDGE-3 ante entradas inválidas |
| Adición desde `BrandCard` o Silo de Marca | Clic en botón `+ Agregar a requisición` (`[data-add-to-quote]`) | Agrega la marca con su `id`, `name`, `sector`, `url`, `logo`, `isTractor` a `$cartStore` y actualiza el badge del Header | Feedback visual inmediato (`¡Agregado!`) sin recargar la página |
| Bifurcación de acciones con carrito vacío vs con ítems | Usuario pulsa WhatsApp, Correo o Crédito 45 días | Con ítems: genera URL de requisición WhatsApp o dispara `open-quote-formal-modal` con payload; vacío: orienta a agregar insumos o cotización general | Fallback seguro sin enlaces rotos |

</frozen-after-approval>

## Code Map

- `src/stores/cart.ts` -- Extender `CatalogItem` y `CartItemInput` con `logo?: string | null` y preservarlo en `safeDecode` y `addItem`.
- `src/lib/search.ts` -- Extender `SearchIndexItem` con `logo?: string | null` e incluirlo en `buildSearchIndex`.
- `src/islands/LiveSearchModal.tsx` -- Renderizar miniatura del logotipo oficial de marca (con fallback tipográfico) en las tarjetas de resultados, pasar `logo` al invocar `$cartStore.addItem`, y añadir botón para abrir el `QuoteDrawer`.
- `src/islands/QuoteDrawer.tsx` -- Nueva isla Preact del cajón de cotización persistente: listado de ítems (`CatalogItem` con logo y `CustomItem` con notas), controles de cantidad, formulario `+ Agregar insumo o nota libre`, aviso de ticket mínimo ($200.000 COP Bogotá / $100k-$300k Sabana), microcopy de Excel/PDF y las 3 acciones comerciales.
- `src/components/common/Header.astro` -- Añadir botón de Cajón de Cotización (`data-open-quote-drawer`) con contador badge reactivo (`data-cart-badge`) tanto en la barra superior desktop/mobile como en el menú desplegable móvil.
- `src/components/catalog/BrandCard.astro` & `src/pages/distribuidor-[brand]-colombia.astro` -- Añadir botón interactivo `+ Agregar a requisición` con atributos `data-add-to-quote` para alimentar `$cartStore` desde el catálogo estático.
- `src/layouts/BaseLayout.astro` -- Montar `<QuoteDrawer client:idle />` y enlazar en el script global los disparadores `[data-open-quote-drawer]`, `[data-add-to-quote]` y la sincronización reactiva de los badges `[data-cart-badge]`.
- `tests/unit/quote-drawer.test.ts`, `tests/unit/search.test.ts` & `tests/unit/cart.test.ts` -- Pruebas unitarias TDD para la lógica del cajón, helpers de correo/acciones, propagación de `logo` en búsqueda y carrito, y renderizado sin regresiones.

## Tasks & Acceptance

**Execution:**
- [x] `src/stores/cart.ts` & `src/lib/search.ts` -- Extender `CatalogItem`, `CartItemInput` y `SearchIndexItem` con la propiedad `logo?: string | null` y actualizar `buildSearchIndex`, `safeDecode` y `addItem` -- Requerido para visualizar logotipos oficiales en buscador y cajón de cotización.
- [x] `tests/unit/quote-drawer.test.ts`, `tests/unit/cart.test.ts` & `tests/unit/search.test.ts` -- Escribir pruebas unitarias TDD validando la propagación de `logo` en el índice de búsqueda y carrito, la adición de insumos libres, los textos normativos de ticket mínimo ($200k Bogotá / $100k-$300k Sabana), el atajo de Excel/PDF y los generadores/eventos de las 3 acciones del `QuoteDrawer` -- Garantizar ciclo Red-Green-Refactor.
- [x] `src/islands/QuoteDrawer.tsx` -- Implementar la isla Preact del cajón de cotización con accesibilidad WCAG 2.2 AA (`Escape`, focus trap, cierre backdrop), ocultamiento singleton de mascota/sticky bar, lista de ítems con logos, formulario `+ Agregar insumo o nota libre`, bloque de ticket mínimo y barra de 3 acciones comerciales -- Entregable central de Story 4.2.
- [x] `src/islands/LiveSearchModal.tsx` -- Integrar visualización del logotipo oficial (`logo` con fallback tipográfico) en los resultados de búsqueda, enviar `item.logo` a `$cartStore.addItem`, y permitir abrir `QuoteDrawer` desde la barra inferior de requisición -- Criterio de aceptación explícito de Story 4.2 y cierre de trabajo diferido de Story 4.1.
- [x] `src/components/common/Header.astro`, `src/components/catalog/BrandCard.astro`, `src/pages/distribuidor-[brand]-colombia.astro` & `src/layouts/BaseLayout.astro` -- Integrar el badge reactivo de cotización en el Header, botones `[data-add-to-quote]` en tarjetas/silos de marca, montaje `<QuoteDrawer client:idle />` y listeners globales en `BaseLayout.astro` -- Conexión end-to-end en toda la plataforma.
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` & `_bmad-output/implementation-artifacts/deferred-work.md` -- Actualizar estado de Story 4.2 y marcar como resuelto el ítem diferido de logotipos en búsqueda -- Mantener trazabilidad del sprint.

**Acceptance Criteria:**
- Given el badge de cotización en el Header institucional o navegación móvil, when el usuario hace clic o toque, then se despliega el panel lateral `QuoteDrawer` (`src/islands/QuoteDrawer.tsx`) con animación fluida, listado de materiales y botón de cierre accesible con tecla `Escape`, ocultando temporalmente el widget flotante de la mascota y la `MobileStickyBar` para evitar colisiones visuales.
- Given el cajón de cotización abierto, when el usuario inspecciona las opciones de edición, then dispone de controles para ajustar cantidades, eliminar ítems y el campo interactivo `+ Agregar insumo o nota libre` para referencias personalizadas fuera de catálogo.
- Given la visualización de marcas agregadas en el cajón y en el buscador, when el usuario interactúa con los ítems del catálogo en `QuoteDrawer` o revisa los resultados de `LiveSearchModal`, then se renderiza el logotipo oficial de la marca (`logo` normalizado en WebP/SVG/PNG con fallback tipográfico), integrando la propiedad `logo` en el índice de búsqueda estático `SearchIndexItem`.
- Given la sección informativa del Drawer, when el usuario revisa las condiciones de despacho, then visualiza el recordatorio de ticket mínimo sugerido ($200.000 COP en Bogotá / $100k-$300k Sabana) y el atajo contextual: *"¿Tienes listado completo en Excel o PDF? Puedes adjuntarlo directamente en WhatsApp tras abrir el chat"*.
- Given la barra de acciones del Drawer, when el usuario decide cómo tramitar su orden, then se presentan tres opciones claras: (1) Botón Primario *"Cotizar por WhatsApp (SLA ≤ 5 min en horario hábil)"*, (2) Botón Secundario *"¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com"* disparando la apertura de `QuoteFormalModal` (con fallback seguro), y (3) Enlace de acción especial *"Solicitar Crédito a 45 Días con RUT"* que dispara la apertura de `QuoteFormalModal` con la casilla de crédito pre-seleccionada.

## Implementation Notes

- Se extendieron `CatalogItem`, `CartItemInput` (`src/stores/cart.ts`) y `SearchIndexItem` (`src/lib/search.ts`) con la propiedad `logo?: string | null`, normalizando y sanitizando rutas de logotipos en `buildSearchIndex`, `safeDecode` y `addItem` (rechazando cadenas vacías, `'#'` o esquemas `'javascript:'`).
- Se implementó la isla Preact `src/islands/QuoteDrawer.tsx` montada con `client:idle` en `src/layouts/BaseLayout.astro`, incluyendo cierre con `Escape`, trampa de foco WCAG 2.2 AA, áreas táctiles ≥ 48x48px, bloqueo limpio de scroll y ocultamiento Singleton de `#floating-whatsapp-widget` y `#mobile-sticky-bar` respetando el estado del `IntersectionObserver` sobre `#cotizar`.
- Se integró la visualización de miniaturas de logotipos oficiales con fallback tipográfico de iniciales tanto en las tarjetas de resultados y lista inferior de `src/islands/LiveSearchModal.tsx` como en las tarjetas de `src/islands/QuoteDrawer.tsx`.
- Se implementó el formulario colapsable `+ Agregar insumo o nota libre` conectado a `$cartStore.addCustomItem`, el bloque informativo de ticket mínimo sugerido ($200.000 COP Bogotá / $100k-$300k Sabana) con el atajo contextual para adjuntar Excel/PDF en WhatsApp, y la barra de triple acción comercial (WhatsApp con SLA ≤ 5 min, envío a `serviciocliente@asoexi.com` y solicitud de Crédito a 45 Días con RUT vía `open-quote-formal-modal` con fallback `mailto:`).
- Se agregaron botones disparadores `[data-open-quote-drawer]` con badge reactivo `[data-cart-badge]` en `src/components/common/Header.astro` (desktop y menú móvil) y botones `+ Agregar a requisición` (`[data-add-to-quote]`) con protección ante clics rápidos en `src/components/catalog/BrandCard.astro` y `src/pages/distribuidor-[brand]-colombia.astro`.
- Se crearon y ampliaron las pruebas unitarias TDD en `tests/unit/quote-drawer.test.ts`, `tests/unit/cart.test.ts` y `tests/unit/search.test.ts` alcanzando 246 tests pasando en 13 suites y 0 diagnósticos en `astro check` y `tsc --noEmit`.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / Route |
|---------|---------|------------------|
| `src/islands/QuoteDrawer.tsx:621-656` -- El botón `+ Agregar` / `Ocultar` cambia `isCustomFormExpanded` y `aria-expanded`, pero `<form>` se renderiza incondicionalmente sin ocultarse | high | `patch` -- Verificado en línea 644; condicionar el renderizado del formulario a `{isCustomFormExpanded && (<form>...</form>)}` y enfocar `customInputRef` solo al expandir. |
| `src/islands/QuoteDrawer.tsx:180-211`, `src/islands/LiveSearchModal.tsx:67-115` & `src/islands/ContactChannelModal.tsx:20-47` -- Mutex de modales unidireccional y captura de `document.body.style.overflow` como `'hidden'` al transicionar entre `LiveSearchModal` y `QuoteDrawer` | high | `patch` -- Verificado; despachar `close-quote-drawer` al abrir `LiveSearchModal` o `ContactChannelModal`, e ignorar `'hidden'` como `originalOverflow` (restaurar a `''` al cerrar si no queda otro dialog abierto). |
| `src/islands/QuoteDrawer.tsx:266-274` & `src/layouts/BaseLayout.astro:240-265` -- Al cerrar `QuoteDrawer` mientras `#cotizar` está en viewport, `classList.remove('opacity-0', 'pointer-events-none')` muestra la mascota sobre `#cotizar` porque `IntersectionObserver` no se re-dispara con un evento `scroll` sintético | medium | `patch` -- Verificado; al restaurar la mascota y sticky bar al cierre del modal/drawer, verificar si `#floating-whatsapp-widget` tiene `translate-y-8` (o `#mobile-sticky-bar` tiene `translate-y-full`) impuestos por el `IntersectionObserver` de `#cotizar`, y en ese caso mantener `opacity-0` y `pointer-events-none`. |
| `src/islands/LiveSearchModal.tsx:671-684` -- La lista inferior de requisición dentro de `LiveSearchModal` no renderiza la miniatura del logotipo (`item.logo`) con fallback tipográfico | medium | `patch` -- Verificado; el spec exige renderizar `logo` tanto en las tarjetas de resultados como en la lista de `LiveSearchModal.tsx`. Se añade la miniatura con fallback en cada fila de la lista inferior. |
| `src/stores/cart.ts:179-183,255-260,277-280` & `tests/unit/search.test.ts` -- `safeDecode` y `addItem` en `cart.ts` no filtran `'#'` ni `'javascript:'` en `logo`, y faltan aserciones de sanitización de `logo` en `search.test.ts` y de preservación/actualización de `logo` al re-agregar un ítem existente en `cart.test.ts` | medium | `patch` -- Verificado por `verification-gap`, `blind-hunter` y `edge-case-hunter`; unificar sanitización de `logo` en `cart.ts` y añadir los tests unitarios en `cart.test.ts` y `search.test.ts`. |
| `src/islands/QuoteDrawer.tsx:584,608,638` & `src/islands/LiveSearchModal.tsx:647` -- Botones interactivos (`+`, `−`, input de cantidad, `+ Agregar`, `Ver cajón / Insumo libre`) usan `min-h-[44px]`/`h-11` en lugar del estándar WCAG 2.2 AA del proyecto (`min-h-[48px]` / `h-12`) | medium | `patch` -- Verificado; actualizar áreas táctiles de controles interactivos a `min-h-[48px]` (`h-12` / `w-12`). |
| `src/layouts/BaseLayout.astro:160-173` -- Clics rápidos consecutivos en `[data-add-to-quote]` dentro de 1400ms capturan `'¡Agregado!'` como `originalText`, dejando el texto pegado permanentemente | medium | `patch` -- Verificado; almacenar el texto original en un atributo `data-original-label` y limpiar el `timeout` previo en el elemento antes de iniciar uno nuevo. |
| `src/islands/QuoteDrawer.tsx:193-195` -- El listener de `close-quote-drawer` llama `setIsOpen(false)` directamente sin restaurar el foco a `previousActiveElement` | low | `patch` -- Verificado; invocar `closeDrawer()` en `handleClose`. |
| `src/islands/QuoteDrawer.tsx:314-317` -- Múltiples envíos rápidos en `handleAddCustomSubmit` acumulan `setTimeout` de 2000ms sin limpiar el timer anterior | low | `patch` -- Verificado; guardar el timer en un `useRef` y limpiarlo antes de crear uno nuevo y al desmontar. |
| `src/islands/QuoteDrawer.tsx:154,445` & `src/islands/LiveSearchModal.tsx:29,429` -- `brokenLogos` indexado solo por `item.id` en lugar de `${item.id}:${logo}` impide mostrar el logo si la URL se corrige posteriormente | low | `patch` -- Verificado; indexar `brokenLogos` por `${item.id}:${rawLogo}`. |
| `src/islands/LiveSearchModal.tsx:10-13` -- `LiveSearchModal` importa helpers puros desde `@/islands/QuoteDrawer` acoplando ambos módulos de islas | low | `patch` -- Verificado; mover/re-exportar los helpers puros (`resolveItemLogoUrl`, `getBrandTypographicInitials`) en `src/lib/brands.ts` (manteniendo re-export en `QuoteDrawer.tsx` por compatibilidad). |
| `tests/unit/quote-drawer.test.ts` -- Ausencia de tests de montaje DOM/Preact para el componente `QuoteDrawer` y el script de `BaseLayout.astro` | medium | `defer` -- El entorno de Vitest del proyecto corre en Node puro sin `jsdom`/`@testing-library/preact` (igual que `LiveSearchModal`, `ContactChannelModal` y `MobileStickyBar`). Se registra en `deferred-work.md`. |

## Design Notes

- **Sincronización del Badge en Header sin hidratar todo el Header:** El `Header.astro` permanece 100% estático (0 KB JS propio) renderizando botones `[data-open-quote-drawer]` con un `<span data-cart-badge>` que se actualiza reactivamente mediante `$cartStore.subscribe` en el script global de `BaseLayout.astro`, logrando actualización instantánea multi-isla y multi-pestaña.
- **Coordinación con Story 4.4 (`QuoteFormalModal`):** Los botones (2) y (3) despachan `window.dispatchEvent(new CustomEvent('open-quote-formal-modal', { detail: { creditRequested: boolean } }))`. Si ningún listener captura o cancela el evento (mientras Story 4.4 no esté montada), o como acción de respaldo accesible, se provee enlace/apertura de correo estructurado hacia `serviciocliente@asoexi.com` con el listado de materiales pre-formateado.

## Verification

**Commands:**
- `npm test` -- expected: 100% de las suites en Vitest pasan, `astro check` y `tsc --noEmit` con 0 errores y 0 warnings.
- `npm run build` -- expected: Compilación SSG limpia en Astro sin errores ni advertencias.
