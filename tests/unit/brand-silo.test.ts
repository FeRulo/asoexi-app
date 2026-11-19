import { describe, it, expect } from 'vitest';
import {
  getBrandSiloUrl,
  getBrandH1Title,
  buildBrandBreadcrumbs,
  hasValidBrandLogo,
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
});
