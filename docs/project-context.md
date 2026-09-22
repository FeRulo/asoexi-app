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
- **Estética Filuda e Industrial (Regla de Brochure ASOEXI):**
  - Cero bordes suaves o redondeados genéricos tipo SaaS (`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` están prohibidos en botones, tarjetas y contenedores estructurales).
  - Botones, tarjetas, badges y contenedores deben ser filudos, rectos y angulares (`rounded-none`), con bordes técnicos o cortes geométricos en chaflán a 45° inspirados en la portada del brochure de ASOEXI.
  - Sensación visual: suministro industrial pesado, ingeniería, solvencia técnica B2B y aristas sólidas.
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

