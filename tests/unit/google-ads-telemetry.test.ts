import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  GA4_WHATSAPP_EVENT_NAME,
  GOOGLE_ADS_EVENT_NAME,
  sanitizeGoogleAdsId,
  sanitizeGoogleAdsConversionLabel,
  buildGoogleAdsSendTo,
  resolvePrimaryGtagScriptId,
  trackGoogleAdsConversion,
  trackFormalQuoteConversion,
  trackWhatsAppLead,
  handleDelegatedWhatsAppClick,
  deriveRequisitionAnalyticsContext,
} from '@/lib/analytics';
import { submitFormalQuoteWithTelemetry } from '@/islands/QuoteDrawer';
import type { CartItem } from '@/stores/cart';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf-8');
}

describe('Story 5.5: Infraestructura de Medición para Pauta y Conversiones Google Ads (SEM Geofenced)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('Sanitización de credenciales Google Ads (AW-* y Conversion Label)', () => {
    it('exports the canonical Google Ads event name conversion', () => {
      expect(GOOGLE_ADS_EVENT_NAME).toBe('conversion');
    });

    it('accepts valid Google Ads IDs matching /^AW-[A-Z0-9]{6,20}$/i and normalizes to uppercase', () => {
      expect(sanitizeGoogleAdsId('aw-123456789')).toBe('AW-123456789');
      expect(sanitizeGoogleAdsId('  AW-9876543210AB  ')).toBe('AW-9876543210AB');
      expect(sanitizeGoogleAdsId('AW-123456')).toBe('AW-123456');
    });

    it('rejects invalid, empty, GA4, or XSS-injected Google Ads IDs', () => {
      expect(sanitizeGoogleAdsId('')).toBeNull();
      expect(sanitizeGoogleAdsId('   ')).toBeNull();
      expect(sanitizeGoogleAdsId(null)).toBeNull();
      expect(sanitizeGoogleAdsId(undefined)).toBeNull();
      expect(sanitizeGoogleAdsId('"><script>alert(1)</script>')).toBeNull();
      expect(sanitizeGoogleAdsId('G-12345')).toBeNull();
      expect(sanitizeGoogleAdsId('AW-12345')).toBeNull();
      expect(sanitizeGoogleAdsId('AW-ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeNull();
    });

    it('accepts valid conversion labels matching /^[A-Za-z0-9_-]{4,64}$/ preserving case', () => {
      expect(sanitizeGoogleAdsConversionLabel('AbCd_12-x')).toBe('AbCd_12-x');
      expect(sanitizeGoogleAdsConversionLabel('  lead_2026  ')).toBe('lead_2026');
    });

    it('rejects empty, short, or XSS-injected conversion labels', () => {
      expect(sanitizeGoogleAdsConversionLabel('')).toBeNull();
      expect(sanitizeGoogleAdsConversionLabel('   ')).toBeNull();
      expect(sanitizeGoogleAdsConversionLabel(null)).toBeNull();
      expect(sanitizeGoogleAdsConversionLabel(undefined)).toBeNull();
      expect(sanitizeGoogleAdsConversionLabel('abc')).toBeNull();
      expect(sanitizeGoogleAdsConversionLabel('"><script>')).toBeNull();
      expect(sanitizeGoogleAdsConversionLabel('a'.repeat(65))).toBeNull();
    });

    it('builds send_to as AW-XXXXXXXXX/Label only when both parts are valid', () => {
      expect(buildGoogleAdsSendTo('aw-123456789', 'AbCd_12-x')).toBe(
        'AW-123456789/AbCd_12-x'
      );
      expect(buildGoogleAdsSendTo('aw-123456789', '')).toBeNull();
      expect(buildGoogleAdsSendTo('G-12345', 'AbCd_12-x')).toBeNull();
      expect(buildGoogleAdsSendTo('"><script>', 'AbCd_12-x')).toBeNull();
    });
  });

  describe('resolvePrimaryGtagScriptId (carga única de gtag.js)', () => {
    it('prioritizes GA4 measurement ID when both GA4 and Google Ads are configured', () => {
      expect(resolvePrimaryGtagScriptId('g-abc12345', 'aw-123456789')).toBe('G-ABC12345');
    });

    it('falls back to Google Ads ID when GA4 is absent or invalid', () => {
      expect(resolvePrimaryGtagScriptId(undefined, 'aw-123456789')).toBe('AW-123456789');
      expect(resolvePrimaryGtagScriptId('invalid', 'aw-123456789')).toBe('AW-123456789');
    });

    it('returns null when neither ID is valid', () => {
      expect(resolvePrimaryGtagScriptId(undefined, undefined)).toBeNull();
      expect(resolvePrimaryGtagScriptId('bad', 'bad')).toBeNull();
    });
  });

  describe('trackWhatsAppLead + Google Ads conversion', () => {
    it('emits both lead_whatsapp_click and Google Ads conversion when send_to is valid', () => {
      const mockGtag = vi.fn();

      const result = trackWhatsAppLead(
        {
          originPage: '/distribuidor-3m-colombia',
          brandOrigin: '3M',
          sectorOrigin: 'ferretero-construccion',
          isTractor: true,
          ctaLocation: 'brand_silo_hero_quote',
        },
        mockGtag,
        {
          adsId: 'aw-123456789',
          conversionLabel: 'AbCd_12-x',
        }
      );

      expect(result).toBe(true);
      expect(mockGtag).toHaveBeenCalledTimes(2);
      expect(mockGtag).toHaveBeenNthCalledWith(1, 'event', GA4_WHATSAPP_EVENT_NAME, {
        channel: 'corporate',
        origin_page: '/distribuidor-3m-colombia',
        brand_origin: '3M',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        cta_location: 'brand_silo_hero_quote',
      });
      expect(mockGtag).toHaveBeenNthCalledWith(2, 'event', 'conversion', {
        send_to: 'AW-123456789/AbCd_12-x',
        origin_page: '/distribuidor-3m-colombia',
        brand_origin: '3M',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        conversion_source: 'whatsapp',
        cta_location: 'brand_silo_hero_quote',
        transport_type: 'beacon',
      });
    });

    it('omits Google Ads conversion silently when credentials are missing or invalid', () => {
      const mockGtag = vi.fn();

      const result = trackWhatsAppLead(
        {
          originPage: '/',
          brandOrigin: 'general',
          sectorOrigin: 'general',
        },
        mockGtag,
        {
          adsId: '"><script>',
          conversionLabel: 'AbCd_12-x',
        }
      );

      expect(result).toBe(true);
      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', GA4_WHATSAPP_EVENT_NAME, expect.any(Object));
    });

    it('reads PUBLIC_GOOGLE_ADS_ID and PUBLIC_GOOGLE_ADS_CONVERSION_LABEL from import.meta.env when adsOptions are omitted', () => {
      vi.stubEnv('PUBLIC_GOOGLE_ADS_ID', 'aw-123456789');
      vi.stubEnv('PUBLIC_GOOGLE_ADS_CONVERSION_LABEL', 'AbCd_12-x');
      const mockGtag = vi.fn();

      const waOk = trackWhatsAppLead(
        {
          originPage: '/distribuidor-3m-colombia',
          brandOrigin: '3M',
          sectorOrigin: 'ferretero-construccion',
          isTractor: true,
        },
        mockGtag
      );
      expect(waOk).toBe(true);
      expect(mockGtag).toHaveBeenNthCalledWith(2, 'event', 'conversion', {
        send_to: 'AW-123456789/AbCd_12-x',
        origin_page: '/distribuidor-3m-colombia',
        brand_origin: '3M',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        conversion_source: 'whatsapp',
        transport_type: 'beacon',
      });

      const mockAnchor = {
        getAttribute: (name: string) =>
          ({
            href: 'https://wa.me/573014191344',
            'data-wa-brand': 'Bosch',
            'data-wa-sector': 'ferretero-construccion',
            'data-wa-tractor': 'true',
            'data-wa-location': 'hero_cta',
          })[name] ?? null,
        closest: (selector: string) => {
          if (selector.includes('a[href*="wa.me/"]')) return mockAnchor;
          return null;
        },
      } as unknown as Element;

      const delegatedOk = handleDelegatedWhatsAppClick(mockAnchor, {
        doc: { body: { dataset: {}, getAttribute: () => null } } as unknown as Document,
        loc: { pathname: '/sector-ferretero-construccion' },
        gtag: mockGtag,
      });
      expect(delegatedOk).toBe(true);
      expect(mockGtag).toHaveBeenNthCalledWith(4, 'event', 'conversion', {
        send_to: 'AW-123456789/AbCd_12-x',
        origin_page: '/sector-ferretero-construccion',
        brand_origin: 'Bosch',
        sector_origin: 'ferretero-construccion',
        brand_tier: 'tractor',
        conversion_source: 'whatsapp',
        cta_location: 'hero_cta',
        transport_type: 'beacon',
      });

      const formalOk = trackFormalQuoteConversion(
        {
          originPage: '/nosotros',
          brandOrigin: 'general',
          sectorOrigin: 'general',
          brandTier: 'general',
          creditRequested: false,
        },
        { gtag: mockGtag }
      );
      expect(formalOk).toBe(true);
      expect(mockGtag).toHaveBeenNthCalledWith(5, 'event', 'conversion', {
        send_to: 'AW-123456789/AbCd_12-x',
        origin_page: '/nosotros',
        brand_origin: 'general',
        sector_origin: 'general',
        brand_tier: 'general',
        conversion_source: 'formal_quote',
        credit_requested: false,
        transport_type: 'beacon',
      });
    });
  });

  describe('trackFormalQuoteConversion (QuoteDrawer /api/quote)', () => {
    it('emits conversion with pre-clear requisition context, credit_requested, and zero PII', () => {
      const mockGtag = vi.fn();
      const cartItems: CartItem[] = [
        {
          id: 'schneider-electric',
          name: 'Schneider Electric',
          sector: 'electrico',
          isTractor: true,
          type: 'brand',
          quantity: 1,
        },
      ];
      const reqContext = deriveRequisitionAnalyticsContext(cartItems);

      const emitted = trackFormalQuoteConversion(
        {
          originPage: '/sector-electrico',
          ...reqContext,
          creditRequested: true,
          ctaLocation: 'quote_drawer_formal',
        },
        {
          adsId: 'aw-123456789',
          conversionLabel: 'Formal_Lead_01',
          gtag: mockGtag,
        }
      );

      expect(emitted).toBe(true);
      expect(mockGtag).toHaveBeenCalledTimes(1);
      const [, eventName, payload] = mockGtag.mock.calls[0];
      expect(eventName).toBe('conversion');
      expect(payload).toEqual({
        send_to: 'AW-123456789/Formal_Lead_01',
        origin_page: '/sector-electrico',
        brand_origin: 'Schneider Electric',
        sector_origin: 'electrico',
        brand_tier: 'tractor',
        conversion_source: 'formal_quote',
        credit_requested: true,
        cta_location: 'quote_drawer_formal',
        transport_type: 'beacon',
      });

      const serialized = JSON.stringify(payload);
      expect(serialized).not.toContain('nit');
      expect(serialized).not.toContain('email');
      expect(serialized).not.toContain('phone');
      expect(serialized).not.toContain('companyName');
    });

    it('submitFormalQuoteWithTelemetry preserves pre-clear cart attribution on outcome.ok === true', async () => {
      vi.stubEnv('PUBLIC_GOOGLE_ADS_ID', 'aw-123456789');
      vi.stubEnv('PUBLIC_GOOGLE_ADS_CONVERSION_LABEL', 'Formal_Lead_01');
      const mockGtag = vi.fn();
      let items: CartItem[] = [
        {
          id: 'schneider-electric',
          name: 'Schneider Electric',
          sector: 'electrico',
          isTractor: true,
          type: 'brand',
          quantity: 2,
        },
      ];

      const mockFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          message: 'Radicado exitoso',
          referenceId: 'REF-123',
        }),
      })) as unknown as typeof fetch;

      const outcome = await submitFormalQuoteWithTelemetry(
        {
          companyName: 'Constructora Andes S.A.S.',
          nit: '900123456-7',
          contactName: 'Carlos Pérez',
          email: 'compras@andes.co',
          phone: '3001234567',
          cityOrAddress: 'Bogotá',
          creditRequested: false,
          notes: '',
        },
        items,
        null,
        {
          fetchFn: mockFetch,
          onSuccess: () => {
            items = [];
          },
          loc: { pathname: '/sector-electrico' },
          doc: { body: { dataset: {}, getAttribute: () => null } } as unknown as Document,
          trackConversionFn: (ctx) => trackFormalQuoteConversion(ctx, { gtag: mockGtag }),
        }
      );

      expect(outcome.ok).toBe(true);
      expect(items).toHaveLength(0);
      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'conversion', {
        send_to: 'AW-123456789/Formal_Lead_01',
        origin_page: '/sector-electrico',
        brand_origin: 'Schneider Electric',
        sector_origin: 'electrico',
        brand_tier: 'tractor',
        conversion_source: 'formal_quote',
        credit_requested: false,
        cta_location: 'quote_drawer_formal',
        transport_type: 'beacon',
      });
    });

    it('submitFormalQuoteWithTelemetry does NOT fire conversion when outcome.ok === false', async () => {
      vi.stubEnv('PUBLIC_GOOGLE_ADS_ID', 'aw-123456789');
      vi.stubEnv('PUBLIC_GOOGLE_ADS_CONVERSION_LABEL', 'Formal_Lead_01');
      const mockGtag = vi.fn();

      const outcome = await submitFormalQuoteWithTelemetry(
        {
          companyName: '',
          nit: '',
          contactName: '',
          email: 'bad-email',
          phone: '',
          cityOrAddress: '',
          creditRequested: false,
          notes: '',
        },
        [],
        null,
        {
          trackConversionFn: (ctx) => trackFormalQuoteConversion(ctx, { gtag: mockGtag }),
        }
      );

      expect(outcome.ok).toBe(false);
      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe('Degradación silenciosa bajo bloqueadores (< 50 ms)', () => {
    it('completes in < 50 ms without throwing when window.gtag is undefined', () => {
      vi.stubGlobal('window', {});
      const start = performance.now();

      const waOk = trackWhatsAppLead(
        { originPage: '/' },
        undefined,
        { adsId: 'AW-123456789', conversionLabel: 'AbCd_12-x' }
      );
      const formalOk = trackFormalQuoteConversion(
        { originPage: '/', creditRequested: false },
        { adsId: 'AW-123456789', conversionLabel: 'AbCd_12-x', gtag: undefined }
      );

      const elapsed = performance.now() - start;
      expect(waOk).toBe(false);
      expect(formalOk).toBe(false);
      expect(elapsed).toBeLessThan(50);
    });

    it('completes in < 50 ms without throwing when window.gtag throws an error', () => {
      const throwingGtag = vi.fn(() => {
        throw new Error('Blocked by AdBlock');
      });
      const start = performance.now();

      const waOk = trackWhatsAppLead(
        { originPage: '/' },
        throwingGtag,
        { adsId: 'AW-123456789', conversionLabel: 'AbCd_12-x' }
      );
      const formalOk = trackGoogleAdsConversion(
        { originPage: '/', conversionSource: 'formal_quote' },
        { adsId: 'AW-123456789', conversionLabel: 'AbCd_12-x', gtag: throwingGtag }
      );

      const elapsed = performance.now() - start;
      expect(waOk).toBe(false);
      expect(formalOk).toBe(false);
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('Integración en BaseLayout.astro, env.d.ts, QuoteDrawer.tsx y dist/client/', () => {
    it('declares PUBLIC_GOOGLE_ADS_ID and PUBLIC_GOOGLE_ADS_CONVERSION_LABEL in src/env.d.ts', () => {
      const envDts = readProjectFile('src/env.d.ts');
      expect(envDts).toContain('PUBLIC_GOOGLE_ADS_ID?: string');
      expect(envDts).toContain('PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?: string');
    });

    it('configures single gtag.js script and conditional googleAdsId config in BaseLayout.astro', () => {
      const layout = readProjectFile('src/layouts/BaseLayout.astro');
      expect(layout).toContain('resolvePrimaryGtagScriptId');
      expect(layout).toContain('sanitizeGoogleAdsId');
      expect(layout).toContain('PUBLIC_GOOGLE_ADS_ID');
      const scriptMatches = layout.match(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/g) ?? [];
      expect(scriptMatches.length).toBe(1);
    });

    it('wires submitFormalQuoteWithTelemetry in QuoteDrawer.tsx handleFormalQuoteSubmit', () => {
      const drawer = readProjectFile('src/islands/QuoteDrawer.tsx');
      expect(drawer).toContain('submitFormalQuoteWithTelemetry(');
      expect(drawer).toContain('trackFormalQuoteConversion');
    });

    it('does not inject AW-* scripts in dist/client/index.html when built without PUBLIC_GOOGLE_ADS_ID', () => {
      const distIndexPath = path.join(PROJECT_ROOT, 'dist/client/index.html');
      if (!fs.existsSync(distIndexPath)) {
        return;
      }
      const html = fs.readFileSync(distIndexPath, 'utf-8');
      if (!process.env.PUBLIC_GOOGLE_ADS_ID) {
        expect(html).not.toMatch(/AW-[A-Z0-9]{6,20}/i);
      }
    });
  });
});
