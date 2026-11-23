import { SECTOR_IDS } from '@/content.config';
import { SECTORS_META, getBrandSiloUrl } from '@/lib/brands';
import { SITE_METADATA } from '@/lib/constants';
import { resolveCanonicalUrl } from '@/lib/seo';

export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: SitemapChangeFreq;
  priority?: number;
}

export interface SitemapBrandInput {
  id?: string | null;
  isTractor?: boolean;
  data?: {
    id?: string | null;
    isTractor?: boolean;
  };
}

export interface BuildSitemapOptions {
  baseUrl?: string;
  lastmod?: string | Date;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const VALID_CHANGEFREQS: ReadonlySet<SitemapChangeFreq> = new Set([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
]);

/**
 * Escapa los 5 caracteres reservados de XML para garantizar documentos bien formados.
 */
export function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeBaseUrl(baseUrl?: string): string {
  const trimmed = typeof baseUrl === 'string' ? baseUrl.trim() : '';
  if (!trimmed || /\s/.test(trimmed)) {
    return SITE_METADATA.siteUrl;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return SITE_METADATA.siteUrl;
    }
    return parsed.origin.replace(/^http:/, 'https:');
  } catch {
    return SITE_METADATA.siteUrl;
  }
}

function normalizeLastmod(value?: string | Date): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (ISO_DATE_REGEX.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    if (
      utcDate.getUTCFullYear() === year &&
      utcDate.getUTCMonth() === month - 1 &&
      utcDate.getUTCDate() === day
    ) {
      return trimmed;
    }
    return undefined;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString().slice(0, 10);
}

function formatPriority(priority?: number): string | undefined {
  if (typeof priority !== 'number' || !Number.isFinite(priority) || priority < 0 || priority > 1) {
    return undefined;
  }
  const hundredths = Math.round(priority * 100);
  const rounded = hundredths / 100;
  return hundredths % 10 === 0 ? rounded.toFixed(1) : rounded.toFixed(2);
}

function compareByLoc(a: SitemapEntry, b: SitemapEntry): number {
  return a.loc < b.loc ? -1 : a.loc > b.loc ? 1 : 0;
}

/**
 * Construye la lista determinista y deduplicada de entradas del sitemap XML público:
 * Home (1.0), 3 Hubs de Sector (0.9), Marcas Tractoras (0.85), Marcas Secundarias (0.8) y Nosotros (0.7).
 */
export function buildSitemapEntries(
  brands: readonly (SitemapBrandInput | null | undefined)[] = [],
  options?: BuildSitemapOptions
): SitemapEntry[] {
  const baseUrl = normalizeBaseUrl(options?.baseUrl);
  const lastmod =
    options && options.lastmod !== undefined
      ? normalizeLastmod(options.lastmod)
      : new Date().toISOString().slice(0, 10);

  const makeEntry = (
    path: string,
    priority: number,
    changefreq: SitemapChangeFreq
  ): SitemapEntry => {
    const entry: SitemapEntry = {
      loc: resolveCanonicalUrl(path, baseUrl),
      changefreq,
      priority,
    };
    if (lastmod) {
      entry.lastmod = lastmod;
    }
    return entry;
  };

  const homeEntry = makeEntry('/', 1.0, 'weekly');
  const sectorEntries = SECTOR_IDS.map((sectorId) =>
    makeEntry(`/${SECTORS_META[sectorId].slug}`, 0.9, 'weekly')
  );
  const nosotrosEntry = makeEntry('/nosotros', 0.7, 'monthly');

  const brandMap = new Map<string, SitemapEntry>();

  if (Array.isArray(brands)) {
    for (const item of brands) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const rawId = item.data?.id || item.id;
      const isTractor = Boolean(item.data?.isTractor ?? item.isTractor);

      const siloPath = getBrandSiloUrl(rawId);
      if (siloPath === '#') {
        continue;
      }

      const priority = isTractor ? 0.85 : 0.8;
      const changefreq: SitemapChangeFreq = isTractor ? 'weekly' : 'monthly';
      const candidate = makeEntry(siloPath, priority, changefreq);

      const existing = brandMap.get(candidate.loc);
      if (!existing || (candidate.priority ?? 0) > (existing.priority ?? 0)) {
        brandMap.set(candidate.loc, candidate);
      }
    }
  }

  const brandEntries = Array.from(brandMap.values());
  const tractorBrandEntries = brandEntries
    .filter((e) => e.priority === 0.85)
    .sort(compareByLoc);
  const secondaryBrandEntries = brandEntries
    .filter((e) => e.priority !== 0.85)
    .sort(compareByLoc);

  const ordered = [
    homeEntry,
    ...sectorEntries,
    ...tractorBrandEntries,
    ...secondaryBrandEntries,
    nosotrosEntry,
  ];

  // Garantiza unicidad global preservando la entrada de mayor prioridad
  const deduped = new Map<string, SitemapEntry>();
  for (const entry of ordered) {
    const existing = deduped.get(entry.loc);
    if (!existing || (entry.priority ?? 0) > (existing.priority ?? 0)) {
      deduped.set(entry.loc, entry);
    }
  }

  return Array.from(deduped.values());
}

/**
 * Serializa las entradas del sitemap a XML 1.0 UTF-8 conforme al protocolo sitemaps.org 0.9.
 */
export function renderSitemapXml(entries: readonly SitemapEntry[]): string {
  const urlBlocks: string[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry.loc !== 'string' || entry.loc.trim().length === 0) {
      continue;
    }

    const lines = [`  <url>`, `    <loc>${escapeXml(entry.loc.trim())}</loc>`];

    const normalizedLastmod = normalizeLastmod(entry.lastmod);
    if (normalizedLastmod) {
      lines.push(`    <lastmod>${escapeXml(normalizedLastmod)}</lastmod>`);
    }

    if (entry.changefreq && VALID_CHANGEFREQS.has(entry.changefreq)) {
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }

    const formattedPriority = formatPriority(entry.priority);
    if (formattedPriority !== undefined) {
      lines.push(`    <priority>${formattedPriority}</priority>`);
    }

    lines.push(`  </url>`);
    urlBlocks.push(lines.join('\n'));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlBlocks,
    '</urlset>',
    '',
  ].join('\n');
}
