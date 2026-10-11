# Forged Idea: Integración y Animación de la Mascota Institucional (Asesor Técnico)

## Decisiones Fijadas (Locks)
- **Rol y Ubicación:** La mascota institucional ("Asesor Técnico" con casco y planilla de ASOEXI) se integra exclusivamente en los puntos de conversión comercial: el Banner de Cotización (`#cotizar` / Banner institucional) y como elemento de soporte visual junto al canal de contacto / WhatsApp.
- **Tipo de Animación:** Animación ambiental y en reposo (micro-interacción fluida de saludo, pestañeo o toma de teléfono), viva de fondo para aportar calidez sin interferir en la lectura técnica.
- **Inmediatez de Conversión:** Cero fricción. El clic en "Cotizar por WhatsApp" o llamada abre inmediatamente la aplicación externa sin pausas, retrasos de temporizador ni secuencias intermedias.
- **Estándar de Rendimiento Móvil:** Formato WebP animado o CSS Sprite-sheet ligero (< 70 KB) con aceleración nativa por GPU, garantizando carga inferior a 1.5s y fluidez de 60 fps en iPhones antiguos y dispositivos de obra.

## Opciones Rechazadas (Kills) & Motivos
- **KILLED — Retención pre-redirección (Mascota subiéndose a la van antes de abrir WhatsApp):** Rechazada porque retrasar la navegación provoca que los navegadores móviles (Safari/Chrome) bloqueen el enlace considerándolo un pop-up no confiable, además de generar fricción comercial inaceptable para compradores B2B en obra.
- **KILLED — Archivo GIF animado tradicional:** Rechazado por peso excesivo (1.5 MB – 4.5 MB, 10x más pesado que toda la web), falta de compresión de video moderna y degradación de rendimiento.
- **KILLED — SVG vectorial continuo complejo vía JS/Lottie:** Rechazado por alto costo de CPU en WebKit móvil y riesgo de saturación térmica en dispositivos antiguos.
