---
title: 'Story 4.1: Almacén Reactivo Persistente Nano Stores ($cartStore) para Requisición B2B'
type: 'feature'
created: '2026-11-20'
status: 'done'
baseline_commit: 'dd5a18d8edd96613cb1ff71b0315305cc0dec3da'
route: 'dispatch'
review_loop_iteration: 0
context:
  - docs/project-context.md
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Los compradores corporativos, ingenieros residentes y jefes de compras necesitan estructurar listas de abastecimiento B2B que combinan referencias del catálogo web con insumos libres anotados a mano, sin perder sus datos al recargar la página, navegar entre páginas estáticas o alternar entre pestañas del navegador.

**Approach:** Implementar el almacén reactivo y persistente `$cartStore` en `src/stores/cart.ts` utilizando `@nanostores/persistent` y `nanostores`, con sincronización automática en `localStorage` bajo clave corporativa (`asoexi_cart_v1`), soporte para tipos de ítems duales (`CatalogItem` y `CustomItem`), coerción reactiva estricta en el rango `[1, 99999]` (EDGE-3) y acciones puras (`addItem`, `removeItem`, `updateQuantity`, `addCustomItem`, `clearCart`), actualizando además la barra inferior de requisición de `LiveSearchModal` para mostrar el desglose explícito de cantidades por ítem (`Panduit (2 unds), Sika (1 und)`) y total de unidades acumuladas (`totalItems`).

## Boundaries & Constraints

**Always:**
- Instalar y configurar las dependencias de producción oficiales: `nanostores` y `@nanostores/persistent`.
- Implementar el estado centralizado en `src/stores/cart.ts` con persistencia en `localStorage` bajo clave corporativa (`asoexi_cart_v1`) y fallback seguro ante entornos SSR (Node/Cloudflare) o cuotas de almacenamiento bloqueadas.
- Definir y exportar los tipos duales:
  - `CatalogItem`: ítem proveniente del catálogo web (`id`, `name`, `sector?`, `url?`, `isTractor?`, `type?`, `quantity: number`).
  - `CustomItem`: ítem libre ingresado manualmente (`id`, `name`, `isCustom: true`, `notes?`, `quantity: number`).
  - `CartItem = CatalogItem | CustomItem`.
  - `CartState`: estructura `{ items: CartItem[]; totalItems: number; }`.
- Exportar las acciones puras de manipulación de estado:
  - `addItem(item: CartItemInput)`: agrega o incrementa la cantidad de un ítem existente.
  - `addCustomItem(description: string, quantity?: number, notes?: string)`: genera un identificador único seguro (`custom-UUID` o `custom-timestamp-rand`) y añade el insumo libre.
  - `updateQuantity(id: string, quantity: number)`: actualiza la cantidad aplicando coerción estricta.
  - `removeItem(id: string)`: elimina el ítem especificado por su identificador.
  - `clearCart()`: vacía completamente la lista y restablece el contador a 0.
- Mantener compatibilidad hacia atrás con la API actual consumida por `src/islands/LiveSearchModal.tsx` y `tests/unit/search.test.ts`:
  - Exportar tanto `$cartStore` como `cartStore`.
  - Método o alias `$cartStore.clear()` equivalente a `clearCart()`.
  - Métodos `get()`, `subscribe()`, `addItem()`, `removeItem()` utilizables como métodos de instancia o acciones vinculadas.
  - Funciones auxiliares para tests: `resetCartStore()` y `setCartStorage(storage)`.
- Aplicar coerción estricta en la actualización e incremento de cantidades (EDGE-3):
  - Rango obligatorio de enteros positivos: `[1, 99999]`.
  - Redondeo/truncado de decimales a enteros con `Math.floor`.
  - Si el valor proporcionado es menor a 1, `0`, negativo, `NaN`, `null`, `undefined` o no numérico, se restablece defensivamente a `1`.
  - Si el valor excede `99999`, se limita defensivamente a `99999`.
- Sincronización multi-pestaña:
  - Manejo de eventos `storage` para actualizar reactivamente el estado cuando otra pestaña modifique `localStorage`.
- Actualización de la barra de requisición en `src/islands/LiveSearchModal.tsx`:
  - Mostrar desglose con cantidades individuales (`[Nombre] ([N] und[s])`) y contador total de unidades acumuladas (`totalItems`).
- Metodología TDD estricta:
  - Escribir suite exhaustiva de tests unitarios en `tests/unit/cart.test.ts`.
  - Mantener 100% verdes los tests de `tests/unit/search.test.ts` y demás suites del proyecto.
  - Registrar 0 errores y 0 warnings en `npm test` y compilación limpia con `npm run build`.

