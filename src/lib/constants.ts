export interface CompanyInfo {
  name: string;
  legalName: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  experienceYears: number;
  noCounterNotice: string;
}

export interface ContactPhone {
  id: string;
  name: string;
  e164: string;
  display: string;
  role: string;
  hasWhatsApp: boolean;
}

export interface OfficialEmail {
  id: string;
  email: string;
  label: string;
}

export interface BusinessHours {
  weekdays: string;
  saturdays: string;
  sundaysAndHolidays: string;
}

export interface NavLink {
  label: string;
  href: string;
  isCta?: boolean;
}

export const LOGISTIC_NOTICE =
  'Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)';

export const LOGISTIC_HERO_PROPOSITION =
  'Despacho directo a tu bodega u obra a nivel nacional — Sede administrativa centralizada';

export const COMPANY_INFO: CompanyInfo = {
  name: 'ASOEXI S.A.S.',
  legalName: 'ASOCIADOS DE ÉXITO INTERNACIONAL S.A.S.',
  nit: '900480460-8',
  address: 'Carrera 55 A No. 51 A 28 Sur',
  city: 'Bogotá',
  country: 'Colombia',
  experienceYears: 7,
  noCounterNotice: LOGISTIC_NOTICE,
};

export const CONTACT_PHONES: ContactPhone[] = [
  {
    id: 'geraldine',
    name: 'Geraldine',
    e164: '+573186397212',
    display: '+57 318 639 7212',
    role: 'Asesora Comercial',
    hasWhatsApp: true,
  },
  {
    id: 'sonia',
    name: 'Sonia',
    e164: '+573204498881',
    display: '+57 320 449 8881',
    role: 'Asesora Comercial',
    hasWhatsApp: true,
  },
  {
    id: 'corporate',
    name: 'Línea Corporativa',
    e164: '+573044013761',
    display: '+57 304 401 3761',
    role: 'Atención Institucional',
    hasWhatsApp: false,
  },
];

export const OFFICIAL_EMAILS: OfficialEmail[] = [
  {
    id: 'ventas1',
    email: 'asesorventas1@asoexi.com',
    label: 'Ventas y Cotizaciones 1',
  },
  {
    id: 'ventas3',
    email: 'asesorventas3@asoexi.com',
    label: 'Ventas y Cotizaciones 2',
  },
  {
    id: 'servicio',
    email: 'servicioclienteasoexi@gmail.com',
    label: 'Servicio al Cliente',
  },
];

export const BUSINESS_HOURS: BusinessHours = {
  weekdays: 'Lunes a Viernes 7:30 - 16:30',
  saturdays: 'Sábados 8:00 - 12:00',
  sundaysAndHolidays: 'Domingos y Festivos: Cerrado',
};

export const NAVIGATION_LINKS: NavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Sectores', href: '/#sectores' },
  { label: 'Marcas', href: '/#marcas' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Cotizar Insumos', href: '/#cotizar', isCta: true },
];

export interface ValuePillar {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  highlight: string;
  icon: string;
  badge?: string;
}

export interface CorporateClient {
  id: string;
  name: string;
  sector: string;
  highlight: string;
  logoAlt: string;
}

export const VALUE_PILLARS: ValuePillar[] = [
  {
    id: 'entregas-rapidas',
    title: 'Entregas 24-48h / 6h Urgencias',
    shortTitle: 'Entregas Ágiles',
    description:
      'Despachos programados en 24 a 48 horas en Bogotá y atención prioritaria para urgencias técnicas en obra en un lapso de 6 horas.',
    highlight: '24-48h estándar · 6h urgencias en Bogotá',
    icon: 'clock-bolt',
    badge: 'Logística Inmediata',
  },
  {
    id: 'credito-comercial',
    title: 'Crédito Comercial hasta 45 Días',
    shortTitle: 'Crédito B2B',
    description:
      'Financiación corporativa y líneas de crédito de hasta 45 días para empresas registradas y contratistas validados con RUT.',
    highlight: 'Hasta 45 días de plazo comercial con RUT',
    icon: 'credit-card',
    badge: 'Solvencia Financiera',
  },
  {
    id: 'marcas-originales',
    title: 'Marcas 100% Originales',
    shortTitle: 'Garantía Directa',
    description:
      'Garantía directa de fábrica, fichas técnicas oficiales y certificados de conformidad en todos nuestros suministros de primera línea.',
    highlight: 'Certificados oficiales y respaldo de fábrica',
    icon: 'shield-check',
    badge: 'Calidad Certificada',
  },
  {
    id: 'minimos-accesibles',
    title: 'Mínimos desde $50.000 COP',
    shortTitle: 'Mínimos Flexibles',
    description:
      'Despachos accesibles desde $50.000 COP para Bogotá y desde $100.000 a $300.000 COP para municipios de la Sabana.',
    highlight: 'Bogotá desde $50.000 · Sabana $100k-$300k',
    icon: 'tag-check',
    badge: 'Cobertura Flexible',
  },
  {
    id: 'logistica-domicilio',
    title: 'Logística 100% a Domicilio',
    shortTitle: 'Entrega en Obra',
    description:
      'Despacho directo en tu obra o bodega a nivel nacional. Operación centralizada sin venta presencial por mostrador ni retiro en bodega.',
    highlight: 'Directo en obra o bodega sin mostrador',
    icon: 'truck-fast',
    badge: 'Despacho Directo',
  },
];

