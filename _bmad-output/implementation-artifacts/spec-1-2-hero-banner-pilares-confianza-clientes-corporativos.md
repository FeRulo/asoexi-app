---
title: 'Story 1.2: Hero Banner Institucional, Pilares de Confianza y Grilla Normalizada de Clientes Corporativos'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: 'd143dd933b45b0c2f10769fdbfdc4de73b0845b6'
review_loop_iteration: 0
context:
  - docs/project-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La página principal actual carece de la modularización definitiva del Hero corporativo, no exhibe formalmente los 5 pilares de confianza indispensables para los decisores B2B, y carece de la sección de Social Proof con clientes corporativos destacados (Casalimpia, Unicentro, Andino, Winner Group, Multiplika), limitando la percepción inmediata de legitimidad y solvencia técnica.

**Approach:** Modularizar el Hero en `src/components/home/Hero.astro` con geometría angular a 45° y titular display en Montserrat, construir `src/components/home/ValuePillars.astro` detallando los 5 pilares contractuales, y desarrollar `src/components/home/ClientLogos.astro` con normalización visual (filtro monocromo en escala de grises con transición suave a color en hover) y optimización de imágenes nativa para cero impacto en CLS, respaldado por contratos de datos validados mediante pruebas TDD en Vitest.

## Boundaries & Constraints

**Always:**
- Metodología TDD estricta: concebir y escribir pruebas unitarias en `tests/unit/home-data.test.ts` antes de instanciar los componentes de producción.
- Estética de precisión industrial: aplicar el token `--radius-industrial` (clase de utilidad `rounded-industrial`) en todas las tarjetas, contenedores, badges y botones.
- Diagonales a 45°: preservar la composición de acento angular y la clase `.icon-diagonal-45` en el CTA principal.
- Accesibilidad WCAG 2.2 AA: áreas táctiles mínimas de 48px de altura en botones y enlaces, textos con contraste superior a 4.5:1 sobre fondo claro/oscuro.
- Prevención de CLS (< 0.05): dimensiones explícitas (width/height) y aspecto estandarizado en contenedores y componentes `<Image>` de Astro.
- Tratamiento de Social Proof: filtro visual neutro `grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300` para armonía con la identidad de marca.

**Ask First:**
- Incorporar librerías externas de carrusel o JavaScript cliente cuando una grilla CSS responsiva pura cumpla con los requisitos sin sobrecarga de runtime.
- Modificar el texto contractual de los 5 pilares o las empresas acreditadas como clientes corporativos.

**Never:**
- No omitir ninguno de los 5 pilares contractuales (entregas 24-48h/6h urgencias, crédito 45 días, marcas 100% originales, mínimos desde $50k Bogotá, logística 100% a domicilio sin mostrador).
- No introducir JavaScript cliente (0 KB client-side JS en componentes estáticos Astro).
- No usar imágenes sin compresión ni dimensiones explícitas que produzcan layout shifts.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Carga de Home Desktop | Viewport ≥ 1024px | Hero despliega cortes a 45°, ValuePillars en grilla 5 columnas/cards balanceadas, ClientLogos con 5 logos en escala de grises. | N/A |
| Carga de Home Móvil | Viewport < 640px | Hero apila titulares y CTAs con tap targets ≥ 48px; ValuePillars apila tarjetas ordenadas; ClientLogos distribuye logos en grilla 2 columnas accesible. | Sin desbordamiento horizontal (overflow-x: hidden) |
| Hover en Logo de Cliente | Cursor sobre tarjeta de cliente | Transición fluida a color natural (`hover:grayscale-0 hover:opacity-100`) con sutil elevación. | N/A |
| Tap en CTA "Solicitar Cotización" | Clic o tap | Navegación suave hacia ancla `#cotizar` o disparador del flujo comercial. | N/A |
| Tap en CTA "Llamar a Línea Corporativa" | Clic o tap en botón secundario | Invoca protocolo nativo `tel:+573044013761`. | N/A |
| Validación de Contratos TDD | `npm test` | Vitest valida estructura, completitud de los 5 pilares y metadatos de los 5 clientes corporativos. | Exit code 0, 0 fallos |

</frozen-after-approval>

## Code Map

