import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_WHATSAPP_MESSAGE,
  WHATSAPP_ADVISORS,
  WHATSAPP_MAX_SAFE_ITEMS,
  WHATSAPP_MAX_SAFE_CHARS,
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
  formatRequisitionFullMessage,
  formatRequisitionSafeIntroMessage,
  buildRequisitionWhatsAppPayload,
  copyTextToClipboard,
  copyTextToClipboardSync,
  type RequisitionWhatsAppItem,
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

    it('generateRequisitionWhatsAppUrl should format multibrand list into WhatsApp deep link with 6 key B2B fields', () => {
      const items = [
        { name: 'Panduit', quantity: 2, sector: 'electrico' },
        { name: 'Sika', quantity: 1, sector: 'hidraulico-pinturas' },
      ];
      const url = generateRequisitionWhatsAppUrl(items, mockStorage);
      expect(url).toContain('https://wa.me/573014191344?text=');
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain('Razón Social:');
      expect(decoded).toContain('NIT:');
      expect(decoded).toContain('Teléfono:');
      expect(decoded).toContain('Dirección de entrega:');
      expect(decoded).toContain('Referencias con cantidades:');
      expect(decoded).toContain('Notas de insumos libres:');
      expect(decoded).toContain('1. Panduit');
      expect(decoded).toContain('2 unds');
      expect(decoded).toContain('2. Sika');
      expect(decoded).toContain('SLA ≤ 5 min');
    });

    it('generateRequisitionWhatsAppUrl should fall back to default message if list is empty or null', () => {
      expect(generateRequisitionWhatsAppUrl([], mockStorage)).toBe(
        getDirectWhatsAppUrl(mockStorage, DEFAULT_WHATSAPP_MESSAGE)
      );
      expect(generateRequisitionWhatsAppUrl(null, mockStorage)).toBe(
        getDirectWhatsAppUrl(mockStorage, DEFAULT_WHATSAPP_MESSAGE)
      );
    });

    describe('Story 4.3: Requisition Deep Link Generator & EDGE-3 Length Safeguard', () => {
      it('should export configurable safeguard threshold constants WHATSAPP_MAX_SAFE_ITEMS = 8 and WHATSAPP_MAX_SAFE_CHARS = 1200', () => {
        expect(WHATSAPP_MAX_SAFE_ITEMS).toBe(8);
        expect(WHATSAPP_MAX_SAFE_CHARS).toBe(1200);
      });

      it('formatRequisitionFullMessage should include all 6 key B2B data fields with bulleted headers (avoiding number collisions with references) and custom notes', () => {
        const items: RequisitionWhatsAppItem[] = [
          { name: 'Panduit', quantity: 3, sector: 'electrico' },
          { name: 'Tubería Conduit EMT 3/4"', quantity: 20, isCustom: true, notes: 'Certificación RETIE urgente' },
        ];

        const msgWithPlaceholders = formatRequisitionFullMessage(items);
        expect(msgWithPlaceholders).toContain('Hola ASOEXI (Geraldine y Sonia)');
        expect(msgWithPlaceholders).toContain('• *Razón Social:*');
        expect(msgWithPlaceholders).toContain('• *NIT:*');
        expect(msgWithPlaceholders).toContain('• *Teléfono:*');
        expect(msgWithPlaceholders).toContain('• *Dirección de entrega:*');
        expect(msgWithPlaceholders).toContain('• *Referencias con cantidades:*');
        expect(msgWithPlaceholders).toContain('1. Panduit (3 unds) — Sector Eléctrico Industrial');
        expect(msgWithPlaceholders).toContain('2. Tubería Conduit EMT 3/4" (20 unds) [Insumo Libre]');
        expect(msgWithPlaceholders).toContain('• *Notas de insumos libres:*');
        expect(msgWithPlaceholders).toContain('Tubería Conduit EMT 3/4": Certificación RETIE urgente');
        expect(msgWithPlaceholders).toContain('SLA ≤ 5 min');
        // Ensure the 6 fields are NOT numbered 1..6 so they never collide with item numbers 1..N
        expect(msgWithPlaceholders).not.toContain('1. Razón Social:');
        expect(msgWithPlaceholders).not.toContain('5. Referencias con cantidades:');

        const msgWithCustomer = formatRequisitionFullMessage(items, {
          companyName: 'Constructora Bolívar S.A.',
          nit: '860034313-1',
          phone: '+57 310 555 9988',
          deliveryAddress: 'Obra Parque Central, Chía, Cundinamarca',
          additionalNotes: 'Entregar en portería norte antes de las 4pm',
        });
        expect(msgWithCustomer).toContain('• *Razón Social:* Constructora Bolívar S.A.');
        expect(msgWithCustomer).toContain('• *NIT:* 860034313-1');
        expect(msgWithCustomer).toContain('• *Teléfono:* +57 310 555 9988');
        expect(msgWithCustomer).toContain('• *Dirección de entrega:* Obra Parque Central, Chía, Cundinamarca');
        expect(msgWithCustomer).toContain('Entregar en portería norte antes de las 4pm');
      });

      it('buildRequisitionWhatsAppPayload should return requiresSafeguard = false and DEFAULT_WHATSAPP_MESSAGE when items are empty or null', () => {
        const emptyPayload = buildRequisitionWhatsAppPayload([], undefined, mockStorage);
        expect(emptyPayload.requiresSafeguard).toBe(false);
        expect(emptyPayload.itemCount).toBe(0);
        expect(emptyPayload.totalUnits).toBe(0);
        expect(emptyPayload.whatsappUrl).toBe(
          getDirectWhatsAppUrl(mockStorage, DEFAULT_WHATSAPP_MESSAGE)
        );

        const nullPayload = buildRequisitionWhatsAppPayload(null, undefined, mockStorage);
        expect(nullPayload.requiresSafeguard).toBe(false);
        expect(nullPayload.whatsappUrl).toBe(
          getDirectWhatsAppUrl(mockStorage, DEFAULT_WHATSAPP_MESSAGE)
        );
      });

      it('buildRequisitionWhatsAppPayload should NOT trigger safeguard when items.length <= 8 AND fullMessage.length <= 1200', () => {
        const eightItems: RequisitionWhatsAppItem[] = Array.from({ length: 8 }, (_, idx) => ({
          name: `Marca ${idx + 1}`,
          quantity: 2,
          sector: 'electrico',
        }));

        const payload = buildRequisitionWhatsAppPayload(eightItems, undefined, mockStorage);
        expect(payload.itemCount).toBe(8);
        expect(payload.totalUnits).toBe(16);
        expect(payload.characterCount).toBeLessThanOrEqual(WHATSAPP_MAX_SAFE_CHARS);
        expect(payload.requiresSafeguard).toBe(false);
        expect(payload.whatsappUrl).toBe(getDirectWhatsAppUrl(mockStorage, payload.fullMessage));
      });

      it('buildRequisitionWhatsAppPayload SHOULD trigger safeguard when items.length > 8 (e.g., 9 items) even if characters <= 1200', () => {
        const nineItems: RequisitionWhatsAppItem[] = Array.from({ length: 9 }, (_, idx) => ({
          name: `Ref ${idx + 1}`,
          quantity: 1,
        }));

        const payload = buildRequisitionWhatsAppPayload(nineItems, undefined, mockStorage);
        expect(payload.itemCount).toBe(9);
        expect(payload.characterCount).toBeLessThanOrEqual(WHATSAPP_MAX_SAFE_CHARS);
        expect(payload.requiresSafeguard).toBe(true);
        expect(payload.confirmationNotice).toBe(
          '¡Lista de 9 materiales copiada al portapapeles! Pégala en el chat de WhatsApp'
        );
        // Full message and clipboardMessage preserve all 9 items without truncation
        expect(payload.fullMessage).toContain('9. Ref 9');
        expect(payload.clipboardMessage).toContain('9. Ref 9');
        // clipboardMessage contains ONLY the references, notes, and SLA closing so pasting below safeIntroMessage causes zero duplicated greeting or company headers
        expect(payload.clipboardMessage).toContain('• *Referencias con cantidades:*');
        expect(payload.clipboardMessage).toContain('• *Notas de insumos libres:*');
        expect(payload.clipboardMessage).not.toContain('Hola ASOEXI');
        expect(payload.clipboardMessage).not.toContain('Razón Social');
        // WhatsApp URL uses the safe introductory message instead of the full list
        expect(payload.whatsappUrl).toBe(
          getDirectWhatsAppUrl(mockStorage, payload.safeIntroMessage)
        );
        expect(payload.safeIntroMessage.length).toBeLessThan(700);
        expect(payload.safeIntroMessage).toContain('9 materiales');
        expect(payload.safeIntroMessage).toContain('• *Razón Social:*');
        expect(payload.safeIntroMessage).toContain('• *NIT:*');
        expect(payload.safeIntroMessage).toContain('Ctrl+V');
        expect(payload.safeIntroMessage).toContain('Pegar');
        expect(payload.safeIntroMessage).not.toContain('SLA ≤ 5 min');
      });

      it('buildRequisitionWhatsAppPayload SHOULD trigger safeguard when fullMessage.length > 1200 even if items.length <= 8 (EDGE-3)', () => {
        const fourVerboseItems: RequisitionWhatsAppItem[] = [
          {
            name: 'Tablero de distribución industrial autosoportado certificado RETIE 400A',
            quantity: 2,
            isCustom: true,
            notes: 'A'.repeat(320),
          },
          {
            name: 'Cable de potencia monopolar XLPE 15kV 100% cobre apantallado Centelsa',
            quantity: 500,
            isCustom: true,
            notes: 'B'.repeat(320),
          },
          {
            name: 'Sistema de puesta a tierra completo con soldadura exotérmica y varillas Copperweld',
            quantity: 10,
            isCustom: true,
            notes: 'C'.repeat(320),
          },
          {
            name: 'Impermeabilizante acrílico con fibras Sika Acril Techo para cubierta industrial',
            quantity: 15,
            isCustom: true,
            notes: 'D'.repeat(250),
          },
        ];

        const payload = buildRequisitionWhatsAppPayload(fourVerboseItems, undefined, mockStorage);
        expect(payload.itemCount).toBe(4);
        expect(payload.characterCount).toBeGreaterThan(WHATSAPP_MAX_SAFE_CHARS);
        expect(payload.requiresSafeguard).toBe(true);
        expect(payload.confirmationNotice).toBe(
          '¡Lista de 4 materiales copiada al portapapeles! Pégala en el chat de WhatsApp'
        );
        // Full message must never truncate any of the 4 items or notes
        expect(payload.fullMessage).toContain('A'.repeat(320));
        expect(payload.fullMessage).toContain('D'.repeat(250));
        // Safe intro URL is used for generateRequisitionWhatsAppUrl backwards compatibility as well
        expect(generateRequisitionWhatsAppUrl(fourVerboseItems, mockStorage)).toBe(
          payload.whatsappUrl
        );
        expect(formatRequisitionSafeIntroMessage(fourVerboseItems).length).toBeLessThan(700);
      });

      it('copyTextToClipboard should return true when synchronous execCommand("copy") succeeds without calling navigator.clipboard.writeText, while restoring activeElement focus', async () => {
        const fakeTextarea = {
          value: '',
          setAttribute: vi.fn(),
          style: {} as Record<string, string>,
          focus: vi.fn(),
          select: vi.fn(),
          setSelectionRange: vi.fn(),
        };
        const prevActiveElement = {
          focus: vi.fn(),
        };
        const appendChildSpy = vi.fn();
        const removeChildSpy = vi.fn();
        const execCommandSpy = vi.fn().mockReturnValue(true);
        const writeTextSpy = vi.fn().mockResolvedValue(undefined);

        vi.stubGlobal('document', {
          activeElement: prevActiveElement,
          createElement: vi.fn().mockReturnValue(fakeTextarea),
          body: {
            appendChild: appendChildSpy,
            removeChild: removeChildSpy,
          },
          execCommand: execCommandSpy,
        });
        vi.stubGlobal('navigator', {
          clipboard: {
            writeText: writeTextSpy,
          },
        });

        const result = await copyTextToClipboard('Lista de requisición B2B');
        expect(result).toBe(true);
        expect(fakeTextarea.value).toBe('Lista de requisición B2B');
        expect(execCommandSpy).toHaveBeenCalledWith('copy');
        expect(removeChildSpy).toHaveBeenCalledWith(fakeTextarea);
        expect(prevActiveElement.focus).toHaveBeenCalledTimes(1);
        expect(writeTextSpy).not.toHaveBeenCalled();
      });

      it('copyTextToClipboardSync should remove the temporary textarea and restore focus in finally even when execCommand throws', () => {
        const fakeTextarea = {
          value: '',
          setAttribute: vi.fn(),
          style: {} as Record<string, string>,
          focus: vi.fn(),
          select: vi.fn(),
          setSelectionRange: vi.fn(),
        };
        const prevActiveElement = {
          focus: vi.fn(),
        };
        const appendChildSpy = vi.fn();
        const removeChildSpy = vi.fn();

        vi.stubGlobal('document', {
          activeElement: prevActiveElement,
          createElement: vi.fn().mockReturnValue(fakeTextarea),
          body: {
            appendChild: appendChildSpy,
            removeChild: removeChildSpy,
          },
          execCommand: vi.fn().mockImplementation(() => {
            throw new Error('execCommand exploded');
          }),
        });

        const result = copyTextToClipboardSync('Lista con error');
        expect(result).toBe(false);
        expect(removeChildSpy).toHaveBeenCalledWith(fakeTextarea);
        expect(prevActiveElement.focus).toHaveBeenCalledTimes(1);
      });

      it('should coerce non-finite quantities (Infinity, -Infinity, NaN) to 1 and clamp verbose customer fields in formatRequisitionSafeIntroMessage', () => {
        const items: RequisitionWhatsAppItem[] = [
          { name: 'Panduit', quantity: Number.POSITIVE_INFINITY },
          { name: 'Sika', quantity: Number.NEGATIVE_INFINITY },
          { name: 'DeWalt', quantity: Number.NaN },
        ];

        const payload = buildRequisitionWhatsAppPayload(
          items,
          {
            companyName: 'C'.repeat(400),
            nit: 'N'.repeat(400),
            phone: 'P'.repeat(400),
            deliveryAddress: 'D'.repeat(400),
          },
          mockStorage
        );

        expect(payload.totalUnits).toBe(3);
        expect(payload.fullMessage).toContain('1. Panduit (1 und)');
        expect(payload.fullMessage).toContain('2. Sika (1 und)');
        expect(payload.fullMessage).toContain('3. DeWalt (1 und)');
        expect(payload.safeIntroMessage.length).toBeLessThan(WHATSAPP_MAX_SAFE_CHARS);
        expect(payload.safeIntroMessage).not.toContain('C'.repeat(150));
      });

      it('copyTextToClipboard should fall back to navigator.clipboard.writeText when execCommand returns false', async () => {
        const writeTextSpy = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('document', {
          createElement: vi.fn().mockImplementation(() => {
            throw new Error('DOM restricted');
          }),
        });
        vi.stubGlobal('navigator', {
          clipboard: {
            writeText: writeTextSpy,
          },
        });

        const result = await copyTextToClipboard('Mensaje vía Clipboard API');
        expect(result).toBe(true);
        expect(writeTextSpy).toHaveBeenCalledWith('Mensaje vía Clipboard API');
      });

      it('copyTextToClipboard should return false cleanly without throwing when browser blocks all clipboard permissions', async () => {
        vi.stubGlobal('document', {
          createElement: vi.fn().mockImplementation(() => {
            throw new Error('NotAllowedError');
          }),
        });
        vi.stubGlobal('navigator', {
          clipboard: {
            writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError: Permission denied')),
          },
        });

        const result = await copyTextToClipboard('Texto bloqueado');
        expect(result).toBe(false);
      });
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