export const CORPORATE_CLIENTS: CorporateClient[] = [
  {
    id: 'casalimpia',
    name: 'Casalimpia',
    sector: 'Facility Services & Aseo Industrial',
    highlight: 'Líder en servicios de limpieza, mantenimiento e instalaciones',
    logoAlt: 'Logo corporativo de Casalimpia',
  },
  {
    id: 'unicentro',
    name: 'Centro Comercial Unicentro',
    sector: 'Centros Comerciales & Grandes Superficies',
    highlight: 'Complejo comercial y empresarial emblemático de Bogotá',
    logoAlt: 'Logo oficial de Centro Comercial Unicentro Bogotá',
  },
  {
    id: 'andino',
    name: 'Centro Comercial Andino',
    sector: 'Centros Comerciales & Retail Exclusivo',
    highlight: 'Centro comercial de alta categoría y tradición en Bogotá',
    logoAlt: 'Logo oficial de Centro Comercial Andino',
  },
  {
    id: 'winner-group',
    name: 'Winner Group',
    sector: 'Hotelería, Casinos & Entretenimiento',
    highlight: 'Operador líder de entretenimiento y salas de juego Cirsa Colombia',
    logoAlt: 'Logo oficial de Winner Group Cirsa',
  },
  {
    id: 'multiplika',
    name: 'Multiplika',
    sector: 'Arquitectura & Soluciones Corporativas',
    highlight: 'Especialistas en diseño, remodelación y adecuaciones arquitectónicas corporativas',
    logoAlt: 'Logo corporativo de Multiplika',
  },
];

export interface SiteMetadata {
  siteUrl: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  locale: string;
  ogType: string;
  twitterCard: string;
}

