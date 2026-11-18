import type { Brand, SectorId } from '@/content.config';
import { SECTOR_IDS } from '@/content.config';

export interface SectorMeta {
  id: SectorId;
  name: string;
  shortName: string;
  slug: string;
  anchor: string;
  accentBorderClass: string;
  accentTextClass: string;
  accentBgClass: string;
  badgeClass: string;
  description: string;
}

export const SECTORS_META: Record<SectorId, SectorMeta> = {
  'electrico': {
    id: 'electrico',
    name: 'Sector Eléctrico Industrial',
    shortName: 'Sector Eléctrico',
    slug: 'sector-electrico',
    anchor: 'sector-electrico',
    accentBorderClass: 'border-t-sector-electrico',
    accentTextClass: 'text-sector-electrico',
    accentBgClass: 'bg-red-50',
    badgeClass: 'text-red-700 bg-red-50 border-red-200/60',
    description: 'Conductores certificados RETIE, canalización, protección y cableado estructurado.',
  },
  'ferretero-construccion': {
    id: 'ferretero-construccion',
    name: 'Sector Ferretero & Construcción',
    shortName: 'Sector Ferretero & Construcción',
    slug: 'sector-ferretero-construccion',
    anchor: 'sector-ferretero',
    accentBorderClass: 'border-t-sector-ferretero',
    accentTextClass: 'text-sector-ferretero',
    accentBgClass: 'bg-amber-50',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200/60',
    description: 'Herramientas de potencia para trabajo pesado, fijaciones técnicas y construcción en seco.',
  },
  'hidraulico-pinturas': {
    id: 'hidraulico-pinturas',
    name: 'Sector Hidráulico & Pinturas',
    shortName: 'Sector Hidráulico & Pinturas',
    slug: 'sector-hidraulico-pinturas',
    anchor: 'sector-hidraulico',
    accentBorderClass: 'border-t-sector-hidraulico',
    accentTextClass: 'text-sector-hidraulico',
    accentBgClass: 'bg-blue-50',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200/60',
    description: 'Tuberías de presión, recubrimientos epóxicos, impermeabilizantes técnicos y químicos para construcción.',
  },
};

export const EXPECTED_TRACTOR_BRANDS_BY_SECTOR: Record<SectorId, readonly string[]> = {
  'electrico': ['panduit', 'centelsa', 'sylvania'],
  'ferretero-construccion': ['supermastick', 'stanley', 'dewalt', 'truper'],
  'hidraulico-pinturas': ['pavco-wavin', 'sika', 'pintuco'],
} as const;

export const ALL_EXPECTED_TRACTOR_BRAND_IDS = [
  ...EXPECTED_TRACTOR_BRANDS_BY_SECTOR['electrico'],
  ...EXPECTED_TRACTOR_BRANDS_BY_SECTOR['ferretero-construccion'],
  ...EXPECTED_TRACTOR_BRANDS_BY_SECTOR['hidraulico-pinturas'],
] as const;

export interface GroupedSectorBrands<T> {
  sector: SectorMeta;
  brands: T[];
}

/**
 * Filter items that represent tractor brands.
 * Supports raw Brand objects, Brand-like objects, or Astro CollectionEntry<'brands'>.
 * Defensively handles null and undefined items.
 */
export function filterTractorBrands<T extends { data?: Brand; isTractor?: boolean }>(
  items: (T | null | undefined)[]
): T[] {
  return items.filter((item): item is T => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    if ('data' in item && item.data) {
      return Boolean(item.data.isTractor);
    }
    return Boolean(item.isTractor);
  });
}

/**
 * Group brands by their industrial sector in canonical order.
 * Sorts brands within each sector according to EXPECTED_TRACTOR_BRANDS_BY_SECTOR.
 * Defensively handles null and undefined items.
 */
