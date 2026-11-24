---
title: 'Story 5.4: Verificación en Google Search Console, SEO On-Page Local (Bogotá / Venecia) y Google Business Profile'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
baseline_commit: '5418c832a2930e27c71b59af26c80cf66b476743'
review_loop_iteration: 0
context:
  - '{project-root}/docs/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `<SEOHead />` no emite la meta-etiqueta de verificación de Google Search Console, `Footer` y `Nosotros` no explicitan el Barrio Venecia ni enlazan la ficha verificada de Google Business Profile, y `Home` y `Nosotros` aún no incorporan las señales semánticas locales B2B de Bogotá y el sur de la ciudad.

**Approach:** Añadir verificación configurable de Google Search Console (`PUBLIC_GOOGLE_SITE_VERIFICATION`) con sanitización estricta en `src/lib/seo.ts` y `<SEOHead />`, centralizar el contrato local y de Google Business Profile en `src/lib/constants.ts`, actualizar `Footer.astro` y `nosotros.astro` con ubicación en Barrio Venecia, política sin mostrador y enlace a GBP, e integrar los términos locales B2B en `index.astro` y `nosotros.astro`.

## Boundaries & Constraints

**Always:**
- Emitir `<meta name="google-site-verification" content="..." />` en `<SEOHead />` solo cuando `PUBLIC_GOOGLE_SITE_VERIFICATION` (o prop `gscVerificationToken`) cumpla `/^[A-Za-z0-9_-]{10,128}$/`.
- Mostrar en `Footer.astro` y `src/pages/nosotros.astro`: *"Sede administrativa y logística: Carrera 55 A No. 51 A 28 Sur, Barrio Venecia, Bogotá D.C."* y *"Despacho centralizado a domicilio a obras y bodegas en Bogotá y Sabana — Sin venta de mostrador ni retiro en bodega"*.
- Enlazar `COMPANY_LOCATION.googleMapsUrl` (`https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6`) desde `Footer.astro` y `nosotros.astro` con `min-h-[48px]`, `target="_blank"` y `rel="noopener noreferrer"`.
- Definir `GOOGLE_BUSINESS_PROFILE` en `src/lib/constants.ts` con categorías (*Ferretería*, *Proveedor de equipos industriales*), cobertura (*Bogotá*, *Sabana de Bogotá*) y URL atribuida `https://asoexi.com/?utm_source=gbp&utm_medium=organic&utm_campaign=local` (normalizable por `resolveCanonicalUrl` a `https://asoexi.com/`).
- Incorporar naturalmente en metadatos y textos de `index.astro` y `nosotros.astro`: *"distribuidor ferretero bogotá"*, *"proveedor de insumos industriales venecia bogotá"* y *"materiales eléctricos sur de bogotá"*.
- Preservar intactos `LOGISTIC_NOTICE`, `COMPANY_INFO`, `SITE_METADATA`, `ABOUT_DATA` y los clústeres de Story 5.1; pasar `npm test` y `npm run build` con 0 errores y 0 warnings.

