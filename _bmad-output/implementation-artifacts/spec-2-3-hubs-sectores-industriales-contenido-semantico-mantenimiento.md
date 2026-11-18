---
title: 'Story 2.3: Hubs de los 3 Sectores Industriales y Contenido Semántico de Mantenimiento'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '798d682a415b18bdfefea69a4f78709aa1d57cb9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores corporativos, contratistas y jefes de mantenimiento carecen de páginas especializadas por sector industrial para consultar el portafolio integral de ASOEXI, entender las soluciones técnicas para mantenimiento correctivo/locativo y cotizar listas multimarca agrupadas en un solo despacho.

**Approach:** Crear las 3 rutas estáticas SSG (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`) alimentadas por colecciones de Astro (`brands` y `categories`), con un componente modular `SectorHub.astro` que incorpore jerarquía semántica H1/H2 para intenciones de búsqueda B2B (cableado estructurado, breakers, tuberías de planta, impermeabilización y masillas), despliegue prioritario de marcas tractoras, aviso corporativo de disponibilidad bajo pedido para referencias complementarias y botón CTA a WhatsApp pre-cargando la solicitud de cotización multimarca del sector.

## Boundaries & Constraints

**Always:**
- Las 3 páginas de sector deben crearse en `src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro` y `src/pages/sector-hidraulico-pinturas.astro`.
- Renderizado 100% estático SSG con 0 KB de JavaScript en el cliente, montadas sobre `BaseLayout.astro`.
- Integrar contenido semántico técnico orientado a intención B2B de mantenimiento:
  - *Sector Eléctrico:* Cableado estructurado, conductores certificados RETIE, breakers/protecciones termo-magnéticas, canalización y gabinetes.
  - *Sector Ferretero & Construcción:* Herramientas de potencia para trabajo pesado, discos de corte/abrasivos, fijaciones técnicas, masillas y sistemas de construcción liviana (drywall).
  - *Sector Hidráulico & Pinturas:* Tuberías de planta y fluidos a presión, recubrimientos epóxicos, impermeabilizantes técnicos y pinturas arquitectónicas de alto tráfico.
- Presentar las marcas del sector reutilizando `BrandCard.astro`, ordenando en posición prioritaria las marcas tractoras correspondientes.
- Incluir un bloque informativo de "Disponibilidad bajo pedido" que indique que marcas secundarias y referencias fuera de vitrina se despachan bajo pedido directo de fábrica con cotización formal.
- Incluir un llamado a la acción (CTA) destacado para *"Cotizar lista multimarca de este sector"* enlazado a la Línea Corporativa Oficial (`+57 301 419 1344`) pre-cargando el mensaje contextual del sector con SLA ≤ 5 minutos.
- Asegurar cumplimiento de WCAG 2.2 AA (áreas táctiles ≥ 48px, contraste tipográfico y navegación por teclado).
- Metodología TDD estricta: crear suite de pruebas unitarias que audite la metadata de sectores, el generador de mensajes de cotización multimarca por sector y la resolución de marcas y copys técnicos.
- Mantener 0 errores y 0 warnings en `npm test` (`vitest run && astro check && tsc --noEmit`) y compilar limpiamente con `npm run build`.

**Never:**
- No introducir librerías de cliente ni componentes hidratados innecesarios; estas páginas son puramente estáticas.
- No alterar los números corporativos oficiales ni la centralización en la Línea Corporativa (+57 301 419 1344).
- No romper ni alterar el comportamiento de `FeaturedBrands.astro`, `BrandCard.astro`, `BaseLayout.astro` o `index.astro`.
- No omitir los términos técnicos B2B obligatorios requeridos por los criterios de aceptación de la historia.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Acceso a ruta de sector | GET `/sector-electrico`, `/sector-ferretero-construccion` o `/sector-hidraulico-pinturas` | Renderiza la página con H1 técnico, descripción B2B, grilla de marcas tractoras del sector, aviso de marcas secundarias y CTA multimarca | Si un sector no tiene marcas asociadas en la colección, renderiza el hub con aviso comercial defensivo |
| Clic en CTA "Cotizar lista multimarca" | Clic en botón de WhatsApp del hub | Abre `wa.me/573014191344?text=...` con mensaje pre-cargado solicitando cotización multimarca del sector correspondiente | Fallback a mensaje corporativo por defecto si el nombre del sector estuviera ausente |
| Clic en tarjeta de marca | Clic en logo o título de `BrandCard` | Navega al silo canónico `/distribuidor-[id]-colombia` | Resuelto por `BrandCard` existente |
| Acceso con parámetros desconocidos o sector inexistente | Parámetro de sector inválido en funciones de apoyo | Retorna metadatos vacíos o fallback seguro sin lanzar excepciones en tiempo de compilación | Manejo defensivo en funciones helpers |

</frozen-after-approval>

## Code Map

- `src/lib/brands.ts` -- Incorporar metadata semántica extendida por sector (`SECTOR_TECHNICAL_CONTENT`), que detalle términos B2B, beneficios y palabras clave de mantenimiento locativo/correctivo.
- `src/lib/whatsapp.ts` -- Añadir función helper `generateSectorQuoteWhatsAppUrl(sectorName?: string | null)` para generar el enlace con mensaje de cotización de lista multimarca pre-cargado.
- `src/components/catalog/SectorHub.astro` -- Nuevo componente Astro reutilizable que renderiza el encabezado del sector, badges, contenido semántico técnico, grilla de marcas mediante `BrandCard.astro`, bloque de disponibilidad bajo pedido y el CTA multimarca de WhatsApp.
- `src/pages/sector-electrico.astro` -- Página canónica SSG para el Sector Eléctrico Industrial.
- `src/pages/sector-ferretero-construccion.astro` -- Página canónica SSG para el Sector Ferretero y Construcción.
- `src/pages/sector-hidraulico-pinturas.astro` -- Página canónica SSG para el Sector Hidráulico y Pinturas.
- `tests/unit/sector-hubs.test.ts` -- Nueva suite de pruebas unitarias que audita la generación de URLs de WhatsApp por sector, la consistencia de los datos semánticos y el filtrado/ordenamiento de marcas por sector.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/sector-hubs.test.ts` -- Crear pruebas unitarias que validen la función `generateSectorQuoteWhatsAppUrl`, la integridad de `SECTOR_TECHNICAL_CONTENT` para los 3 sectores (incluyendo términos clave exigidos: cableado estructurado, breakers, tuberías de planta, impermeabilización y masillas) y la recuperación de marcas de sector.
- [x] `src/lib/whatsapp.ts` -- Implementar `generateSectorQuoteWhatsAppUrl` con codificación segura de URI y fallback a Línea Corporativa Oficial.
- [x] `src/lib/brands.ts` -- Declarar interfaces y constantes `SECTOR_TECHNICAL_CONTENT` con copys semánticos B2B, términos clave de mantenimiento y metadatos SEO por sector.
- [x] `src/components/catalog/SectorHub.astro` -- Desarrollar componente de presentación estática que combine el Hero de sector, la grilla de marcas tractoras (`BrandCard`), el bloque de insumos complementarios bajo pedido y el CTA de cotización multimarca.
- [x] `src/pages/sector-electrico.astro` -- Crear página del Sector Eléctrico Industrial con metadatos SEO específicos montada en `BaseLayout`.
- [x] `src/pages/sector-ferretero-construccion.astro` -- Crear página del Sector Ferretero y Construcción con metadatos SEO específicos montada en `BaseLayout`.
- [x] `src/pages/sector-hidraulico-pinturas.astro` -- Crear página del Sector Hidráulico y Pinturas con metadatos SEO específicos montada en `BaseLayout`.
- [x] Verificación integral -- Ejecutar `npm test` y `npm run build` garantizando 0 errores y 0 warnings en TypeScript, Astro check y suite de pruebas.

**Acceptance Criteria:**
- Given las rutas de sector en Astro (`src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro`, `src/pages/sector-hidraulico-pinturas.astro`), when un usuario o motor de búsqueda accede, then se renderiza la grilla completa de marcas asociadas a ese sector, priorizando las marcas tractoras en la cabecera e indicando la disponibilidad bajo pedido para marcas secundarias.
- Given cada página de sector, when se inspecciona el contenido semántico (FR-4), then incluye encabezados técnicos optimizados (`h1`, `h2`) y textos descriptivos para intenciones de búsqueda B2B (cableado estructurado, breakers, tuberías de planta, impermeabilización y masillas).
- Given cualquier página de sector, when el usuario visualiza el llamado a la acción principal, then encuentra el CTA para "Cotizar lista multimarca de este sector" abriendo WhatsApp con el contexto del sector pre-cargado (+57 301 419 1344).
- Given la ejecución de `npm test` y `npm run build`, then todas las pruebas pasan y la compilación genera limpiamente los 3 artefactos HTML sin errores de diagnóstico.

## Implementation Notes

- Creada suite de pruebas `tests/unit/sector-hubs.test.ts` con 15 pruebas unitarias verificando la generación segura de URLs de cotización multimarca en WhatsApp por sector, la presencia obligatoria de términos técnicos B2B para intenciones de búsqueda de mantenimiento, y el filtrado/ordenamiento de marcas tractoras y complementarias.
- En `src/lib/whatsapp.ts`, implementada la función `generateSectorQuoteWhatsAppUrl(sectorName?: string | null, storage?: Storage)` con codificación URI segura y fallback a la Línea Corporativa Oficial (+57 301 419 1344).
- En `src/lib/brands.ts`, incorporadas las interfaces `SectorTechnicalCategory` y `SectorTechnicalContent`, junto con `SECTOR_TECHNICAL_CONTENT`, `getSectorTechnicalContent` y `getSectorBrands`.
- Creado el componente modular `src/components/catalog/SectorHub.astro` que integra encabezado con migas de pan, badge de SLA ≤ 5 min, H1 y H2 semánticos optimizados para B2B, grilla responsiva de marcas mediante `BrandCard.astro`, bloque técnico de disponibilidad bajo pedido para referencias secundarias y botón CTA accesible para cotizar listas multimarca por WhatsApp.
- Implementadas las 3 páginas canónicas SSG montadas sobre `BaseLayout`: `src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro` y `src/pages/sector-hidraulico-pinturas.astro`.
- Enlazado canónico actualizado en `src/pages/index.astro` (`#sectores`) y `src/components/common/Footer.astro` para apuntar a las nuevas páginas `/sector-*`.
- Correcciones de triaje de revisión aplicadas: barra de navegación rápida entre sectores, aria-labels WCAG, desacoplamiento de `astro:content` en `whatsapp.ts` para bundles cliente de Preact y compatibilidad estricta con arreglos vacíos.
- Verificación completa con `npm test` (110 tests pasando, 0 errores/warnings en Astro check y tsc) y `npm run build` (5 páginas estáticas generadas).

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Falta de Schema.org / JSON-LD en páginas de sector | `false` | reject | Fuera de alcance; planificado formalmente en Story 5.2 (Marcado Estructurado Schema.org JSON-LD B2B). |
| 2 | Enlaces en index.astro (#sectores) y Footer.astro apuntando a anclas locales en vez de URLs canónicas | `low` | patch | Resuelto actualizando los href a /sector-electrico, /sector-ferretero-construccion y /sector-hidraulico-pinturas. |
| 3 | Inconsistencia de nombre de sector hidráulico entre SECTORS_META y SECTOR_TECHNICAL_CONTENT | `medium` | patch | Resuelto unificando a 'Sector Hidráulico & Pinturas' en SECTORS_META. |
| 4 | Encabezado h2 en header de SectorHub.astro alterando jerarquía semántica | `low` | patch | Resuelto cambiando el elemento a h3 para no competir con los h2 de las secciones de nivel superior. |
| 5 | Condición en SectorHub.astro ignora arreglos vacíos explícitos customBrands={[]} | `low` | patch | Resuelto cambiando la validación a `if (customBrands !== undefined)`. |
| 6 | Resolución de id en getSectorBrands ante CollectionEntry sin id en a.data | `low` | patch | Resuelto robusteciendo la coalescencia nula a `(('data' in a && a.data?.id ? a.data.id : (a as { id?: string }).id) || '').toLowerCase()`. |
| 7 | Ausencia de navegación rápida entre los 3 sectores en SectorHub.astro | `low` | patch | Resuelto agregando una barra accesible con píldoras de enlace a los otros 2 sectores. |
| 8 | generateSectorQuoteWhatsAppUrl no resuelve identificadores de SectorId literal | `low` | patch | Resuelto añadiendo resolución canónica contra SECTOR_NAME_BY_SLUG sin importar astro:content en bundles de cliente. |
| 9 | Omisión de imagen Open Graph específica por sector | `false` | reject | No existen assets gráficos individuales para cada sector aún; se utiliza el fallback corporativo predeterminado. |
| 10 | Falta de tests con @astrojs/container para renderizado de componentes | `false` | reject | El estándar del proyecto valida la lógica/esquemas con Vitest y la compilación/DOM estático con astro check y npm run build. |
| 11 | Falta de aria-label en botón WhatsApp del estado vacío de SectorHub.astro | `low` | patch | Resuelto añadiendo aria-label descriptivo con el nombre del sector para cumplimiento WCAG AA. |
| 12 | Clave de historia en sprint-status.yaml no alineada con el slug del spec | `low` | patch | Resuelto actualizando la clave a 2-3-hubs-sectores-industriales-contenido-semantico-mantenimiento. |
| 13 | Colección categories no leída en tiempo de ejecución en SectorHub.astro | `false` | reject | SectorHub se apoya en SECTORS_META y SECTOR_TECHNICAL_CONTENT tipados en TypeScript, optimizando rendimiento sin consultas asíncronas redundantes. |

## Design Notes

El diseño de los Hubs de Sector mantiene la estética industrial con geometría angular a 45°:
- Hero banner sobrio con fondo `bg-secondary` o tokens temáticos del sector (`border-t-sector-*`), respetando la paleta institucional (rojo eléctrico, ámbar ferretero, azul hidráulico).
- Grilla responsiva de tarjetas de marca mediante `BrandCard.astro` (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- Bloque industrial para referencias complementarias: tarjeta con estilo de tablero técnico (`bg-slate-50 border border-slate-200 rounded-industrial p-6`) que aclara el despacho a domicilio bajo pedido con garantía de fábrica para marcas secundarias y referencias no listadas.
- Botón CTA de cotización multimarca con altura táctil accesible (≥ 48px) y microcopy de SLA ≤ 5 minutos.

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las pruebas incluyendo `sector-hubs.test.ts`, `astro check` y `tsc --noEmit` reportan 0 diagnósticos.
- `npm run build` -- expected: Compilación exitosa en Astro SSG generando `/sector-electrico/index.html`, `/sector-ferretero-construccion/index.html` y `/sector-hidraulico-pinturas/index.html`.

**Manual checks (if no CLI):**
- Verificar en navegador las 3 páginas de sector confirmando el H1, H2 semánticos, las marcas tractoras correspondientes, el aviso de disponibilidad bajo pedido y el enlace funcional a WhatsApp.
