# Project Context — asoexi-app

## Principios y Metodología de Desarrollo

### 1. Metodología TDD (Test-Driven Development) Estricta
- **Ciclo Red-Green-Refactor:** Para cada funcionalidad, utilidad, store o componente, los tests unitarios deben concebirse y escribirse **antes** o a la par con la implementación de producción.
- **Runner de Pruebas y Diagnósticos:** `Vitest` es el ejecutor oficial de tests unitarios e integración; `@astrojs/check` (`astro check`) y TypeScript (`tsc --noEmit`) auditan la integridad estricta de tipos e interfaces en componentes `.astro`, `.tsx` y `.ts`.
- **Criterio de Entrega:** Ninguna historia de usuario se considera lista o aprobada si no cuenta con tests unitarios correspondientes, pasa limpiamente la ejecución de `npm test` (`vitest run && astro check && tsc --noEmit`), compila con `npm run build` y registra estrictamente 0 errores y 0 warnings en los diagnósticos de TypeScript/Astro (panel Problems de VS Code limpio).

### 2. Invariantes de Arquitectura, Rendimiento y Estética Visual
- **Arquitectura de Islas:** Generación estática pura (SSG) en Astro con 0 KB de JavaScript cliente por defecto.
- **Islas Preact:** La interactividad reside exclusivamente en `src/islands/` montada con directivas cliente explícitas (`client:idle`, `client:visible`).
- **Diseño con Tailwind CSS v4:** Tokens corporativos declarados en `src/styles/global.css` mediante `@theme`.
- **Estética de Precisión Industrial con Geometría Angular a 45° (Regla de Brochure ASOEXI):**
  - Token centralizado `--radius-industrial`: declarado en `@theme` de `src/styles/global.css` (que genera la clase de utilidad `rounded-industrial`) para gobernar de forma única el radio de curvatura en botones, tarjetas, badges, inputs y contenedores.
  - Integración de la diagonal institucional a 45° (inspirada en la portada del brochure y flecha del logo) en remates de iconos de CTAs principales (`.icon-diagonal-45`) y composición geométrica del Hero.
  - Áreas táctiles estrictamente accesibles (≥ 48px de altura) sin deformación ni corte de textos.
  - Sensación visual: suministro industrial pesado, ingeniería, solvencia técnica B2B y aristas manufacturadas de precisión.
- **Accesibilidad y Móvil:** Cumplimiento WCAG 2.2 AA (áreas táctiles ≥ 48x48px, ratios de contraste verificados).

### 3. Invariantes de Negocio y Datos Oficiales de ASOEXI S.A.S.
- **Razón Social:** ASOEXI S.A.S. | **NIT:** 900480460-8.
- **Canales de Contacto:**
  - Línea Corporativa Oficial (Llamadas y WhatsApp): `+57 301 419 1344`
  - Equipo Comercial de Atención y Cotizaciones: Geraldine y Sonia Franco
- **Correos Oficiales:** `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`, `serviciocliente@asoexi.com`.
- **Sede Administrativa:** Carrera 55 A No. 51 A 28 Sur, Bogotá.
- **Política Logística Inviolable:** Despacho 100% a domicilio en obra y empresas. No existe venta presencial por mostrador ni retiro en bodega.
- **Mínimos de Despacho:** Bogotá desde $200.000 COP; Sabana según municipio accesible.
- **Crédito Comercial:** Hasta 45 días para empresas registradas y validadas con RUT.

### 4. Convenciones de Git y Documentación
- **Rama Oficial de Desarrollo (`dev`):** Todo el desarrollo activo, implementación de historias y cambios se realizan sobre la rama `dev`. Queda prohibido trabajar o cometer directamente sobre `master` salvo procesos de release final.
- **Commit y Push en Rama `dev`:** Al completar o verificar una historia, fix o tarea en el flujo de desarrollo, se deben realizar de manera obligatoria y ordenada los commits respectivos y el posterior `git push origin dev` (o upstream correspondiente) para mantener sincronizado el repositorio remoto.
- **Mensajes de Commit Referenciando Specs:** Todo mensaje de commit en el flujo de desarrollo debe incluir una referencia explícita al spec de la historia correspondiente (ej. `feat(spec-1-1): ...`, `fix(spec-1-1): ...`, `refactor(spec-1-1): ...`).
- **Mantenimiento del README.md:** Mantener actualizado continuamente `README.md` con los requisitos de entorno (Node >=22), comandos vigentes para desarrollo (`npm run dev`), pruebas unitarias (`npm test`) y compilación de producción (`npm run build`).

### 5. Mecanismo Obligatorio de Cero Problemas en VS Code (Zero-Diagnostics)
- **Ejecución Automatizada en Cada Spec:** Todo ciclo de desarrollo (`bmad-build`) debe ejecutar `npm test` al verificar la historia. Al estar conectado a `vitest run && astro check && tsc --noEmit`, cualquier error de tipado o propiedad faltante en componentes `.astro` o archivos `.ts` detendrá el proceso de inmediato.
- **Compilación Blindada:** `npm run build` corre automáticamente `astro check && astro build` asegurando que no se generen artefactos si existen diagnósticos pendientes.
- **Configuración Workspace de VS Code:** El archivo `.vscode/settings.json` asegura que el editor utilice siempre el SDK de TypeScript del repositorio (`node_modules/typescript/lib`) y el servidor de lenguaje oficial de Astro.


