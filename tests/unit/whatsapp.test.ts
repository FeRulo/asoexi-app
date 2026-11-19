import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_WHATSAPP_MESSAGE,
  WHATSAPP_ADVISORS,
  cleanPhoneForWhatsApp,
  generateWhatsAppUrl,
  getSessionRotationIndex,
  getBalancedWhatsAppAdvisors,
  getPrimaryWhatsAppAdvisor,
  getDirectWhatsAppUrl,
  getBalancedAdvisors,
  getPrimaryAdvisor,
  generateRequisitionWhatsAppUrl,
  generateBrandCatalogRequestWhatsAppUrl,
} from '@/lib/whatsapp';

// In-memory mock storage implementation for unit tests
class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

describe('WhatsApp Utilities & Corporate Channel Unification (TDD)', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    vi.restoreAllMocks();
  });

  describe('Institutional Constants & Sanitization', () => {
    it('should define the default greeting message acknowledging ASOEXI and advisors Geraldine and Sonia', () => {
      expect(DEFAULT_WHATSAPP_MESSAGE).toMatch(/^Hola ASOEXI/);
      expect(DEFAULT_WHATSAPP_MESSAGE).toContain('Geraldine');
      expect(DEFAULT_WHATSAPP_MESSAGE).toContain('Sonia');
      expect(DEFAULT_WHATSAPP_MESSAGE).toContain('cotización');
    });

    it('should sanitize phone numbers to strict digits only for WhatsApp wa.me links', () => {
      // E.164 format with plus
      expect(cleanPhoneForWhatsApp('+573014191344')).toBe('573014191344');
      // Human display with spaces and plus
      expect(cleanPhoneForWhatsApp('+57 301 419 1344')).toBe('573014191344');
      // Numbers with dashes or parentheses
      expect(cleanPhoneForWhatsApp('+57 (301) 419-1344')).toBe('573014191344');
      // Plain 10-digit mobile prepending country code 57 if missing
      expect(cleanPhoneForWhatsApp('3014191344')).toBe('573014191344');

      // Diverse Colombian mobile prefixes resilience (310, 318, 320, 300)
      expect(cleanPhoneForWhatsApp('3101234567')).toBe('573101234567');
      expect(cleanPhoneForWhatsApp('+57 318 639 7212')).toBe('573186397212');
      expect(cleanPhoneForWhatsApp('3204498881')).toBe('573204498881');
      expect(cleanPhoneForWhatsApp('+57 (300) 111-2233')).toBe('573001112233');
    });

    it('should generate properly encoded WhatsApp deep links with default message', () => {
      const url = generateWhatsAppUrl('+573014191344');
      expect(url).toContain('https://wa.me/573014191344');
      expect(url).toContain('?text=');
      expect(url).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
    });

    it('should generate deep links with custom messages when provided', () => {
      const customMsg = 'Cotización para proyecto en Chía';
      const url = generateWhatsAppUrl('+57 301 419 1344', customMsg);
      expect(url).toBe(`https://wa.me/573014191344?text=${encodeURIComponent(customMsg)}`);
    });
  });

  describe('Unified Corporate Channel: Línea Corporativa (+57 301 419 1344) is the 100% unified WhatsApp recipient', () => {
    it('should identify Línea Corporativa as the sole official WHATSAPP_ADVISORS channel', () => {
      expect(WHATSAPP_ADVISORS).toHaveLength(1);
      expect(WHATSAPP_ADVISORS[0].id).toBe('corporate');
      expect(WHATSAPP_ADVISORS[0].e164).toBe('+573014191344');
      expect(WHATSAPP_ADVISORS[0].hasWhatsApp).toBe(true);

      // Verify no personal phones in WHATSAPP_ADVISORS
      const advisorIds = WHATSAPP_ADVISORS.map((a) => a.id);
      expect(advisorIds).not.toContain('geraldine');
      expect(advisorIds).not.toContain('sonia');

      // Regression prevention: Verify decommissioned number is not in WHATSAPP_ADVISORS
      WHATSAPP_ADVISORS.forEach((advisor) => {
        expect(advisor.e164).not.toContain('3044013761');
        expect(advisor.display).not.toContain('304 401 3761');
      });
    });

    it('getPrimaryWhatsAppAdvisor returns Línea Corporativa', () => {
      const primary = getPrimaryWhatsAppAdvisor(mockStorage);
      expect(primary.id).toBe('corporate');
      expect(primary.e164).toBe('+573014191344');
      expect(getPrimaryAdvisor(mockStorage).id).toBe('corporate');
    });

    it('getDirectWhatsAppUrl produces a direct link to Línea Corporativa (+57 301 419 1344)', () => {
      const url = getDirectWhatsAppUrl(mockStorage);
      expect(url).toContain('https://wa.me/573014191344');
      expect(url).not.toContain('3044013761');
      expect(url).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
    });

    it('getBalancedAdvisors returns Línea Corporativa with both voice calls and WhatsApp enabled', () => {
      const allAdvisors = getBalancedAdvisors(mockStorage);
      expect(allAdvisors).toHaveLength(1);
      expect(allAdvisors[0].id).toBe('corporate');
      expect(allAdvisors[0].hasWhatsApp).toBe(true);
    });

    it('getBalancedWhatsAppAdvisors preserves array contract and points to Línea Corporativa', () => {
      const balanced = getBalancedWhatsAppAdvisors(mockStorage);
      expect(balanced).toHaveLength(1);
      expect(balanced[0].id).toBe('corporate');
    });

    it('should handle broken or throwing sessionStorage gracefully', () => {
      const brokenStorage: Storage = {
        length: 0,
        clear: () => {},
        getItem: () => {
          throw new Error('SecurityError: The operation is insecure.');
        },
        key: () => null,
        removeItem: () => {},
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      };

      expect(() => getSessionRotationIndex(brokenStorage)).not.toThrow();
      expect(() => getBalancedWhatsAppAdvisors(brokenStorage)).not.toThrow();
      const advisors = getBalancedWhatsAppAdvisors(brokenStorage);
      expect(advisors).toHaveLength(1);
      expect(advisors[0].id).toBe('corporate');
    });

    it('should handle undefined storage gracefully (SSR / Node environments)', () => {
      expect(() => getBalancedWhatsAppAdvisors(undefined)).not.toThrow();
      const advisors = getBalancedWhatsAppAdvisors(undefined);
      expect(advisors).toHaveLength(1);
      expect(advisors[0].id).toBe('corporate');
    });

    it('generateRequisitionWhatsAppUrl should format multibrand list into WhatsApp deep link', () => {
      const items = [
        { name: 'Panduit', quantity: 2 },
        { name: 'Sika', quantity: 1 },
      ];
      const url = generateRequisitionWhatsAppUrl(items, mockStorage);
      expect(url).toContain('https://wa.me/573014191344?text=');
      expect(url).toContain(encodeURIComponent('1. Panduit (2 unds)'));
      expect(url).toContain(encodeURIComponent('2. Sika'));
      expect(url).toContain(encodeURIComponent('SLA ≤ 5 min'));
    });

    it('generateRequisitionWhatsAppUrl should fall back to default message if list is empty or null', () => {
      expect(generateRequisitionWhatsAppUrl([], mockStorage)).toBe(
        getDirectWhatsAppUrl(mockStorage, DEFAULT_WHATSAPP_MESSAGE)
      );
      expect(generateRequisitionWhatsAppUrl(null, mockStorage)).toBe(
        getDirectWhatsAppUrl(mockStorage, DEFAULT_WHATSAPP_MESSAGE)
      );
    });

    describe('generateBrandCatalogRequestWhatsAppUrl (Story 3.2)', () => {
      it('should generate official WhatsApp link to corporate line with brand catalog request message', () => {
        const url = generateBrandCatalogRequestWhatsAppUrl('Panduit', mockStorage);
        expect(url).toContain('https://wa.me/573014191344?text=');
        expect(decodeURIComponent(url)).toContain(
          'Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar la ficha técnica o catálogo oficial de fábrica para la marca Panduit'
        );
      });

      it('should trim surrounding whitespace from brand name', () => {
        const url = generateBrandCatalogRequestWhatsAppUrl('  Sika  ', mockStorage);
        expect(decodeURIComponent(url)).toContain(
          'Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar la ficha técnica o catálogo oficial de fábrica para la marca Sika'
        );
      });

      it('should safely fall back to default message when brand name is empty, null or whitespace', () => {
        const emptyUrl = generateBrandCatalogRequestWhatsAppUrl('', mockStorage);
        expect(decodeURIComponent(emptyUrl)).toContain(DEFAULT_WHATSAPP_MESSAGE);

        const nullUrl = generateBrandCatalogRequestWhatsAppUrl(null, mockStorage);
        expect(decodeURIComponent(nullUrl)).toContain(DEFAULT_WHATSAPP_MESSAGE);

        const whitespaceUrl = generateBrandCatalogRequestWhatsAppUrl('   ', mockStorage);
        expect(decodeURIComponent(whitespaceUrl)).toContain(DEFAULT_WHATSAPP_MESSAGE);
      });
    });
  });
});
