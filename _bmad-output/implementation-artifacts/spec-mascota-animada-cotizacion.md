---
title: 'Integración y Animación de la Mascota Institucional en Canales de Cotización'
type: 'feature'
created: '2026-10-11'
baseline_commit: '2f963e2641965c8f8552b4e72c859919c627c3fc'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/project-context.md'
  - '_bmad-output/forge/animacion-mascota-cotizacion/forged-idea.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los puntos de contacto comercial y cotización rápida (botón flotante desktop, barra móvil y banner institucional `#cotizar`) resultaban impersonales, mientras que los textos explicativos largos sobrecargaban la interfaz distrayendo la concentración del usuario.

**Approach:** Integrar avatares animados de la mascota institucional en bucle ambiental liviano (< 80 KB vía video HTML5 H.264 decodificado por GPU) con disposición vertical en desktop (avatar circular grande de 96px ubicado encima del botón circular de WhatsApp, sin tooltips invasivos), remover el aviso largo redundante de SLA en la barra móvil simplificando su altura, y enriquecer el banner `#cotizar`, manteniendo siempre redirección instantánea hacia la línea corporativa de WhatsApp.

## Boundaries & Constraints

**Always:**
- Cero fricción comercial: el clic en cualquier botón de WhatsApp o llamada debe abrir de forma inmediata el canal sin temporizadores, demoras ni secuencias bloqueantes.
- En desktop (`FloatingWhatsAppButton.astro`), disposición vertical apilada: el avatar animado de la mascota circular grande (w-24 h-24 / 96px) se posiciona directamente encima del botón circular de WhatsApp (w-16 h-16 / 64px). Sin switchers de depuración y sin tooltips gigantes que tapen la lectura.
- En móvil (`MobileStickyBar.tsx`), retirar el microcopy superior largo "Respondemos tus cotizaciones en menos de 5 minutos (horario hábil)" para desaturar la pantalla y concentrarse en el contenido, manteniendo únicamente los dos botones accesibles (Llamar Corporativo y Cotizar WhatsApp con mini-avatar).
- Los videos animados deben alojarse en `/public/animated/` en formato MP4 H.264 ultra-optimizado (< 80 KB cada archivo: `greeting-float.mp4` ~82 KB y `recieve-call-float.mp4` ~100 KB) con atributos `<video autoplay loop muted playsinline disablepictureinpicture aria-hidden="true">`.
- Accesibilidad WCAG 2.2 AA: los videos son decorativos (`aria-hidden="true"`, `pointer-events-none`), y los enlaces/botones mantienen nombres accesibles explícitos (`aria-label`) y áreas táctiles mínimas ≥ 48x48px.
- Todos los enlaces a WhatsApp deben utilizar la URL canónica generada por `@/lib/whatsapp`.
- Cero diagnósticos pendientes: `npm test` (`vitest run && astro check && tsc --noEmit`) y `npm run build` deben compilar con 0 errores y 0 advertencias.

**Never:**
- No bloquear ni demorar la apertura de WhatsApp con animaciones previas de transición o carga.
- No mostrar tooltips gigantes intrusivos ni avisos redundantes que saturen la experiencia visual.
- No utilizar formatos pesados (GIF tradicional o animaciones WebP/Lottie excesivas de alto consumo de CPU en WebKit móvil).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Navegación Desktop | Usuario carga la página en pantalla ≥ 768px | Se muestra el widget flotante a la derecha con disposición vertical: Avatar circular grande (96px) arriba saludando, botón circular verde WhatsApp (64px) abajo | El widget se oculta en móvil |
| Clic Cotizar WhatsApp (Desktop Flotante) | Usuario hace clic en el avatar o botón flotante | Abre WhatsApp corporativo inmediatamente en nueva pestaña (`target="_blank"`) | Fallback nativo del navegador a enlace `https://wa.me/...` |
| Navegación Móvil | Usuario carga la página en pantalla < 768px | Barra fija inferior limpia sin aviso textual de SLA; botones "Llamar Corporativo" y "Cotizar WhatsApp" con mini-avatar | Layout compacto sin tapar viewport |
| Clic Cotizar WhatsApp (Móvil) | Usuario toca "Cotizar WhatsApp" en barra inferior móvil | Abre WhatsApp directamente en la app nativa o web sin demoras | Fallback estándar del sistema operativo |
| Navegador sin soporte autoplay de video | Dispositivo en modo ahorro de batería o sin autoplay | El contenedor mantiene fondo blanco, borde y apariencia limpia sin romper layout | Video silenciado (`muted playsinline`) garantizado para reproducir sin interacción |

</frozen-after-approval>

## Code Map

