---
title: 'Story 1.5: Unificación de Línea Corporativa, SLA ≤ 5 Minutos y Rebalanceo de Pilares Logísticos'
type: 'refactor'
created: '2026-10-10'
status: 'in-review'
baseline_commit: '47b72a358937598215adbc8c205e7d16612c5207'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-1-context.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-10-10.md
---

<frozen-after-approval reason="human-owned intent — renegotiated with human on 2026-10-10 to maintain humanized advisor names on corporate channel">

## Intent

**Problem:** La configuración anterior exponía números de teléfono y enlaces de WhatsApp personales de las asesoras comerciales (Geraldine y Sonia), arriesgando la dispersión de leads y fuga de clientes fuera de la base institucional de ASOEXI S.A.S. Adicionalmente, el canal oficial de servicio al cliente utilizaba una cuenta `@gmail.com` en lugar del dominio propio corporativo, el pilar de despacho mínimo indicaba $50.000 COP (cuando gerencia determinó un mínimo de $200.000 COP para viabilidad de fletes), y no se comunicaba la rapidez de atención a cotizaciones ni se priorizaba el diferencial más vendedor: la logística y transporte rápido.

**Approach:** 
1. Unificar todos los puntos de contacto comerciales en la **Línea Corporativa oficial (`+57 304 401 3761`)**, dotándola de canal de WhatsApp directo y llamadas de voz, pero manteniendo la calidez humana presentando explícitamente a las asesoras comerciales (**Geraldine** y **Sonia**) como el equipo que atiende y asesora a través de esta línea y en el mensaje predeterminado de cotización. Retirar la rotación 50/50 de números personales para que el 100% de los leads queden centralizados en la línea de la empresa.
2. Actualizar el directorio de correos para que apunte formalmente a **`serviciocliente@asoexi.com`** en Header, Footer y Nosotros.
3. Comunicar de forma ubicua y contextual la promesa de servicio (SLA): *"Respondemos tus cotizaciones en menos de 5 minutos (horario hábil)"* en el modal de contacto (`ContactChannelModal`), botón flotante de WhatsApp (`FloatingWhatsAppButton`), barra móvil inferior (`MobileStickyBar`) y llamados a la acción.
4. Reordenar los 5 Pilares de Confianza en Home y Nosotros para situar **Logística y Transporte Rápido** en la posición #1 (Insignia) y **Logística 100% a Domicilio** en la posición #2, ajustando el pilar de mínimos a **$200.000 COP** en la posición #5.
5. Actualizar la suite de pruebas unitarias (`tests/unit/*.test.ts`) para garantizar 100% de éxito en build y tests.

## Boundaries & Constraints

**Always:**
- Metodología TDD: actualizar y adaptar las pruebas unitarias en `tests/unit/constants.test.ts`, `tests/unit/whatsapp.test.ts`, `tests/unit/home-data.test.ts` y `tests/unit/nosotros-data.test.ts`.
- WCAG 2.2 AA: conservar áreas táctiles mínimas de 48x48px, alto contraste de textos y accesibilidad con teclado en modales.
- Única línea corporativa: todo enlace `tel:` y `wa.me` de atención general y cotización debe apuntar a `+57 304 401 3761`.
- Humanización B2B: en el modal y puntos de contacto se debe visibilizar que el equipo de atención comercial está liderado por las ejecutivas Geraldine y Sonia.
- Dominio oficial: ninguna vista o metadato debe exponer correos con `@gmail.com`.
- Preservar retrocompatibilidad en funciones exportadas de `src/lib/whatsapp.ts` para no romper dependencias de compilación.

