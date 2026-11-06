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
    name: 'Sector Hidráulico & Químico / Pinturas',
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