export function groupBrandsBySector<T extends { data?: Brand; sector?: SectorId; id?: string }>(
  items: (T | null | undefined)[]
): GroupedSectorBrands<T>[] {
  const validItems = items.filter((item): item is T => Boolean(item && typeof item === 'object'));

  return SECTOR_IDS.map((sectorId) => {
    const sector = SECTORS_META[sectorId];
    const expectedOrder = EXPECTED_TRACTOR_BRANDS_BY_SECTOR[sectorId];

    const brands = validItems.filter((item) => {
      const s = 'data' in item && item.data ? item.data.sector : item.sector;
      return s === sectorId;
    });

    brands.sort((a, b) => {
      const idA = (('data' in a && a.data ? a.data.id : a.id) || (a as { id?: string }).id || '').toLowerCase();
      const idB = (('data' in b && b.data ? b.data.id : b.id) || (b as { id?: string }).id || '').toLowerCase();

      const indexA = expectedOrder.indexOf(idA);
      const indexB = expectedOrder.indexOf(idB);

      const orderA = indexA === -1 ? 999 : indexA;
      const orderB = indexB === -1 ? 999 : indexB;

      return orderA - orderB;
    });

    return {
      sector,
      brands,
    };
  });
}

/**
 * Returns canonical silo URL for a brand id.
 * Defensively returns '#' if id is empty.
 * Normalizes id to lowercase.
 */
export function getBrandSiloUrl(id?: string | null): string {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return '#';
  }
  return `/distribuidor-${id.trim().toLowerCase()}-colombia`;
}

export interface SectorTechnicalCategory {
  title: string;
  description: string;
  keywords: string[];
}

export interface SectorTechnicalContent {
  id: SectorId;
  name: string;
  slug: string;
  h1: string;
  subtitle: string;
  maintenanceFocus: string;
  technicalCategoriesHeading: string;
  technicalCategories: SectorTechnicalCategory[];
  b2bKeywords: string[];
  onDemandNotice: {
    heading: string;
    description: string;
    ctaNote: string;
  };
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
  };
}

