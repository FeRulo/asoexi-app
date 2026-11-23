---
title: 'Story 2.4: Isla Preact Buscador en Tiempo Real (LiveSearchModal) con Carga Diferida y "Fallo Cero"'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: '615fb93caa215492a633a2350be704a003c89e73'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores corporativos y jefes de obra necesitan buscar rápidamente marcas e insumos clave del catálogo sin recargar la página, y cuando consultan referencias no listadas en la web sufren la frustración de resultados vacíos que paralizan su cotización.

**Approach:** Implementar la isla Preact `LiveSearchModal` con carga diferida (`client:idle`) del índice estático `search-index.json` (< 35 KB), atajo `/`, debounce de 150ms, botón "+ Agregar a requisición" ($cartStore), coordinación visual con el widget de la mascota y el mecanismo comercial de "fallo cero" hacia WhatsApp (+57 301 419 1344, SLA ≤ 5 min) para referencias no listadas.

## Boundaries & Constraints

**Always:**
- Crear la isla interactiva `src/islands/LiveSearchModal.tsx` con Preact y tokens Tailwind v4 (`rounded-industrial`).
- Añadir botón trigger en Header (`src/components/common/Header.astro`) y atajo global `/` (ignorado en campos de texto editables).
- Generar el índice estático pre-compilado en `src/pages/search-index.json.ts` y espejo en `public/search-index.json` (< 35 KB).
- Carga diferida on-demand del índice estático al interactuar o abrir el modal, sin penalizar LCP ni Core Web Vitals.
- Sanitizar inputs con `trim()` y debounce de 150ms con respuesta visual < 30ms.
- Fallo Cero: ante 0 resultados, mostrar tarjeta proactiva *"No encontramos esta referencia en el catálogo web, pero suministramos todo el portafolio de fábrica bajo pedido. Cotiza '[término]' con un asesor técnico"* con botón directo a WhatsApp (+57 301 419 1344).
- Resultados: enlazar a silo canónico (`/distribuidor-[id]-colombia` o `/sector-[slug]`) y botón "+ Agregar a requisición" invocando `addItem` en `$cartStore` sin cerrar el modal.
- Accesibilidad WCAG 2.2 AA: bloqueo de scroll de fondo, focus trap, tecla Escape para cerrar y ocultar dinámicamente `#floating-whatsapp-widget` (`opacity: 0; pointer-events: none`) mientras el modal esté abierto.
- Metodología TDD estricta: tests unitarios en `tests/unit/search.test.ts` y cero errores/advertencias en `npm test` y `npm run build`.

**Never:**
- No realizar llamadas dinámicas a servidores backend ni añadir bases de datos externas; búsqueda 100% estática en cliente.
- No incluir el índice de búsqueda en el bundle síncrono inicial de la página.
- No alterar los números corporativos oficiales ni la centralización en la Línea Corporativa (+57 301 419 1344).
- No mostrar estados vacíos desérticos ni mensajes de error sin salida comercial a WhatsApp.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Apertura | Clic en lupa o tecla `/` | Abre modal, autofocus en input, scroll bloqueado, widget mascota oculto | Ignora atajo `/` si el foco está en input/textarea |
| Coincidencia | Término existente (ej: "panduit") | Lista instantánea de marcas/sectores con enlace canónico y botón "+ Agregar a requisición" | Sanitiza espacios repetidos |
| Sin coincidencia | Término no listado (ej: "taladro hilti") | Despliega tarjeta "fallo cero" con botón a WhatsApp pre-cargando la solicitud del término | Sanitiza caracteres especiales en URL de WhatsApp |
| Entrada con metacaracteres | Simbolos `*** ??? <>` | Evalúa texto plano limpiamente sin excepciones de regex ni riesgo de inyección | Sanitizador defensivo |
| Agregar a requisición | Clic en "+ Agregar a requisición" | Invoca `addItem` en `$cartStore` con feedback visual momentáneo sin cerrar el modal | Estado reactivo defensivo |
| Cierre | Tecla `Escape`, clic backdrop o botón `×` | Cierra modal, desbloquea scroll, restaura foco al trigger y restaura widget de mascota | Limpieza de listeners |
| Falla de red en índice | Error de carga de `search-index.json` | Muestra estado defensivo con canal directo a WhatsApp para cotizar | Bloque try/catch con fallback seguro |

