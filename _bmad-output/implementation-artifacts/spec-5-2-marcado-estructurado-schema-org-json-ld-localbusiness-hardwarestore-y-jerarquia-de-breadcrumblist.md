---
title: 'Story 5.2: Marcado Estructurado Schema.org JSON-LD LocalBusiness (HardwareStore) y Jerarquía de BreadcrumbList'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
baseline_commit: 'a2fb1a7a19c28b3358b53a4b4d34b031994a1980'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Las páginas principales (`/`, `/nosotros`) y los 3 hubs de sector (`/sector-electrico`, `/sector-ferretero-construccion`, `/sector-hidraulico-pinturas`) no emiten marcado estructurado JSON-LD de Schema.org (`Organization`, `HardwareStore`/`WholesaleStore` ni `BreadcrumbList`), limitando los resultados enriquecidos locales y la comprensión semántica de ASOEXI S.A.S. en Google y motores de IA.

**Approach:** Centralizar en `src/lib/constants.ts` los datos geográficos oficiales de la sede en Barrio Venecia, implementar generadores puros de JSON-LD (`Organization`, `["HardwareStore", "WholesaleStore"]` y `BreadcrumbList` por sector) en `src/lib/seo.ts` y `src/lib/brands.ts`, e inyectarlos a través de `BaseLayout` / `<SEOHead />` en Home, Nosotros y los 3 hubs de sector, preservando el `BreadcrumbList` ya activo en los 44 silos de marca.

## Boundaries & Constraints

**Always:**
- Inyectar en `/` y `/nosotros` las entidades Schema.org `Organization` y `@type: ["HardwareStore", "WholesaleStore"]` vía prop `jsonLd` de `BaseLayout` → `<SEOHead />`.
- Usar estrictamente los datos corporativos vigentes: `name` / `legalName: "ASOEXI S.A.S."`, `alternateName: "ASOEXI"`, `taxID: "900480460-8"`, `url: "https://asoexi.com"`, `telephone: "+573014191344"`, `email: "serviciocliente@asoexi.com"`, `priceRange: "$$"`, `currenciesAccepted: "COP"`, `paymentAccepted: "Cash, Credit Card, Bank Transfer"`.
- Estructurar `PostalAddress` conforme a Schema.org válido (`streetAddress: "Carrera 55 A No. 51 A 28 Sur, Barrio Venecia"`, `addressLocality: "Bogotá"`, `addressRegion: "Bogotá D.C."`, `postalCode: "110611"`, `addressCountry: "CO"`), `GeoCoordinates` (`4.5899661`, `-74.1472122`), `hasMap: "https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6"`, `openingHoursSpecification` (L–V `07:30`–`16:30`, S `08:00`–`12:00`) y `areaServed` (Bogotá, Sabana de Bogotá, Colombia).
- Emitir `BreadcrumbList` con URLs canónicas absolutas `https://asoexi.com` en los 3 hubs de sector (`Inicio > [Sector]`), en `/nosotros` (`Inicio > Nosotros`) y mantener `Inicio > [Sector] > [Marca]` en los 44 silos de marca.
- Cumplir TDD estricto, `npm test` (`vitest run && astro check && tsc --noEmit`) y `npm run build` con 0 errores y 0 warnings.

**Never:**
- No emitir propiedades no reconocidas por Schema.org en `PostalAddress` (como `neighborhood`), para garantizar 0 errores en Schema Markup Validator y Rich Results Test.
- No exponer cuentas `@gmail.com`, líneas personales ni enlaces `tel:` en ningún bloque JSON-LD.
- No modificar estilos visuales, layout ni islas Preact, ni adelantar telemetría GA4 (5.3), GSC (5.4) o Google Ads (5.5).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Entidades institucionales | `generateInstitutionalSchemas()` | Arreglo `[Organization, HardwareStore/WholesaleStore]` con `@context`, `@id`, `PostalAddress`, `GeoCoordinates`, `openingHoursSpecification`, `areaServed` y parámetros comerciales | Fallback de `baseUrl` a `SITE_METADATA.siteUrl` |
| `baseUrl` no canónica | `'http://asoexi.com/'` o `'   '` | Normaliza `@id`, `url`, `logo` e `image` a `https://...` sin barras duplicadas | Fallback seguro a `https://asoexi.com` |
| Breadcrumbs de hub de sector | `buildSectorBreadcrumbs('electrico')` | `[{ name: 'Inicio', url: '/' }, { name: 'Sector Eléctrico', url: '/sector-electrico' }]` → `BreadcrumbList` 1-based con URLs absolutas | Sector inválido retorna solo `[{ name: 'Inicio', url: '/' }]` sin lanzar excepción |
| Ítems vacíos en `BreadcrumbList` | `[{ name: 'Inicio', url: '/' }, { name: '   ', url: '/x' }, { name: 'Marca' }]` | Filtra ítems con `name` vacío y renumera `position` secuencialmente (`1`, `2`) | Nunca emite `ListItem` sin `name` |
| Serialización segura en `<SEOHead />` | `jsonLd` con `<` o array con entradas `null` | Escapa `<` como `\u003c` y omite entradas nulas | Nunca genera HTML roto ni scripts vacíos |