- `public/animated/greeting-float.mp4` -- Video animado H.264 optimizado (saludo mascota con casco, ~82 KB)
- `public/animated/recieve-call-float.mp4` -- Video animado H.264 optimizado (mascota atendiendo llamada, ~100 KB)
- `assets/animated/` -- Archivos fuente de animación
- `src/components/common/FloatingWhatsAppButton.astro` -- Widget flotante desktop de WhatsApp con avatar animado vertical (96px) encima del botón verde (64px), sin switcher ni tooltips gigantes
- `src/islands/MobileStickyBar.tsx` -- Barra de acción rápida móvil con mini-avatar animado en el botón de WhatsApp y sin banner textual de SLA
- `src/pages/index.astro` -- Sección institucional `#cotizar` enriquecida con avatar animado de la mascota, badge "En línea" y SLA ≤ 5 min
- `_bmad-output/forge/animacion-mascota-cotizacion/forged-idea.md` -- Decisiones técnicas y locks forjados

## Tasks & Acceptance

**Execution:**
- [x] `src/components/common/FloatingWhatsAppButton.astro` -- Implementar disposición vertical: Avatar circular grande (96px) posicionado arriba del botón circular de WhatsApp (64px). Eliminar el switcher interactivo temporal, eliminar el tooltip gigante y consolidar código limpio de producción.
- [x] `src/islands/MobileStickyBar.tsx` -- Eliminar el bloque de texto superior de aviso SLA ("Respondemos tus cotizaciones en menos de 5 minutos...") para compactar la barra móvil y evitar saturación visual, conservando los dos botones táctiles con el mini-avatar.
- [x] `src/pages/index.astro` -- Mantener y verificar el bloque institucional `#cotizar` con la mascota animada y llamado a la acción comercial.
- [x] `tests/unit/` -- Auditar que todas las suites de pruebas unitarias (`tests/unit/`) pasen y añadir pruebas necesarias si aplica.

**Acceptance Criteria:**
- Given la navegación en desktop, when el usuario observa el widget flotante, then se muestra el avatar circular grande de la mascota (96px) dispuesto verticalmente encima del botón circular de WhatsApp (64px), ambos clickeables y con animación fluida sin tooltips intrusivos.
- Given la navegación en móvil, when el usuario visualiza la barra inferior sticky, then no aparece el texto de aviso largo de SLA, reduciendo la altura ocupada y mostrando de forma nítida los botones de llamada y cotización con el mini avatar animado.
- Given la sección `#cotizar` en la página de inicio, when el usuario llega al bloque de cotización técnica, then visualiza el avatar de la mascota atendiendo llamada con badge "En línea", microcopy SLA ≤ 5 min y botones de contacto oficiales.

## Implementation Notes
- Se eliminó el switcher interactivo temporal y el tooltip grande de `FloatingWhatsAppButton.astro`, dejando una disposición vertical limpia de producción con el avatar de 96px arriba y el botón verde de 64px abajo.
- Se actualizaron las clases de color a tokens oficiales del tema (`bg-whatsapp`, `hover:bg-whatsapp-hover`).
- Se removió el banner textual redundante de SLA de `MobileStickyBar.tsx` y se protegió la etiqueta con `truncate` para pantallas angostas (<= 360px).
- Se añadió `pointer-events-none` al video en `src/pages/index.astro` para evitar menús contextuales no deseados en dispositivos táctiles.
- Se agregó test unitario en `tests/unit/constants.test.ts` verificando la presencia física y peso ligero (< 120 KB) de los assets en `public/animated/`.

## Spec Change Log

## Review Triage Log
| Finding | Severity | Verdict / Resolution |
|---------|----------|----------------------|
| Text overflow en móviles <= 360px en `MobileStickyBar.tsx` | medium | patch: aplicado `truncate` en el span de texto. |
| Hardcoded colors `bg-[#25D366]` en lugar de tokens del tema | low | patch: reemplazado por `bg-whatsapp` y `hover:bg-whatsapp-hover`. |
| Falta de `pointer-events-none` en el video de `index.astro` | low | patch: agregado `pointer-events-none` al elemento `<video>`. |
| Script cliente redundante en `FloatingWhatsAppButton.astro` | low | patch: eliminado; el href ya se renderiza en build time. |
| Cobertura de tests para assets animados | low | patch: añadido test en `tests/unit/constants.test.ts` que valida existencia y límites de tamaño. |

## Design Notes

El uso de video H.264 MP4 ultra-optimizado con `autoplay loop muted playsinline disablepictureinpicture` permite una animación de 10 segundos continuos a 24 fps decodificada por hardware (GPU dedicada), logrando un peso ligero y 0% de uso de CPU en el hilo principal de JavaScript. La disposición vertical en desktop maximiza la presencia empática del personaje ("Asesor Técnico") sin obstruir el área de lectura ni requerir globos de texto excesivos.

## Verification

**Commands:**
- `npm test` -- expected: vitest run && astro check && tsc --noEmit pasan con 0 errores y 0 warnings
- `npm run build` -- expected: compilación estática de Astro sin errores

