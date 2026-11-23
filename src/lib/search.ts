export type SectorId = 'electrico' | 'ferretero-construccion' | 'hidraulico-pinturas';

export type SearchItemType = 'brand' | 'sector';

export interface SearchIndexItem {
  id: string;
  name: string;
  type: SearchItemType;
  sector: SectorId;
  sectorName: string;
  isTractor?: boolean;
  description: string;
  url: string;
  logo?: string | null;
  keywords?: string[];
}

export interface SearchBrandInput {
  id: string;
  name: string;
  sector: SectorId;
  isTractor?: boolean;
  description: string;
  applicationNotes?: string;
  pdfCatalogUrl?: string | null;
  logo?: string | null;
}

export interface SearchCategoryInput {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
}

const SECTOR_NAMES: Record<SectorId, string> = {
  'electrico': 'Sector Eléctrico Industrial',
  'ferretero-construccion': 'Sector Ferretero & Construcción',
  'hidraulico-pinturas': 'Sector Hidráulico & Pinturas',
};

const SECTOR_SHORT_NAMES: Record<SectorId, string> = {
  'electrico': 'Sector Eléctrico',
  'ferretero-construccion': 'Sector Ferretero & Construcción',
  'hidraulico-pinturas': 'Sector Hidráulico & Pinturas',
};

function resolveBrandSiloUrl(id?: string | null): string {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return '#';
  }
  return `/distribuidor-${id.trim().toLowerCase()}-colombia`;
}

/**
 * Sanitizes raw user input from the search box.
 * Trims whitespace, collapses internal multiple spaces,
 * strips HTML / script injection characters while preserving
 * slashes and dimension quotes (e.g. 1/2", 3/4").
 */
export function sanitizeSearchQuery(rawQuery?: string | null): string {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return '';
  }

  return rawQuery
    .replace(/[<>'\\`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes text for accent-insensitive and case-insensitive searching.
 */
function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeBrandLogoPath(logo?: string | null): string | null {
  if (!logo || typeof logo !== 'string') {
    return null;
  }
  const trimmed = logo.trim();
  if (trimmed.length === 0 || trimmed === '#' || trimmed.toLowerCase().startsWith('javascript:')) {
    return null;
  }
  return trimmed;
}

/**
 * Builds a search index array from brands and categories.
 */
export function buildSearchIndex(
  brands: SearchBrandInput[] = [],
  categories: SearchCategoryInput[] = []
): SearchIndexItem[] {
  const brandItems: SearchIndexItem[] = brands.map((brand) => {
    const sectorName = SECTOR_NAMES[brand.sector] || brand.sector;
    const shortName = SECTOR_SHORT_NAMES[brand.sector];
    const keywords: string[] = [brand.name, brand.sector, sectorName];
    if (shortName) keywords.push(shortName);

    if (brand.applicationNotes) {
      const notesWords = brand.applicationNotes
        .split(/[,.;\n]+/)
        .map((w) => w.trim())
        .filter(Boolean);
      keywords.push(...notesWords);
    }

    return {
      id: brand.id,
      name: brand.name,
      type: 'brand',
      sector: brand.sector,
      sectorName,
      isTractor: Boolean(brand.isTractor),
      description: brand.description,
      url: resolveBrandSiloUrl(brand.id),
      logo: normalizeBrandLogoPath(brand.logo),
      keywords,
    };
  });

  const categoryItems: SearchIndexItem[] = categories.map((cat) => {
    const sectorId = cat.id as SectorId;
    const sectorName = SECTOR_NAMES[sectorId] || cat.name;
    const shortName = SECTOR_SHORT_NAMES[sectorId];
    const slug = cat.slug.startsWith('/') ? cat.slug : `/${cat.slug}`;

    return {
      id: cat.id,
      name: cat.name,
      type: 'sector',
      sector: sectorId,
      sectorName,
      isTractor: false,
      description: cat.description,
      url: slug,
      logo: null,
      keywords: [cat.name, cat.shortDescription || '', ...(shortName ? [shortName] : [])],
    };
  });

  return [...brandItems, ...categoryItems];
}

/**
 * Filters and ranks search index items based on a search query.
 * Fast, pure JavaScript algorithm (< 5ms for hundreds of items).
 * Returns empty array if query is empty or whitespace.
 */
export function filterSearchIndex(
  index: SearchIndexItem[],
  rawQuery?: string | null
): SearchIndexItem[] {
  const sanitized = sanitizeSearchQuery(rawQuery);
  if (!sanitized) {
    return [];
  }

  const normalizedQuery = normalizeSearchText(sanitized);
  const queryTerms = normalizedQuery.split(/[\s,.;]+/).filter(Boolean);

  if (queryTerms.length === 0) {
    return [];
  }

  interface ScoredItem {
    item: SearchIndexItem;
    score: number;
  }

  const scoredItems: ScoredItem[] = [];

  for (const item of index) {
    const normName = normalizeSearchText(item.name);
    const normId = normalizeSearchText(item.id);
    const normDesc = normalizeSearchText(item.description);
    const normSector = normalizeSearchText(item.sectorName);
    const normKeywords = (item.keywords || []).map((k) => normalizeSearchText(k)).join(' ');

    let score = 0;

    // Check if whole query matches name
    if (normName === normalizedQuery) {
      score += 150;
    } else if (normName.startsWith(normalizedQuery)) {
      score += 100;
    } else if (normName.includes(normalizedQuery)) {
      score += 60;
    }

    if (normId === normalizedQuery) {
      score += 120;
    } else if (normId.startsWith(normalizedQuery)) {
      score += 70;
    } else if (normId.includes(normalizedQuery)) {
      score += 40;
    }

    // Check individual terms
    let allTermsMatch = true;
    for (const term of queryTerms) {
      let termMatched = false;
      if (normName.includes(term)) {
        score += 30;
        termMatched = true;
      }
      if (normId.includes(term)) {
        score += 20;
        termMatched = true;
      }
      if (normDesc.includes(term)) {
        score += 15;
        termMatched = true;
      }
      if (normKeywords.includes(term)) {
        score += 15;
        termMatched = true;
      }
      if (normSector.includes(term)) {
        score += 10;
        termMatched = true;
      }

      if (!termMatched) {
        allTermsMatch = false;
        break;
      }
    }

    if (allTermsMatch && score > 0) {
      if (item.isTractor) {
        score += 10;
      }
      scoredItems.push({ item, score });
    }
  }

  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((s) => s.item);
}
