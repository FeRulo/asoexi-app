---
title: PRD - ASOEXI S.A.S.
status: final
created: 2026-09-05
updated: 2026-09-07
---

# PRD: ASOEXI S.A.S. - Plataforma Web Corporativa, Catálogo B2B & Motor de Conversión SEO

## 0. Document Purpose

Este Documento de Requisitos de Producto (PRD) define la especificación integral para el diseño, desarrollo, posicionamiento en motores de búsqueda (SEO) e instrumentación comercial de la nueva plataforma web corporativa de **ASOEXI S.A.S.** Está dirigido al equipo de desarrollo, arquitectura de software, diseño UX/UI, consultores SEO y a los líderes comerciales de ASOEXI.

El documento está estructurado bajo una disciplina de vocabulario controlado anclado en el [Glosario (§3)](#3-glossary). Las funcionalidades están agrupadas por áreas de capacidad y cuentan con Requisitos Funcionales numerados de forma global y estable (`FR-1` a `FR-14`). 

Este PRD sintetiza e integra directamente los hallazgos operativos de las dos entrevistas realizadas al equipo comercial de ventas de ASOEXI (septiembre de 2026), garantizando que los flujos de captura recopilen con precisión **la información exacta que necesitan las vendedoras para cotizar sin reprocesos**, junto con las políticas logísticas reales de despacho y crédito. Todas las decisiones técnicas de transporte e infraestructuras se preservan en [`addendum.md`](file:///home/fernando/Fernando/Own/asoexi-app/_bmad-output/planning-artifacts/prds/prd-asoexi-app-2026-09-05/addendum.md).

---

## 1. Vision

**ASOEXI S.A.S.** es una empresa comercializadora de insumos industriales, eléctricos, ferreteros e hidráulicos con más de 7 años de experiencia abasteciendo a grandes compañías, contratistas y plantas en Colombia, con foco prioritario en **Bogotá y la Sabana de Cundinamarca**.

La propuesta de valor diferencial de ASOEXI frente a distribuidores tradicionales y grandes superficies se sintetiza en: **ofrecer la amplitud multimarca y variedad de Homecenter, pero a precios mayoristas más económicos, con atención personalizada y logística directa**. Sus ventajas competitivas reales comprobadas son:

1. **Atención Comercial Especializada & Capacidad Total:** 3 líneas directas de atención comercial facultadas para cotizar, gestionar requerimientos técnicos y brindar asesoría personalizada.
2. **Logística y Tiempos de Entrega Claros:**
   - Entregas en Bogotá en **24 a 48 horas** posteriores a la aprobación formal (Orden de Compra o confirmación escrita).
   - Despacho exprés prioritario en **6 horas para urgencias críticas en Bogotá**.
   - Entregas en la Sabana de Cundinamarca en ~**48 horas**.
   - Despachos nacionales coordinados a través de transportadoras especializadas a cualquier municipio del país.
3. **Respaldo Financiero Corporativo:** Facilidades de crédito comercial de **hasta 45 días** para empresas y clientes creados en el sistema contable.
4. **Confianza Institucional y Calidad Certificada:** Facturación electrónica formal, certificados de distribución autorizada y marcas 100% originales garantizadas (eliminando el temor del comprador corporativo a productos de baja calidad o demoras de entrega).
5. **Políticas de Despacho Accesibles:** Montos mínimos escalonados muy asequibles ($50.000 COP en Bogotá, $100.000 COP en moto y $300.000 COP en vehículo de carga para la Sabana), sin monto mínimo exigido para emitir cotizaciones.

La plataforma web corporativa se concibe como un **motor de conversión ágil**, diseñado para posicionar en Google las intenciones de búsqueda de analistas y jefes de compras (como *"distribuidor de insumos para mantenimiento"*, *"breakers y cableado bogota"*, *"tubería pavco"* o *"distribuidor autorizado panduit"*) y canalizarlas hacia WhatsApp y líneas directas con la información completa que las asesoras comerciales requieren.

---

## 2. Target User

### 2.1 Jobs To Be Done (JTBD)

- **JTBD 1 (Funcional - Consolidar compras multimarca en un solo proveedor a mejor precio):** Como analista o jefe de compras corporativo, quiero encontrar en un único distribuidor formal suministros eléctricos, hidráulicos y de ferretería pesada a precios más competitivos que una gran superficie, para simplificar la gestión contable de mis compras y optimizar el presupuesto.
- **JTBD 2 (Contextual / Urgencia en obra - Resolver una contingencia en 6 horas):** Cuando se agota material crítico en una obra en Bogotá, quiero contactar a una asesora comercial que me confirme inventario y garantice entrega en **6 horas**, para mantener las cuadrillas activas y evitar penalizaciones de cronograma.
- **JTBD 3 (Financiero - Respaldar el flujo de caja con crédito a 45 días):** Como director de compras de una empresa constructora o industrial, quiero formalizar compras recurrentes con un distribuidor que ofrezca crédito a 45 días y facturación electrónica formal.
- **JTBD 4 (Operativo Comercial ASOEXI - Recibir solicitudes con datos completos desde el primer contacto):** Como asesora comercial de ASOEXI (Geraldine, Sonia), cuando un cliente potencial me escribe por WhatsApp o correo, quiero que el mensaje contenga de entrada: Nombre/Razón Social, NIT, Teléfono, Dirección exacta de entrega, Referencias de producto claras y Cantidades, para calcular y emitir la cotización en menos de 30 minutos sin llamadas de aclaración redundantes.
- **JTBD 5 (Emocional - Certeza total de autenticidad y cumplimiento):** Cuando compro insumos técnicos (cableado, tuberías, breakers, masillas), quiero la garantía de recibir marcas líderes certificadas (Pavco, Panduit, Centelsa, Sika, Stanley, DeWalt, Sylvania, Supermastick PR) sin riesgo de falsificaciones.

### 2.2 Non-Users (v1)

- **Consumidor final minorista al menudeo extremo:** Personas que buscan comprar una unidad individual de bajo valor sin cumplir los montos mínimos de despacho formal ($50.000 COP Bogotá).
- **Comprador automatizado B2C con pasarela en línea:** Compradores que exigen carrito de compra y pago inmediato con tarjeta sin asesoría humana; ASOEXI opera con cotización consultiva personalizada y negociación de volumen.

### 2.3 Key User Journeys (UJ)

#### UJ-1: Carlos (Analista de Compras Corporativo) - Compra programada multimarca
- **Persona + Contexto:** Carlos, analista de compras de una contratista en Bogotá, recibe la requisición mensual de insumos para mantenimiento: bobinas de cable estructurado Panduit, conductores Centelsa y breakers de distribución.
- **Entry State:** Búsqueda en Google desde su oficina: *"distribuidor de insumos para mantenimiento electrico bogota"*.
- **Path:**
  1. Aterriza en `/distribuidor-panduit-colombia` desde Google.
  2. Comprueba las credenciales de ASOEXI: 7+ años abasteciendo grandes compañías, facturación electrónica, marcas originales y opción de crédito a 45 días.
  3. Hace clic en el botón principal *"Cotizar por WhatsApp"*.
  4. En el selector de canales, elige a *"Atención Comercial: Geraldine"*.
- **Climax:** Su aplicación de WhatsApp se abre con la plantilla estructurada pre-cargada. Carlos diligencia los campos:
  - Empresa: Construtec S.A.S. (NIT: 900.123.456-7)
  - Dirección: Calle 26 # 68-35, Bogotá
  - Teléfono: 310 123 4567
  - Referencias y cantidades: 10 bobinas Panduit Cat 6 azul + 5 rollos cable Centelsa 12 AWG.
- **Resolution:** Geraldine recibe la solicitud completa, valida el stock y en 20 minutos le envía la cotización formal en PDF con condiciones comerciales de crédito a 45 días.
- **Edge Case:** Si Carlos tiene su solicitud en un archivo de Excel o PDF con 50 referencias, la plantilla le indica que puede adjuntar el documento directamente en el chat para cotización inmediata.

#### UJ-2: Ingeniero Martínez (Residente de Obra) - Despacho de urgencia en 6 horas
- **Persona + Contexto:** El Ing. Martínez está en una obra en Bogotá a las 8:30 AM; se terminaron los aditivos Sika y accesorios de tubería Pavco para la fundición del mediodía.
- **Entry State:** Búsqueda móvil en 4G: *"distribuidor pavco entrega urgente bogota"*.
- **Path:**
  1. Ingresa a la web de ASOEXI; el sitio carga en 0.8 segundos.
  2. Lee el banner destacado: *"Despacho exprés en 6 horas para urgencias en Bogotá | Entrega en 24-48h regular"*.
  3. Hace clic en *"Llamar a Asesora Comercial"* y conecta con Sonia Franco.
- **Climax:** Sonia atiende la llamada de inmediato, confirma disponibilidad en bodega y toma los datos de entrega de la obra.
- **Resolution:** Con la confirmación enviada por WhatsApp, el pedido se despacha en vehículo propio y llega a la obra a la 1:30 PM (plazo de 6 horas cumplido), evitando retrasos en la cuadrilla.

#### UJ-3: Don Gustavo (Ferretero en la Sabana de Cundinamarca) - Abastecimiento con flete económico
- **Persona + Contexto:** Administra un depósito ferretero en Chía; necesita surtirse de herramientas Stanley y masillas Supermastick PR.
- **Entry State:** Visita `asoexi.com` desde su tablet.
- **Path:**
  1. Revisa en la página de inicio las marcas tractoras destacadas: Stanley, Supermastick PR, Pavco, DeWalt y Truper.
  2. Consulta las condiciones de despacho: verifica que para la Sabana el despacho en moto aplica desde $100.000 COP y en vehículo de carga desde $300.000 COP, con entrega en ~48 horas.
  3. Selecciona la opción de *"Línea Corporativa / Servicio al Cliente"* para consultar requisitos de apertura de crédito.
- **Climax:** Es atendido por la asesora en turno rotativo, quien le brinda asesoría personalizada y le envía el listado mayorista de precios.
- **Resolution:** Don Gustavo formaliza su orden con despacho programado a su ferretería.

---

## 3. Glossary

- **ASOEXI S.A.S.:** Empresa comercializadora mayorista e institucional de insumos en Colombia (7+ años de trayectoria).
- **Marcas Tractoras (Top 10 Estrella):** Las marcas consolidadas de mayor rotación y volumen de venta identificadas por el equipo comercial:
  - *Eléctrico:* **Panduit**, **Centelsa by Nexans**, **Sylvania**.
  - *Ferretero & Construcción:* **Supermastick PR**, **Stanley**, **DeWalt**, **Truper**.
  - *Hidráulico, Pinturas & Químicos:* **Pavco Wavin**, **Sika**, **Pintuco**.
- **Plantilla de Cotización Estructurada:** Formato predeterminado de mensaje en WhatsApp que captura los 6 datos indispensables para las vendedoras: Razón Social, NIT, Teléfono, Dirección de entrega, Referencias claras y Cantidades.
- **Entrega Express 6 Horas:** Servicio logístico prioritario para contingencias críticas dentro del perímetro urbano de Bogotá.
- **Entrega Regular (24-48h):** Tiempo estándar de despacho en Bogotá y la Sabana tras aprobación con Orden de Compra o confirmación escrita.
- **Despacho Nacional:** Envíos fuera de la Sabana de Bogotá operados a través de empresas transportadoras de carga.
- **Políticas de Monto Mínimo de Despacho:**
  - Bogotá urbana: $50.000 COP (IVA incluido).
  - Sabana en moto: $100.000 COP (IVA incluido).
  - Sabana en carro / vehículo de carga: $300.000 COP (IVA incluido).
- **Crédito Corporativo (Hasta 45 Días):** Línea de crédito comercial para compras recurrentes de clientes corporativos formalmente creados.
- **Selector de Canales de Contacto:** Componente interactivo que permite elegir entre Atención Comercial Geraldine, Atención Comercial Sonia Franco y Línea Corporativa / Servicio al Cliente.
- **Insumos para Mantenimiento:** Clúster semántico SEO clave que agrupa cableado, breakers, tuberías, pinturas y herramientas para plantas y obras.

---

## 4. Features

### 4.1 Identidad Corporativa, Hero & Propuesta de Valor

**Description:** La página de inicio comunica de inmediato la propuesta de valor validada en las dos entrevistas: amplitud multimarca tipo Homecenter con precio mayorista, 7+ años de trayectoria, crédito a 45 días, entrega regular en 24-48h y urgencias en 6h en Bogotá, garantizando marcas 100% originales. Realiza `UJ-1`, `UJ-2` y `UJ-3`.

**Functional Requirements:**

#### FR-1: Visualización de Diferenciales y Credenciales de Confianza
El sistema debe exponer en la cabecera/Hero de la página de inicio los 5 pilares de legitimidad empresarial:
El sistema debe exponer en la cabecera/Hero de la página de inicio los 6 pilares de legitimidad empresarial:
1. "Más de 7 años abasteciendo a grandes compañías en Colombia".
2. "Entrega en Bogotá en 24-48h (despacho exprés en 6 horas para urgencias) y 48h en la Sabana".
3. "Crédito comercial de hasta 45 días para empresas".
4. "Garantía de marcas 100% originales, certificados autorizados y facturación electrónica".
5. "Montos mínimos de despacho desde $50.000 COP en Bogotá y transporte directo".
6. "Atención especializada con logística y entrega directa en obra o empresa (no venta presencial por mostrador)".
- **Consequences (testable):**
  - Los pilares son visibles de forma inmediata en dispositivos móviles y de escritorio.
  - Se visualizan sellos de facturación electrónica y garantía de fábrica para despejar la desconfianza del comprador primerizo.
  - Se aclara desde el primer momento que el modelo es de suministro y despacho a domicilio, gestionando adecuadamente la expectativa física del cliente.
- **Out of Scope:** Pasarela de pago en línea o calculadora de crédito automatizada.

#### FR-2: Vitrina Destacada de las Top 10 Marcas Tractoras
El sistema debe exhibir en una sección preferencial del Home las 10 marcas estrella de mayor demanda agrupadas por sector:
- *Eléctrico:* **Panduit**, **Centelsa by Nexans**, **Sylvania**.
- *Ferretero:* **Supermastick PR**, **Stanley**, **DeWalt**, **Truper**.
- *Hidráulico / Químico:* **Pavco Wavin**, **Sika**, **Pintuco**.
- **Consequences (testable):**
  - Cada marca se visualiza con su logotipo oficial optimizado en formato WebP/SVG.
  - Al hacer clic en cualquiera de ellas, navega directamente a su Silo de Marca correspondiente (`/distribuidor-[marca]-colombia`).

#### FR-2b: Sección de Clientes Corporativos y Prueba Social
El sistema debe incluir una franja de confianza institucional destacando las empresas y centros comerciales abastecidos por ASOEXI:
- **Clientes validados:** Casalimpia, Centro Comercial Andino, Centro Comercial Unicentro, Winner Group, Multiplika.
- **Consequences (testable):**
  - Grilla o carrusel de logotipos de clientes en alta resolución/optimizado en escala de grises o contraste armonioso en la página de inicio y en la sección institucional.

---

### 4.2 Catálogo B2B por Hubs de Sector (Categorías)

**Description:** Estructura en 3 sectores, enriquecida semánticamente con las categorías de producto que buscan los analistas de compras: cableado, breakers, tubería, pintura, masillas y herramientas. Realiza `UJ-1` y `UJ-2`.

**Functional Requirements:**

#### FR-3: Despliegue de Hubs de Sector
El sistema debe implementar 3 páginas principales de sector:
- `/sector-electrico` (Cableado estructurado, energía, iluminación, breakers, canalización).
- `/sector-ferretero-construccion` (Herramientas eléctricas y manuales, fijación, masillas, drywall, cementos).
- `/sector-hidraulico-pinturas` (Tuberías, grifería, impermeabilizantes, químicos para construcción, pinturas).
- **Consequences (testable):**
  - Cada sector despliega el conjunto completo de marcas que pertenecen a su rubro.
  - Incluye un llamado a la acción visible para cotizar listas multimarca en una sola orden de compra.

#### FR-4: Contenido Semántico de Insumos para Mantenimiento
Cada Hub de Sector debe contener texto técnico estructurado que responda a búsquedas de insumos para mantenimiento industrial, correctivo y locativo.
- **Consequences (testable):**
  - Incorpora encabezados semánticos optimizados: *"Breakers y conductores eléctricos para mantenimiento"*, *"Tuberías y sellantes para infraestructura de plantas"*.

---

### 4.3 Arquitectura Silo de Marcas (~40 Landings Dedicadas)

**Description:** ~40 páginas individuales dedicadas por marca comercializada, optimizadas para capturar el tráfico orgánico de compradores que buscan marcas específicas en Google. Realiza `UJ-1` y `UJ-3`.

**Functional Requirements:**

#### FR-5: Landings Especializadas por Marca
El sistema debe generar páginas dedicadas con estructura canónica `/distribuidor-[marca]-colombia` para todas las marcas representadas.
- **Consequences (testable):**
  - Cada página incluye metadatos y títulos transaccionales: `<title>Distribuidor [Marca] en Bogotá y Colombia | Insumos ASOEXI S.A.S.</title>`.
  - La landing destaca las condiciones de crédito a 45 días, entrega en 6h para urgencias y facturación electrónica.

#### FR-6: Descarga de Catálogos en PDF y Enlaces de Fichas
Cada silo de marca debe incluir un botón para descargar el catálogo o ficha técnica en PDF.
#### FR-6: Orientación a Cotización y Vitrina de Portafolio por Marca
Dado que ASOEXI maneja precios dinámicos por volumen y no dispone de catálogos PDF oficiales ni listas públicas con precios (se utilizan piezas publicitarias de apoyo visual de marcas), la plataforma web opera 100% orientada a la **solicitud de cotización formal**.
- **Consequences (testable):**
  - Al hacer clic, abre o descarga el PDF sin retardar el render de la página.
  - Si una marca no dispone temporalmente de PDF, el botón se oculta de forma transparente y se prioriza el botón de cotización por WhatsApp.
  - Cada silo de marca y ficha de categoría presenta como acción principal el botón *"Cotizar por WhatsApp productos de [Marca]"* o *"Solicitar Cotización Formal"*.
  - No existen botones rotos de descarga de catálogos: si en el futuro se incorpora una ficha técnica o catálogo PDF oficial para una marca específica, el botón de descarga se renderiza condicionalmente. De lo contrario, se enfoca totalmente en la apertura del selector de cotización.

---

### 4.4 Motor de Conversión Contextual, Selector de Canales y Captura de Datos

**Description:** Flujo de contacto diseñado para distribuir prospectos entre las 3 líneas comerciales y capturar **la información exacta que necesitan las vendedoras para cotizar**. Realiza `UJ-1`, `UJ-2` y `UJ-3`.

**Functional Requirements:**

#### FR-7: Selector Interactivo de Canales de Contacto (Modal / Desplegable)
Al activar cualquier botón de cotización o el botón flotante de WhatsApp, se despliega un selector con 3 opciones de atención directa:
1. **Atención Comercial — Geraldine:** WhatsApp comercial y línea telefónica directa.
2. **Atención Comercial — Sonia Franco:** WhatsApp comercial y línea telefónica directa.
3. **Línea Corporativa & Servicio al Cliente:** Línea rotativa y PBX para vinculación corporativa o solicitudes generales.
Al activar cualquier botón de cotización o el botón flotante de WhatsApp, se despliega un selector con 3 opciones de atención directa con los números comerciales validados:
1. **Atención Comercial — Geraldine:** WhatsApp comercial directo `+57 318 639 7212` (`3186397212`).
2. **Atención Comercial — Sonia Franco:** WhatsApp comercial directo `+57 320 449 8881` (`3204498881`).
3. **Línea Corporativa & Servicio al Cliente:** Línea directa `+57 304 401 3761` (`3044013761`) rotativa y para vinculación corporativa.
- **Consequences (testable):**
  - Las 3 líneas cuentan con capacidad para cotizar y atender solicitudes.
  - En móviles se despliega como hoja táctil (bottom sheet) con botones táctiles grandes (mínimo 48px).
  - Cada botón abre la API de WhatsApp con la vendedora correspondiente preseleccionada.

#### FR-8: Plantilla Estructurada con los Datos Indispensables para las Vendedoras
Al abrir el chat de WhatsApp con la asesora comercial, el sistema debe pre-cargar automáticamente la plantilla de cotización con los 6 datos requeridos:
```text
Hola ASOEXI, vi su catálogo de [Marca/Sector] en la página web y deseo solicitar una cotización formal.
- Empresa / Nombre: 
- NIT (si aplica crédito/facturación): 
- Teléfono de contacto: 
- Ciudad / Dirección exacta de entrega: 
- Referencias y cantidades (lo más claras posibles): 
```
- **Consequences (testable):**
  - El mensaje aparece listo en la caja de texto de WhatsApp con el nombre de la marca o sector detectado automáticamente.
  - Se añade un micro-texto explicativo en la web: *"¿Tiene su listado en Excel o PDF? Puede adjuntarlo directamente en el chat tras abrir WhatsApp"*.

#### FR-9: Directorio Telefónico y Nota de Tiempos de Entrega
El sistema debe incluir enlaces directos `tel:+57...` para las 3 líneas telefónicas en el Header, Contacto y Footer.
#### FR-9: Directorio Corporativo, Teléfonos, Correos y Canales Oficiales
El sistema debe incluir enlaces directos `tel:+57...`, correos electrónicos y los datos oficiales de la compañía en el Header, Contacto y Footer:
- **NIT:** `900480460-8`
- **Sede Administrativa:** Carrera 55 A No. 51 A 28 Sur, Bogotá D.C. (Aclarando explícitamente: *Sede administrativa y despacho logístico. No contamos con venta presencial por mostrador ni retiro en bodega*).
- **Horario de Atención:** Lunes a Viernes 7:30 AM a 4:30 PM | Sábados 8:00 AM a 12:00 PM.
- **Líneas Telefónicas Directas:**
  - Geraldine: `tel:+573186397212`
  - Sonia Franco: `tel:+573204498881`
  - Corporativa / Servicio al Cliente: `tel:+573044013761`
- **Correos Electrónicos:**
  - `mailto:asesorventas1@asoexi.com`
  - `mailto:asesorventas3@asoexi.com`
  - `mailto:servicioclienteasoexi@gmail.com`
- **Consequences (testable):**
  - Tocar cualquier número activa el marcador nativo del smartphone.
  - Se expone la política de entregas (24-48h estándar Bogotá/Sabana, 6h urgencias en Bogotá, y despachos nacionales por transportadora).

---

### 4.5 Infraestructura SEO B2B & Marcado para Inteligencia Artificial (AEO)

**Description:** Posicionamiento en Google y motores de IA para marcas y categorías clave de insumos. Realiza `UJ-1`.

**Functional Requirements:**

#### FR-10: Sitemap XML Dinámico & Clúster Semántico de Búsqueda
Generación de `sitemap.xml` dinámico optimizado con términos de alta intención de compra identificados en las entrevistas:
- *"distribuidor de insumos para mantenimiento"*
- *"breakers, cableado y tubería bogotá"*
- *"distribuidor autorizado [marca] bogotá / colombia"*
- **Consequences (testable):**
  - Las URLs canónicas, metadatos y encabezados `<h1>`/`<h2>` reflejan estos clústeres semánticos.

#### FR-11: Marcado Estructurado Schema JSON-LD B2B
Incrustación de Schema JSON-LD bajo esquemas `Organization`, `B2BSupplier`, `WholesaleStore` y `OfferCatalog`.
- **Consequences (testable):**
  - Reconoce a ASOEXI S.A.S. como proveedor B2B, con cobertura geográfica en Bogotá, Cundinamarca y Colombia, listando las 10 marcas tractoras y líneas de crédito.

#### FR-12: Metadatos Open Graph y Previews Enriquecidas
Configuración de Open Graph para vistas previas en WhatsApp, LinkedIn y redes sociales con imagen corporativa, logotipo de la marca y la promesa de valor institucional.
- **Consequences (testable):**
  - Todo enlace compartido de `asoexi.com` genera una tarjeta visual instantánea con imagen, titular y descripción formal.

---

### 4.6 Medición, Analítica y Seguimiento de Conversiones

**Description:** Telemetría para monitorear el desempeño del sitio y el flujo de cotizaciones hacia las vendedoras. Realiza `UJ-1` y `UJ-2`.

**Functional Requirements:**

#### FR-13: Telemetría de Conversión por Asesora y Marca
Registro de eventos analíticos personalizados (Google Analytics 4 / GTM):
- Evento `lead_whatsapp_click` con parámetros: `advisor_name` (`geraldine` / `sonia_franco` / `corporativo`), `brand_origin`, `sector_origin`.
- Evento `lead_phone_click` con idénticos parámetros de atribución.
- **Consequences (testable):**
  - Permite a la gerencia auditar el balance de carga entre asesoras y conocer qué marcas generan el mayor volumen de cotizaciones.

#### FR-14: Integración con Google Maps & Google Search Console
Metadatos de verificación para Google Search Console y enlace a la ficha de Google Business Profile (Google Maps) de ASOEXI S.A.S. en Bogotá.
- **Consequences (testable):**
  - La web enlaza directamente a la ficha física en Google Maps para transmitir confianza geográfica inmediata.

---

## 5. Non-Goals (Explicit)

1. **No es un e-commerce B2C con carrito transaccional:** La negociación de precios y condiciones de crédito se gestiona a través de las asesoras comerciales.
2. **No hay publicación de tarifas unitarias abiertas:** Los precios varían según escala de compra, fletes y crédito comercial.
3. **No hay portal privado de clientes con login:** La comunicación y envío de cotizaciones opera ágilmente vía WhatsApp y correo formal.
4. **No hay cotizador paramétrico automatizado con cálculo de presupuestos en vivo:** Requerimientos complejos con decenas de códigos son procesados por el equipo humano.
5. **No hay despachos por montos inferiores al mínimo establecido:** Se respetan los umbrales mínimos ($50.000 COP Bogotá, $100.000 COP moto y $300.000 COP carro en la Sabana).

---

## 6. MVP Scope (Cronograma de 3 Entregables)

### 6.1 In Scope

- **Mes 1 — Entregable 1 (Sitio Web Base Funcional en Vivo):**
  - Plataforma en Astro 7 (SSG + Islas Preact) con diseño responsivo (paleta oficial Blanco, Negro, Rojo, Gris).
  - Home con los pilares institucionales: 7+ años, crédito a 45 días, entrega en 6h urgencias / 24-48h regular, facturación electrónica.
  - Vitrina de las Top 10 Marcas Tractoras.
  - Selector interactivo de canales de contacto (Geraldine, Sonia Franco, Línea Corporativa).
  - Sección Nosotros y pie de página institucional.

- **Mes 2 — Entregable 2 (Catálogo B2B Completo y ~40 Marcas Desplegadas):**
  - Maquetación de los 3 Hubs de Sector (Eléctrico, Ferretero, Hidráulico).
  - Generación de las ~40 páginas dedicadas por marca (`/distribuidor-[marca]-colombia`).
  - Descarga de catálogos en PDF por marca.
  - WhatsApp contextual con la plantilla estructurada de 6 datos clave para las vendedoras.

- **Mes 3 — Entregable 3 (Indexación Google, SEO Local & Medición):**
  - Sitemap XML dinámico con clúster semántico de insumos de mantenimiento.
  - Marcado Schema JSON-LD `B2BSupplier`, `WholesaleStore` y `Organization`.
  - Envío y verificación en Google Search Console.
  - Optimización de ficha en Google Maps.
  - Medición analítica de prospectos desglosada por asesora comercial.

### 6.2 Out of Scope for MVP

- Formulario web con carga masiva de archivos de obra en servidor (se resuelve mediante el envío directo del archivo Excel/PDF por WhatsApp a la asesora).
- Chatbot o contestador automatizado de IA en WhatsApp.
- Portal de consulta de cupos de crédito.

---

## 7. Success Metrics & Counter-metrics

### 7.1 Métricas de Éxito (Success Metrics)

1. **SM-1 (Tasa de Conversión a Contacto Comercial):** Al menos el **4.5%** de los visitantes únicos a un silo de marca o hub de sector activan el selector de contacto (WhatsApp o llamada).
2. **SM-2 (Generación Mensual de Prospectos Calificados):** Alcanzar entre **60 y 100 cotizaciones comerciales mensuales** generadas desde el sitio web al culminar el mes 3 de indexación.
3. **SM-3 (Rendimiento Google Core Web Vitals):** Calificación superior a **90/100 en móviles** y **98/100 en escritorio** en Google PageSpeed Insights.
4. **SM-4 (Tiempo de Emisión de Cotización):** Gracias a la plantilla estructurada (con NIT, dirección, referencias y cantidades), el tiempo de respuesta de las asesoras comerciales es inferior a **30 minutos** en horario hábil.
5. **SM-5 (Indexación de Silos de Marca):** El 100% de las páginas de marca registradas en el sitemap se encuentran indexadas en Google Search Console dentro de los primeros 45 días posteriores al lanzamiento.

### 7.2 Contra-Métricas (Counter-Metrics)

- **CM-1 (Tasa de Falsos Clics en WhatsApp):** Menos del **20%** de usuarios que pulsan el botón de WhatsApp abandonan el chat sin enviar el mensaje predeterminado.
- **CM-2 (Consultas de Menudeo Inadecuado):** Menos del **10%** de los mensajes recibidos corresponden a solicitudes minoristas por debajo de los montos mínimos de despacho.
- **CM-3 (Distribución Equilibrada de Prospectos):** Mantener un reparto equilibrado de consultas entre Geraldine y Sonia Franco.

---

## 8. Cross-Cutting Non-Functional Requirements (NFRs)

- **NFR-1 (Rendimiento):** Arquitectura Astro 7 SSG servida en Cloudflare Pages CDN con TTFB < 200 ms y LCP < 1.5 s en redes móviles 4G.
- **NFR-2 (Optimización de Recursos Gráficos):** Logotipos de marcas y banners en formato WebP / SVG vectorial con compresión optimizada y dimensiones explícitas (CLS < 0.05).
- **NFR-3 (Accesibilidad & Mobile First):** Cumplimiento de WCAG 2.1 AA, contrastes cromáticos de la paleta oficial (Blanco, Negro, Rojo, Gris) y áreas de toque mínimas de 48x48px para botones táctiles.
- **NFR-4 (Seguridad y Privacidad):** Forzado de HTTPS estricto con TLS vigente y cabeceras de seguridad HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`).
- **NFR-5 (Disponibilidad):** Uptime mensual del 99.9% garantizado en infraestructura serverless sin base de datos activa para páginas públicas.

---

## 9. Information Architecture & Brand Silos

### 9.1 Matriz de Hubs y Marcas Representadas

| Sector / Hub | URL Canónica | Marcas Representadas en Silo Individual |
| :--- | :--- | :--- |
| **Sector Eléctrico** | `/sector-electrico` | **Panduit** *(Tractora)*, **Centelsa by Nexans** *(Tractora)*, **Sylvania** *(Tractora)*, Schneider Electric, Siemens, Legrand, Luminex, Colmena, Proeléctricos, Mercury, Philips, Lumec by Signify. |
| **Sector Ferretero & Construcción** | `/sector-ferretero-construccion` | **Supermastick PR** *(Tractora)*, **Stanley** *(Tractora)*, **DeWalt** *(Tractora)*, **Truper** *(Tractora)*, Bosch, Makita, Total Tools, Argos, Cemex, Yale, Irwin Tools, Eternit, Knauf, Gyplac. |
| **Sector Hidráulico, Pinturas & Suministros** | `/sector-hidraulico-pinturas` | **Pavco Wavin** *(Tractora)*, **Sika** *(Tractora)*, **Pintuco** *(Tractora)*, Corona, Pinturas Tito Pabón, Grival, 3M, Multipack, Tesa, TVR, Helbert, Evans, Durman, PCP, Goya, Caribe, Toto, Docol. |

### 9.2 Estructura Jerárquica de URLs
```
/                                             --> Home Institucional (4 Pilares, Top 10 Marcas, Trayectoria 7+ años)
+-- /nosotros                                 --> Historia, Valores, Garantía de Marcas y Respaldo
+-- /contacto                                 --> Selector de Canales (Geraldine, Sonia, Corporativo), Teléfonos, Mapa
+-- /sector-electrico                         --> Hub Sector Eléctrico (Insumos de Mantenimiento Eléctrico)
|   +-- /distribuidor-panduit-colombia        --> Landing Silo Panduit (Marca Tractora)
|   +-- /distribuidor-centelsa-colombia       --> Landing Silo Centelsa (Marca Tractora)
|   +-- /distribuidor-sylvania-colombia       --> Landing Silo Sylvania (Marca Tractora)
|   \-- /distribuidor-[marca]-colombia        --> Demás marcas eléctricas...
+-- /sector-ferretero-construccion            --> Hub Sector Ferretero & Obra
|   +-- /distribuidor-supermastick-colombia   --> Landing Silo Supermastick PR (Marca Tractora)
|   +-- /distribuidor-stanley-colombia        --> Landing Silo Stanley (Marca Tractora)
|   +-- /distribuidor-dewalt-colombia         --> Landing Silo DeWalt (Marca Tractora)
|   +-- /distribuidor-truper-colombia         --> Landing Silo Truper (Marca Tractora)
|   \-- /distribuidor-[marca]-colombia        --> Demás marcas ferretería...
\-- /sector-hidraulico-pinturas               --> Hub Sector Hidráulico & Pinturas
    +-- /distribuidor-pavco-colombia          --> Landing Silo Pavco Wavin (Marca Tractora)
    +-- /distribuidor-sika-colombia           --> Landing Silo Sika (Marca Tractora)
    +-- /distribuidor-pintuco-colombia        --> Landing Silo Pintuco (Marca Tractora)
    \-- /distribuidor-[marca]-colombia        --> Demás marcas hidráulicas...
```

---

## 10. Open Questions & Assumptions Index

| ID | Tipo | Descripción | Estado / Impacto en Implementación |
| :--- | :--- | :--- | :--- |
| `ASSUMP-1` | `[RESUELTA]` | Distribución de líneas comerciales: 3 líneas facultadas para cotizar (Geraldine, Sonia Franco y Línea Corporativa rotativa). | **Cerrada:** Modelada en `FR-7`, `FR-8` y `FR-9`. Solo resta parametrizar los números telefónicos exactos. |
| `ASSUMP-2` | `[ASSUMPTION]` | Correos electrónicos corporativos: Se asumen `contacto@asoexi.com` y `ventas@asoexi.com`. | **Bajo:** Configurable mediante variables de entorno del proyecto. |
| `ASSUMP-3` | `[ASSUMPTION]` | Catálogos PDF: Se obtendrán de los brochures públicos de los fabricantes o material de ASOEXI; si alguna marca no tiene PDF, la landing opera orientada a cotización sin botón roto. | **Medio:** Mitigado por diseño condicional en `FR-6`. |
| `ASSUMP-1` | `[RESUELTA]` | Distribución de líneas comerciales: 3 líneas facultadas para cotizar (Geraldine: 3186397212, Sonia Franco: 3204498881, Corporativa: 3044013761). | **Cerrada:** Parametrizadas en `FR-7`, `FR-8` y `FR-9` con números directos validados. |
| `ASSUMP-2` | `[RESUELTA]` | Correos electrónicos corporativos: `asesorventas1@asoexi.com`, `asesorventas3@asoexi.com`, `servicioclienteasoexi@gmail.com`. | **Cerrada:** Parametrizados en `FR-9` y Addendum. |
| `ASSUMP-3` | `[RESUELTA]` | Catálogos PDF y Precios: El cliente aclaró que no dispone de catálogos oficiales PDF ni precios públicos. El modelo opera 100% orientado a cotización usando piezas publicitarias para visualización de marcas. | **Cerrada:** Reflejada en `FR-6` y Addendum 4.7. Botón principal es "Cotizar por WhatsApp". |
| `ASSUMP-4` | `[RESUELTA]` | Cobertura y logística: 24-48h regular en Bogotá y Sabana tras aprobación; 6h exprés para urgencias en Bogotá; nacional por transportadora. | **Cerrada:** Integrada formalmente en `FR-1`, `FR-9` y `UJ-2`. |
| `ASSUMP-5` | `[RESUELTA]` | Montos mínimos de despacho: $50.000 COP en Bogotá; en Sabana $100.000 COP moto y $300.000 COP carro (IVA incluido). Sin mínimo para cotizar. | **Cerrada:** Reflejada en `FR-1`, `FR-9` y Non-Goals. |
| `ASSUMP-6` | `[ASSUMPTION]` | Alta en Google Business Profile: Se gestionará en el Entregable 3 requiriendo validación física de dirección en Bogotá. | **Medio:** Programado formalmente para la Fase 3. |
| `ASSUMP-6` | `[ASSUMPTION]` | Alta en Google Business Profile: Se gestionará en el Entregable 3 requiriendo validación física de dirección en Bogotá (Carrera 55 A No. 51 A 28 Sur). | **Medio:** Programado formalmente para la Fase 3, especificando sede administrativa sin mostrador. |
| `ASSUMP-7` | `[RESUELTA]` | Naturaleza de la sede física: Sede administrativa/logística sin venta por mostrador ni retiro presencial en bodega. Todo pedido es con despacho a domicilio directo. | **Cerrada:** Reflejada en `FR-1`, `FR-9`, Addendum 4.6 y microcopy UX. |
