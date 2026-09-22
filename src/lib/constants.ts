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
    name: 'Sonia Franco',
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