export const SECTOR_TECHNICAL_CONTENT: Record<SectorId, SectorTechnicalContent> = {
  'electrico': {
    id: 'electrico',
    name: 'Sector Eléctrico Industrial',
    slug: 'sector-electrico',
    h1: 'Suministro Mayorista para el Sector Eléctrico Industrial',
    subtitle:
      'Soluciones integrales de cableado estructurado, conductores certificados RETIE, breakers termo-magnéticos y canalización para mantenimiento de plantas e instalaciones corporativas.',
    maintenanceFocus:
      'Abastecimiento técnico para mantenimiento correctivo y locativo de redes eléctricas de baja y media tensión, subestaciones, centros de cómputo y plantas industriales con despacho a obra.',
    technicalCategoriesHeading: 'Soluciones Técnicas para Mantenimiento Correctivo y Locativo Eléctrico',
    technicalCategories: [
      {
        title: 'Cableado Estructurado y Redes de Datos',
        description:
          'Cables UTP/STP categoría 6 y 6A, fibra óptica monomodo/multimodo, patch panels, jacks y organizadores de rack Panduit para infraestructura TI.',
        keywords: ['cableado estructurado', 'redes de datos', 'fibra óptica', 'panduit', 'patch panels'],
      },
      {
        title: 'Conductores Certificados RETIE y Potencia',
        description:
          'Cables de cobre y aluminio certificados bajo norma RETIE, cables libres de halógeno (LSZH) y de fuerza para acometidas y tableros Centelsa by Nexans.',
        keywords: ['conductores certificados RETIE', 'cables de potencia', 'cables libres de halógeno', 'centelsa'],
      },
      {
        title: 'Breakers y Protecciones Termo-magnéticas',
        description:
          'Interruptores automáticos en caja moldeada, breakers enchufables y riel DIN, contactores, guardamotores y relés térmicos de protección.',
        keywords: ['breakers', 'protecciones termo-magnéticas', 'caja moldeada', 'guardamotores', 'interruptores'],
      },
      {
        title: 'Canalización y Gabinetes Industriales',
        description:
          'Tubería conduit metálica EMT e IMC, bandejas portacables tipo malla y escalera, cajas de paso y gabinetes autosoportados NEMA.',
        keywords: ['canalización y gabinetes', 'tubería conduit EMT', 'bandejas portacables', 'cajas de paso'],
      },
      {
        title: 'Iluminación Industrial y Reflectores LED',
        description:
          'Campanas industriales High Bay, reflectores estancos IP65/IP66 y paneles LED Sylvania para bodegas, hangares y plantas de producción.',
        keywords: ['iluminación industrial', 'reflectores LED', 'sylvania', 'campanas high bay'],
      },
    ],
    b2bKeywords: [
      'cableado estructurado',
      'conductores certificados RETIE',
      'breakers',
      'protecciones termo-magnéticas',
      'canalización y gabinetes',
      'mantenimiento eléctrico industrial',
    ],
    onDemandNotice: {
      heading: 'Disponibilidad Bajo Pedido Directo de Fábrica',
      description:
        'Marcas secundarias, calibres especiales de conductores y referencias de breakers o canalización fuera de vitrina se despachan bajo pedido directo de fábrica con cotización formal, fichas técnicas y garantía original.',
      ctaNote: 'Consolidamos su lista eléctrica completa en una sola factura y despacho a obra.',
    },
    seo: {
      title: 'Sector Eléctrico Industrial | Distribuidor Mayorista ASOEXI Colombia',
      description:
        'Distribución mayorista del Sector Eléctrico en Colombia: conductores certificados RETIE Centelsa, cableado estructurado Panduit, breakers termo-magnéticos y canalización con despacho a obra.',
      canonicalPath: '/sector-electrico',
    },
  },
  'ferretero-construccion': {
    id: 'ferretero-construccion',
    name: 'Sector Ferretero & Construcción',
    slug: 'sector-ferretero-construccion',
    h1: 'Suministro Mayorista para el Sector Ferretero y Construcción',
    subtitle:
      'Herramientas de potencia para trabajo pesado, discos de corte y abrasivos, fijaciones técnicas, masillas y sistemas de construcción liviana (drywall) con despacho consolidado en obra.',
    maintenanceFocus:
      'Soluciones para cuadrillas de obra civil, remodelaciones corporativas y mantenimiento locativo que requieren insumos de alta durabilidad y certificación de fábrica.',
    technicalCategoriesHeading: 'Soluciones Técnicas para Obras Civiles y Mantenimiento Locativo',
    technicalCategories: [
      {
        title: 'Herramientas de Potencia para Trabajo Pesado',
        description:
          'Taladros percutores, rotomartillos SDS, esmeriladoras angulares, sierras circulares y tronzadoras industriales DeWalt y Stanley.',
        keywords: ['herramientas de potencia para trabajo pesado', 'dewalt', 'stanley', 'rotomartillos', 'amoladoras'],
      },
      {
        title: 'Sistemas de Construcción Liviana (Drywall) y Masillas',
        description:
          'Masillas listas para usar Supermastick PR, cintas de papel microperforadas, perfiles estructurales de acero galvanizado y placas de yeso para tabiquería.',
        keywords: ['sistemas de construcción liviana (drywall)', 'masillas', 'supermastick', 'cintas drywall'],
      },
      {
        title: 'Discos de Corte, Desbaste y Abrasivos',
        description:
          'Discos de corte fino para metal, discos diamantados para concreto y mampostería, y abrasivos de alto rendimiento para preparación de superficies.',
        keywords: ['discos de corte', 'abrasivos', 'discos diamantados', 'desbaste'],
      },
      {
        title: 'Fijaciones Técnicas y Anclajes Estructurales',
        description:
          'Chazos mecánicos expansivos, anclajes químicos epóxicos, tornillería drywall fosfatada y pernos autorroscantes para fijación pesada en concreto y acero.',
        keywords: ['fijaciones técnicas', 'anclajes químicos', 'tornillos drywall', 'chazos'],
      },
      {
        title: 'Herramientas Manuales y Equipo de Medición',
        description:
          'Juegos de llaves, alicates de uso pesado, prensas, niveles láser, flexómetros y equipo de seguridad industrial Truper y Stanley.',
        keywords: ['herramientas manuales', 'truper', 'stanley', 'niveles láser'],
      },
    ],
    b2bKeywords: [
      'herramientas de potencia para trabajo pesado',
      'discos de corte',
      'abrasivos',
      'fijaciones técnicas',
      'masillas',
      'sistemas de construcción liviana (drywall)',
      'mantenimiento locativo',
    ],
    onDemandNotice: {
      heading: 'Disponibilidad Bajo Pedido Directo de Fábrica',
      description:
        'Marcas complementarias de ferretería pesada, referencias especiales de corte y fijación o volúmenes masivos de drywall y masillas se despachan bajo pedido directo con cotización formal y garantía del fabricante.',
      ctaNote: 'Despachamos listas completas de ferretería directamente en obra sin intermediarios.',
    },
    seo: {
      title: 'Sector Ferretero & Construcción | Distribuidor Mayorista ASOEXI Colombia',
      description:
        'Distribución mayorista de Ferretería y Construcción en Colombia: herramientas de potencia DeWalt, masillas Supermastick, sistemas drywall, discos de corte y fijaciones técnicas.',
      canonicalPath: '/sector-ferretero-construccion',
    },
  },
  'hidraulico-pinturas': {
    id: 'hidraulico-pinturas',
    name: 'Sector Hidráulico & Pinturas',
    slug: 'sector-hidraulico-pinturas',
    h1: 'Suministro Mayorista para el Sector Hidráulico y Pinturas',
    subtitle:
      'Tuberías de planta y fluidos a presión, recubrimientos epóxicos, impermeabilizantes técnicos y pinturas arquitectónicas de alto tráfico para mantenimiento de plantas e instalaciones.',
    maintenanceFocus:
      'Insumos técnicos para mantenimiento correctivo de redes hidrosanitarias industriales, conducción de fluidos a presión, sellado de cubiertas y protección de pisos en áreas de tráfico pesado.',
    technicalCategoriesHeading: 'Soluciones Técnicas para Redes de Fluidos y Mantenimiento de Superficies',
    technicalCategories: [
      {
        title: 'Tuberías de Planta y Fluidos a Presión',
        description:
          'Tubería y accesorios PVC presión, sanitaria, ventilación, CPVC para agua caliente y sistemas de conducción de aguas residuales e industriales Pavco Wavin.',
        keywords: ['tuberías de planta', 'fluidos a presión', 'pavco wavin', 'tubería pvc', 'accesorios presión'],
      },
      {
        title: 'Impermeabilización Técnica y Aditivos para Morteros',
        description:
          'Impermeabilizantes acrílicos y asfálticos, membranas continuas, aditivos hidrófugos para concreto y morteros de reparación estructural Sika.',
        keywords: ['impermeabilización', 'impermeabilizantes técnicos', 'sika', 'aditivos concreto'],
      },
      {
        title: 'Recubrimientos Epóxicos y Pinturas de Alto Tráfico',
        description:
          'Pintura epóxica bicomponente para pisos industriales, esmaltes anticorrosivos, demarcación vial y vinilos arquitectónicos de alto tráfico Pintuco.',
        keywords: ['recubrimientos epóxicos', 'pinturas arquitectónicas de alto tráfico', 'pintuco', 'pintura epóxica'],
      },
      {
        title: 'Selladores Elastoméricos y Químicos de Construcción',
        description:
          'Poliuretanos para sellado de juntas de dilatación en pisos y fachadas, siliconas industriales y adhesivos de montaje de alta adherencia.',
        keywords: ['selladores elastoméricos', 'poliuretano', 'juntas de dilatación'],
      },
      {
        title: 'Válvulas y Control Hidráulico Industrial',
        description:
          'Válvulas de compuerta, mariposa, bola y retención en bronce, hierro y termoplásticos para redes hidráulicas de alta exigencia.',
        keywords: ['válvulas industriales', 'control hidráulico', 'válvulas de compuerta'],
      },
    ],
    b2bKeywords: [
      'tuberías de planta',
      'fluidos a presión',
      'recubrimientos epóxicos',
      'impermeabilización',
      'impermeabilizantes técnicos',
      'pinturas arquitectónicas de alto tráfico',
      'mantenimiento hidrosanitario',
    ],
    onDemandNotice: {
      heading: 'Disponibilidad Bajo Pedido Directo de Fábrica',
      description:
        'Diámetros especiales de tuberías de planta, recubrimientos epóxicos de formulación especializada y marcas complementarias se entregan bajo pedido directo con cotización formal, soporte técnico y fichas de seguridad.',
      ctaNote: 'Consolidación hidrosanitaria y química en un solo despacho con garantía de fábrica.',
    },
    seo: {
      title: 'Sector Hidráulico & Pinturas | Distribuidor Mayorista ASOEXI Colombia',
      description:
        'Distribución mayorista del Sector Hidráulico y Pinturas en Colombia: tuberías de planta Pavco Wavin, impermeabilización Sika y recubrimientos epóxicos Pintuco con entrega en obra.',
      canonicalPath: '/sector-hidraulico-pinturas',
    },
  },
};

