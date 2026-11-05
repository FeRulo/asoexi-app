---
title: 'Retiro temporal de llamadas telefónicas (solo WhatsApp) e inclusión de nuevo correo de asesor'
type: 'chore'
created: '2026-11-05'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** ASOEXI actualmente atiende de forma exclusiva mediante WhatsApp, por lo que los botones de llamada telefónica (`tel:`) y las menciones a contacto telefónico deben retirarse temporalmente para evitar llamadas fallidas de clientes. Asimismo, se requiere incorporar el correo de un asesor comercial adicional (`asesor1.asoexi@gmail.com`) en los canales oficiales de contacto.

**Approach:** Remover todos los botones de llamada y protocolos `tel:` en Header, Hero, MobileStickyBar, ContactChannelModal, Footer, y páginas institucionales (`index.astro`, `nosotros.astro`), centralizando los accesos directos en WhatsApp. Añadir `asesor1.asoexi@gmail.com` al listado oficial de correos en `src/lib/constants.ts` y actualizar las pruebas unitarias asociadas para validar su presencia y funcionamiento.

</frozen-after-approval>

## Implementation Notes

- **Archivos modificados:**
  - `src/lib/constants.ts`: Añadido el correo oficial `asesor1.asoexi@gmail.com` con id `asesor1` y etiqueta `Ventas y Cotizaciones 3`.
  - `src/components/common/Header.astro`: Sustituido el enlace `tel:` de llamada por acceso directo a WhatsApp Corporativo usando `generateWhatsAppUrl` y diseño accesible (≥ 48px).
  - `src/components/home/Hero.astro`: Sustituido el botón secundario de llamada a la Línea Corporativa por botón directo de atención vía WhatsApp usando tokens corporativos (`bg-whatsapp`, `hover:bg-whatsapp-hover`).
  - `src/islands/MobileStickyBar.tsx`: Retirado el botón de llamada telefónica; conservado el avatar interactivo de la mascota técnica y botón destacado a ancho completo para cotización directa en WhatsApp.
  - `src/islands/ContactChannelModal.tsx`: Retirado el botón de llamada por teléfono (`tel:`); botón de WhatsApp ocupa el ancho completo con cierre automático de modal (`onClick={closeModal}`) para fluidez de interacción.
  - `src/components/common/Footer.astro`: Retirado el botón de llamada `tel:`; conservado el botón de WhatsApp con tokens canónicos y ajustado el área táctil mínima de correos a 48px (WCAG 2.2 AA).
  - `src/pages/index.astro`: Retirado el botón de llamada telefónica en la sección inferior de contacto; conservado el CTA de cotización por WhatsApp.
  - `src/pages/nosotros.astro`: Retirados los botones `tel:` de llamada; actualizado el copy institucional para reflejar atención oficial por WhatsApp y renderizar los 4 correos autorizados.
  - `src/layouts/BaseLayout.astro`: Limpieza de comentarios obsoletos sobre llamada telefónica.
  - `tests/unit/constants.test.ts`: Actualizada la prueba de correos oficiales para verificar los 4 correos, exigiendo dominio `@asoexi.com` o el correo explícitamente autorizado `asesor1.asoexi@gmail.com`.
- **Reversibilidad / Restauración futura:**
  - Para reactivar llamadas telefónicas cuando se restablezca la atención por voz, basta con reinstaurar los enlaces `tel:${corporate.e164}` en Header, Hero, MobileStickyBar, Modal y Footer, dado que `CONTACT_PHONES` en `src/lib/constants.ts` preserva intactos el número `e164` y el formato `display`.

## Review Triage Log

- `Modal redundant without multi-channel options`: `false` — El modal aporta contexto institucional completo (SLA 5 min, asesoras, detalles) y es activado por múltiples CTAs de cotización en el sitio.
- `Modal remains open after clicking WhatsApp link`: `medium` (patch) — Corregido agregando `onClick={closeModal}` en el botón de WhatsApp dentro de `ContactChannelModal.tsx`.
- `Missing official email channels in contact modal`: `low` (rejected) — El modal está diseñado específicamente como canal de cotización ágil con SLA de 5 minutos, los correos se ofrecen en Footer y Nosotros.
- `Outdated accessibility labels referencing selector de canales`: `low` (patch) — Corregidos los atributos de accesibilidad en modal y sticky bar.
- `Asymmetrical layout in mobile sticky bar`: `low` (patch) — Ajustado el contenedor flex con espaciado y alineación visual limpia.
- `Inconsistent design tokens for WhatsApp colors`: `medium` (patch) — Estandarizado el uso de tokens `@theme` (`bg-whatsapp`, `hover:bg-whatsapp-hover`, `focus:ring-whatsapp`) en todos los componentes.
- `Incomplete spec artifact`: `high` (patch) — Completado con notas de implementación y estado `done`.
- `Weakened email domain assertion in unit tests`: `medium` (patch) — Reforzada la validación para exigir dominio corporativo `@asoexi.com` o la dirección autorizada `asesor1.asoexi@gmail.com`.
- `Inconsistent naming convention for advisor email`: `low` (patch) — Estandarizada la etiqueta a `Ventas y Cotizaciones 3`.
- `Sub-standard touch target height on footer email links`: `low` (patch) — Aumentada el área táctil a `min-h-[48px]`.
