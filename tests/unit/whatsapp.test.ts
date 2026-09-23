import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_WHATSAPP_MESSAGE,
  SESSION_ROTATION_STORAGE_KEY,
  cleanPhoneForWhatsApp,
  generateWhatsAppUrl,
  getSessionRotationIndex,
  setSessionRotationIndex,
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

describe('WhatsApp Utilities & Tripartite Balancing Engine (TDD)', () => {
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

  describe('Tripartite Session Load Balancing (1/3 Rotation)', () => {
    it('should define exactly 3 official contact channels in CONTACT_PHONES', () => {
      expect(CONTACT_PHONES).toHaveLength(3);
      expect(CONTACT_PHONES[0].id).toBe('geraldine');
      expect(CONTACT_PHONES[1].id).toBe('sonia');
      expect(CONTACT_PHONES[2].id).toBe('corporate');
    });

    it('Rotation 1 (index 0): Geraldine #1, Sonia #2, Línea Corporativa #3', () => {
      setSessionRotationIndex(0, mockStorage);
      const advisors = getBalancedAdvisors(mockStorage);

      expect(advisors).toHaveLength(3);
      expect(advisors[0].id).toBe('geraldine');
      expect(advisors[1].id).toBe('sonia');
      expect(advisors[2].id).toBe('corporate');

      const primary = getPrimaryAdvisor(mockStorage);
      expect(primary.id).toBe('geraldine');
    });

    it('Rotation 2 (index 1): Sonia #1, Línea Corporativa #2, Geraldine #3', () => {
      setSessionRotationIndex(1, mockStorage);
      const advisors = getBalancedAdvisors(mockStorage);

      expect(advisors).toHaveLength(3);
      expect(advisors[0].id).toBe('sonia');
      expect(advisors[1].id).toBe('corporate');
      expect(advisors[2].id).toBe('geraldine');

      const primary = getPrimaryAdvisor(mockStorage);
      expect(primary.id).toBe('sonia');
    });

    it('Rotation 3 (index 2): Línea Corporativa #1, Geraldine #2, Sonia #3', () => {
      setSessionRotationIndex(2, mockStorage);
      const advisors = getBalancedAdvisors(mockStorage);

      expect(advisors).toHaveLength(3);
      expect(advisors[0].id).toBe('corporate');
      expect(advisors[1].id).toBe('geraldine');
      expect(advisors[2].id).toBe('sonia');

      const primary = getPrimaryAdvisor(mockStorage);
      expect(primary.id).toBe('corporate');
    });

    it('should persist the assigned rotation index in sessionStorage for repeat calls in same session', () => {
      // First call with empty storage assigns a random index and saves to storage
      const firstCallIndex = getSessionRotationIndex(mockStorage);
      expect([0, 1, 2]).toContain(firstCallIndex);
      expect(mockStorage.getItem(SESSION_ROTATION_STORAGE_KEY)).toBe(String(firstCallIndex));

      // Subsequent call in the same session must return identical index
      const secondCallIndex = getSessionRotationIndex(mockStorage);
      expect(secondCallIndex).toBe(firstCallIndex);

      const balancedFirst = getBalancedAdvisors(mockStorage);
      const balancedSecond = getBalancedAdvisors(mockStorage);
      expect(balancedFirst.map((a) => a.id)).toEqual(balancedSecond.map((a) => a.id));
    });

    it('should distribute across all 3 channels (1/3 each) when picking randomly', () => {
      const counts = [0, 0, 0];
      const iterations = 300;

      for (let i = 0; i < iterations; i++) {
        const tempStorage = new MockStorage();
        const index = getSessionRotationIndex(tempStorage);
        counts[index]++;
      }

      // Each should have roughly 1/3 (~100) with a reasonable statistical margin
      expect(counts[0]).toBeGreaterThan(50);
      expect(counts[1]).toBeGreaterThan(50);
      expect(counts[2]).toBeGreaterThan(50);
      expect(counts[0] + counts[1] + counts[2]).toBe(iterations);
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

      // Must not throw an unhandled exception
      expect(() => getSessionRotationIndex(brokenStorage)).not.toThrow();
      const index = getSessionRotationIndex(brokenStorage);
      expect([0, 1, 2]).toContain(index);

      expect(() => getBalancedAdvisors(brokenStorage)).not.toThrow();
      const advisors = getBalancedAdvisors(brokenStorage);
      expect(advisors).toHaveLength(3);
    });

    it('should handle undefined storage gracefully (SSR / Node environments)', () => {
      expect(() => getBalancedAdvisors(undefined)).not.toThrow();
      const advisors = getBalancedAdvisors(undefined);
      expect(advisors).toHaveLength(3);
    });

    it('should resolve and persist to window.sessionStorage across invocations when called without storage arguments', () => {
      vi.stubGlobal('window', { sessionStorage: mockStorage });

      const firstIndex = getSessionRotationIndex();
      expect([0, 1, 2]).toContain(firstIndex);
      expect(mockStorage.getItem(SESSION_ROTATION_STORAGE_KEY)).toBe(String(firstIndex));

      const secondIndex = getSessionRotationIndex();
      expect(secondIndex).toBe(firstIndex);

      const balanced = getBalancedAdvisors();
      expect(balanced).toHaveLength(3);
      expect(balanced[0].id).toBe(CONTACT_PHONES[firstIndex].id);
    });
  });
});
