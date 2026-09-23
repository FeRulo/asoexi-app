# Project Context — asoexi-app

## Principios y Metodología de Desarrollo

### 1. Metodología TDD (Test-Driven Development) Estricta
- **Ciclo Red-Green-Refactor:** Para cada funcionalidad, utilidad, store o componente, los tests unitarios deben concebirse y escribirse **antes** o a la par con la implementación de producción.
- **Runner de Pruebas:** `Vitest` es el ejecutor oficial de tests unitarios e integración para el proyecto.
- **Criterio de Entrega:** Ninguna historia de usuario se considera lista o aprobada si no cuenta con tests unitarios correspondientes y pasa limpiamente la ejecución de `npm test` (`vitest run`) y `npm run build`.

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
  - Geraldine: `+57 318 639 7212`
  - Sonia Franco: `+57 320 449 8881`
  - Línea Corporativa: `+57 304 401 3761`
- **Correos Oficiales:** `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`, `servicioclienteasoexi@gmail.com`.
- **Sede Administrativa:** Carrera 55 A No. 51 A 28 Sur, Bogotá.
- **Política Logística Inviolable:** Despacho 100% a domicilio en obra y empresas. No existe venta presencial por mostrador ni retiro en bodega.
- **Mínimos de Despacho:** Bogotá desde $50.000 COP; Sabana según municipio ($100.000 - $300.000 COP).
- **Crédito Comercial:** Hasta 45 días para empresas registradas y validadas con RUT.

### 4. Convenciones de Git y Documentación
- **Mensajes de Commit Referenciando Specs:** Todo mensaje de commit en el flujo de desarrollo debe incluir una referencia explícita al spec de la historia correspondiente (ej. `feat(spec-1-1): ...`, `fix(spec-1-1): ...`, `refactor(spec-1-1): ...`).
- **Mantenimiento del README.md:** Mantener actualizado continuamente `README.md` con los requisitos de entorno (Node >=22), comandos vigentes para desarrollo (`npm run dev`), pruebas unitarias (`npm test`) y compilación de producción (`npm run build`).