**Never:**
- No emitir meta `google-site-verification` vacía ni aceptar caracteres HTML/espacios.
- No añadir enlaces `tel:`, cuentas `@gmail.com`, iframes pesados de Google Maps ni lógica de Google Ads (Story 5.5).
- No alterar `LOGISTIC_NOTICE` ni romper suites existentes (`constants.test.ts`, `nosotros-data.test.ts`, `sitemap-aeo.test.ts`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Token GSC válido | `'  abcDEF_0123456789-xyz  '` | Retorna `'abcDEF_0123456789-xyz'`; `<SEOHead />` emite `<meta name="google-site-verification" ... />` | N/A |
| Token GSC vacío/ausente | `undefined`, `null`, `''`, `'   '` | Retorna `null`; `<SEOHead />` omite la etiqueta | Omisión silenciosa |
| Token GSC inválido/inyección | `'" /><script>'`, `'corto'`, `'con espacio'` | Retorna `null`; `<SEOHead />` omite la etiqueta | Rechaza fuera de `[A-Za-z0-9_-]{10,128}` |
| URL GBP con UTM | `'https://asoexi.com/?utm_source=gbp&utm_medium=organic&utm_campaign=local'` | `resolveCanonicalUrl` retorna `'https://asoexi.com/'` | Evita duplicado canónico |

</frozen-after-approval>

## Code Map

- `src/env.d.ts` -- Añadir `readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;` a `ImportMetaEnv`.
- `src/lib/constants.ts` -- Mantener `LOGISTIC_NOTICE`, `COMPANY_INFO`, `COMPANY_LOCATION`. Añadir `LOCAL_HEADQUARTERS_ADDRESS`, `LOCAL_DELIVERY_POLICY` y `GOOGLE_BUSINESS_PROFILE`. Enriquecer `ABOUT_DATA.logistics.headquartersAddress` (Barrio Venecia) y `ABOUT_DATA.history.paragraphs` con señal local.
- `src/lib/seo.ts` -- Exportar `sanitizeGscVerificationToken(raw?: string | null): string | null`.
- `src/components/seo/SEOHead.astro` -- Aceptar `gscVerificationToken?: string | null` (fallback `import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION`) y renderizar condicionalmente `<meta name="google-site-verification" content={gscVerification} />`.
- `src/components/common/Footer.astro` -- Actualizar Columna 1 con dirección en Barrio Venecia, política de despacho centralizado sin mostrador y enlace accesible a Google Business Profile.
- `src/pages/nosotros.astro` -- Actualizar `pageDescription`, banner logístico y sección de contacto con Barrio Venecia, política operativa, enlace GBP y términos locales B2B.
- `src/pages/index.astro` -- Integrar términos locales B2B en `description` y bloque `#sectores` preservando el clúster de Story 5.1.
- `tests/unit/local-seo-gbp.test.ts` *(nuevo)* -- Suite TDD para `sanitizeGscVerificationToken`, `GOOGLE_BUSINESS_PROFILE`, `SEOHead.astro`, `Footer.astro`, `nosotros.astro`, `index.astro` y HTML compilado en `dist/client/`.

## Tasks & Acceptance

**Execution:**
- [x] `tests/unit/local-seo-gbp.test.ts` -- Crear tests TDD para matriz I/O de `sanitizeGscVerificationToken`, contrato GBP/UTM, `<SEOHead />`, `Footer.astro`, `nosotros.astro` e `index.astro` -- Asegurar ciclo Red-Green-Refactor.
- [x] `src/env.d.ts` -- Declarar `PUBLIC_GOOGLE_SITE_VERIFICATION` en `ImportMetaEnv` -- Tipar variable pública GSC.
- [x] `src/lib/constants.ts` -- Exportar `LOCAL_HEADQUARTERS_ADDRESS`, `LOCAL_DELIVERY_POLICY`, `GOOGLE_BUSINESS_PROFILE` y enriquecer `ABOUT_DATA` -- Fuente única de verdad NAP/GBP.
- [x] `src/lib/seo.ts` -- Implementar `sanitizeGscVerificationToken` -- Validación pura anti-inyección del token GSC.
- [x] `src/components/seo/SEOHead.astro` -- Inyectar condicionalmente `<meta name="google-site-verification" ... />` -- Verificación GSC sin etiquetas vacías.
- [x] `src/components/common/Footer.astro` -- Mostrar sede en Barrio Venecia, política sin mostrador y enlace accesible a Google Business Profile -- Coherencia NAP y confianza local global.
- [x] `src/pages/nosotros.astro` -- Actualizar metadatos, banner logístico y enlace GBP con señal local Venecia/Bogotá -- Validar legitimidad física y operativa.
- [x] `src/pages/index.astro` -- Integrar términos locales B2B en `description` y `#sectores` conservando clústeres 5.1 -- Captar búsquedas locales en Bogotá y sur de Bogotá.

**Acceptance Criteria:**
- Given `PUBLIC_GOOGLE_SITE_VERIFICATION` con token válido en compilación, when se inspeccionan `index.html` y `nosotros/index.html`, then incluyen `<meta name="google-site-verification" content="<token>">`, y lo omiten si está ausente o inválido.
- Given `index.html` y `nosotros/index.html` compilados, when se revisan `Footer` y `Nosotros`, then exponen *"Carrera 55 A No. 51 A 28 Sur, Barrio Venecia, Bogotá D.C."*, la política de despacho centralizado sin mostrador ni retiro en bodega, y enlaces accesibles a `https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6`.
- Given `index.html` y `nosotros/index.html` compilados, when un rastreador indexa su contenido y metadatos, then identifica los términos locales B2B (*distribuidor ferretero bogotá*, *proveedor de insumos industriales venecia bogotá*, *materiales eléctricos sur de bogotá*) y mantiene canónica limpia ante `?utm_source=gbp&utm_medium=organic&utm_campaign=local`.

## Implementation Notes

- Declarada `PUBLIC_GOOGLE_SITE_VERIFICATION` en [env.d.ts](../../src/env.d.ts) e implementada `sanitizeGscVerificationToken` en [seo.ts](../../src/lib/seo.ts) con inyección condicional en [SEOHead.astro](../../src/components/seo/SEOHead.astro).
- Definidos `LOCAL_HEADQUARTERS_ADDRESS`, `LOCAL_DELIVERY_POLICY` y `GOOGLE_BUSINESS_PROFILE` en [constants.ts](../../src/lib/constants.ts), enriqueciendo `ABOUT_DATA` y actualizando [Footer.astro](../../src/components/common/Footer.astro), [nosotros.astro](../../src/pages/nosotros.astro) e [index.astro](../../src/pages/index.astro) con NAP de Barrio Venecia, enlaces accesibles a GBP y términos locales B2B.
- Verificado con [local-seo-gbp.test.ts](../../tests/unit/local-seo-gbp.test.ts) (13 tests), build con y sin `PUBLIC_GOOGLE_SITE_VERIFICATION`, `npm test` (18 archivos, 370/370 tests, 0 errores en `astro check` y `tsc --noEmit`).

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | edge-case-hunter | `nosotros/index.html` se omite silenciosamente con `continue` si falta en `dist/client/` | `medium` | patch | Verificado en `tests/unit/local-seo-gbp.test.ts:174-175`; reemplazar `if (!fs.existsSync(fullPath)) continue;` por aserción explícita `expect(fs.existsSync(fullPath)).toBe(true)`. |
| 2 | blind-hunter | Meta descriptions > 160 caracteres en `index.astro` (233) y `nosotros.astro` (238) truncan propuesta de valor en SERPs | `low` | patch | Verificado en `src/pages/index.astro:15` y `src/pages/nosotros.astro:17-18`; acortar `description` a ~155-160 caracteres preservando todos los términos locales B2B en el contenido visible y metadatos. |
| 3 | blind-hunter | Aviso redundante `{LOCAL_DELIVERY_POLICY}. {ABOUT_DATA.logistics.noCounterNotice}.` en `nosotros.astro` | `low` | patch | Verificado en `src/pages/nosotros.astro:292`; repite despacho a domicilio y sin mostrador dos veces seguidas en el mismo `<p>`. Dejar solo `{LOCAL_DELIVERY_POLICY}.` en ese bloque. |
| 4 | blind-hunter | `GOOGLE_BUSINESS_PROFILE` sin uso en `src/` y `attributedWebsiteUrl` hardcodea dominio | `low` | patch | Verificado en `src/lib/constants.ts`, `Footer.astro` y `nosotros.astro`; consumir `GOOGLE_BUSINESS_PROFILE.mapsUrl` y construir `attributedWebsiteUrl` desde `SITE_METADATA.siteUrl` (mantener `serviceAreas: ['Bogotá', 'Sabana de Bogotá']` por spec). |
| 5 | blind-hunter | Duplicación literal de `LOCAL_HEADQUARTERS_ADDRESS` y `ABOUT_DATA.logistics.noCounterNotice` en `constants.ts` | `low` | patch | Verificado en `src/lib/constants.ts`; componer `LOCAL_HEADQUARTERS_ADDRESS` desde `COMPANY_LOCATION` y referenciar `LOGISTIC_NOTICE` en `ABOUT_DATA.logistics.noCounterNotice`. |
| 6 | blind-hunter | `gscVerificationToken` no se reenvía desde `BaseLayout.astro` y `PUBLIC_GOOGLE_SITE_VERIFICATION` no está en `README.md` | `false` | reject | La verificación GSC es a nivel de dominio vía variable de entorno; `BaseLayout.astro` no requiere prop por página y el spec no exige cambios en `README.md`. |
| 7 | blind-hunter | Falta estilo de foco accesible (`focus:ring-2`) en el enlace GBP de `Footer.astro` | `low` | patch | Verificado en `src/components/common/Footer.astro:36-41`; añadir `focus:outline-none focus:ring-2 focus:ring-primary` en consistencia con `nosotros.astro` y WCAG 2.2 AA. |
| 8 | blind-hunter | `sanitizeGscVerificationToken` falla silenciosamente sin `console.warn` | `false` | reject | La matriz I/O congelada del spec exige que la función pura retorne `null` y `<SEOHead />` omita la etiqueta silenciosamente ante tokens inválidos. |
| 9 | blind-hunter | Brechas de cobertura en `tests/unit/local-seo-gbp.test.ts` (skip silencioso, regex débil, sin ejecución de `SEOHead`) | `medium` | patch | Misma causa raíz que #1 y #10; reforzar regex de meta GSC para detectar `content` vacío/espacios en cualquier orden y cubrir resolución de token en `SEOHead`. |
| 10 | verification-gap | Renderizado condicional de `google-site-verification` en `SEOHead.astro` nunca ejecutado en tests | `medium` | patch | Pre-verificado; extraer helper puro `resolveGscVerificationToken(prop, env)` probado en unidad y/o validar render de `SEOHead.astro` para precedencia prop vs env, token válido e inválido. |
| 11 | verification-gap | `package.json` `verify` corre `vitest run` antes de `astro build` (auditoría `dist/client/` audita build previo o hace skip) | `medium` | defer | Pre-verificado; comportamiento preexistente de `package.json` compartido por toda la Epic 5 (`schema-jsonld`, `analytics`, `local-seo-gbp`); diferir a `deferred-work.md`. |
| 12 | verification-gap | Aserción `gbpAnchors.length >= 1` en `nosotros/index.html` queda satisfecha solo con `Footer.astro` | `medium` | patch | Pre-verificado; en `tests/unit/local-seo-gbp.test.ts` exigir `gbpAnchors.length >= 3` en `nosotros/index.html` y `>= 2` dentro de `<main>...</main>`. |

## Design Notes

- **Sin iframe de Google Maps:** El enlace liviano hacia `COMPANY_LOCATION.googleMapsUrl` (`hasMap` en Schema.org) protege LCP (< 1.5 s) y CLS (< 0.05) frente a iframes externos.
- **Atribución UTM GBP:** `GOOGLE_BUSINESS_PROFILE.attributedWebsiteUrl` documenta la URL de entrada desde Google Business Profile; `resolveCanonicalUrl` elimina los parámetros UTM para evitar duplicación de índice.

## Verification

**Commands:**
- `npm test` -- expected: 100% Vitest en verde, 0 errores en `astro check` y `tsc --noEmit`.
- `npm run build` -- expected: compilación SSG exitosa en `dist/client/` con `index.html` y `nosotros/index.html` verificados.