export const SITE_METADATA: SiteMetadata = {
  siteUrl: 'https://asoexi.com',
  siteName: 'ASOEXI S.A.S.',
  defaultTitle: 'ASOEXI S.A.S. | Distribuidor Mayorista de Insumos Industriales y Ferreteros',
  defaultDescription:
    'Distribuidor mayorista de insumos industriales, eléctricos, ferreteros e hidráulicos en Bogotá y Colombia. Más de 7 años de experiencia y despacho a domicilio.',
  defaultOgImage: 'https://asoexi.com/og-image.jpg',
  locale: 'es_CO',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutLogisticsFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface AboutSafetyProtocolItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutData {
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  history: {
    title: string;
    paragraphs: string[];
    stats: AboutStat[];
  };
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  logistics: {
    title: string;
    description: string;
    administrativeNotice: string;
    noCounterNotice: string;
    headquartersAddress: string;
    features: AboutLogisticsFeature[];
  };
  safetyProtocols: {
    title: string;
    subtitle: string;
    items: AboutSafetyProtocolItem[];
  };
}

export const ABOUT_DATA: AboutData = {
  badge: 'Trayectoria y Solvencia B2B',
  heroTitle: 'Más de 7 Años Abasteciendo a la Industria y Grandes Superficies',
  heroSubtitle:
    'Garantía directa de fábrica, cumplimiento estricto de entregas y respaldo contractual para compras corporativas en Colombia.',
  history: {
    title: 'Nuestra Historia y Trayectoria B2B',
    paragraphs: [
      'Constituida legalmente como ASOCIADOS DE ÉXITO INTERNACIONAL S.A.S. (ASOEXI S.A.S., NIT 900480460-8), contamos con más de 7 años de experiencia ininterrumpida abasteciendo insumos industriales, eléctricos, ferreteros e hidráulicos a los principales centros comerciales, cadenas de hotelería y compañías de servicios en Colombia.',
      'Nacimos para transformar la adquisición técnica B2B eliminando la intermediación innecesaria, suministrando marcas 100% originales con certificados oficiales de conformidad, facturación electrónica y despacho programado directamente a las instalaciones de nuestros clientes corporativos.',
    ],
    stats: [
      { value: '7+ Años', label: 'Abasteciendo grandes empresas' },
      { value: '100%', label: 'Marcas originales con garantía de fábrica' },
      { value: '24-48h', label: 'Tiempos estándar de entrega en Bogotá' },
      { value: '45 Días', label: 'Línea de crédito comercial con RUT' },
    ],
  },
  mission: {
    title: 'Nuestra Misión',
    description:
      'Abastecer a la industria, el sector constructor e institucional con suministros técnicos y ferreteros de primera calidad, proporcionando una solución logística ágil, confiable y oportuna que asegure la continuidad operativa de los proyectos de nuestros clientes corporativos.',
  },
  vision: {
    title: 'Nuestra Visión',
    description:
      'Consolidarnos como el distribuidor mayorista multimarca referente a nivel nacional en suministro industrial y ferretero, reconocido por la excelencia en servicio técnico comercial, trazabilidad certificada y un modelo logístico 100% digitalizado y eficiente.',
  },
  logistics: {
    title: 'Modelo Logístico y Operativo',
    description:
      'Coordinación centralizada de despachos directos a obra, planta o bodega corporativa a nivel nacional.',
    administrativeNotice: 'Sede Administrativa Centralizada',
    headquartersAddress: 'Carrera 55 A No. 51 A 28 Sur, Bogotá, Colombia',
    noCounterNotice:
      'Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)',
    features: [
      {
        title: 'Despacho 100% a Domicilio',
        description:
          'Entregas directas en obra, fábrica o bodega centralizada del cliente, evitando traslados y tiempos muertos.',
      },
      {
        title: 'Sin Venta por Mostrador',
        description:
          'Operación 100% enfocada en despachos programados B2B; no disponemos de atención en mostrador ni retiro en bodega.',
      },
      {
        title: 'Entregas 24-48h y 6h Urgencias',
        description:
          'Atención prioritaria en Bogotá para mantener el ritmo de su operación sin detenciones por falta de insumos.',
      },
      {
        title: 'Cobertura Bogotá y Sabana',
        description:
          'Despachos desde $50.000 COP en Bogotá y fletes económicos para los municipios de la Sabana.',
      },
    ],
  },
  safetyProtocols: {
    title: 'Protocolos de Seguridad y Salud en el Trabajo (SG-SST)',
    subtitle:
      'Cumplimiento riguroso de normativas y estándares para garantizar operaciones seguras y productos certificados.',
    items: [
      {
        id: 'epp-certificados',
        title: 'EPPs Homologados y Certificados',
        description:
          'Personal de logística y transporte equipado con EPPs homologados bajo normas ANSI e ICONTEC para ingreso seguro a plantas y obras.',
        icon: 'shield-check',
      },
      {
        id: 'trazabilidad-lotes',
        title: 'Trazabilidad Estricta de Lotes',
        description:
          'Control exhaustivo de números de lote, fechas de fabricación y certificados de calidad de cada insumo despachado.',
        icon: 'document-search',
      },
      {
        id: 'fichas-sds',
        title: 'Fichas Técnicas SDS Oficiales',
        description:
          'Disponibilidad inmediata de Hojas de Datos de Seguridad (SDS) y fichas técnicas oficiales para recubrimientos, químicos y materiales técnicos.',
        icon: 'document-text',
      },
      {
        id: 'entrega-segura-obra',
        title: 'Entrega y Descarga Segura en Obra',
        description:
          'Protocolos de estiba, aseguramiento de carga y maniobras seguras de descargue coordinadas con supervisores de obra.',
        icon: 'truck-check',
      },
    ],
  },
};
