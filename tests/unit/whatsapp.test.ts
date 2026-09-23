import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_WHATSAPP_MESSAGE,
  SESSION_ROTATION_STORAGE_KEY,
  WHATSAPP_ADVISORS,
  cleanPhoneForWhatsApp,
  generateWhatsAppUrl,
  getSessionRotationIndex,
  setSessionRotationIndex,
  getBalancedWhatsAppAdvisors,
  getPrimaryWhatsAppAdvisor,
  getDirectWhatsAppUrl,
  getBalancedAdvisors,
  getPrimaryAdvisor,
} from '@/lib/whatsapp';
import { CONTACT_PHONES } from '@/lib/constants';

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

describe('WhatsApp Utilities & 50/50 Internal Balancing Engine (TDD)', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    vi.restoreAllMocks();
  });

  describe('Institutional Constants & Sanitization', () => {
    it('should define the exact mandatory institutional greeting message', () => {
      expect(DEFAULT_WHATSAPP_MESSAGE).toBe(
        'Hola ASOEXI, vi su página web y deseo solicitar una cotización formal'
      );
    });

    it('should sanitize phone numbers to strict digits only for WhatsApp wa.me links', () => {
      // E.164 format with plus
      expect(cleanPhoneForWhatsApp('+573186397212')).toBe('573186397212');
      // Human display with spaces and plus
      expect(cleanPhoneForWhatsApp('+57 318 639 7212')).toBe('573186397212');
      // Numbers with dashes or parentheses
      expect(cleanPhoneForWhatsApp('+57 (320) 449-8881')).toBe('573204498881');
      // Plain 10-digit mobile prepending country code 57 if missing
      expect(cleanPhoneForWhatsApp('3044013761')).toBe('573044013761');
    });

    it('should generate properly encoded WhatsApp deep links with default message', () => {
      const url = generateWhatsAppUrl('+573186397212');
      expect(url).toContain('https://wa.me/573186397212');
      expect(url).toContain('?text=');
      expect(url).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
    });

    it('should generate deep links with custom messages when provided', () => {
      const customMsg = 'Cotización para proyecto en Chía';
      const url = generateWhatsAppUrl('+57 320 449 8881', customMsg);
      expect(url).toBe(`https://wa.me/573204498881?text=${encodeURIComponent(customMsg)}`);
    });
  });

  describe('Channel Filtering: Línea Corporativa has NO WhatsApp, only sales reps rotate 50/50', () => {
    it('should identify only Geraldine and Sonia as WHATSAPP_ADVISORS and exclude Línea Corporativa', () => {
      expect(WHATSAPP_ADVISORS).toHaveLength(2);
      expect(WHATSAPP_ADVISORS.map((a) => a.id)).toEqual(['geraldine', 'sonia']);

      const corporate = CONTACT_PHONES.find((p) => p.id === 'corporate');
      expect(corporate?.hasWhatsApp).toBe(false);
    });

    it('Rotation 0: Geraldine is primary WhatsApp advisor #1, Sonia is #2', () => {
      setSessionRotationIndex(0, mockStorage);
      const balanced = getBalancedWhatsAppAdvisors(mockStorage);

      expect(balanced).toHaveLength(2);
      expect(balanced[0].id).toBe('geraldine');
      expect(balanced[1].id).toBe('sonia');

      const primary = getPrimaryWhatsAppAdvisor(mockStorage);
      expect(primary.id).toBe('geraldine');
      expect(getPrimaryAdvisor(mockStorage).id).toBe('geraldine');
    });

    it('Rotation 1: Sonia is primary WhatsApp advisor #1, Geraldine is #2', () => {
      setSessionRotationIndex(1, mockStorage);
      const balanced = getBalancedWhatsAppAdvisors(mockStorage);

      expect(balanced).toHaveLength(2);
      expect(balanced[0].id).toBe('sonia');
      expect(balanced[1].id).toBe('geraldine');

      const primary = getPrimaryWhatsAppAdvisor(mockStorage);
      expect(primary.id).toBe('sonia');
      expect(getPrimaryAdvisor(mockStorage).id).toBe('sonia');
    });

    it('getDirectWhatsAppUrl produces a direct link to the balanced advisor', () => {
      setSessionRotationIndex(0, mockStorage);
      const url0 = getDirectWhatsAppUrl(mockStorage);
      expect(url0).toContain('https://wa.me/573186397212');

      setSessionRotationIndex(1, mockStorage);
      const url1 = getDirectWhatsAppUrl(mockStorage);
      expect(url1).toContain('https://wa.me/573204498881');
    });

    it('getBalancedAdvisors orders WhatsApp advisors first and Línea Corporativa call-only at the end', () => {
      setSessionRotationIndex(0, mockStorage);
      const allAdvisors = getBalancedAdvisors(mockStorage);

      expect(allAdvisors).toHaveLength(3);
      expect(allAdvisors[0].id).toBe('geraldine');
      expect(allAdvisors[1].id).toBe('sonia');
      expect(allAdvisors[2].id).toBe('corporate');
      expect(allAdvisors[2].hasWhatsApp).toBe(false);
    });

    it('should persist the assigned rotation index in sessionStorage for repeat calls in same session', () => {
      // First call with empty storage assigns a random index (0 or 1) and saves to storage
      const firstCallIndex = getSessionRotationIndex(mockStorage);
      expect([0, 1]).toContain(firstCallIndex);
      expect(mockStorage.getItem(SESSION_ROTATION_STORAGE_KEY)).toBe(String(firstCallIndex));

      // Subsequent call in the same session must return identical index
      const secondCallIndex = getSessionRotationIndex(mockStorage);
      expect(secondCallIndex).toBe(firstCallIndex);

      const balancedFirst = getBalancedWhatsAppAdvisors(mockStorage);
      const balancedSecond = getBalancedWhatsAppAdvisors(mockStorage);
      expect(balancedFirst.map((a) => a.id)).toEqual(balancedSecond.map((a) => a.id));
    });

    it('should distribute 50/50 between Geraldine and Sonia when picking randomly', () => {
      const counts = [0, 0];
      const iterations = 200;

      for (let i = 0; i < iterations; i++) {
        const tempStorage = new MockStorage();
        const index = getSessionRotationIndex(tempStorage);
        counts[index]++;
      }

      // Each should have roughly 50% (~100) with statistical margin
      expect(counts[0]).toBeGreaterThan(60);
      expect(counts[1]).toBeGreaterThan(60);
      expect(counts[0] + counts[1]).toBe(iterations);
    });

    it('should handle broken or throwing sessionStorage gracefully (incognito mode / quota exceeded)', () => {
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
      const index = getSessionRotationIndex(brokenStorage);
      expect([0, 1]).toContain(index);

      expect(() => getBalancedWhatsAppAdvisors(brokenStorage)).not.toThrow();
      const advisors = getBalancedWhatsAppAdvisors(brokenStorage);
      expect(advisors).toHaveLength(2);
    });

    it('should handle undefined storage gracefully (SSR / Node environments)', () => {
      expect(() => getBalancedWhatsAppAdvisors(undefined)).not.toThrow();
      const advisors = getBalancedWhatsAppAdvisors(undefined);
      expect(advisors).toHaveLength(2);
    });

    it('should resolve and persist to window.sessionStorage when storage parameter is omitted', () => {
      vi.stubGlobal('window', { sessionStorage: mockStorage });
      try {
        const first = getSessionRotationIndex();
        const second = getSessionRotationIndex();
        expect(second).toBe(first);
        expect(mockStorage.getItem(SESSION_ROTATION_STORAGE_KEY)).toBe(String(first));
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});
