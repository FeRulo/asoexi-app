# Forged Idea: Integración y Animación de la Mascota Institucional (Asesor Técnico)

## Decisiones Fijadas (Locks)
- **Rol y Ubicación:** La mascota institucional ("Asesor Técnico" con casco y planilla de ASOEXI) se integra exclusivamente en los puntos de conversión comercial: como avatar interactivo flotante junto al botón de WhatsApp y en el Banner de Cotización (`#cotizar` / Banner institucional).
- **Tipo de Animación:** Animación ambiental en reposo sin interacción bloqueante (saludo de mano de 10s en `greeting-float.mp4` o toma de llamada en `recieve-call-float.mp4`), contenida en un avatar circular (`rounded-full`) que absorbe el fondo blanco con elegancia y da calidez humana.
- **Inmediatez de Conversión:** Cero fricción comercial. El clic en "Cotizar por WhatsApp" o llamada abre inmediatamente la aplicación externa sin pausas, demoras con temporizadores ni secuencias intermedias.
- **Estándar Técnico Definitivo (< 80 KB vía Video HTML5 H.264):**
  - Implementación mediante `<video autoPlay loop muted playsInline disablePictureInPicture>` en H.264 optimizado (CRF 28, preset veryslow, faststart).
  - **Pesos verificados:** `greeting-float.mp4` (69 KB) y `recieve-call-float.mp4` (79 KB) para 10 segundos completos a 24 fps fluidos.
  - **Ventaja de rendimiento:** Decodificación por hardware nativo (GPU dedicada) en el 100% de dispositivos móviles (iOS y Android), liberando completamente el hilo principal de JavaScript (0% CPU).

## Opciones Rechazadas (Kills) & Motivos
- **KILLED — Retención pre-redirección (Mascota subiéndose a la van antes de abrir WhatsApp):** Rechazada porque retrasar la navegación provoca que los navegadores móviles (Safari/Chrome) bloqueen el enlace considerándolo un pop-up no confiable, además de generar fricción comercial inaceptable para compradores B2B en obra.
- **KILLED — Archivo GIF animado tradicional:** Rechazado por peso excesivo (1.5 MB – 4.5 MB, 10x más pesado que toda la web), falta de compresión de video moderna y degradación de rendimiento.
- **KILLED — WebP animado para clips largos:** Rechazado frente a H.264 debido a que WebP carece de B-frames inter-cuadro temporales y requería recortar la animación a 2s pesando más de 290 KB, mientras que H.264 entrega 10s completos por solo 69 KB.
- **KILLED — SVG vectorial continuo complejo vía JS/Lottie:** Rechazado por alto costo de CPU en WebKit móvil y riesgo de saturación térmica en dispositivos antiguos.