</frozen-after-approval>

## Code Map

- `src/lib/search.ts` -- Tipos (`SearchIndexItem`), función `buildSearchIndex`, sanitizador `sanitizeSearchQuery` y filtrador `filterSearchIndex`.
- `src/lib/whatsapp.ts` -- Helper `generateSearchZeroFailWhatsAppUrl(query: string, storage?: Storage)` con pre-carga del término.
- `src/stores/cart.ts` -- Almacén reactivo de requisición `$cartStore` con `addItem` (soporte `CatalogItem` y base para Epic 4).
- `src/pages/search-index.json.ts` y `public/search-index.json` -- Generación estática SSG del índice (< 35 KB).
- `src/islands/LiveSearchModal.tsx` -- Modal interactivo Preact: atajo `/`, debounce 150ms, resultados, fallo cero y coordinación con `#floating-whatsapp-widget`.
- `src/components/common/Header.astro` -- Botón trigger accesible con icono de lupa y badge del atajo `/`.
- `src/layouts/BaseLayout.astro` -- Montaje de `<LiveSearchModal client:idle />` y binding de eventos.
- `tests/unit/search.test.ts` -- Tests de sanitización, filtrado, fallo cero, enlace WhatsApp y reactividad de `$cartStore`.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/search.test.ts` -- Suite de pruebas para sanitización, filtrado, fallback de fallo cero, URL de WhatsApp y `$cartStore`.
- [x] `src/lib/search.ts` -- Tipos e interfaces de búsqueda, función sanitizadora y algoritmo de filtrado ponderado.
- [x] `src/lib/whatsapp.ts` -- Función `generateSearchZeroFailWhatsAppUrl` con codificación segura.
- [x] `src/stores/cart.ts` -- Store `$cartStore` con acción `addItem` y persistencia en localStorage.
- [x] `src/pages/search-index.json.ts` & `public/search-index.json` -- Endpoint estático SSG con marcas y sectores (< 35 KB).
- [x] `src/islands/LiveSearchModal.tsx` -- Isla Preact con accesibilidad WCAG 2.2 AA, debounce 150ms, fallo cero y toggle de `#floating-whatsapp-widget`.
- [x] `src/components/common/Header.astro` & `src/layouts/BaseLayout.astro` -- Integrar botón disparador, atajo `/` y montaje del componente.
- [x] Verificación -- Ejecutar `npm test` y `npm run build` con 0 errores y 0 warnings.

**Acceptance Criteria:**
- Given el botón de búsqueda en Header o navegación móvil, when el usuario interactúa o pulsa `/`, then se abre `LiveSearchModal` con foco en el input y bloqueo de scroll.
- Given la apertura del modal, when se inicializa, then descarga de forma diferida el índice `search-index.json` (< 35 KB, ADR-1).
- Given el usuario escribiendo, when ingresa texto, then el algoritmo sanitiza con `trim()`, aplica debounce de 150ms y filtra con respuesta < 30ms.
- Given resultados desplegados, when el usuario selecciona un ítem, then ofrece enlace a su silo canónico y botón "+ Agregar a requisición" invocando `addItem` en `$cartStore` sin cerrar el buscador.
- Given una búsqueda sin coincidencias, when el filtro no arroja resultados, then despliega la tarjeta de "fallo cero" con botón a WhatsApp (+57 301 419 1344) con el término pre-cargado y SLA ≤ 5 min.
- Given el modal abierto, when se presiona `Escape` o clic en backdrop, then se cierra devolviendo el foco al disparador.
- Given el widget flotante `#floating-whatsapp-widget`, when el modal está abierto, then se oculta dinámicamente (`opacity: 0; pointer-events: none`).
- Given `npm test` y `npm run build`, then pasan todos los tests con 0 diagnósticos.

## Implementation Notes

