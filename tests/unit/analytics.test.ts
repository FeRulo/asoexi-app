import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  GA4_WHATSAPP_EVENT_NAME,
  sanitizeGa4MeasurementId,
  buildWhatsAppLeadPayload,
  deriveRequisitionAnalyticsContext,
  readPageAnalyticsContext,
  extractWhatsAppClickContextFromElement,
  handleDelegatedWhatsAppClick,
  trackWhatsAppLead,
} from '@/lib/analytics';
import type { CartItem } from '@/stores/cart';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf-8');
}

interface MockElementOptions {
  attrs?: Record<string, string>;
  matchesSelectors?: string[];
  parent?: MockElement | null;
}

class MockElement {
  private attrs: Record<string, string>;
  private matchesSelectors: Set<string>;
  public parentElement: MockElement | null;

  constructor(options: MockElementOptions = {}) {
    this.attrs = options.attrs ?? {};
    this.matchesSelectors = new Set(options.matchesSelectors ?? []);
    this.parentElement = options.parent ?? null;
  }

  getAttribute(name: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.attrs, name)
      ? this.attrs[name]
      : null;
  }

  matches(selector: string): boolean {
    return selector
      .split(',')
      .map((s) => s.trim())
      .some((part) => {
        if (this.matchesSelectors.has(part)) return true;
        if (part === '[data-wa-managed="island"]') {
          return this.attrs['data-wa-managed'] === 'island';
        }
        if (part === '[data-open-contact-modal]') {
          return Object.prototype.hasOwnProperty.call(this.attrs, 'data-open-contact-modal');
        }
        if (part === '[data-direct-whatsapp]') {
          return Object.prototype.hasOwnProperty.call(this.attrs, 'data-direct-whatsapp');
        }
        if (part === 'a[href*="wa.me/"]') {
          return (this.attrs.href ?? '').includes('wa.me/');
        }
        if (part === 'a[href="#cotizar"]') {
          return this.attrs.href === '#cotizar';
        }
        if (part === 'a[href="/#cotizar"]') {
          return this.attrs.href === '/#cotizar';
        }
        return false;
      });
  }

  closest(selector: string): MockElement | null {
    let current: MockElement | null = this;
    while (current) {
      if (current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }
}

function createMockDocument(bodyAttrs: Record<string, string> = {}) {
  const dataset: Record<string, string> = {};
  if (bodyAttrs['data-page-brand'] !== undefined) {
    dataset.pageBrand = bodyAttrs['data-page-brand'];
  }
  if (bodyAttrs['data-page-sector'] !== undefined) {
    dataset.pageSector = bodyAttrs['data-page-sector'];
  }
  if (bodyAttrs['data-page-tractor'] !== undefined) {
    dataset.pageTractor = bodyAttrs['data-page-tractor'];
  }

  return {
    body: {
      dataset,
      getAttribute: (name: string) =>
        Object.prototype.hasOwnProperty.call(bodyAttrs, name) ? bodyAttrs[name] : null,
    },
  } as unknown as Document;
}

describe('Story 5.3: Telemetría de Conversión por Canal Corporativo (GA4)', () => {
  describe('GA4_WHATSAPP_EVENT_NAME & sanitizeGa4MeasurementId', () => {
    it('exports the canonical GA4 event name lead_whatsapp_click', () => {
      expect(GA4_WHATSAPP_EVENT_NAME).toBe('lead_whatsapp_click');
    });

    it('accepts valid GA4 Measurement IDs matching /^G-[A-Z0-9]{4,20}$/i', () => {
      expect(sanitizeGa4MeasurementId('G-ABC12345')).toBe('G-ABC12345');
      expect(sanitizeGa4MeasurementId('  g-ab12cd34ef  ')).toBe('G-AB12CD34EF');
      expect(sanitizeGa4MeasurementId('G-1234')).toBe('G-1234');
    });

    it('rejects empty, malformed, XSS-injected, or non-GA4 IDs', () => {
      expect(sanitizeGa4MeasurementId('')).toBeNull();
      expect(sanitizeGa4MeasurementId('   ')).toBeNull();
      expect(sanitizeGa4MeasurementId(null)).toBeNull();
      expect(sanitizeGa4MeasurementId(undefined)).toBeNull();
      expect(sanitizeGa4MeasurementId('"><script>alert(1)</script>')).toBeNull();
      expect(sanitizeGa4MeasurementId('UA-12345678-1')).toBeNull();
      expect(sanitizeGa4MeasurementId('AW-123456789')).toBeNull();
      expect(sanitizeGa4MeasurementId('G-123')).toBeNull();
      expect(sanitizeGa4MeasurementId('G-ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeNull();
    });
  });

  describe('buildWhatsAppLeadPayload', () => {
    it('builds payload for a tractor brand with full attribution', () => {
      const payload = buildWhatsAppLeadPayload({
        originPage: '/distribuidor-3m-colombia',
        brandOrigin: '3M',
        sectorOrigin: 'ferretero-construccion',
        isTractor: true,
        ctaLocation: 'brand_silo_hero_quote',
      });

      expect(payload).toEqual({
        channel: 'corporate',
        origin_page: '/distribuidor-3m-colombia',
        brand_origin: '3M',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        cta_location: 'brand_silo_hero_quote',
      });
    });

    it('builds payload for a secondary brand when isTractor is false', () => {
      const payload = buildWhatsAppLeadPayload({
        originPage: '/distribuidor-marca-aliada-colombia',
        brandOrigin: 'Marca Aliada',
        sectorOrigin: 'electrico',
        isTractor: false,
      });

      expect(payload).toEqual({
        channel: 'corporate',
        origin_page: '/distribuidor-marca-aliada-colombia',
        brand_origin: 'Marca Aliada',
        sector_origin: 'electrico',
        brand_tier: 'secondary',
      });
      expect('cta_location' in payload).toBe(false);
    });

    it('normalizes empty or missing brand/sector fields to general', () => {
      const payload = buildWhatsAppLeadPayload({
        originPage: '   ',
        brandOrigin: '',
        sectorOrigin: '   ',
        isTractor: false,
        ctaLocation: '   ',
      });

      expect(payload).toEqual({
        channel: 'corporate',
        origin_page: '/',
        brand_origin: 'general',
        sector_origin: 'general',
        brand_tier: 'general',
      });
      expect('cta_location' in payload).toBe(false);
    });

    it('handles null/undefined context safely without PII fields', () => {
      const payload = buildWhatsAppLeadPayload(undefined);

      expect(payload).toEqual({
        channel: 'corporate',
        origin_page: '/',
        brand_origin: 'general',
        sector_origin: 'general',
        brand_tier: 'general',
      });
    });

    it('strips query strings and hash fragments from originPage and normalizes mixed-case GENERAL to lowercase', () => {
      const payload = buildWhatsAppLeadPayload({
        originPage: '/distribuidor-3m-colombia?utm_source=google&gclid=xyz#cotizar',
        brandOrigin: '  GENERAL  ',
        sectorOrigin: 'General',
        isTractor: false,
      });

      expect(payload).toEqual({
        channel: 'corporate',
        origin_page: '/distribuidor-3m-colombia',
        brand_origin: 'general',
        sector_origin: 'general',
        brand_tier: 'general',
      });

      const queryOnlyPayload = buildWhatsAppLeadPayload({
        originPage: '?utm_medium=cpc#top',
        brandOrigin: '3M',
        sectorOrigin: 'GENERAL',
        isTractor: true,
      });
      expect(queryOnlyPayload.origin_page).toBe('/');
      expect(queryOnlyPayload.sector_origin).toBe('general');
    });
  });

  describe('deriveRequisitionAnalyticsContext', () => {
    it('returns general for null, undefined, empty list, or custom-only items', () => {
      expect(deriveRequisitionAnalyticsContext(null)).toEqual({
        brandOrigin: 'general',
        sectorOrigin: 'general',
        brandTier: 'general',
      });
      expect(deriveRequisitionAnalyticsContext([])).toEqual({
        brandOrigin: 'general',
        sectorOrigin: 'general',
        brandTier: 'general',
      });

      const customOnly: CartItem[] = [
        {
          id: 'custom-1',
          name: 'Tubo conduit EMT 3/4',
          isCustom: true,
          quantity: 10,
        },
      ];
      expect(deriveRequisitionAnalyticsContext(customOnly)).toEqual({
        brandOrigin: 'general',
        sectorOrigin: 'general',
        brandTier: 'general',
      });
    });

    it('attributes single catalog brand accurately (tractor and secondary, with or without sector)', () => {
      const singleTractor: CartItem[] = [
        {
          id: '3m',
          name: '3M',
          sector: 'ferretero-construccion',
          isTractor: true,
          quantity: 2,
        },
      ];
      expect(deriveRequisitionAnalyticsContext(singleTractor)).toEqual({
        brandOrigin: '3M',
        sectorOrigin: 'ferretero-construccion',
        isTractor: true,
        brandTier: 'tractor',
      });

      const singleSecondaryNoSector: CartItem[] = [
        {
          id: 'aliada',
          name: 'Aliada Industrial',
          isTractor: false,
          quantity: 1,
        },
      ];
      expect(deriveRequisitionAnalyticsContext(singleSecondaryNoSector)).toEqual({
        brandOrigin: 'Aliada Industrial',
        sectorOrigin: 'general',
        isTractor: false,
        brandTier: 'secondary',
      });
    });

    it('attributes multi-brand requisitions with same or different sectors and tractor precedence', () => {
      const sameSectorSecondary: CartItem[] = [
        { id: 'b1', name: 'Marca A', sector: 'electrico', isTractor: false, quantity: 1 },
        { id: 'b2', name: 'Marca B', sector: 'electrico', isTractor: false, quantity: 3 },
      ];
      expect(deriveRequisitionAnalyticsContext(sameSectorSecondary)).toEqual({
        brandOrigin: 'multi_brand',
        sectorOrigin: 'electrico',
        isTractor: false,
        brandTier: 'secondary',
      });

      const multiSectorWithTractor: CartItem[] = [
        { id: 'b1', name: 'Panduit', sector: 'electrico', isTractor: true, quantity: 1 },
        { id: 'b2', name: 'Sika', sector: 'hidraulico-pinturas', isTractor: false, quantity: 2 },
        { id: 'c1', name: 'Insumo libre', isCustom: true, quantity: 5 },
      ];
      expect(deriveRequisitionAnalyticsContext(multiSectorWithTractor)).toEqual({
        brandOrigin: 'multi_brand',
        sectorOrigin: 'multi_sector',
        isTractor: true,
        brandTier: 'tractor',
      });
    });

    it('backfills missing sector from duplicate brand entries and deduplicates sectors case-insensitively', () => {
      const duplicateBrandWithSectorBackfill: CartItem[] = [
        { id: 'b1', name: '3M', isTractor: false, quantity: 1 },
        { id: 'b2', name: '3m', sector: 'ferretero-construccion', isTractor: true, quantity: 2 },
      ];
      expect(deriveRequisitionAnalyticsContext(duplicateBrandWithSectorBackfill)).toEqual({
        brandOrigin: '3M',
        sectorOrigin: 'ferretero-construccion',
        isTractor: true,
        brandTier: 'tractor',
      });

      const caseInsensitiveSectors: CartItem[] = [
        { id: 'b1', name: 'Panduit', sector: 'Electrico', isTractor: true, quantity: 1 },
        { id: 'b2', name: 'Legrand', sector: 'electrico', isTractor: false, quantity: 1 },
      ];
      expect(deriveRequisitionAnalyticsContext(caseInsensitiveSectors)).toEqual({
        brandOrigin: 'multi_brand',
        sectorOrigin: 'Electrico',
        isTractor: true,
        brandTier: 'tractor',
      });
    });
  });

  describe('trackWhatsAppLead & EDGE-4 AdBlocker resilience', () => {
    const originalWindow = globalThis.window;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        delete (globalThis as Record<string, unknown>).window;
      } else {
        globalThis.window = originalWindow;
      }
    });

    it('emits lead_whatsapp_click via window.gtag and returns true', () => {
      const gtagMock = vi.fn();
      (globalThis as Record<string, unknown>).window = {
        gtag: gtagMock,
        location: { pathname: '/distribuidor-3m-colombia' },
      };

      const sent = trackWhatsAppLead({
        brandOrigin: '3M',
        sectorOrigin: 'ferretero-construccion',
        isTractor: true,
        ctaLocation: 'brand_silo_hero_quote',
      });

      expect(sent).toBe(true);
      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith('event', 'lead_whatsapp_click', {
        channel: 'corporate',
        origin_page: '/distribuidor-3m-colombia',
        brand_origin: '3M',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        cta_location: 'brand_silo_hero_quote',
      });
    });

    it('degrades silently in < 50 ms when window.gtag is undefined (EDGE-4 AdBlock/Brave)', () => {
      (globalThis as Record<string, unknown>).window = {
        location: { pathname: '/sector-electrico' },
      };
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const start = performance.now();
      const sent = trackWhatsAppLead({ sectorOrigin: 'electrico' });
      const elapsed = performance.now() - start;

      expect(sent).toBe(false);
      expect(elapsed).toBeLessThan(50);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('catches exceptions thrown by window.gtag silently in < 50 ms', () => {
      const throwingGtag = vi.fn(() => {
        throw new Error('Blocked by extension');
      });
      (globalThis as Record<string, unknown>).window = {
        gtag: throwingGtag,
        location: { pathname: '/' },
      };
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const start = performance.now();
      const sent = trackWhatsAppLead({ ctaLocation: 'home_hero' });
      const elapsed = performance.now() - start;

      expect(sent).toBe(false);
      expect(elapsed).toBeLessThan(50);
      expect(throwingGtag).toHaveBeenCalledTimes(1);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('degrades safely during SSR when window is undefined', () => {
      delete (globalThis as Record<string, unknown>).window;
      expect(trackWhatsAppLead({ brandOrigin: '3M', isTractor: true })).toBe(false);
    });
  });

  describe('DOM context inheritance & delegated click anti-duplication', () => {
    it('reads body data-page-* attributes and prioritizes local data-wa-* attributes', () => {
      const mockDoc = createMockDocument({
        'data-page-brand': 'Panduit',
        'data-page-sector': 'electrico',
        'data-page-tractor': 'true',
      });
      const mockLoc = { pathname: '/distribuidor-panduit-colombia' };

      expect(readPageAnalyticsContext(mockDoc, mockLoc)).toEqual({
        originPage: '/distribuidor-panduit-colombia',
        brandOrigin: 'Panduit',
        sectorOrigin: 'electrico',
        isTractor: true,
      });

      // Floating CTA inherits page context
      const floatingAnchor = new MockElement({
        attrs: {
          href: 'https://wa.me/573014191344',
          'data-direct-whatsapp': '',
          'data-wa-location': 'floating_whatsapp_button',
        },
      });
      expect(
        extractWhatsAppClickContextFromElement(
          floatingAnchor as unknown as Element,
          mockDoc,
          mockLoc
        )
      ).toEqual({
        originPage: '/distribuidor-panduit-colombia',
        brandOrigin: 'Panduit',
        sectorOrigin: 'electrico',
        isTractor: true,
        ctaLocation: 'floating_whatsapp_button',
      });

      // BrandCard overrides page context with its own brand/sector/tractor
      const brandCardAnchor = new MockElement({
        attrs: {
          href: 'https://wa.me/573014191344',
          'data-wa-brand': 'Sika',
          'data-wa-sector': 'hidraulico-pinturas',
          'data-wa-tractor': 'false',
          'data-wa-location': 'brand_card',
        },
      });
      expect(
        extractWhatsAppClickContextFromElement(
          brandCardAnchor as unknown as Element,
          mockDoc,
          mockLoc
        )
      ).toEqual({
        originPage: '/distribuidor-panduit-colombia',
        brandOrigin: 'Sika',
        sectorOrigin: 'hidraulico-pinturas',
        isTractor: false,
        ctaLocation: 'brand_card',
      });
    });

    it('fires exactly once for static wa.me links and skips island-managed or modal-trigger elements', () => {
      const gtagMock = vi.fn();
      const mockDoc = createMockDocument({
        'data-page-sector': 'electrico',
      });
      const mockLoc = { pathname: '/sector-electrico' };

      // 1. Static link with nested span click
      const staticAnchor = new MockElement({
        attrs: {
          href: 'https://wa.me/573014191344?text=Hola',
          'data-wa-brand': '3M',
          'data-wa-sector': 'ferretero-construccion',
          'data-wa-tractor': 'true',
          'data-wa-location': 'brand_card',
        },
      });
      const nestedSpan = new MockElement({ parent: staticAnchor });

      const firedStatic = handleDelegatedWhatsAppClick(
        nestedSpan as unknown as EventTarget,
        { doc: mockDoc, loc: mockLoc, gtag: gtagMock }
      );
      expect(firedStatic).toBe(true);
      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith('event', 'lead_whatsapp_click', {
        channel: 'corporate',
        origin_page: '/sector-electrico',
        brand_origin: '3M',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        cta_location: 'brand_card',
      });

      // 2. Island-managed link must be ignored by global delegated listener
      const islandAnchor = new MockElement({
        attrs: {
          href: 'https://wa.me/573014191344',
          'data-wa-managed': 'island',
          'data-wa-location': 'mobile_sticky_bar',
        },
      });
      const firedIsland = handleDelegatedWhatsAppClick(
        islandAnchor as unknown as EventTarget,
        { doc: mockDoc, loc: mockLoc, gtag: gtagMock }
      );
      expect(firedIsland).toBe(false);
      expect(gtagMock).toHaveBeenCalledTimes(1);

      // 3. Modal trigger (e.g. nosotros.astro) must be ignored by global delegated listener
      const modalTrigger = new MockElement({
        attrs: {
          href: 'https://wa.me/573014191344',
          'data-open-contact-modal': '',
          'data-direct-whatsapp': '',
        },
      });
      const firedModal = handleDelegatedWhatsAppClick(
        modalTrigger as unknown as EventTarget,
        { doc: mockDoc, loc: mockLoc, gtag: gtagMock }
      );
      expect(firedModal).toBe(false);
      expect(gtagMock).toHaveBeenCalledTimes(1);

      // 4. Text node target (no .closest method, falls back to parentElement)
      const textNodeTarget = { parentElement: staticAnchor };
      const firedTextNode = handleDelegatedWhatsAppClick(
        textNodeTarget as unknown as EventTarget,
        { doc: mockDoc, loc: mockLoc, gtag: gtagMock }
      );
      expect(firedTextNode).toBe(true);
      expect(gtagMock).toHaveBeenCalledTimes(2);

      // 5. Direct #cotizar / /#cotizar anchors without data-open-contact-modal
      const hashCotizarAnchor = new MockElement({
        attrs: {
          href: '#cotizar',
          'data-wa-location': 'inline_cotizar_anchor',
        },
      });
      const firedHashCotizar = handleDelegatedWhatsAppClick(
        hashCotizarAnchor as unknown as EventTarget,
        { doc: mockDoc, loc: mockLoc, gtag: gtagMock }
      );
      expect(firedHashCotizar).toBe(true);
      expect(gtagMock).toHaveBeenCalledTimes(3);

      const modalCotizarAnchor = new MockElement({
        attrs: {
          href: '/#cotizar',
          'data-open-contact-modal': '',
        },
      });
      const firedModalCotizar = handleDelegatedWhatsAppClick(
        modalCotizarAnchor as unknown as EventTarget,
        { doc: mockDoc, loc: mockLoc, gtag: gtagMock }
      );
      expect(firedModalCotizar).toBe(false);
      expect(gtagMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Template & Island Instrumentation Coverage Audit', () => {
    it('BaseLayout.astro wires data-page-*, conditional GA4 gtag.js, and guarded delegation', () => {
      const baseLayout = readProjectFile('src/layouts/BaseLayout.astro');
      expect(baseLayout).toContain('PUBLIC_GA4_MEASUREMENT_ID');
      expect(baseLayout).toContain('sanitizeGa4MeasurementId');
      expect(baseLayout).toContain('https://www.googletagmanager.com/gtag/js?id=');
      expect(baseLayout).toContain("window.gtag('js', new Date())");
      expect(baseLayout).toContain("transport_type: 'beacon'");
      expect(baseLayout).not.toContain('anonymize_ip');
      expect(baseLayout).toContain('data-page-brand');
      expect(baseLayout).toContain('data-page-sector');
      expect(baseLayout).toContain('data-page-tractor');
      expect(baseLayout).toContain('__waAnalyticsBound');
      expect(baseLayout).toContain('handleDelegatedWhatsAppClick');
    });

    it('Brand silo and sector pages propagate BaseLayout page context props', () => {
      const brandSilo = readProjectFile('src/pages/distribuidor-[brand]-colombia.astro');
      expect(brandSilo).toContain('pageBrand=');
      expect(brandSilo).toContain('pageSector=');
      expect(brandSilo).toContain('pageBrandIsTractor=');
      expect((brandSilo.match(/data-wa-location=/g) ?? []).length).toBeGreaterThanOrEqual(3);

      expect(readProjectFile('src/pages/sector-electrico.astro')).toContain(
        'pageSector="electrico"'
      );
      expect(readProjectFile('src/pages/sector-ferretero-construccion.astro')).toContain(
        'pageSector="ferretero-construccion"'
      );
      expect(readProjectFile('src/pages/sector-hidraulico-pinturas.astro')).toContain(
        'pageSector="hidraulico-pinturas"'
      );
    });

    it('Static catalog and common components annotate data-wa-* attributes', () => {
      const brandCard = readProjectFile('src/components/catalog/BrandCard.astro');
      expect(brandCard).toContain('data-wa-brand=');
      expect(brandCard).toContain('data-wa-sector=');
      expect(brandCard).toContain('data-wa-tractor=');
      expect(brandCard).toContain('data-wa-location=');

      const sectorHub = readProjectFile('src/components/catalog/SectorHub.astro');
      expect((sectorHub.match(/data-wa-location=/g) ?? []).length).toBeGreaterThanOrEqual(3);
      expect(sectorHub).toContain('data-wa-sector=');

      expect(readProjectFile('src/pages/index.astro')).toContain('data-wa-location=');
      expect(readProjectFile('src/components/home/Hero.astro')).toContain('data-wa-location=');
      expect(readProjectFile('src/components/common/Header.astro')).toContain('data-wa-location=');
      expect(readProjectFile('src/components/common/Footer.astro')).toContain('data-wa-location=');
      expect(readProjectFile('src/components/common/FloatingWhatsAppButton.astro')).toContain(
        'data-wa-location='
      );
      expect(readProjectFile('src/components/common/FloatingWhatsAppButton.astro')).toContain(
        'data-direct-whatsapp'
      );
    });

    it('All 4 Preact islands call trackWhatsAppLead and mark every WhatsApp anchor with data-wa-managed="island"', () => {
      const expectedIslandManagedCounts: Array<{ file: string; minWhatsAppAnchors: number }> = [
        { file: 'src/islands/MobileStickyBar.tsx', minWhatsAppAnchors: 1 },
        { file: 'src/islands/ContactChannelModal.tsx', minWhatsAppAnchors: 1 },
        { file: 'src/islands/LiveSearchModal.tsx', minWhatsAppAnchors: 5 },
        { file: 'src/islands/QuoteDrawer.tsx', minWhatsAppAnchors: 2 },
      ];

      for (const { file, minWhatsAppAnchors } of expectedIslandManagedCounts) {
        const content = readProjectFile(file);
        expect(content, `${file} should call trackWhatsAppLead`).toContain('trackWhatsAppLead');

        // Extract every <a ...> opening tag that targets WhatsApp
        const anchorTags = content.match(/<a\b[\s\S]*?>/g) ?? [];
        const whatsappAnchors = anchorTags.filter((tag) =>
          /whatsAppUrl|waUrl|whatsappUrl|whatsappRequisitionUrl|zeroFailWhatsAppUrl|generateBrandQuoteWhatsAppUrl|generateSearchZeroFailWhatsAppUrl|buildRequisitionWhatsAppPayload/i.test(
            tag
          )
        );
        expect(
          whatsappAnchors.length,
          `${file} should have at least ${minWhatsAppAnchors} WhatsApp <a> tags`
        ).toBeGreaterThanOrEqual(minWhatsAppAnchors);

        for (const tag of whatsappAnchors) {
          expect(tag, `${file} WhatsApp anchor missing data-wa-managed="island"`).toContain(
            'data-wa-managed="island"'
          );
        }
      }

      const liveSearch = readProjectFile('src/islands/LiveSearchModal.tsx');
      expect(liveSearch).toContain('deriveRequisitionAnalyticsContext');
      expect(liveSearch).toMatch(
        /ctaLocation:\s*'live_search_index_error'/
      );
      expect(liveSearch).toMatch(
        /originPage:\s*readPageAnalyticsContext\(\)\.originPage,\s*brandOrigin:\s*'general',\s*sectorOrigin:\s*'general',\s*brandTier:\s*'general',\s*ctaLocation:\s*'live_search_index_error'/
      );
      expect(liveSearch).toMatch(
        /originPage:\s*readPageAnalyticsContext\(\)\.originPage,\s*brandOrigin:\s*'general',\s*sectorOrigin:\s*'general',\s*brandTier:\s*'general',\s*ctaLocation:\s*'live_search_zero_fail'/
      );

      expect(readProjectFile('src/islands/QuoteDrawer.tsx')).toContain(
        'deriveRequisitionAnalyticsContext'
      );

      const brandCard = readProjectFile('src/components/catalog/BrandCard.astro');
      expect(brandCard).toContain('data-wa-brand={data.name?.trim() || undefined}');
    });

    it('audits compiled HTML in dist/client when build output exists', () => {
      const distClient = path.join(PROJECT_ROOT, 'dist/client');
      const homeHtmlPath = path.join(distClient, 'index.html');
      if (!fs.existsSync(homeHtmlPath)) {
        return;
      }

      const pagesToAudit = [
        'index.html',
        'nosotros/index.html',
        'sector-electrico/index.html',
        'sector-ferretero-construccion/index.html',
        'sector-hidraulico-pinturas/index.html',
        'distribuidor-3m-colombia/index.html',
      ];

      for (const relPath of pagesToAudit) {
        const fullPath = path.join(distClient, relPath);
        if (!fs.existsSync(fullPath)) continue;
        const html = fs.readFileSync(fullPath, 'utf-8');

        // Without PUBLIC_GA4_MEASUREMENT_ID, no gtag.js script should be injected
        expect(html, `${relPath} should not contain googletagmanager.com`).not.toContain(
          'googletagmanager.com'
        );

        // Every static wa.me/ anchor (excluding modal triggers) must carry data-wa-location
        const anchorTags = html.match(/<a\b[^>]*>/g) ?? [];
        const staticWaAnchors = anchorTags.filter(
          (tag) =>
            tag.includes('wa.me/') &&
            !tag.includes('data-open-contact-modal') &&
            !tag.includes('data-wa-managed="island"')
        );
        for (const tag of staticWaAnchors) {
          expect(tag, `${relPath} static wa.me anchor missing data-wa-location`).toContain(
            'data-wa-location='
          );
        }
      }

      // Brand silo <body> must carry data-page-brand, data-page-sector, data-page-tractor
      const brandSiloHtml = fs.readFileSync(
        path.join(distClient, 'distribuidor-3m-colombia/index.html'),
        'utf-8'
      );
      const brandBodyTag = brandSiloHtml.match(/<body\b[^>]*>/)?.[0] ?? '';
      expect(brandBodyTag).toContain('data-page-brand="3M"');
      expect(brandBodyTag).toContain('data-page-sector=');
      expect(brandBodyTag).toContain('data-page-tractor=');

      // Sector hubs <body> must carry data-page-sector
      for (const sector of [
        'electrico',
        'ferretero-construccion',
        'hidraulico-pinturas',
      ]) {
        const sectorHtml = fs.readFileSync(
          path.join(distClient, `sector-${sector}/index.html`),
          'utf-8'
        );
        const sectorBodyTag = sectorHtml.match(/<body\b[^>]*>/)?.[0] ?? '';
        expect(sectorBodyTag).toContain(`data-page-sector="${sector}"`);
      }
    });
  });
});
