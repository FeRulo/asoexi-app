import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildSitemapEntries,
  escapeXml,
  renderSitemapXml,
  type SitemapChangeFreq,
} from '@/lib/sitemap';
import { brandSchema, type Brand } from '@/content.config';
import {
  SECTOR_TECHNICAL_CONTENT,
  getBrandH1Title,
} from '@/lib/brands';
import { SITE_METADATA } from '@/lib/constants';
import { GET as getSitemap, prerender as sitemapPrerender } from '@/pages/sitemap.xml';

vi.mock('astro:content', async () => {
  const fsModule = await import('node:fs');
  const pathModule = await import('node:path');
  return {
    defineCollection: vi.fn((config: unknown) => config),
    getCollection: vi.fn(async (collection: string) => {
      const dir = pathModule.join(process.cwd(), 'src/content', collection);
      if (!fsModule.existsSync(dir)) return [];
      const files = fsModule.readdirSync(dir);
      return files
        .filter((f: string) => f.endsWith('.json'))
        .map((file: string) => ({
          id: file.replace(/\.json$/, ''),
          data: JSON.parse(fsModule.readFileSync(pathModule.join(dir, file), 'utf-8')),
        }));
    }),
  };
});

describe('Story 5.1: Sitemap XML Dinámico & Optimización Semántica (SEO/AEO)', () => {
  const brandsDir = path.resolve(process.cwd(), 'src/content/brands');
  const brandFiles = fs.readdirSync(brandsDir).filter((file) => file.endsWith('.json'));
  const allLoadedBrands: Brand[] = brandFiles.map((file) => {
    const filePath = path.join(brandsDir, file);
    return brandSchema.parse(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
  });
  const expectedTractorCount = allLoadedBrands.filter((b) => b.isTractor).length;
  const expectedSecondaryCount = allLoadedBrands.length - expectedTractorCount;
  const expectedTotalUrls = allLoadedBrands.length + 5; // Home + 3 sector hubs + Nosotros + brands

  describe('1. Generador puro de Sitemap XML (src/lib/sitemap.ts)', () => {
    it('debe generar todas las URLs canónicas absolutas para el catálogo completo (Home, 3 Hubs, Marcas y Nosotros)', () => {
      const entries = buildSitemapEntries(allLoadedBrands, { lastmod: '2026-11-23' });

      expect(allLoadedBrands.length).toBeGreaterThanOrEqual(40);
      expect(entries).toHaveLength(expectedTotalUrls);

      const locs = entries.map((e) => e.loc);
      expect(new Set(locs).size).toBe(expectedTotalUrls);

      for (const entry of entries) {
        expect(entry.loc.startsWith('https://asoexi.com')).toBe(true);
        expect(entry.lastmod).toBe('2026-11-23');
        expect(entry.priority).toBeDefined();
        expect(entry.loc).not.toContain('/api/');
        expect(entry.loc).not.toContain('/search-index.json');
      }
    });

    it('debe asignar prioridades y changefreq jerárquicos exactos por nivel', () => {
      const entries = buildSitemapEntries(allLoadedBrands, { lastmod: '2026-11-23' });
      const byLoc = new Map(entries.map((e) => [e.loc, e]));

      expect(byLoc.get('https://asoexi.com/')?.priority).toBe(1.0);
      expect(byLoc.get('https://asoexi.com/')?.changefreq).toBe('weekly');

      for (const sectorSlug of [
        '/sector-electrico',
        '/sector-ferretero-construccion',
        '/sector-hidraulico-pinturas',
      ]) {
        const sectorEntry = byLoc.get(`https://asoexi.com${sectorSlug}`);
        expect(sectorEntry?.priority).toBe(0.9);
        expect(sectorEntry?.changefreq).toBe('weekly');
      }

      expect(byLoc.get('https://asoexi.com/nosotros')?.priority).toBe(0.7);
      expect(byLoc.get('https://asoexi.com/nosotros')?.changefreq).toBe('monthly');

      const tractorEntries = entries.filter((e) => e.priority === 0.85);
      const secondaryEntries = entries.filter((e) => e.priority === 0.8);

      expect(tractorEntries).toHaveLength(expectedTractorCount);
      expect(secondaryEntries).toHaveLength(expectedSecondaryCount);
      expect(tractorEntries.every((e) => e.changefreq === 'weekly')).toBe(true);
      expect(secondaryEntries.every((e) => e.changefreq === 'monthly')).toBe(true);
    });

    it('debe mantener un orden determinista independiente del orden de entrada de las marcas', () => {
      const entriesForward = buildSitemapEntries(allLoadedBrands, { lastmod: '2026-11-23' });
      const entriesReversed = buildSitemapEntries([...allLoadedBrands].reverse(), {
        lastmod: '2026-11-23',
      });

      expect(entriesReversed).toEqual(entriesForward);
    });

    it('debe soportar objetos Astro CollectionEntry<\'brands\'> y fallback a campos raíz cuando data es parcial', () => {
      const collectionEntries = allLoadedBrands.map((brand) => ({
        id: brand.id,
        data: brand,
      }));
      const entries = buildSitemapEntries(collectionEntries, { lastmod: '2026-11-23' });

      expect(entries).toHaveLength(expectedTotalUrls);
      expect(entries.some((e) => e.loc === 'https://asoexi.com/distribuidor-dewalt-colombia')).toBe(true);

      const partialDataEntries = buildSitemapEntries(
        [{ id: 'dewalt', isTractor: true, data: {} }],
        { lastmod: '2026-11-23' }
      );
      const dewalt = partialDataEntries.find(
        (e) => e.loc === 'https://asoexi.com/distribuidor-dewalt-colombia'
      );
      expect(dewalt?.priority).toBe(0.85);
      expect(dewalt?.changefreq).toBe('weekly');
    });

    it('debe normalizar y deduplicar marcas sucias conservando la mayor prioridad e ignorando IDs inválidos', () => {
      const dirtyBrands = [
        { id: ' Dewalt ', isTractor: false },
        { id: 'dewalt', isTractor: true },
        { id: '   ', isTractor: true },
        { id: '', isTractor: false },
        null,
        undefined,
      ] as unknown as Brand[];

      const entries = buildSitemapEntries(dirtyBrands, { lastmod: '2026-11-23' });
      // Home + 3 sectors + 1 deduplicated brand (dewalt) + Nosotros = 6
      expect(entries).toHaveLength(6);

      const dewalt = entries.find(
        (e) => e.loc === 'https://asoexi.com/distribuidor-dewalt-colombia'
      );
      expect(dewalt).toBeDefined();
      expect(dewalt?.priority).toBe(0.85);
      expect(dewalt?.changefreq).toBe('weekly');
    });

    it('debe normalizar baseUrl con http://, query/fragmentos y hacer fallback a SITE_METADATA.siteUrl ante URLs malformadas', () => {
      const entriesHttp = buildSitemapEntries([{ id: 'dewalt', isTractor: true }], {
        baseUrl: 'http://asoexi.com/?utm_source=test#hash',
        lastmod: '2026-11-23',
      });

      for (const entry of entriesHttp) {
        expect(entry.loc.startsWith('https://asoexi.com/')).toBe(true);
        expect(entry.loc).not.toContain('?');
        expect(entry.loc).not.toContain('#');
        expect(entry.loc.replace('https://', '')).not.toContain('//');
      }

      for (const malformed of ['   ', 'not-a-url', 'https://asoexi.com/ con espacios', 'ftp://asoexi.com']) {
        const entriesFallback = buildSitemapEntries([{ id: 'dewalt', isTractor: true }], {
          baseUrl: malformed,
          lastmod: '2026-11-23',
        });
        expect(entriesFallback[0].loc).toBe(`${SITE_METADATA.siteUrl}/`);
      }
    });

    it('debe escapar caracteres especiales XML y formatear prioridades redondeadas en escapeXml y renderSitemapXml', () => {
      expect(escapeXml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &apos;');

      const xml = renderSitemapXml([
        {
          loc: `https://asoexi.com/search?a=1&b="x"&c='<tag>'`,
          lastmod: '2026-11-23T15:30:00Z',
          changefreq: 'weekly',
          priority: 0.854,
        },
        {
          loc: 'https://asoexi.com/rounded',
          priority: 0.896,
        },
      ]);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain(
        '<loc>https://asoexi.com/search?a=1&amp;b=&quot;x&quot;&amp;c=&apos;&lt;tag&gt;&apos;</loc>'
      );
      expect(xml).toContain('<lastmod>2026-11-23</lastmod>');
      expect(xml).toContain('<changefreq>weekly</changefreq>');
      expect(xml).toContain('<priority>0.85</priority>');
      expect(xml).toContain('<priority>0.9</priority>');
      expect(xml).toContain('</urlset>');
    });

    it('debe omitir lastmod y changefreq inválidos sin generar XML malformado', () => {
      const xml = renderSitemapXml([
        {
          loc: 'https://asoexi.com/',
          lastmod: 'fecha-invalida',
          changefreq: 'every-minute' as unknown as SitemapChangeFreq,
          priority: 1.0,
        },
        {
          loc: 'https://asoexi.com/nosotros',
          lastmod: '2026-02-31',
          changefreq: 'monthly',
          priority: 0.7,
        },
      ]);

      expect(xml).not.toContain('<lastmod>');
      expect(xml).not.toContain('<changefreq>every-minute</changefreq>');
      expect(xml).toContain('<changefreq>monthly</changefreq>');
      expect(xml).toContain('<priority>1.0</priority>');
      expect(xml).toContain('<priority>0.7</priority>');
    });
  });

  describe('2. Endpoint estático Astro (src/pages/sitemap.xml.ts)', () => {
    it('debe exportar prerender = true y retornar XML válido con headers y todas las URLs públicas', async () => {
      expect(sitemapPrerender).toBe(true);

      const response = await getSitemap({} as Parameters<typeof getSitemap>[0]);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
      expect(response.headers.get('Cache-Control')).toContain('public');

      const xml = await response.text();
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

      const locMatches = xml.match(/<loc>[^<]+<\/loc>/g) ?? [];
      expect(locMatches).toHaveLength(expectedTotalUrls);
      expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
      expect(xml).not.toContain('/api/');
      expect(xml).not.toContain('/search-index.json');
    });
  });

  describe('3. Directivas de rastreo SEO/AEO (public/robots.txt) y descubrimiento en HTML', () => {
    it('debe existir public/robots.txt con Allow /, Disallow /api/ y /search-index.json, bots AEO y Sitemap absoluto', () => {
      const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);

      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Disallow: /api/');
      expect(content).toContain('Disallow: /search-index.json');
      expect(content).toContain('Sitemap: https://asoexi.com/sitemap.xml');

      const aeoBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
      for (const bot of aeoBots) {
        expect(content).toContain(`User-agent: ${bot}`);
      }
    });

    it('debe declarar <link rel="sitemap" type="application/xml" href="/sitemap.xml" /> en SEOHead.astro', () => {
      const seoHeadPath = path.resolve(process.cwd(), 'src/components/seo/SEOHead.astro');
      const content = fs.readFileSync(seoHeadPath, 'utf-8');
      expect(content).toContain('<link rel="sitemap" type="application/xml" href="/sitemap.xml" />');
    });
  });

  describe('4. Optimización Semántica para Motores de Búsqueda e IA (3 Clústeres B2B/AEO)', () => {
    it('Home (index.astro) y SITE_METADATA deben consolidar el clúster "distribuidor mayorista de insumos para mantenimiento" y Bogotá', () => {
      const indexPath = path.resolve(process.cwd(), 'src/pages/index.astro');
      const indexSource = fs.readFileSync(indexPath, 'utf-8').toLowerCase();

      expect(indexSource).toContain('distribuidor mayorista de insumos para mantenimiento');
      expect(indexSource).toContain('bogotá');
      expect(SITE_METADATA.defaultDescription.toLowerCase()).toContain(
        'insumos para mantenimiento industrial'
      );
    });

    it('Hub Sector Eléctrico debe consolidar el clúster "breakers y conductores eléctricos" en Bogotá', () => {
      const electrico = SECTOR_TECHNICAL_CONTENT['electrico'];

      expect(electrico.seo.title.toLowerCase()).toContain('breakers y conductores eléctricos');
      expect(electrico.seo.title.toLowerCase()).toContain('bogotá');
      expect(electrico.seo.description.toLowerCase()).toContain('breakers y conductores eléctricos');
      expect(electrico.seo.description.toLowerCase()).toContain('bogotá');
      expect(electrico.technicalCategoriesHeading.toLowerCase()).toContain(
        'breakers y conductores eléctricos'
      );
      expect(electrico.technicalCategoriesHeading.toLowerCase()).toContain('bogotá');
      expect(
        electrico.b2bKeywords.some((k) =>
          k.toLowerCase().includes('breakers y conductores eléctricos')
        )
      ).toBe(true);
    });

    it('Silos de marca deben consolidar el clúster "Distribuidor Autorizado [Marca] en Colombia"', () => {
      expect(getBrandH1Title('DeWalt').toLowerCase()).toContain(
        'distribuidor autorizado dewalt en colombia'
      );
      expect(getBrandH1Title('Centelsa').toLowerCase()).toContain(
        'distribuidor autorizado centelsa en colombia'
      );
    });
  });
});
