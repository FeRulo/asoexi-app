---
title: 'Actualización de Línea Corporativa Oficial de ASOEXI (+57 301 419 1344)'
type: 'chore'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - 'docs/project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La línea corporativa oficial para llamadas telefónicas y WhatsApp registrada en el sistema (+57 304 401 3761) requiere ser actualizada por el nuevo número institucional (+57 301 419 1344).

**Approach:** Actualizar de manera centralizada la constante del número corporativo en `src/lib/constants.ts`, actualizar referencias y documentación en `src/lib/whatsapp.ts` y `docs/project-context.md`, y sincronizar los tests unitarios correspondientes garantizando 100% de cobertura y cero diagnósticos.

</frozen-after-approval>

## Implementation Notes

- Modificado `src/lib/constants.ts`: actualizado `CONTACT_PHONES` con `e164: '+573014191344'` y `display: '+57 301 419 1344'`.
- Modificado `src/lib/whatsapp.ts`: JSDoc actualizado para referenciar `CONTACT_PHONES` dinámicamente y desacoplar literales numéricos.
- Modificado `docs/project-context.md`: actualizada la sección de invariantes comerciales con la nueva Línea Corporativa Oficial.
- Actualizado `tests/unit/constants.test.ts`: sincronizadas las aserciones de `corporate.e164` y `corporate.display`, y añadidas aserciones negativas contra el número legado `304 401 3761`.
- Actualizado `tests/unit/whatsapp.test.ts`: sincronizadas las aserciones de sanitización y URLs profundas para el nuevo número, agregada prueba de resiliencia ante múltiples prefijos móviles colombianos (310, 318, 320, 300) y aserción negativa de no presencia del número legado.
- Verificación completa: `npm test` (`vitest run && astro check && tsc --noEmit`) con 61 tests aprobados y 0 errores/warnings, y `npm run build` completado exitosamente.

## Review Triage Log

- finding: `spec leaves ## Implementation Notes blank and retains status: 'in-progress'` | verdict: `false` | evidence: Desestimado por prematuro; el ciclo de vida oneshot actualiza las notas y el status a 'done' durante el paso Finalize Spec tras la revisión.
- finding: `spec remains untracked in git` | verdict: `false` | evidence: Desestimado por prematuro; la convención de git añade y confirma todos los artefactos de la especificación en el paso Commit.
- finding: `src/lib/whatsapp.ts contains hardcoded phone literals in JSDoc comments` | verdict: `low` | evidence: Se aplicó patch desacoplando los literales numéricos y referenciando la constante `CONTACT_PHONES`.
- finding: `tests/unit/constants.test.ts and tests/unit/whatsapp.test.ts lack negative regression assertions` | verdict: `medium` | evidence: Se aplicó patch agregando aserciones negativas explícitas para asegurar que `+573044013761` / `304 401 3761` no esté presente en `CONTACT_PHONES`, `WHATSAPP_ADVISORS` ni URLs.
- finding: `tests/unit/whatsapp.test.ts replaces sanitization test inputs exclusively with 3014191344` | verdict: `low` | evidence: Se aplicó patch ampliando los tests de sanitización con prefijos móviles colombianos adicionales (310, 318, 320, 300).
- finding: `docs/out/cotización.pdf still contains references to old 304 line` | verdict: `false` | evidence: Desestimado; `docs/out/` contiene archivos binarios y notas históricas de la fase de descubrimiento inicial (agosto 2026), fuera del código y runtime de la aplicación.
