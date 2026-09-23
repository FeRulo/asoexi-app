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
  },
  {
    id: 'sonia',
    name: 'Sonia',
    e164: '+573204498881',
    display: '+57 320 449 8881',
    role: 'Asesora Comercial',
  },
  {
    id: 'corporate',
    name: 'Línea Corporativa',
    e164: '+573044013761',
    display: '+57 304 401 3761',
    role: 'Atención Institucional',
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