/**
 * Returns technical content for an industrial sector.
 * Defensively returns null if sectorId is unknown or invalid.
 */
export function getSectorTechnicalContent(sectorId?: string | null): SectorTechnicalContent | null {
  if (!sectorId || typeof sectorId !== 'string') {
    return null;
  }
  const normalized = sectorId.trim().toLowerCase() as SectorId;
  return SECTOR_TECHNICAL_CONTENT[normalized] ?? null;
}

/**
 * Filters and sorts brands for a specific sector.
 * Tractor brands are placed first in their canonical order defined in EXPECTED_TRACTOR_BRANDS_BY_SECTOR.
 * Secondary brands are placed afterwards, sorted alphabetically by name.
 * Defensively handles null and undefined items.
 */
export function getSectorBrands<
  T extends { data?: Brand; sector?: SectorId; isTractor?: boolean; id?: string; name?: string }
>(items: (T | null | undefined)[], sectorId: SectorId): T[] {
  if (!items || !Array.isArray(items) || !SECTOR_IDS.includes(sectorId)) {
    return [];
  }

  const validItems = items.filter((item): item is T => Boolean(item && typeof item === 'object'));
  const sectorItems = validItems.filter((item) => {
    const s = 'data' in item && item.data ? item.data.sector : item.sector;
    return s === sectorId;
  });

  const tractorOrder = EXPECTED_TRACTOR_BRANDS_BY_SECTOR[sectorId] || [];

  const tractorBrands: T[] = [];
  const secondaryBrands: T[] = [];

  for (const item of sectorItems) {
    const isTractor = 'data' in item && item.data ? Boolean(item.data.isTractor) : Boolean(item.isTractor);
    if (isTractor) {
      tractorBrands.push(item);
    } else {
      secondaryBrands.push(item);
    }
  }

  tractorBrands.sort((a, b) => {
    const idA = (('data' in a && a.data?.id ? a.data.id : (a as { id?: string }).id) || '').toLowerCase();
    const idB = (('data' in b && b.data?.id ? b.data.id : (b as { id?: string }).id) || '').toLowerCase();
    const indexA = tractorOrder.indexOf(idA);
    const indexB = tractorOrder.indexOf(idB);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    return orderA - orderB;
  });

  secondaryBrands.sort((a, b) => {
    const nameA = (('data' in a && a.data?.name ? a.data.name : (a as { name?: string; id?: string }).name) || (a as { id?: string }).id || '').toLowerCase();
    const nameB = (('data' in b && b.data?.name ? b.data.name : (b as { name?: string; id?: string }).name) || (b as { id?: string }).id || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return [...tractorBrands, ...secondaryBrands];
}