**Never:**
- No almacenar información sensible, contraseñas, tokens de autenticación ni datos personales dentro del carrito de requisición.
- No acoplar el almacén de estado a ningún framework UI específico; debe ser agnóstico y consumible directamente en Preact, Astro o vainilla JS.
- No romper la API de métodos utilizada por `LiveSearchModal.tsx`.
- No permitir cantidades fraccionadas, nulas o negativas en el estado.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Inicialización vacía | Almacén sin datos en `localStorage` | `$cartStore.get()` retorna `{ items: [], totalItems: 0 }` | Inicialización por defecto sin excepciones |
| Carga de estado existente | `localStorage` con ítems válidos | `$cartStore.get()` recupera ítems y calcula `totalItems` como suma de cantidades | Si el JSON está corrupto, descarta y arranca limpio |
| Agregar ítem de catálogo nuevo | `addItem({ id: 'panduit', name: 'Panduit', quantity: 2 })` | Se añade ítem a `items` con `quantity: 2`, `totalItems` aumenta en 2 | Si `quantity` es inválido o no provisto, default 1 |
| Agregar ítem de catálogo existente | `addItem({ id: 'panduit', name: 'Panduit', quantity: 3 })` con ítem ya presente | Incrementa la cantidad del ítem existente sumando 3 | Coerción de suma acumulada máx 99999 |
| Agregar insumo libre (Custom) | `addCustomItem('Cinta aislante 3M amarilla', 5, 'Para tablero principal')` | Crea ítem con `isCustom: true`, id único prefijado `custom-`, descripción y notas | Si la descripción está vacía tras `trim()`, no agrega nada |
| Actualizar cantidad válida | `updateQuantity('panduit', 10)` | Cantidad del ítem pasa a 10, recalcula `totalItems` | Actualización atómica |
| Actualizar cantidad inválida (EDGE-3) | `updateQuantity('panduit', -5)` o `0` o `NaN` | Coerción automática a `1`, `totalItems` actualizado acordemente | Restablece a 1 sin romper el estado |
| Actualizar cantidad excesiva | `updateQuantity('panduit', 150000)` | Coerción al tope máximo `99999` | Clampeo a 99999 |
| Eliminar ítem existente | `removeItem('panduit')` | Ítem retirado de la lista, `totalItems` decrementado | Si el id no existe, no altera el estado |
| Vaciar carrito | `clearCart()` o `$cartStore.clear()` | `items: []`, `totalItems: 0`, `localStorage` actualizado | Operación idempotente |
| Evento multi-pestaña | Otra pestaña modifica la clave de storage | La pestaña actual detecta el cambio de storage y actualiza su estado reactivamente | Sincronización transparente sin deshidratación |

</frozen-after-approval>

## Code Map

