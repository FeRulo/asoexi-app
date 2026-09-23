---
title: 'Story 1.3: Selector Interactivo de Canales de Contacto con Balanceo Inteligente y Botón WhatsApp'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: 'ff662f54387828d4129033a9b93f3f3c72cd43b4'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-1-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los usuarios listos para cotizar insumos o consultar referencias en el sitio web actualmente encuentran enlaces ancla no funcionales (`#cotizar`) en el Header y Hero, carecen de un botón flotante persistente de WhatsApp, y no disponen de un mecanismo balanceado para contactar a las ejecutivas comerciales (Geraldine y Sonia) o la línea corporativa, lo cual arriesga la saturación de una sola asesora y fuga de leads comerciales.

**Approach:** Implementar el módulo de utilidades puras `src/lib/whatsapp.ts` con generador de deep links y algoritmo determinista de balanceo rotativo por sesión, desarrollar la isla interactiva Preact `src/islands/ContactChannelModal.tsx` (modal accesible en escritorio y bottom-sheet táctil en móvil con áreas de toque ≥ 48px), la barra persistente móvil `src/islands/MobileStickyBar.tsx`, el botón flotante `src/components/common/FloatingWhatsAppButton.astro`, e integrarlos mediante eventos desacoplados en el layout base y en los disparadores existentes de Header, Hero y Footer, todo respaldado por TDD en Vitest.

## Boundaries & Constraints

**Always:**
- Metodología TDD estricta: concebir y escribir pruebas unitarias en `tests/unit/whatsapp.test.ts` antes de instanciar la lógica de balanceo y generación de enlaces de WhatsApp.
- WCAG 2.2 AA: áreas táctiles de mínimo 48x48px (`min-h-[48px]`), contraste superior a 4.5:1, compatibilidad con teclado (`Escape` para cerrar modal, gestión de foco y atributos ARIA `role="dialog"`, `aria-modal="true"`).
- Estética industrial: radio de curvatura uniforme `--radius-industrial` (clase `rounded-industrial`), paleta corporativa (Rojo ASOEXI `#E51A24`, Secundario `#1E2229`, Verde WhatsApp `#25D366`, Ámbar `#F59E0B`).
- Balanceo equitativo tripartito por sesión: distribución rotativa equitativa de 1/3 (33.3% de probabilidad) entre los 3 canales oficiales (Geraldine `+57 318 639 7212`, Sonia `+57 320 449 8881` y Línea Corporativa `+57 304 401 3761`) persistiendo la selección en `sessionStorage` para consistencia en la misma visita del usuario.
- Canales oficiales inmutables: las 3 líneas están plenamente habilitadas para cotizar y atender requerimientos técnicos.
- Mensaje institucional de saludo pre-cargado: *"Hola ASOEXI, vi su página web y deseo solicitar una cotización formal"*.

**Ask First:**
- Modificar los números o nombres de los canales oficiales.
- Agregar librerías de UI externas o dependencias pesadas de terceros para el modal.

