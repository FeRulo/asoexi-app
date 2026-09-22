---
title: 'Story 1.1: Setup Base de Astro 7, Tokens de Diseño Tailwind v4, Header y Footer Institucional con TDD'
type: 'feature'
created: '2026-09-22'
status: 'done'
baseline_commit: '18019c63ea8623ff94b92c0197e650b80e7e4987'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El repositorio carece de inicialización en Astro 7, configuración de Tailwind CSS v4, componentes estructurales (Header y Footer) y harness de testing automatizado, impidiendo el desarrollo ágil y confiable de la plataforma.

**Approach:** Establecer el entorno con Astro 7 (`output: 'static'`), Preact, Tailwind CSS v4 y Vitest bajo metodología TDD (desarrollando primero los tests unitarios de las constantes e información institucional), estructurando el layout base con Header (top bar telefónica, logo SVG, navegación) y Footer (datos legales, NIT 900480460-8, correos, horarios y aclaración de despacho a domicilio sin mostrador).

## Boundaries & Constraints

**Always:**
- Metodología TDD estricta: concebir y escribir los tests unitarios antes de la implementación final (`Red-Green-Refactor`).
- Compilación estática pura (`output: 'static'`) sin dependencias de base de datos activa para páginas públicas.
- Paleta oficial: Rojo ASOEXI `#E51A24` (hover `#C8101A`), Antracita `#1E2229`, Superficie `#FFFFFF`, Superficie alterna `#F8FAFC`, Acento ámbar `#F59E0B`, Verde WhatsApp `#25D366`.
- Tipografías: Montserrat (titulares) e Inter (cuerpo y datos).
- Teléfonos en formato E.164 (`tel:+57...`).
- Áreas táctiles mínimas de 48x48px (WCAG 2.2 AA).
- Microcopy logístico obligatorio en Footer: *"Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)"*.

**Ask First:**
- Modificar versiones principales del stack o alterar nombres de rutas definidas en la arquitectura.

**Never:**
- No omitir los tests unitarios ni considerar completada una tarea sin suite de pruebas en verde.
- No incluir librerías de UI pesadas no aprobadas ni pasarelas e-commerce B2C.
- No omitir datos fiscales formales ni canales oficiales de atención.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Tests Unitarios TDD | `npm test` | Vitest ejecuta suites de pruebas de constantes y contratos institucionales pasando al 100%. | Exit code 0, 0 fallos |
| Pantalla Móvil (< 768px) | Viewport móvil | Header adapta enlaces directos con áreas táctiles ≥48px sin desbordamiento horizontal. | N/A |
| Tap en Teléfono | Clic/Tap en Geraldine, Sonia o Corporativo | Dispara protocolo nativo `tel:+573186397212`, `tel:+573204498881` o `tel:+573044013761`. | N/A |
| Pie de Página | Scroll al Footer | Bloque en `#16191F` con NIT 900480460-8, correos, horarios y nota sin mostrador. | N/A |
| Compilación SSG | `npm run build` | Genera salida estática en `dist/` con 0 errores. | Exit code 0 |

</frozen-after-approval>

## Code Map