- `package.json` -- Agregar dependencias de producción: `nanostores` y `@nanostores/persistent`.
- `src/stores/cart.ts` -- Implementación de `$cartStore` con persistencia, tipos `CatalogItem`, `CustomItem`, `CartItem`, `CartState`, y acciones puras `addItem`, `addCustomItem`, `updateQuantity`, `removeItem`, `clearCart`.
- `tests/unit/cart.test.ts` -- Suite exhaustiva de pruebas unitarias TDD: inicialización, persistencia, adición dual, coerción EDGE-3, multi-pestaña y compatibilidad.
- `src/islands/LiveSearchModal.tsx` -- Consumidor existente de `$cartStore` (verificar integración continua sin cambios regresivos).
- `tests/unit/search.test.ts` -- Verificación de no-regresión de pruebas de búsqueda que interactúan con `$cartStore`.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- Instalar `nanostores` y `@nanostores/persistent` -- Requisito fundamental para la arquitectura de estado reactivo y persistente.
- [x] `tests/unit/cart.test.ts` -- Crear suite de pruebas unitarias TDD cubriendo todos los casos de la matriz I/O y requerimientos de Story 4.1 -- Garantizar ciclo Red-Green-Refactor estricto.
- [x] `src/stores/cart.ts` -- Refactorizar módulo de estado usando `persistentAtom` / Nano Stores con clave corporativa `asoexi_cart_v1`, soporte dual de ítems, coerción reactiva y compatibilidad de API -- Implementación de producción para Story 4.1.
- [x] `tests/unit/search.test.ts` & `src/islands/LiveSearchModal.tsx` -- Actualizar la barra inferior de requisición en `LiveSearchModal` para mostrar cantidades por ítem y total de unidades acumuladas; validar que todas las pruebas existentes de búsqueda y carrito pasen limpiamente sin regresiones.
- [x] `docs/` & `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Actualizar estado de Story 4.1 en seguimiento de sprint.

**Acceptance Criteria:**
- Given el módulo de estado `src/stores/cart.ts`, when se inicializa con `@nanostores/persistent`, then expone `$cartStore` sincronizado automáticamente con `localStorage` bajo clave corporativa y soporte para tipos de ítems duales: `CatalogItem` y `CustomItem`.
- Given las acciones puras exportadas (`addItem`, `removeItem`, `updateQuantity`, `addCustomItem`, `clearCart`), when se actualiza la cantidad de cualquier ítem (EDGE-3), then aplica coerción reactiva estricta garantizando números enteros positivos dentro del rango `[1, 99999]`, restableciendo a 1 cualquier valor inválido o negativo.
- Given múltiples pestañas abiertas en el navegador, when se agrega o elimina un ítem en una pestaña, then el evento de storage actualiza instantáneamente el contador y contenido en todas las pestañas sin desfase ni errores de hidratación.
- Given la suite de pruebas del proyecto, when se ejecuta `npm test`, then pasa con 0 errores y 0 warnings en TypeScript y Astro check.

## Implementation Notes

- Se instalaron en dependencias de producción oficiales: `nanostores` y `@nanostores/persistent`.
- Se implementó `$cartStore` en `src/stores/cart.ts` con persistencia reactiva en `localStorage` bajo clave corporativa `asoexi_cart_v1` y migración/compatibilidad con `asoexi_cart`.
- Se definieron y exportaron los tipos duales: `CatalogItem`, `CustomItem`, `CartItem`, `CartState` y `CartItemInput`.
- Se implementaron las acciones puras: `addItem`, `addCustomItem`, `updateQuantity`, `removeItem`, `clearCart`, `resetCartStore` y `syncFromStorage`.
- Coerción estricta de cantidad (EDGE-3) implementada en el rango `[1, 99999]` con truncado de enteros y fallback a 1 para entradas no válidas o menores a 1.
- Sincronización multi-pestaña libre de bucles de ping-pong (sin llamadas redundantes a `saveState` en storage events).
- Actualizada la barra inferior de requisición en `src/islands/LiveSearchModal.tsx` reflejando desglose individual de cantidades (`[Nombre] ([N] und[s])`) y contador total acumulado de unidades (`totalItems`).
- Se creó la suite completa de pruebas unitarias TDD en `tests/unit/cart.test.ts` con 34 tests específicos pasando limpiamente.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / Route |
|---------|---------|------------------|
| `src/stores/cart.ts:365` -- `syncFromStorage()` invocaba `saveState()` escribiendo a storage y arriesgando bucle multi-pestaña | high | `patch` -- Verificado; corregido en subagente eliminando `saveState` y actualizando el atom en memoria directamente. |
| `src/stores/cart.ts:196` -- En `loadInitialState()`, `stateV1` vacío caía en `stateLegacy` resucitando ítems eliminados | medium | `patch` -- Verificado; corregido priorizando retorno de `stateV1` siempre que `rawV1 !== null`. |
| `src/stores/cart.ts:238` -- `addItem` carecía de guard ante `input` nulo, indefinido o sin `id` | medium | `patch` -- Verificado; agregado guard temprano `if (!input || typeof input !== 'object' || !input.id) return;`. |
| `src/stores/cart.ts:155` -- En `safeDecode()`, `parsed.items.map` fallaba si algún elemento era primitivo o nulo | medium | `patch` -- Verificado; agregado filtro defensivo de objetos válidos previo al mapeo. |
| `tests/unit/cart.test.ts:378` -- Test de storage event en ventana condicionado por `typeof window !== 'undefined'` no ejecutaba aserciones en Node | medium | `patch` -- Verificado; configurado mock de `window` y exportado `initCartStorageListener` para ejecución incondicional en Vitest. |
| Integración de logotipos de marca en tarjetas de resultados de búsqueda | low | `defer` -- Registrado formalmente en `_bmad-output/implementation-artifacts/deferred-work.md` para Story 4.2 junto con las tarjetas de marcas del `QuoteDrawer`. |

## Design Notes

- Se utiliza `persistentAtom` de `@nanostores/persistent` con codificación JSON personalizada para garantizar que el estado `{ items: CartItem[], totalItems: number }` se serialice de forma segura.
- Para el entorno de pruebas y compatibilidad con SSR, se abstrae el storage de modo que en Node o en tests con `mockStorage` funcione fluidamente sin depender exclusivamente del objeto global `window.localStorage`.
- Las acciones puras reciben o actualizan el estado de forma inmutable, recalculando automáticamente `totalItems` como `items.reduce((sum, it) => sum + it.quantity, 0)`.

## Verification

**Commands:**
- `npm test` -- expected: Todas las suites de vitest pasan limpiamente, `astro check` y `tsc --noEmit` con 0 errores y 0 warnings.
- `npm run build` -- expected: Compilación de producción exitosa en Astro SSG sin fallas de tipos.