- Implementación 100% completada siguiendo metodología TDD estricta.
- Se crearon 26 tests unitarios en `tests/unit/search.test.ts` validando sanitización, filtrado ponderado, fallo cero hacia WhatsApp (+57 301 419 1344), reactividad y persistencia de `$cartStore`, y validación del tamaño del artefacto (< 35 KB).
- Índice de búsqueda estático generado con 13 ítems (~7.6 KB en dist, ~9 KB en public), muy por debajo del límite de 35 KB.
- Total suite de pruebas: 136 tests unitarios en 10 archivos pasando limpiamente en Vitest.
- Astro check y TypeScript reportan 0 errores, 0 warnings, 0 hints. Compilación exitosa en Astro SSG (`npm run verify`).

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Colisión de build de Astro entre `public/search-index.json` y `src/pages/search-index.json.ts` | `medium` | patch | Resuelto eliminando `public/search-index.json` para que `src/pages/search-index.json.ts` compile limpiamente a `dist/search-index.json` sin advertencias de colisión. |
| 2 | Condición de carrera al tipear mientras el índice se descarga en `LiveSearchModal.tsx` | `medium` | patch | Resuelto agregando un efecto reactivo sobre `[index]` que re-filtra la búsqueda activa una vez el índice llega, evitando falsos positivos de fallo cero. |
| 3 | Banner de fallo cero mostrándose simultáneamente ante error de red | `low` | patch | Resuelto condicionando `showZeroFail` a `!indexError && !isLoadingIndex`. |
| 4 | Temporizador de debounce pendiente al cerrar el modal antes de 150ms | `low` | patch | Resuelto limpiando explícitamente `debounceTimerRef.current` en `closeModal`. |
| 5 | Restauración incondicional del widget de mascota ignorando posición de scroll | `low` | patch | Resuelto re-disparando el evento de scroll para que el observer singleton de `BaseLayout` mantenga oculto el widget si el usuario está en `#cotizar`. |
| 6 | Duplicación de botón de limpiar búsqueda en navegadores WebKit/Blink | `low` | patch | Resuelto añadiendo `[&::-webkit-search-cancel-button]:hidden` al input tipo search. |
| 7 | Botón "+ Agregar a requisición" renderizado en resultados de tipo sector | `low` | patch | Resuelto limitando la adición al carrito a `type === 'brand'`, mostrando "Ver sector →" para categorías industriales. |
| 8 | Sanitización excesiva removiendo slashes y comillas de dimensiones técnicas | `low` | patch | Resuelto permitiendo `/` y `"` en `sanitizeSearchQuery` para soportar búsquedas de medidas como `1/2"`. |
| 9 | Tokenización sin tratar puntuaciones como separadores de palabras | `low` | patch | Resuelto separando tokens con expresión regular `[\s,.;]+`. |
| 10 | Falta de sincronización cross-tab en `$cartStore` | `low` | patch | Resuelto escuchando el evento `window.addEventListener('storage')` para actualizar el store si otra pestaña modifica `localStorage`. |
| 11 | Falta de prueba de integración para el endpoint SSG `src/pages/search-index.json.ts` | `medium` | patch | Resuelto añadiendo test en `tests/unit/search.test.ts` que valida la respuesta HTTP 200, Content-Type y payload del handler `GET`. |

## Design Notes

- Backdrop `bg-slate-900/60 backdrop-blur-sm`, contenedor con `border border-slate-200 shadow-2xl rounded-industrial bg-white max-w-2xl w-full mx-4`.
- Input de búsqueda con placeholder *"Buscar marcas (Panduit, Sika, DeWalt...), sectores o insumos..."*, icono de lupa y badge del atajo `ESC` para cerrar.
- Tarjetas de resultado con badge de color de sector, nombre en Montserrat, micro-badge "Tractora" si aplica, enlace al silo y botón "+ Agregar a requisición".
- Tarjeta "Fallo Cero" en `bg-amber-50/70 border border-amber-200 rounded-industrial p-5` con botón destacado a WhatsApp oficial.

## Verification

**Commands:**
- `npm test` -- expected: Vitest pasa todas las pruebas unitarias, `astro check` y `tsc --noEmit` reportan 0 diagnósticos.
- `npm run build` -- expected: Compilación exitosa en Astro SSG generando `/search-index.json` (< 35 KB) y páginas HTML.

**Manual checks (if no CLI):**
- Probar atajo `/` y clic en lupa del Header para abrir modal con autofocus.
- Buscar "sika" y verificar resultados y botón "+ Agregar a requisición".
- Buscar "hilti" y verificar tarjeta de fallo cero con enlace directo a WhatsApp.
- Verificar que el widget de la mascota se oculta mientras el modal está abierto.