- `package.json` -- Dependencias base: `astro`, `@astrojs/preact`, `preact`, `tailwindcss`, `@tailwindcss/vite`, `typescript`, `vitest`.
- `vitest.config.ts` -- Configuración de Vitest para pruebas unitarias rápidas en TypeScript.
- `astro.config.mjs` -- Configuración de Astro con `@astrojs/preact` y plugin `@tailwindcss/vite` (`output: 'static'`).
- `tsconfig.json` -- Configuración de TypeScript con path alias `@/*` -> `src/*`.
- `tests/unit/constants.test.ts` -- Pruebas unitarias TDD que validan la existencia y formato de las constantes corporativas (NIT, teléfonos E.164, correos, horarios y microcopy logístico).
- `src/lib/constants.ts` -- Constantes oficiales de ASOEXI (fuente única de verdad para Header, Footer y futuros módulos).
- `src/styles/global.css` -- `@import "tailwindcss";` y bloque `@theme` con colores institucionales y tipografías.
- `src/components/common/Header.astro` -- Barra oscura (`#1E2229`) con teléfonos directos, barra blanca con logo SVG, navegación y CTA "Cotizar Insumos".
- `src/components/common/Footer.astro` -- Bloque oscuro (`#16191F`) con NIT `900480460-8`, correos, horarios y aviso de despacho a domicilio sin mostrador.
- `src/layouts/BaseLayout.astro` -- Shell HTML5 con fuentes Montserrat/Inter, Header, `<slot />` y Footer.
- `src/pages/index.astro` -- Página inicial conectada al layout base para validar renderizado y estilos.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` & `vitest.config.ts` -- Configurar entorno y dependencias incluyendo Vitest -- Habilitar infraestructura TDD.
- [x] `tests/unit/constants.test.ts` -- [TDD RED] Escribir pruebas unitarias iniciales para validar datos corporativos oficiales y formatos telefónicos -- Establecer contratos de prueba previos al código.
- [x] `src/lib/constants.ts` -- [TDD GREEN] Implementar las constantes oficiales para satisfacer las pruebas -- Servir como fuente única de verdad.
- [x] `astro.config.mjs` & `tsconfig.json` -- Configurar Astro 7 y TypeScript estricto con alias `@/*` -- Habilitar compilación e islas.
- [x] `src/styles/global.css` -- Declarar `@import "tailwindcss";` y variables `@theme` corporativas -- Estandarizar diseño visual.
- [x] `src/components/common/Header.astro` -- Construir Header institucional consumiendo las constantes de contacto -- Proveer navegación y llamada a 1 toque.
- [x] `src/components/common/Footer.astro` -- Construir Footer institucional con datos fiscales, correos y política sin mostrador -- Cumplir requisitos legales y transparencia logística.
- [x] `src/layouts/BaseLayout.astro` & `src/pages/index.astro` -- Implementar shell común y página inicial de verificación -- Comprobar renderizado integral.

**Acceptance Criteria:**
- Given la suite de pruebas unitarias (`tests/unit/constants.test.ts`), When se ejecuta `npm test`, Then todas las pruebas pasan exitosamente validando NIT `900480460-8`, teléfonos en formato E.164, correos corporativos y nota logística.
- Given el repositorio `asoexi-app`, When se compila el proyecto (`npm run build`), Then genera salida estática en `dist/` sin errores de compilación ni TypeScript.
- Given `src/styles/global.css`, When se declaran los tokens de diseño, Then las clases de utilidad para `#E51A24`, `#1E2229`, `#FFFFFF`, `#F59E0B`, `#25D366`, Montserrat e Inter están disponibles.
- Given el componente `Header.astro`, When se accede en escritorio o móvil, Then muestra la barra superior oscura con enlaces `tel:+57...` para Geraldine, Sonia Franco y Corporativo, el logo SVG de ASOEXI, enlaces y botón "Cotizar Insumos".
- Given el componente `Footer.astro`, When se llega al final de la página, Then se visualiza el NIT `900480460-8`, correos oficiales, horarios comerciales y la nota explícita de sede administrativa sin mostrador ni retiro en bodega.

## Spec Change Log

## Design Notes

Configuración de tokens en Tailwind v4 en `src/styles/global.css`:
```css
@import "tailwindcss";

@theme {
  --color-primary: #E51A24;
  --color-primary-hover: #C8101A;
  --color-secondary: #1E2229;
  --color-secondary-hover: #14171C;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F8FAFC;
  --color-surface-dark: #16191F;
  --color-whatsapp: #25D366;
  --color-amber-industrial: #F59E0B;
  --font-display: 'Montserrat', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```

## Verification

**Commands:**
- `npm test` -- expected: Vitest ejecuta y aprueba el 100% de las pruebas unitarias con exit code 0.
- `npm run build` -- expected: Compilación SSG limpia en `dist/` con exit code 0.

## Suggested Review Order

**Contratos e Identidad Corporativa**

- Fuente única de verdad institucional, datos fiscales, E.164 y microcopy logístico.
  [`constants.ts:1`](../../src/lib/constants.ts#L1)

- Suite de pruebas TDD que valida contratos fiscales y telefónicos.
  [`constants.test.ts:1`](../../tests/unit/constants.test.ts#L1)

**Tokens de Diseño y Layouts**

- Declaración de tokens corporativos en Tailwind v4 con directiva @theme.
  [`global.css:1`](../../src/styles/global.css#L1)

- Shell HTML5 base con tipografías Montserrat e Inter y estructura común.
  [`BaseLayout.astro:1`](../../src/layouts/BaseLayout.astro#L1)

**Componentes Estructurales**

- Header institucional con top bar telefónica accesible y navegación responsive.
  [`Header.astro:1`](../../src/components/common/Header.astro#L1)

- Footer con microcopy de despacho sin mostrador, NIT y canales oficiales.
  [`Footer.astro:1`](../../src/components/common/Footer.astro#L1)

**Página de Demostración y Verificación**

- Vista principal que conecta los componentes e ilustra los sectores de negocio.
  [`index.astro:1`](../../src/pages/index.astro#L1)

**Configuración y Entorno**

- Configuración de Astro 7 SSG con Tailwind Vite y soporte Preact.
  [`astro.config.mjs:1`](../../astro.config.mjs#L1)

- Dependencias base y requisito de motor Node >=22.12.0.
  [`package.json:1`](../../package.json#L1)