</frozen-after-approval>

## Code Map

- `src/lib/constants.ts` -- Agregar `COMPANY_LOCATION` (calle, barrio Venecia, localidad, región `Bogotá D.C.`, `postalCode: '110611'`, `countryCode: 'CO'`, `geo: { latitude: 4.5899661, longitude: -74.1472122 }`, `googleMapsUrl: 'https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6'`) y `BUSINESS_COMMERCE_SCHEMA` (`priceRange`, `currenciesAccepted`, `paymentAccepted`, horarios estructurados, `areaServed`). No alterar contratos probados en `tests/unit/constants.test.ts`.
- `src/lib/seo.ts` -- Añadir interfaces y funciones puras `generateOrganizationSchema`, `generateLocalBusinessSchema` (`@type: ['HardwareStore', 'WholesaleStore']`) y `generateInstitutionalSchemas`; endurecer `generateBreadcrumbsSchema` filtrando `name` vacío antes de asignar `position`. Reutilizar `resolveCanonicalUrl` y `resolveOgImageUrl`.
- `src/lib/brands.ts` -- Añadir helper puro `buildSectorBreadcrumbs(sectorId)` reutilizando `SECTORS_META` (análogo a `buildBrandBreadcrumbs`). No alterar `buildBrandBreadcrumbs` ni `SECTOR_TECHNICAL_CONTENT`.
- `src/pages/index.astro` -- Pasar `jsonLd={generateInstitutionalSchemas()}` a `BaseLayout`.
- `src/pages/nosotros.astro` -- Pasar `jsonLd={[...generateInstitutionalSchemas(), generateBreadcrumbsSchema([{ name: 'Inicio', url: '/' }, { name: 'Nosotros', url: '/nosotros' }])]}` a `BaseLayout`.
- `src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro`, `src/pages/sector-hidraulico-pinturas.astro` -- Pasar `jsonLd={generateBreadcrumbsSchema(buildSectorBreadcrumbs(sectorId))}` a `BaseLayout`.
- `src/pages/distribuidor-[brand]-colombia.astro` -- Ya inyecta `BreadcrumbList` (`Inicio > Sector > [Marca]`) vía `buildBrandBreadcrumbs` + `generateBreadcrumbsSchema`; solo verificar en tests, sin cambios requeridos.
- `src/components/seo/SEOHead.astro` -- Ya soporta `jsonLd` objeto o arreglo y escapa `<` como `\u003c`; no requiere cambios salvo verificación en pruebas.
- `tests/unit/schema-jsonld.test.ts` *(nuevo)* -- Suite TDD para `Organization`, `HardwareStore`/`WholesaleStore`, `BreadcrumbList` de sectores/nosotros/marcas, casos borde y auditoría estática del HTML generado o plantillas de página.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/schema-jsonld.test.ts` -- Escribir tests TDD para generadores `Organization`, `HardwareStore`/`WholesaleStore`, `buildSectorBreadcrumbs`, filtrado de `name` vacío en `generateBreadcrumbsSchema`, ausencia de `neighborhood`/`@gmail.com` y cobertura de páginas -- Cumplir ciclo Red-Green-Refactor y matriz I/O.
- [x] `src/lib/constants.ts` -- Definir constantes estructuradas `COMPANY_LOCATION` y parámetros comerciales/horarios oficiales de ASOEXI S.A.S. -- Fuente única de verdad para Stories 5.2 y 5.4.
- [x] `src/lib/seo.ts` -- Implementar `generateOrganizationSchema`, `generateLocalBusinessSchema`, `generateInstitutionalSchemas` y filtrar `name` vacío en `generateBreadcrumbsSchema` -- Producir JSON-LD 100% conforme a Schema.org y Rich Results Test.
- [x] `src/lib/brands.ts` -- Implementar `buildSectorBreadcrumbs(sectorId)` -- Reutilizar `SECTORS_META` para jerarquía canónica de hubs de sector.
- [x] `src/pages/index.astro`, `src/pages/nosotros.astro` -- Inyectar `jsonLd` institucional (y `BreadcrumbList` en Nosotros) vía `BaseLayout` -- Exponer `Organization` y `HardwareStore`/`WholesaleStore` en HTML compilado.
- [x] `src/pages/sector-electrico.astro`, `src/pages/sector-ferretero-construccion.astro`, `src/pages/sector-hidraulico-pinturas.astro` -- Inyectar `BreadcrumbList` vía `BaseLayout` -- Completar la jerarquía `Inicio > Sector > [Marca]` en todo el catálogo.

**Acceptance Criteria:**
- Given el sitio compilado con `npm run build`, when se inspeccionan los bloques `<script type="application/ld+json">` de `index.html` y `nosotros/index.html`, then cada página contiene JSON válido parseable con `Organization` y `@type: ["HardwareStore", "WholesaleStore"]`, NIT `900480460-8`, `PostalAddress` en Barrio Venecia (`110611`, `CO`), `GeoCoordinates` (`4.5899661`, `-74.1472122`), `hasMap: "https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6"`, `+573014191344`, `serviciocliente@asoexi.com`, `priceRange: "$$"`, `currenciesAccepted: "COP"`, `paymentAccepted` y `areaServed`.
- Given cualquier hub de sector y cualquier silo de marca compilado, when se audita su `<script type="application/ld+json">`, then contiene `BreadcrumbList` válido con posiciones 1-based y URLs canónicas absolutas `https://asoexi.com` reflejando `Inicio > Sector` o `Inicio > Sector > [Marca]`.
- Given el marcado JSON-LD emitido en todas las páginas públicas, when se valida contra las reglas de Schema.org (`Organization`, `HardwareStore`, `WholesaleStore`, `BreadcrumbList`), then no existen campos requeridos faltantes ni propiedades desconocidas como `neighborhood`.

