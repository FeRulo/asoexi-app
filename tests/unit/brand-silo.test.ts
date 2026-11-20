import { describe, it, expect } from 'vitest';
import {
  getBrandSiloUrl,
  getBrandH1Title,
  buildBrandBreadcrumbs,
  hasValidBrandLogo,
  getBrandLogisticsPromise,
  hasValidPdfCatalog,
  normalizePdfCatalogUrl,
  getBrandProductFamilies,
  getBrandSourcingNotes,
  isBrandContentSubstantial,
} from '@/lib/brands';
import { resolveCanonicalUrl, generateBreadcrumbsSchema } from '@/lib/seo';
import { generateBrandQuoteWhatsAppUrl } from '@/lib/whatsapp';

describe('Brand Silo Unit Tests (Story 3.1: /distribuidor-[brand]-colombia)', () => {
  describe('Canonical URL resolution for Brand Silos (getBrandSiloUrl)', () => {
    it('should generate canonical relative path /distribuidor-[brand]-colombia', () => {
      expect(getBrandSiloUrl('panduit')).toBe('/distribuidor-panduit-colombia');
      expect(getBrandSiloUrl('sika')).toBe('/distribuidor-sika-colombia');
      expect(getBrandSiloUrl('pavco-wavin')).toBe('/distribuidor-pavco-wavin-colombia');
      expect(getBrandSiloUrl('supermastick')).toBe('/distribuidor-supermastick-colombia');
    });

    it('should normalize uppercase letters and surrounding whitespace', () => {
      expect(getBrandSiloUrl(' Panduit ')).toBe('/distribuidor-panduit-colombia');
      expect(getBrandSiloUrl('DEWALT')).toBe('/distribuidor-dewalt-colombia');
      expect(getBrandSiloUrl('  Truper  ')).toBe('/distribuidor-truper-colombia');
    });

    it('should resolve to absolute canonical production URL with https and no duplicate slashes', () => {
      const siloUrl = getBrandSiloUrl('panduit');
      const canonicalAbsolute = resolveCanonicalUrl(siloUrl);
      expect(canonicalAbsolute).toBe('https://asoexi.com/distribuidor-panduit-colombia');
    });

    it('should guard against null, undefined or empty brand IDs', () => {
      expect(getBrandSiloUrl('')).toBe('#');
      expect(getBrandSiloUrl(null)).toBe('#');
      expect(getBrandSiloUrl(undefined)).toBe('#');
      expect(getBrandSiloUrl('   ')).toBe('#');
    });
  });

  describe('Breadcrumb items generation for Brand Silos (buildBrandBreadcrumbs)', () => {
    it('should build 3-tier hierarchy: Inicio > Sector Eléctrico > Panduit', () => {
      const items = buildBrandBreadcrumbs('Panduit', 'panduit', 'electrico');
      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ name: 'Inicio', url: '/' });
      expect(items[1]).toEqual({ name: 'Sector Eléctrico', url: '/sector-electrico' });
      expect(items[2]).toEqual({ name: 'Panduit', url: '/distribuidor-panduit-colombia' });
    });

    it('should build 3-tier hierarchy: Inicio > Sector Ferretero & Construcción > Stanley', () => {
      const items = buildBrandBreadcrumbs('Stanley', 'stanley', 'ferretero-construccion');
      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ name: 'Inicio', url: '/' });
      expect(items[1]).toEqual({ name: 'Sector Ferretero & Construcción', url: '/sector-ferretero-construccion' });
      expect(items[2]).toEqual({ name: 'Stanley', url: '/distribuidor-stanley-colombia' });
    });

    it('should build 3-tier hierarchy: Inicio > Sector Hidráulico & Pinturas > Sika', () => {
      const items = buildBrandBreadcrumbs('Sika', 'sika', 'hidraulico-pinturas');
      expect(items).toHaveLength(3);
      expect(items[0]).toEqual({ name: 'Inicio', url: '/' });
      expect(items[1]).toEqual({ name: 'Sector Hidráulico & Pinturas', url: '/sector-hidraulico-pinturas' });
      expect(items[2]).toEqual({ name: 'Sika', url: '/distribuidor-sika-colombia' });
    });

    it('should accept custom siloUrl override if provided', () => {
      const items = buildBrandBreadcrumbs(
        'Panduit',
        'panduit',
        'electrico',
        '/distribuidor-panduit-colombia?v=2'
      );
      expect(items[2]).toEqual({ name: 'Panduit', url: '/distribuidor-panduit-colombia?v=2' });
    });

    it('should provide safe fallback when sector is unknown or empty', () => {
      const items = buildBrandBreadcrumbs('CustomBrand', 'custom-brand', 'unknown-sector');
      expect(items).toHaveLength(3);
      expect(items[1].name).toBe('Sector Industrial');
      expect(items[1].url).toBe('/sector-unknown-sector');

      const emptySectorItems = buildBrandBreadcrumbs(null, '', null);
      expect(emptySectorItems[0]).toEqual({ name: 'Inicio', url: '/' });
      expect(emptySectorItems[1].name).toBe('Sector Industrial');
      expect(emptySectorItems[2].name).toBe('Marca');
    });

    it('should convert breadcrumbs into valid Schema.org BreadcrumbList with absolute URLs', () => {
      const items = buildBrandBreadcrumbs('Stanley', 'stanley', 'ferretero-construccion');
      const schema = generateBreadcrumbsSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);

      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://asoexi.com/',
      });

      expect(schema.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Sector Ferretero & Construcción',
        item: 'https://asoexi.com/sector-ferretero-construccion',
      });

      expect(schema.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Stanley',
        item: 'https://asoexi.com/distribuidor-stanley-colombia',
      });
    });
  });

  describe('H1 Title Formulation (getBrandH1Title)', () => {
    it('should generate exact H1 formula required by specification', () => {
      expect(getBrandH1Title('Panduit')).toBe(
        'Distribuidor Autorizado Panduit en Colombia e Insumos Mayoristas'
      );
      expect(getBrandH1Title('Sika')).toBe(
        'Distribuidor Autorizado Sika en Colombia e Insumos Mayoristas'
      );
      expect(getBrandH1Title('Pavco Wavin')).toBe(
        'Distribuidor Autorizado Pavco Wavin en Colombia e Insumos Mayoristas'
      );
    });

    it('should trim brand name and handle null/empty defensively', () => {
      expect(getBrandH1Title('  DeWalt  ')).toBe(
        'Distribuidor Autorizado DeWalt en Colombia e Insumos Mayoristas'
      );
      expect(getBrandH1Title('')).toBe(
        'Distribuidor Autorizado en Colombia e Insumos Mayoristas'
      );
      expect(getBrandH1Title(null)).toBe(
        'Distribuidor Autorizado en Colombia e Insumos Mayoristas'
      );
      expect(getBrandH1Title(undefined)).toBe(
        'Distribuidor Autorizado en Colombia e Insumos Mayoristas'
      );
    });
  });

  describe('WhatsApp CTA Integration', () => {
    it('should generate WhatsApp URL with correct corporate phone and contextual message', () => {
      const url = generateBrandQuoteWhatsAppUrl('Panduit');
      expect(url).toContain('https://wa.me/573014191344?text=');
      expect(url).toContain(encodeURIComponent('Panduit'));
      expect(decodeURIComponent(url)).toContain(
        'Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar una cotización formal para la marca Panduit'
      );
    });

    it('should safely fall back to default corporate quote message if brand name is empty', () => {
      const url = generateBrandQuoteWhatsAppUrl('');
      expect(url).toContain('https://wa.me/573014191344?text=');
      expect(decodeURIComponent(url)).toContain(
        'Hola ASOEXI (Geraldine y Sonia), vi su página web y deseo solicitar una cotización formal'
      );
    });
  });

  describe('EDGE-2 Logo Fallback resilience (hasValidBrandLogo)', () => {
    it('should return false for null, undefined, or empty string logo', () => {
      expect(hasValidBrandLogo(null)).toBe(false);
      expect(hasValidBrandLogo(undefined)).toBe(false);
      expect(hasValidBrandLogo('')).toBe(false);
      expect(hasValidBrandLogo('   ')).toBe(false);
    });

    it('should return true for valid logo image paths', () => {
      expect(hasValidBrandLogo('/images/brands/panduit.svg')).toBe(true);
      expect(hasValidBrandLogo('https://cdn.asoexi.com/brands/sika.png')).toBe(true);
    });
  });

  describe('Brand Collection Silo Integrity', () => {
    it('should verify all brand content files have valid canonical silo paths and metadata', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const brandsDir = path.resolve(process.cwd(), 'src/content/brands');
      const files = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.json'));

      expect(files.length).toBeGreaterThan(0);

      for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(brandsDir, file), 'utf-8'));
        expect(content.id).toBeDefined();
        expect(content.id.trim()).not.toBe('');
        expect(content.name).toBeDefined();
        expect(content.name.trim()).not.toBe('');
        expect(content.sector).toBeDefined();
        expect(['electrico', 'ferretero-construccion', 'hidraulico-pinturas']).toContain(content.sector);

        const siloUrl = getBrandSiloUrl(content.id);
        expect(siloUrl).toBe(`/distribuidor-${content.id.toLowerCase()}-colombia`);

        const canonicalUrl = resolveCanonicalUrl(siloUrl);
        expect(canonicalUrl).toBe(`https://asoexi.com/distribuidor-${content.id.toLowerCase()}-colombia`);

        const h1 = getBrandH1Title(content.name);
        expect(h1).toBe(`Distribuidor Autorizado ${content.name.trim()} en Colombia e Insumos Mayoristas`);
        expect(h1).toContain(content.name.trim());
      }
    });
  });

  describe('Differentiated Logistics Promise (Story 3.2: getBrandLogisticsPromise)', () => {
    it('should return urgent delivery promise for tractor brands (isTractor: true)', () => {
      const promise = getBrandLogisticsPromise(true);
      expect(promise.isTractor).toBe(true);
      expect(promise.urgentDelivery).toBe(true);
      expect(promise.promise).toBe('Entrega 24-48h regular en Bogotá y 6h urgencias en obra');
      expect(promise.creditDaysNotice).toContain('45 días');
      expect(promise.dianNotice).toContain('DIAN');
      expect(promise.badgeLabel).toBeDefined();
    });

    it('should return on-demand direct factory delivery promise for secondary brands (isTractor: false)', () => {
      const promise = getBrandLogisticsPromise(false);
      expect(promise.isTractor).toBe(false);
      expect(promise.urgentDelivery).toBe(false);
      expect(promise.promise).toBe('Suministro de portafolio completo bajo pedido directo a fábrica (~48-72h)');
      expect(promise.promise).not.toContain('6h urgencias');
      expect(promise.creditDaysNotice).toContain('45 días');
      expect(promise.badgeLabel).toBeDefined();
    });
  });

  describe('Conditional PDF Catalog Detection (Story 3.2: hasValidPdfCatalog)', () => {
    it('should return true for valid PDF URLs or local paths', () => {
      expect(hasValidPdfCatalog('/catalogs/panduit-2026.pdf')).toBe(true);
      expect(hasValidPdfCatalog('https://cdn.asoexi.com/catalogs/sika.pdf')).toBe(true);
      expect(hasValidPdfCatalog('relative/path/catalog.pdf')).toBe(true);
    });

    it('should return false for null, undefined, empty string or whitespace (EDGE-2)', () => {
      expect(hasValidPdfCatalog(null)).toBe(false);
      expect(hasValidPdfCatalog(undefined)).toBe(false);
      expect(hasValidPdfCatalog('')).toBe(false);
      expect(hasValidPdfCatalog('   ')).toBe(false);
    });

    it('should reject dummy hashes and javascript pseudo-protocols', () => {
      expect(hasValidPdfCatalog('#')).toBe(false);
      expect(hasValidPdfCatalog(' # ')).toBe(false);
      expect(hasValidPdfCatalog('javascript:void(0)')).toBe(false);
      expect(hasValidPdfCatalog('javascript:alert(1)')).toBe(false);
    });

    it('should normalize relative PDF catalog URLs with leading slash', () => {
      expect(normalizePdfCatalogUrl('catalogs/panduit-2026.pdf')).toBe('/catalogs/panduit-2026.pdf');
      expect(normalizePdfCatalogUrl('/catalogs/panduit-2026.pdf')).toBe('/catalogs/panduit-2026.pdf');
      expect(normalizePdfCatalogUrl('https://cdn.asoexi.com/catalogs/sika.pdf')).toBe(
        'https://cdn.asoexi.com/catalogs/sika.pdf'
      );
      expect(normalizePdfCatalogUrl('#')).toBeNull();
      expect(normalizePdfCatalogUrl(null)).toBeNull();
    });
  });

  describe('Brand Product Families Extraction & Defensive Fallback (Story 3.2: getBrandProductFamilies)', () => {
    it('should return explicit productFamilies array when defined and non-empty', () => {
      const brand = {
        name: 'Panduit',
        productFamilies: ['Cableado Estructurado', 'Bandejas Portacables', 'Amarras'],
      };
      const families = getBrandProductFamilies(brand);
      expect(families).toEqual(['Cableado Estructurado', 'Bandejas Portacables', 'Amarras']);
    });

    it('should trim explicit productFamilies and filter out empty elements', () => {
      const brand = {
        name: 'Panduit',
        productFamilies: ['  Cableado Estructurado  ', '', '   ', 'Bandejas Portacables'],
      };
      const families = getBrandProductFamilies(brand);
      expect(families).toEqual(['Cableado Estructurado', 'Bandejas Portacables']);
    });

    it('should extract families from applicationNotes when productFamilies is empty or omitted', () => {
      const brand = {
        name: 'Panduit',
        applicationNotes: 'Categoría 6A/7, bandejas portacables, amarras',
      };
      const families = getBrandProductFamilies(brand);
      expect(families.length).toBeGreaterThanOrEqual(3);
      expect(families).toContain('Categoría 6A/7');
      expect(families).toContain('Bandejas portacables');
      expect(families).toContain('Amarras');
    });

    it('should extract families from complex applicationNotes with conjunctions (y / e) and punctuation', () => {
      const brand = {
        name: 'Panduit',
        applicationNotes: 'Sistemas de cableado estructurado categoría 6A/7, bandejas portacables, amarras plásticas resistentes a intemperie y marcado industrial.',
      };
      const families = getBrandProductFamilies(brand);
      expect(families.length).toBeGreaterThanOrEqual(2);
      expect(families.some((f) => f.includes('cableado') || f.includes('Cableado'))).toBe(true);
      expect(families.some((f) => f.includes('bandejas') || f.includes('Bandejas'))).toBe(true);
    });

    it('should preserve internal decimal numbers while stripping trailing punctuation in applicationNotes', () => {
      const brand = {
        name: 'Centelsa',
        applicationNotes: 'Cables THHN 2.5 mm², acometidas de 4.0 mm, terminales a compresión.',
      };
      const families = getBrandProductFamilies(brand);
      expect(families.length).toBe(3);
      expect(families[0]).toBe('Cables THHN 2.5 mm²');
      expect(families[1]).toBe('Acometidas de 4.0 mm');
      expect(families[2]).toBe('Terminales a compresión');
    });

    it('should fall back to sector technical categories when productFamilies and applicationNotes are empty', () => {
      const brand = {
        name: 'EmptyBrand',
        sector: 'electrico' as const,
        applicationNotes: '',
      };
      const families = getBrandProductFamilies(brand);
      expect(families.length).toBeGreaterThan(0);
      expect(families.some((f) => f.includes('Cableado') || f.includes('Conductores'))).toBe(true);
    });

    it('should provide defensive fallback when all properties are undefined or brand is empty', () => {
      const familiesEmpty = getBrandProductFamilies({});
      expect(familiesEmpty.length).toBeGreaterThan(0);

      const familiesNull = getBrandProductFamilies(null);
      expect(familiesNull.length).toBe(0);
    });

    it('should handle Astro CollectionEntry-like objects with .data property', () => {
      const entry = {
        id: 'panduit',
        data: {
          name: 'Panduit',
          sector: 'electrico' as const,
          productFamilies: ['Patch Cords', 'Racks'],
        },
      };
      const families = getBrandProductFamilies(entry as any);
      expect(families).toEqual(['Patch Cords', 'Racks']);
    });
  });

  describe('Brand Sourcing Notes & Fallback (Story 3.3: getBrandSourcingNotes)', () => {
    it('should return explicit sourcingNotes when defined and non-empty', () => {
      const brand = {
        name: 'Panduit',
        sourcingNotes:
          'Suministro directo de planta en carretes de cable UTP, racks de telecomunicaciones y accesorios de montaje con entrega programada.',
      };
      const notes = getBrandSourcingNotes(brand);
      expect(notes).toBe(
        'Suministro directo de planta en carretes de cable UTP, racks de telecomunicaciones y accesorios de montaje con entrega programada.'
      );
    });

    it('should return institutional wholesale fallback when sourcingNotes is null or undefined', () => {
      const brand = {
        name: 'Panduit',
        sourcingNotes: null,
      };
      const fallback = getBrandSourcingNotes(brand);
      expect(fallback).toContain('Panduit');
      expect(fallback).toContain('45 días');
      expect(fallback).toContain('DIAN');
      expect(fallback).toContain('Bogotá');
      expect(fallback).toContain('Sabana');
      expect(fallback.length).toBeGreaterThanOrEqual(60);
    });

    it('should return institutional wholesale fallback when sourcingNotes is empty string or whitespace', () => {
      const fallbackEmpty = getBrandSourcingNotes({ name: 'Sika', sourcingNotes: '' });
      expect(fallbackEmpty).toContain('Sika');
      expect(fallbackEmpty.length).toBeGreaterThanOrEqual(60);

      const fallbackWhitespace = getBrandSourcingNotes({ name: 'Sika', sourcingNotes: '   ' });
      expect(fallbackWhitespace).toContain('Sika');
    });

    it('should handle Astro CollectionEntry-like objects with .data property', () => {
      const entry = {
        id: 'centelsa',
        data: {
          name: 'Centelsa by Nexans',
          sourcingNotes: 'Despacho directo de bobinas industriales con certificación RETIE.',
        },
      };
      expect(getBrandSourcingNotes(entry as any)).toBe(
        'Despacho directo de bobinas industriales con certificación RETIE.'
      );
    });

    it('should provide robust default brand name if brand or brand name is omitted', () => {
      const fallbackNull = getBrandSourcingNotes(null);
      expect(fallbackNull).toContain('45 días');
      expect(fallbackNull).toContain('DIAN');
      expect(fallbackNull.length).toBeGreaterThanOrEqual(60);

      const fallbackNoName = getBrandSourcingNotes({});
      expect(fallbackNoName).toContain('la marca');
    });
  });

  describe('Brand Semantic Density Audit (Story 3.3: isBrandContentSubstantial)', () => {
    const validSubstantialBrand = {
      id: 'panduit',
      name: 'Panduit',
      sector: 'electrico' as const,
      isTractor: true,
      description:
        'Líder mundial en infraestructura de conectividad física, eléctrica y de red para centros de datos y plantas industriales.',
      applicationNotes:
        'Soluciones de cableado estructurado Cat 6A, bandejas portacables, amarras de nylon resistentes a rayos UV y sistemas de puesta a tierra.',
      productFamilies: [
        'Cableado Estructurado',
        'Bandejas Portacables',
        'Sistemas de Puesta a Tierra',
      ],
      sourcingNotes:
        'Suministro integral de todo el catálogo Panduit con entrega programada a obra y soporte de ingeniería.',
    };

    it('should return true when all semantic density criteria are met (>= 60 chars and >= 3 families)', () => {
      expect(isBrandContentSubstantial(validSubstantialBrand)).toBe(true);
    });

    it('should return false if description is shorter than 60 characters or empty', () => {
      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          description: 'Demasiado corto.',
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          description: '',
        })
      ).toBe(false);
    });

    it('should return false if applicationNotes is shorter than 60 characters or empty', () => {
      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          applicationNotes: 'Notas cortas.',
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          applicationNotes: '',
        })
      ).toBe(false);
    });

    it('should return false if productFamilies has fewer than 3 items', () => {
      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          productFamilies: ['Familia 1', 'Familia 2'],
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          productFamilies: ['Familia 1', '', '   '],
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          productFamilies: [],
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          productFamilies: null as any,
        })
      ).toBe(false);
    });

    it('should return false if sourcingNotes is shorter than 60 characters or missing', () => {
      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          sourcingNotes: 'Notas breves.',
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          sourcingNotes: null,
        })
      ).toBe(false);

      expect(
        isBrandContentSubstantial({
          ...validSubstantialBrand,
          sourcingNotes: '',
        })
      ).toBe(false);
    });

    it('should handle null, undefined and collection entries gracefully', () => {
      expect(isBrandContentSubstantial(null)).toBe(false);
      expect(isBrandContentSubstantial(undefined)).toBe(false);
      expect(isBrandContentSubstantial({})).toBe(false);

      const entry = {
        id: 'panduit',
        data: validSubstantialBrand,
      };
      expect(isBrandContentSubstantial(entry as any)).toBe(true);
    });
  });
});