**Never:**
- No exponer números de teléfonos personales directos fuera de la línea institucional `+57 304 401 3761`.
- No colocar la promesa de SLA de 5 minutos como una tarjeta más dentro de la grilla de los 5 pilares; debe residir en los puntos de contacto/cotización.
- No reducir el ticket mínimo en Bogotá por debajo de $200.000 COP.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Apertura de modal de contacto | Clic en CTA "Cotizar Insumos" o botón flotante | Despliega `ContactChannelModal` mostrando la Línea Corporativa oficial (+57 304 401 3761) con botones "Chatear por WhatsApp" y "Llamar por Teléfono", junto al badge "Respondemos en menos de 5 minutos en horario hábil". | Cierre limpio con Escape o backdrop. |
| Clic en WhatsApp directo | Clic en botón flotante o botón de WhatsApp en modal/sticky bar | Abre `https://wa.me/573044013761?text=Hola%20ASOEXI...` sin depender de rotación en `sessionStorage`. | Sanitización garantizada mediante `cleanPhoneForWhatsApp`. |
| Vista Móvil (< 768px) | Carga en smartphone | `MobileStickyBar` muestra botón "Llamar Línea Corporativa" (`tel:+573044013761`) y botón "Cotizar por WhatsApp" con badge de SLA 5 min. | Espaciado inferior seguro para evitar solapes. |
| Footer institucional | Scroll hasta el pie de página | Muestra `serviciocliente@asoexi.com`, Línea Corporativa `+57 304 401 3761` y nota de despacho sin mostrador. | Validación de enlace mailto: y tel:. |
| Sección Pilares de Valor (Home) | Render de `ValuePillars.astro` | Grilla de 5 tarjetas en orden: 1. Entregas 24-48h / 6h Urgencias (Badge: "Logística Inmediata"), 2. Logística 100% a Domicilio, 3. Marcas 100% Originales, 4. Crédito Comercial hasta 45 Días, 5. Mínimos desde $200.000 COP. | N/A |
| Página Nosotros | Carga `/nosotros` | Estadísticas y características logísticas reflejan ticket mínimo desde $200.000 COP y canales corporativos unificados. | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/constants.ts` -- Centralización de datos: actualizar `CONTACT_PHONES` (Línea Corporativa oficial con `hasWhatsApp: true`), `COMMERCIAL_ADVISORS` (Geraldine y Sonia), `OFFICIAL_EMAILS` (`serviciocliente@asoexi.com`), `VALUE_PILLARS` (reordenamiento logístico y mínimo de $200.000 COP), y constante `QUOTE_SLA_NOTICE`.
- `src/lib/whatsapp.ts` -- Simplificación de generador WhatsApp hacia la línea corporativa (+57 304 401 3761) con saludo cordial a Geraldine y Sonia, preservando firmas de funciones para compatibilidad.
- `src/islands/ContactChannelModal.tsx` -- Presentación de la línea corporativa única, equipo de asesoras (Geraldine y Sonia), botones de WhatsApp y llamada, e inclusión del microcopy de SLA ≤ 5 min.
- `src/islands/MobileStickyBar.tsx` -- Conexión a la línea corporativa única y microcopy del SLA.
- `src/components/common/FloatingWhatsAppButton.astro` -- Enlace directo a WhatsApp de la línea corporativa con tooltip/badge de respuesta rápida (SLA ≤ 5 min).
- `src/components/common/Header.astro` & `Footer.astro` -- Actualización de teléfonos rápidos, correos oficiales (`serviciocliente@asoexi.com`) y CTAs.
- `src/components/home/ValuePillars.astro` & `src/pages/nosotros.astro` -- Despliegue de los pilares rebalanceados y cifras actualizadas ($200.000 COP).
- `tests/unit/*.test.ts` -- Pruebas unitarias de constantes, WhatsApp y datos de páginas.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/constants.test.ts` -- Adaptar pruebas para validar única línea corporativa, equipo de asesoras (Geraldine y Sonia), correo `serviciocliente@asoexi.com` y nuevos pilares.
- [x] `tests/unit/whatsapp.test.ts` -- Adaptar pruebas para verificar generación directa de enlaces a la línea corporativa con saludo al equipo.
- [x] `src/lib/constants.ts` -- Actualizar constantes maestras de la aplicación.
- [x] `src/lib/whatsapp.ts` -- Simplificar lógica de deep links retirando rotación de números personales y dirigiendo a la línea corporativa.
- [x] `src/islands/ContactChannelModal.tsx` -- Actualizar UI del modal con canal corporativo, presencia humana de Geraldine y Sonia, y SLA ≤ 5 min.
- [x] `src/islands/MobileStickyBar.tsx` -- Actualizar barra móvil fija con canal corporativo y microcopy.
- [x] `src/components/common/FloatingWhatsAppButton.astro` -- Actualizar botón flotante para enlazar a la línea corporativa.
- [x] `src/components/common/Header.astro` & `src/components/common/Footer.astro` -- Actualizar referencias a correos y teléfonos.
- [x] `src/components/home/ValuePillars.astro` & `src/pages/nosotros.astro` -- Actualizar orden de pilares y textos de mínimos.
- [x] `tests/unit/home-data.test.ts` & `tests/unit/nosotros-data.test.ts` -- Ajustar aserciones de datos.

**Acceptance Criteria:**
- Given la suite completa de pruebas (`npm test`), When se ejecuta Vitest, Then el 100% de las pruebas pasan con 0 fallos.
- Given el build de producción (`npm run build`), When se compila el proyecto estático en Astro, Then finaliza con código de salida 0.
- Given cualquier página del sitio web, When se inspeccionan enlaces de contacto, Then no existe ninguna referencia a números personales ni cuentas `@gmail.com`, pero se visibiliza a Geraldine y Sonia como el equipo de atención comercial.
- Given la sección de pilares, When se examina la grilla, Then los diferenciales logísticos ocupan las posiciones #1 y #2, y el mínimo de compra figura como $200.000 COP.