## Implementation Notes

- Definidas constantes `COMPANY_LOCATION` (incluyendo `googleMapsUrl: 'https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6'`) y `BUSINESS_COMMERCE_SCHEMA` en [constants.ts](../../src/lib/constants.ts).
- Implementados `generateOrganizationSchema`, `generateLocalBusinessSchema` (`@type: ["HardwareStore", "WholesaleStore"]` con `hasMap` y `parentOrganization`), `generateInstitutionalSchemas`, `normalizeBaseUrl` y filtrado de nombres vacíos en `generateBreadcrumbsSchema` en [seo.ts](../../src/lib/seo.ts).
- Añadido `buildSectorBreadcrumbs` en [brands.ts](../../src/lib/brands.ts) e inyectados los bloques JSON-LD en [index.astro](../../src/pages/index.astro), [nosotros.astro](../../src/pages/nosotros.astro) y los 3 hubs de sector ([sector-electrico.astro](../../src/pages/sector-electrico.astro), [sector-ferretero-construccion.astro](../../src/pages/sector-ferretero-construccion.astro), [sector-hidraulico-pinturas.astro](../../src/pages/sector-hidraulico-pinturas.astro)).
- Verificado con [schema-jsonld.test.ts](../../tests/unit/schema-jsonld.test.ts) (15 tests), `npm test` (16/16 archivos, 332/332 tests, 0 errores en `astro check` y `tsc --noEmit`) y `npm run build` con auditoría del HTML compilado en `dist/client/`.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind-hunter | Breadcrumbs visibles difieren de `BreadcrumbList` JSON-LD en hubs de sector y `/nosotros` | `false` | reject | El spec prohíbe modificar UI/layout visual y `/#sectores` es un ancla de `/` que duplicaría la URL raíz en `BreadcrumbList`. |
| 2 | blind-hunter | `buildSectorBreadcrumbs` no protege lookup contra claves de `Object.prototype` | `low` | patch | `SECTORS_META['constructor']` evalúa truthy y emite `url: '/undefined'`; corrección de 1 línea con `Object.hasOwn`. |
| 3 | blind-hunter | `normalizeBaseUrl` acepta URLs malformadas (`'http://'`) o sin esquema (`'asoexi.com'`) | `medium` | patch | Produce `@id`/`url` corruptos (`'http:/#organization'`); validar con `new URL(...)` y tomar origen `https:`. |
| 4 | blind-hunter | `generateBreadcrumbsSchema` resuelve `'#'`, `'?...'` o `'javascript:'` al dominio raíz o URI inválida | `medium` | patch | `getBrandSiloUrl('')` retorna `'#'` y `resolveCanonicalUrl('#')` lo convierte en `'https://asoexi.com/'`; omitir `item` en esos casos. |
| 5 | blind-hunter | Inconsistencia de barra final entre `url: 'https://asoexi.com'` y canónica `'https://asoexi.com/'` | `false` | reject | `url: "https://asoexi.com"` coincide exactamente con el contrato aprobado en el spec y valida al 100% en Schema.org. |
| 6 | blind-hunter | Constantes corporativas duplicadas, lookup posicional de teléfono y `neighborhood` sin usar | `false` | reject | `CONTACT_PHONES` tiene longitud 1 garantizada por tests, `COMPANY_LOCATION.neighborhood` prepara Story 5.4, `openingHours` usa formato Schema.org y `'/og-image.jpg'` respeta `baseUrl`. |
| 7 | blind-hunter | Falta `publicAccess: false` en `LocalBusiness` para operación sin mostrador | `low` | patch | Propiedad estándar de `schema.org/Place` alineada con la política logística inviolable sin venta presencial; adición directa de 1 línea. |
| 8 | blind-hunter | Firmas `[key: string]: unknown` en `SchemaOrganization` y `SchemaLocalBusiness` debilitan TypeScript | `low` | patch | Deshabilitan excess-property checking en literales de retorno; eliminación directa de 2 líneas. |
| 9 | blind-hunter | Tests de plantillas solo validan substrings y faltan casos borde en unit tests | `medium` | patch | Misma causa raíz que #10 en verificación de plantillas y cobertura faltante de casos borde; corregir en `schema-jsonld.test.ts`. |
| 10 | verification-gap | Inyección de JSON-LD en páginas y `<SEOHead>` verificada solo con substrings de fuente | `medium` | patch | Pre-verificado; reforzar aserciones de enlace exacto incluyendo `BaseLayout.astro` y validar bloques `<script type="application/ld+json">` parseados cuando exista `dist/client/`. |
| 11 | verification-gap | Campos `contactPoint` y `areaServed` de `generateOrganizationSchema` sin aserciones | `low` | patch | Pre-verificado; añadir aserciones `toEqual` sobre `org.contactPoint` y `org.areaServed` en `schema-jsonld.test.ts`. |
| 12 | edge-case-hunter | Lookup de clave prototipo (`'constructor'`, `'__proto__'`) en `buildSectorBreadcrumbs` | `low` | patch | Misma causa raíz que #2; resuelto con `Object.hasOwn(SECTORS_META, normalized)`. |
| 13 | edge-case-hunter | `normalizeBaseUrl` acepta `'http://'`/`'https://'` o URL sin protocolo | `medium` | patch | Misma causa raíz que #3; resuelto validando con `new URL(...)` y origen `https:`. |

## Design Notes

- **Compatibilidad Schema.org en `PostalAddress`:** La propiedad `neighborhood` no existe en el vocabulario oficial de `https://schema.org/PostalAddress` y provoca error en Schema Markup Validator. Se incluye `"Barrio Venecia"` dentro de `streetAddress` (`"Carrera 55 A No. 51 A 28 Sur, Barrio Venecia"`), preservando la señal geográfica exacta con 0 errores de validación.
- **Vinculación de entidades:** `Organization` (`@id: https://asoexi.com/#organization`) y `["HardwareStore", "WholesaleStore"]` (`@id: https://asoexi.com/#localbusiness`) se enlazan mediante `parentOrganization: { "@id": "https://asoexi.com/#organization" }` y se emiten como bloques independientes en `jsonLd` de `<SEOHead />`.

## Verification

**Commands:**
- `npm test` -- expected: 100% Vitest en verde, 0 errores en `astro check` y `tsc --noEmit`.
- `npm run build` -- expected: compilación SSG exitosa generando `dist/client/` con bloques `application/ld+json` válidos en Home, Nosotros, los 3 hubs de sector y los 44 silos de marca.