- `docs/project-context.md` -- Fuente de invariantes: TDD, radio industrial (`rounded-industrial`), paleta Tailwind v4 y datos oficiales.
- `src/lib/constants.ts` -- Definición de constantes corporativas e incorporación de estructuras para los 5 pilares de confianza (`VALUE_PILLARS`) y clientes corporativos (`CORPORATE_CLIENTS`).
- `tests/unit/home-data.test.ts` -- Nueva suite TDD que valida los contratos de datos de pilares y clientes corporativos antes de renderizarlos.
- `src/assets/clients/` -- Directorio de recursos gráficos optimizados para los 5 clientes corporativos (Casalimpia, Andino, Unicentro, Winner Group, Multiplika).
- `src/components/home/Hero.astro` -- Componente Hero modular con composición diagonal a 45°, titular en Montserrat, propuesta de valor y CTAs con micro-radio industrial.
- `src/components/home/ValuePillars.astro` -- Sección de diferenciales exhibiendo los 5 pilares de legitimidad con iconos industriales y bordes `rounded-industrial`.
- `src/components/home/ClientLogos.astro` -- Franja de Social Proof con grilla armonizada de clientes y filtro monocromo responsivo.
- `src/pages/index.astro` -- Integración limpia de `Hero`, `ValuePillars` y `ClientLogos` manteniendo los anclajes de navegación existentes.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/home-data.test.ts` -- [TDD RED] Escribir pruebas unitarias que certifiquen los contratos de los 5 pilares de confianza y los 5 clientes corporativos -- Asegurar rigurosidad de datos previa al desarrollo.
- [x] `src/lib/constants.ts` -- [TDD GREEN] Declarar `VALUE_PILLARS` y `CORPORATE_CLIENTS` con tipos TypeScript estrictos -- Proveer fuente única de verdad para el Home.
- [x] `src/assets/clients/` -- Normalizar e importar los recursos de imagen de Casalimpia, Andino, Unicentro, Winner Group y Multiplika desde `assets/supplies/clientes/` -- Disponer de fuentes optimizadas para `<Image>`.
- [x] `src/components/home/Hero.astro` -- Extraer y enriquecer el Hero institucional con geometría angular a 45°, microcopy positivo y CTAs accesibles -- Modularizar y optimizar la cabecera del Home.
- [x] `src/components/home/ValuePillars.astro` -- Crear componente de los 5 pilares de confianza con diseño de precisión industrial -- Comunicar diferenciales B2B clave.
- [x] `src/components/home/ClientLogos.astro` -- Construir franja de Social Proof con normalización en escala de grises y transición hover -- Transmitir respaldo y trayectoria corporativa.
- [x] `src/pages/index.astro` -- Reemplazar la sección inline por la composición modular de `Hero`, `ValuePillars` y `ClientLogos` -- Integrar la vista final del Home.

**Acceptance Criteria:**
- Given la suite `tests/unit/home-data.test.ts`, When se ejecuta `npm test`, Then todas las pruebas pasan exitosamente validando los 5 pilares de confianza y los datos de Casalimpia, Andino, Unicentro, Winner Group y Multiplika.
- Given `src/components/home/Hero.astro`, When se inspecciona en la página de inicio, Then muestra la composición diagonal a 45°, el titular en Montserrat destacando 7+ años de trayectoria y los CTAs accesibles (≥48px de altura) con clase `rounded-industrial`.
- Given `src/components/home/ValuePillars.astro`, When se renderiza en el Home, Then presenta con claridad los 5 pilares: entrega 24-48h/6h urgencias, crédito a 45 días, marcas 100% originales, despachos desde $50k Bogotá, y logística 100% a domicilio sin mostrador.
- Given `src/components/home/ClientLogos.astro`, When se navega en el Home, Then visualiza los 5 logos corporativos normalizados con filtro `grayscale opacity-75` y transición interactiva a color en hover sin alterar el layout (CLS < 0.05).
- Given el proyecto completo, When se ejecuta `npm run build`, Then compila estáticamente con exit code 0 y 0 errores de TypeScript o maquetación.

## Spec Change Log

## Design Notes

Composición de tarjetas para `ValuePillars`:
- Fondo `bg-white`, borde sutil `border border-slate-200`, borde superior o acento con clase de sector/primario, micro-radio con clase `rounded-industrial`.
- Iconografía técnica inline en SVG y tipografía Inter con peso font-semibold en titulares breves.

Tratamiento de logos en `ClientLogos`:
- Contenedores de tarjeta con fondo neutro `bg-white`, padding uniforme `p-4 sm:p-6`, borde `border border-slate-100`, `rounded-industrial`.
- Clase CSS de normalización: `grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain`.

## Verification

**Commands:**
- `npm test` -- expected: Vitest ejecuta todas las suites unitarias (constantes e información de home) pasando al 100% con exit code 0.
- `npm run build` -- expected: Astro compila todas las páginas estáticas sin advertencias ni errores con exit code 0.

**Manual checks (if no CLI):**
- Inspección visual en viewport móvil (<640px) y desktop (1280px) verificando ausencia de scroll horizontal y correcta armonía de escala de grises en logos.

## Suggested Review Order

**Componentes Visuales de la Página de Inicio (Home)**

- Hero institucional con cortes a 45°, titular en Montserrat y CTAs accesibles.
  [`Hero.astro:1`](../../src/components/home/Hero.astro#L1)

- Despliegue de los 5 pilares de confianza con diseño industrial y accesibilidad ARIA.
  [`ValuePillars.astro:1`](../../src/components/home/ValuePillars.astro#L1)

- Franja de Social Proof con clientes corporativos y transición hover a color.
  [`ClientLogos.astro:1`](../../src/components/home/ClientLogos.astro#L1)

- Integración modular de Hero, ValuePillars y ClientLogos en la vista principal.
  [`index.astro:1`](../../src/pages/index.astro#L1)

**Contratos de Datos y Cobertura TDD**

- Tipado y contratos de datos para los 5 pilares de confianza y clientes corporativos.
  [`constants.ts:31`](../../src/lib/constants.ts#L31)

- Suite de pruebas unitarias que certifica los contratos de datos en Vitest.
  [`home-data.test.ts:1`](../../tests/unit/home-data.test.ts#L1)

