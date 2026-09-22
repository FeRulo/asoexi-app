# ASOEXI S.A.S. — Plataforma Web Institucional B2B

Plataforma web de distribución mayorista de insumos industriales, eléctricos, ferreteros e hidráulicos para **ASOEXI S.A.S.** (NIT 900480460-8).

Desarrollada bajo arquitectura de islas con **Astro 7**, **Preact**, **Tailwind CSS v4** y metodología **TDD estricta con Vitest**.

---

## 📋 Requisitos Previos

- **Node.js**: Versión `>= 22.12.0` (Astro 7 requiere Node 22 o superior).
- **Gestor de versiones (opcional pero recomendado)**: Si utilizas `nvm`, el repositorio incluye `.nvmrc`:
  ```bash
  nvm use
  ```
  *(o `nvm install 22 && nvm use` si aún no tienes instalada la versión 22).*
- **npm** o gestor compatible.

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd asoexi-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

---

## 🧪 Pruebas Automatizadas (TDD)

El proyecto sigue una metodología estricta de desarrollo guiado por pruebas (**TDD**). Toda nueva funcionalidad, contrato fiscal o componente interactivo cuenta con tests unitarios.

- **Ejecutar todas las pruebas una vez:**
  ```bash
  npm test
  ```
  *(Ejecuta `vitest run` resolviendo path aliases `@/*` y contratos corporativos).*

- **Ejecutar pruebas en modo interactivo / observador (watch):**
  ```bash
  npx vitest
  ```

---

## 💻 Desarrollo Local

Para iniciar el servidor de desarrollo local con recarga rápida en caliente (HMR):

```bash
npm run dev
```

El portal estará disponible por defecto en: [http://localhost:4321](http://localhost:4321).

---

## 🏗️ Compilación para Producción (SSG)

El sitio compila en modo estático puro (`output: 'static'`) sin dependencias de base de datos activa para las rutas públicas:

```bash
npm run build
```

La salida generada se almacena en el directorio `dist/`.

Para previsualizar localmente la versión de producción compilada:

```bash
npm run preview
```

---

## 📐 Convenciones y Principios del Proyecto

1. **Mensajes de Commit:**
   - Todos los commits del flujo de desarrollo deben referenciar explícitamente el spec en desarrollo.
   - Formato estándar: `feat(spec-X-Y): descripción` o `fix(spec-X-Y): descripción` (ej. `feat(spec-1-1): setup base de astro 7 y layout`).

2. **Diseño y Tokens Corporativos (Tailwind CSS v4):**
   - Los estilos corporativos residen en `src/styles/global.css` mediante la directiva `@theme`.
   - Paleta oficial: Rojo ASOEXI `#E51A24` (`primary`), Antracita `#1E2229` (`secondary`), Superficie `#FFFFFF`, WhatsApp `#25D366`, Ámbar Industrial `#F59E0B`.
   - Tipografías: Montserrat (titulares) e Inter (cuerpo de texto).

3. **Invariantes Institucionales:**
   - **Datos de Contacto:** Definidos canónicamente en `src/lib/constants.ts`.
   - **Teléfonos:** Formato estricto E.164 (`tel:+57...`) con áreas táctiles accesibles (≥ 48x48px, WCAG 2.2 AA).
   - **Aviso Logístico Obligatorio:** *"Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)"*.