**Never:**
- No omitir ninguna de las 3 líneas ni alterar el formato internacional E.164.
- No romper la navegación ni recargar la página al abrir el selector de contacto.
- No bloquear la lectura ni el scroll del contenido en móvil cuando el modal está cerrado.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clic en CTA "Cotizar Insumos" (Header/Hero/Footer) | Clic o tap en disparador con atributo `data-open-contact-modal` o enlace `#cotizar` | Despacha evento `open-contact-modal` y se despliega `ContactChannelModal` sin recargar la página. | Prevenir navegación por defecto (`e.preventDefault()`) si el enlace tiene `href="#cotizar"`. |
| Carga en Desktop (≥ 768px) | Viewport desktop con modal abierto | Modal centrado con fondo difuminado (`backdrop-blur-sm`), tarjeta blanca con borde industrial y lista de canales con botones ≥ 48px. | N/A |
| Carga en Móvil (< 768px) | Viewport móvil | Barra fija inferior `MobileStickyBar` con botones "Llamar Asesor" y "Cotizar WhatsApp"; al abrir el selector, se muestra como bottom-sheet táctil. | Padding inferior seguro (`pb-20 md:pb-0`) en el layout para evitar solapamiento de contenido. |
| Sesión Rotación 1 (1/3) | Asignación índice 0 | Geraldine figura como canal prioritario #1, Sonia #2, Línea Corporativa #3. | Si `sessionStorage` está deshabilitado o en modo incógnito estricto, fallback aleatorio/determinista sin excepción. |
| Sesión Rotación 2 (1/3) | Asignación índice 1 | Sonia figura como canal prioritario #1, Línea Corporativa #2, Geraldine #3. | N/A |
| Sesión Rotación 3 (1/3) | Asignación índice 2 | Línea Corporativa figura como canal prioritario #1, Geraldine #2, Sonia #3. | N/A |
| Clic en botón WhatsApp de asesora | Selección de asesora en el modal o botón directo | Genera y abre enlace `https://wa.me/57...?text=Hola%20ASOEXI...` en nueva pestaña (`target="_blank" rel="noopener noreferrer"`). | Validación estricta de teléfono E.164 sanitizado (solo dígitos). |
| Presionar tecla Escape o clic en backdrop | Modal abierto | Cierra el modal y devuelve el foco al disparador activo. | N/A |
| Clic en "Llamar Asesor" en Móvil | Tap en botón de llamada | Invoca enlace nativo `tel:+57...` con el número asignado en el balanceo para esa sesión. | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/constants.ts` (L55-77) -- `CONTACT_PHONES` oficial (Geraldine, Sonia, Línea Corporativa).
- `src/lib/whatsapp.ts` [NUEVO] -- Lógica pura: constante de mensaje institucional, `cleanPhoneForWhatsApp`, `generateWhatsAppUrl`, `getBalancedAdvisors` y `getPrimaryAdvisor` con rotación tripartita (1/3) y persistencia en `sessionStorage`.
- `tests/unit/whatsapp.test.ts` [NUEVO] -- Suite TDD para generación de URL, sanitización telefónica, balanceo tripartito de sesión (1/3) y tolerancia a errores de almacenamiento.
- `src/islands/ContactChannelModal.tsx` [NUEVO] -- Modal accesible (escritorio) y bottom-sheet (móvil) en Preact con listener global `open-contact-modal`, soporte Escape, presentación de las 3 opciones habilitadas para cotizar y áreas táctiles ≥ 48px.
- `src/islands/MobileStickyBar.tsx` [NUEVO] -- Barra fija inferior móvil (< 768px) con accesos de llamada directa y cotización WhatsApp hacia el canal asignado por balanceo.
- `src/components/common/FloatingWhatsAppButton.astro` [NUEVO] -- Botón flotante persistente en desktop con icono SVG de WhatsApp y disparador del modal.
- `src/layouts/BaseLayout.astro` (L37-44) -- Montaje de componentes de contacto, espacio inferior móvil seguro (`pb-20 md:pb-0`) y script para interceptar anclas `#cotizar` y `[data-open-contact-modal]`.
- `src/components/common/Header.astro` (L141-153, L187-200) -- Atributo `data-open-contact-modal` en CTAs desktop y móvil.
- `src/components/home/Hero.astro` (L41-53) -- Atributo `data-open-contact-modal` en botón principal "Solicitar Cotización".
- `src/components/common/Footer.astro` (L108-116) -- Atributo `data-open-contact-modal` en enlace de cotización.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/whatsapp.test.ts` -- Crear suite TDD completa para utilidades y balanceo de WhatsApp cubriendo la rotación tripartita (1/3) entre los 3 canales.
- [x] `src/lib/whatsapp.ts` -- Implementar funciones puras de generación de URLs y rotación balanceada por sesión de las 3 líneas comerciales.
- [x] `src/islands/ContactChannelModal.tsx` -- Construir isla Preact con modal centrado en desktop, bottom-sheet táctil en móvil y accesibilidad ARIA con las 3 líneas.
- [x] `src/islands/MobileStickyBar.tsx` -- Desarrollar barra fija inferior para móviles (< 768px) conectada al canal balanceado.
- [x] `src/components/common/FloatingWhatsAppButton.astro` -- Crear botón flotante desktop para disparar el modal.
- [x] `src/layouts/BaseLayout.astro` -- Integrar componentes de contacto en layout base con script interceptor y padding seguro.
- [x] `src/components/common/Header.astro` -- Conectar CTAs desktop y móvil con el modal vía `data-open-contact-modal`.
- [x] `src/components/home/Hero.astro` -- Conectar CTA principal con el modal vía `data-open-contact-modal`.
- [x] `src/components/common/Footer.astro` -- Conectar enlace de cotización del footer con el modal vía `data-open-contact-modal`.

**Acceptance Criteria:**
- Given la suite `tests/unit/whatsapp.test.ts`, When se ejecuta `npm test`, Then todas las pruebas pasan con 0 fallos, validando la rotación equitativa 1/3 entre Geraldine, Sonia y Línea Corporativa.
- Given la aplicación completa, When se ejecuta `npm run build`, Then el build estático SSG finaliza con código 0 y sin errores.
- Given cualquier viewport (móvil o desktop), When se interactúa con los disparadores de cotización, Then se despliega el selector de canales con los datos oficiales y sin recargar la página.

## Spec Change Log

## Design Notes

- `ContactChannelModal`:
  - Backdrop: `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4`.
  - Contenedor móvil: `w-full bg-white rounded-t-lg p-5 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto`.
  - Contenedor desktop: `sm:w-full sm:max-w-md bg-white sm:rounded-industrial p-6 shadow-2xl animate-fade-in`.
  - Botón WhatsApp: `bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs px-3.5 py-2.5 rounded-industrial min-h-[48px]`.
- `MobileStickyBar`:
  - `fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center gap-3`.
  - Botones con `min-h-[48px] rounded-industrial` ("Llamar": `bg-secondary`, "WhatsApp": `bg-[#25D366]`).
- `FloatingWhatsAppButton`:
  - `fixed bottom-6 right-6 z-40 hidden md:flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg transition-transform hover:scale-105 min-h-[48px] min-w-[48px]`.

## Verification

**Commands:**
- `npm test` -- expected: Vitest ejecuta todas las suites unitarias (`constants`, `home-data` y `whatsapp`) al 100% con exit code 0.
- `npm run build` -- expected: Astro compila todas las páginas y las islas interactivas Preact con exit code 0.

**Manual checks (if no CLI):**
- Apertura y cierre del modal en desktop y móvil con foco adecuado.
- Cierre con tecla Escape y clic en backdrop.
- Botón flotante y sticky bar activos según el breakpoint responsive.

## Suggested Review Order

**Lógica Pura y Balanceo Equitativo**

- Algoritmo de rotación cíclica 1/3 y persistencia segura en sesión.
  [`whatsapp.ts:499`](../../src/lib/whatsapp.ts#L499)

- Generador de enlaces wa.me con sanitización de números colombianos.
  [`whatsapp.ts:461`](../../src/lib/whatsapp.ts#L461)

**Islas Interactivas y UI**

- Modal centrado en desktop y bottom-sheet táctil móvil con trampa de foco accesible.
  [`ContactChannelModal.tsx:270`](../../src/islands/ContactChannelModal.tsx#L270)

- Barra persistente móvil con accesos rápidos a llamada y cotización WhatsApp.
  [`MobileStickyBar.tsx:414`](../../src/islands/MobileStickyBar.tsx#L414)

- Botón flotante desktop con acceso directo al selector de canales.
  [`FloatingWhatsAppButton.astro:174`](../../src/components/common/FloatingWhatsAppButton.astro#L174)

**Integración Global y Disparadores**

- Montaje de islas, espaciado seguro y script desacoplado para enlaces `#cotizar`.
  [`BaseLayout.astro:95`](../../src/layouts/BaseLayout.astro#L95)

- Integración de atributo disparador en Header institucional.
  [`Header.astro:144`](../../src/components/common/Header.astro#L144)

- Disparador de cotización en el Hero principal.
  [`Hero.astro:44`](../../src/components/home/Hero.astro#L44)

**Pruebas Unitarias TDD**

- Suite unitaria exhaustiva cubriendo balanceo tripartito, fallbacks y deep links.
  [`whatsapp.test.ts:619`](../../tests/unit/whatsapp.test.ts#L619)

