import { describe, it, expect } from 'vitest';
import {
  generateBrandQuoteWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
} from '@/lib/whatsapp';

describe('Brand Quote WhatsApp URL Generator (TDD - Story 2.1)', () => {
  const OFFICIAL_PHONE_DIGITS = '573014191344';

  it('should generate official wa.me link with centralized Línea Corporativa (+57 301 419 1344)', () => {
    const url = generateBrandQuoteWhatsAppUrl('Centelsa by Nexans');
    expect(url).toContain(`https://wa.me/${OFFICIAL_PHONE_DIGITS}`);
    expect(url).not.toContain('3044013761');
  });

  it('should include exact brand name contextualized in the query text', () => {
    const brandName = 'Centelsa by Nexans';
    const url = generateBrandQuoteWhatsAppUrl(brandName);
    const parsed = new URL(url);
    const textParam = parsed.searchParams.get('text');

    expect(textParam).toBeDefined();
    expect(textParam).toContain(brandName);
    expect(textParam).toContain('cotización');
  });

  it('should properly encode special characters in brand names', () => {
    const brandName = '3M & Cintas Industriales';
    const url = generateBrandQuoteWhatsAppUrl(brandName);
    const parsed = new URL(url);
    const textParam = parsed.searchParams.get('text');

    expect(textParam).toContain('3M & Cintas Industriales');
  });

  it('should fall back to default corporate message when brand name is empty', () => {
    const urlEmpty = generateBrandQuoteWhatsAppUrl('');
    expect(urlEmpty).toContain(`https://wa.me/${OFFICIAL_PHONE_DIGITS}`);
    expect(urlEmpty).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));

    const urlWhitespace = generateBrandQuoteWhatsAppUrl('   ');
    expect(urlWhitespace).toContain(`https://wa.me/${OFFICIAL_PHONE_DIGITS}`);
    expect(urlWhitespace).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
  });

  it('should fall back to default message when brand name is null or undefined', () => {
    const urlNull = generateBrandQuoteWhatsAppUrl(null);
    expect(urlNull).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));

    const urlUndefined = generateBrandQuoteWhatsAppUrl(undefined);
    expect(urlUndefined).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
  });

  it('should generate valid URLs for all 10 official tractor brands', () => {
    const tractorBrands = [
      'Panduit',
      'Centelsa by Nexans',
      'Sylvania',
      'Supermastick PR',
      'Stanley',
      'DeWalt',
      'Truper',
      'Pavco Wavin',
      'Sika',
      'Pintuco',
    ];

    for (const brand of tractorBrands) {
      const url = generateBrandQuoteWhatsAppUrl(brand);
      expect(url.startsWith(`https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=`)).toBe(true);
      expect(decodeURIComponent(url)).toContain(brand);
    }
  });
});
