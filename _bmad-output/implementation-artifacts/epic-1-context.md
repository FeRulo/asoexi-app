# Epic 1 Context: Identidad Corporativa, Hero, Prueba Social y Canales de Contacto Directo

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Establecer la plataforma base de ASOEXI en Astro 7 con Tailwind CSS v4, consolidando la presencia digital mayorista y la identidad visual de la marca. Permite a compradores corporativos, analistas de adquisiciones y residentes de obra verificar de inmediato la trayectoria y credibilidad de la empresa (7+ años abasteciendo grandes compañías, crédito a 45 días, entregas en Bogotá en 24-48h y urgencias en 6h, marcas 100% originales con factura electrónica y clientes destacados como Casalimpia y Unicentro), asimilar la política operativa de despacho exclusivo a domicilio sin venta en mostrador, y comunicarse a un toque vía telefónica directa o WhatsApp con balanceo dinámico de carga entre las asesoras comerciales oficiales.

## Stories

- Story 1.1: Setup Base de Astro 7, Tokens de Diseño Tailwind v4, Header y Footer Institucional
- Story 1.2: Hero Banner Institucional, Pilares de Confianza y Grilla Normalizada de Clientes Corporativos
- Story 1.3: Selector Interactivo de Canales de Contacto con Balanceo Inteligente y Botón WhatsApp
- Story 1.4: Página Institucional "Nosotros", Protocolos Operativos y Metadatos Open Graph

## Requirements & Constraints

- Plataforma estática SSG sobre Astro 7 con `@astrojs/preact` y `@tailwindcss/vite`, configurada para Cloudflare Pages sin base de datos activa para páginas públicas.
- Políticas y datos corporativos oficiales:
  - Razón social: ASOEXI S.A.S. | NIT: 900480460-8.
  - Sede administrativa: Carrera 55 A No. 51 A 28 Sur, Bogotá (aclaración obligatoria: no hay atención por mostrador ni entrega en bodega).
  - Horarios comerciales: Lunes a Viernes 7:30 - 16:30, Sábados 8:00 - 12:00.
  - Líneas oficiales: Geraldine (`+57 318 639 7212`), Sonia Franco (`+57 320 449 8881`), Línea Corporativa (`+57 304 401 3761`).
  - Correos oficiales: `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`, `servicioclienteasoexi@gmail.com`.
  - Logística: Despacho a domicilio 100%. Pedido mínimo Bogotá $50.000 COP; Sabana de Bogotá según municipio ($100.000 a $300.000 COP).
- 5 Pilares de Confianza visibles en Home:
  1. Entregas en Bogotá en 24-48h y 6h urgencias en obra.
  2. Crédito comercial de hasta 45 días para empresas.
  3. Marcas 100% originales con fichas técnicas, garantías y facturación electrónica.
  4. Despachos desde $50.000 COP en Bogotá y fletes económicos en Sabana.
  5. Modelo logístico 100% a domicilio sin mostrador.
- Clientes corporativos clave para Social Proof: Casalimpia, Centro Comercial Andino, Centro Comercial Unicentro, Winner Group, Multiplika.
- Estándares de calidad web: TTFB < 200ms, LCP < 1.5s, Core Web Vitals > 90 móvil y > 98 desktop; accesibilidad WCAG 2.2 AA (áreas táctiles ≥48x48px y contraste de color validado).

## Technical Decisions

- Stack base: Astro 7 (`output: 'static'`), Tailwind CSS v4, Preact para islas interactivas (`@astrojs/preact`), TypeScript estricto.
- Estructura de carpetas:
  - `src/components/common/`: Componentes estructurales reutilizables (`Header.astro`, `Footer.astro`).
  - `src/components/home/`: Secciones de página de inicio (`Hero.astro`, `ValuePillars.astro`, `ClientLogos.astro`).
  - `src/components/seo/`: Inyección de metadatos (`SEOHead.astro`).
  - `src/islands/`: Componentes interactivos Preact (`ContactChannelModal.tsx`, `MobileStickyBar.tsx`).
  - `src/lib/`: Utilidades y lógica pura (`whatsapp.ts`).
  - `src/styles/`: Definición de directivas y tokens en `global.css`.
  - `src/pages/`: Rutas del sitio (`index.astro`, `nosotros.astro`).
- Tokens de diseño Tailwind v4:
  - Rojo Primario ASOEXI: `#E51A24` (Hover: `#C8101A`).
  - Secundario Antracita: `#1E2229`.
  - Fondos / Superficies: `#FFFFFF` y `#F8FAFC`.
  - Acento Ámbar: `#F59E0B`.
  - Verde WhatsApp: `#25D366`.
  - Tipografías: Montserrat para titulares y display; Inter para textos de lectura, botones y datos técnicos.
- Tratamiento de logos de clientes: Contenedores estandarizados con fondo neutro y filtro monocromo en escala de grises atenuada (`grayscale opacity-75`), transitando suavemente a color (`hover:grayscale-0 hover:opacity-100 transition-all`) para garantizar integración armónica sin estridencias visuales.

## UX & Interaction Patterns

- Header institucional responsive con top-bar oscura (enlaces `tel:+57...`), barra principal blanca con logo SVG corporativo, navegación limpia y botón destacado *"Cotizar Insumos"*.
- Hero banner con corte angular a 45° inspirado en las diagonales geométricas del brochure corporativo de ASOEXI.
- Selector modal de contacto (`ContactChannelModal`):
  - Desktop: Ventana modal centrada con backdrop difuminado.
  - Móvil (< 768px): Bottom-sheet táctil deslizable desde la parte inferior con botones de fácil pulsación (altura ≥ 48px).
  - Rotación y balanceo dinámico: Alternancia equitativa por sesión entre Geraldine y Sonia Franco para distribuir equitativamente el volumen de consultas.
- Botón flotante de WhatsApp de 60px en esquina inferior derecha (`#25D366`) con animación sutil y tooltip descriptivo en escritorio.
- Barra inferior fija en móviles (`MobileStickyBar`): Provee accesos instantáneos para llamada telefónica directa y apertura del selector de cotización WhatsApp sin obstruir el contenido.

## Cross-Story Dependencies

- Story 1.1 sienta la base del proyecto (Astro 7, Tailwind v4, estilos globales, Header y Footer); las siguientes historias dependen de su layout y tokens.
- Story 1.3 implementa `src/lib/whatsapp.ts` y la isla `ContactChannelModal`, que conectan los puntos de contacto invocados desde el Header (Story 1.1) y el Hero (Story 1.2).

