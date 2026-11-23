import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  $cartStore,
  addItem,
  addCustomItem,
  updateQuantity,
  removeItem,
  clearCart,
  resetCartStore,
  setCartStorage,
  type CatalogItem,
  type CustomItem,
} from '@/stores/cart';
import {
  QUOTE_DRAWER_COPY,
  resolveItemLogoUrl,
  getBrandTypographicInitials,
  buildRequisitionMailtoUrl,
  dispatchQuoteFormalModalEvent,
  filterDrawerCatalogBrands,
  executeRequisitionWhatsAppAction,
} from '@/islands/QuoteDrawer';
import { buildSearchIndex, type SearchIndexItem } from '@/lib/search';
import {
  generateRequisitionWhatsAppUrl,
  buildRequisitionWhatsAppPayload,
} from '@/lib/whatsapp';

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

describe('QuoteDrawer Island & Commercial Actions (TDD - Story 4.2)', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    setCartStorage(mockStorage);
    resetCartStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Normative Microcopy & Dispatch Conditions (Ticket Mínimo & Excel/PDF Shortcut)', () => {
    it('should contain the exact normative minimum ticket reminder for Bogotá ($200.000 COP) and Sabana ($100k-$300k)', () => {
      expect(QUOTE_DRAWER_COPY.minimumTicketReminder).toContain('$200.000 COP');
      expect(QUOTE_DRAWER_COPY.minimumTicketReminder).toContain('Bogotá');
      expect(QUOTE_DRAWER_COPY.minimumTicketReminder).toMatch(/\$100\.000|\$100k/i);
      expect(QUOTE_DRAWER_COPY.minimumTicketReminder).toMatch(/\$300\.000|\$300k/i);
      expect(QUOTE_DRAWER_COPY.minimumTicketReminder).toContain('Sabana');
    });

    it('should contain the contextual Excel/PDF WhatsApp attachment shortcut', () => {
      expect(QUOTE_DRAWER_COPY.excelPdfShortcut).toBe(
        '¿Tienes listado completo en Excel o PDF? Puedes adjuntarlo directamente en WhatsApp tras abrir el chat'
      );
    });

    it('should define the 3 required commercial action labels', () => {
      expect(QUOTE_DRAWER_COPY.primaryWhatsAppAction).toBe(
        'Cotizar por WhatsApp (SLA ≤ 5 min en horario hábil)'
      );
      expect(QUOTE_DRAWER_COPY.secondaryEmailAction).toBe(
        '¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com'
      );
      expect(QUOTE_DRAWER_COPY.specialCreditAction).toBe(
        'Solicitar Crédito a 45 Días con RUT'
      );
    });
  });

  describe('2. Brand Logo Normalization & Safe Typographic Fallback (EDGE-2)', () => {
    it('should return valid trimmed logo path when logo is a valid asset string', () => {
      expect(resolveItemLogoUrl('/brands/panduit.png')).toBe('/brands/panduit.png');
      expect(resolveItemLogoUrl('  /brands/sika.png  ')).toBe('/brands/sika.png');
      expect(resolveItemLogoUrl('https://asoexi.com/brands/dewalt.png')).toBe(
        'https://asoexi.com/brands/dewalt.png'
      );
    });

    it('should return null for null, undefined, empty, whitespace, hash or javascript: logos', () => {
      expect(resolveItemLogoUrl(null)).toBeNull();
      expect(resolveItemLogoUrl(undefined)).toBeNull();
      expect(resolveItemLogoUrl('')).toBeNull();
      expect(resolveItemLogoUrl('   ')).toBeNull();
      expect(resolveItemLogoUrl('#')).toBeNull();
      expect(resolveItemLogoUrl('javascript:alert(1)')).toBeNull();
    });

    it('should compute clean typographic initials for brand fallback badges', () => {
      expect(getBrandTypographicInitials('Panduit')).toBe('PA');
      expect(getBrandTypographicInitials('Centelsa by Nexans')).toBe('CB');
      expect(getBrandTypographicInitials('Pavco Wavin')).toBe('PW');
      expect(getBrandTypographicInitials('3M')).toBe('3M');
      expect(getBrandTypographicInitials('')).toBe('AS');
      expect(getBrandTypographicInitials(null)).toBe('AS');
    });
  });

  describe('3. Custom Item Management & Cart Editing Operations', () => {
    it('should add custom items via addCustomItem and reject empty descriptions', () => {
      const invalid = addCustomItem('   ', 5, 'Nota vacía');
      expect(invalid).toBeNull();
      expect($cartStore.get().items).toHaveLength(0);

      const added = addCustomItem('20 tubos conduit EMT 3/4', 15, 'Urgente obra');
      expect(added).not.toBeNull();
      expect(added?.isCustom).toBe(true);
      expect(added?.name).toBe('20 tubos conduit EMT 3/4');
      expect(added?.quantity).toBe(15);
      expect(added?.notes).toBe('Urgente obra');

      const state = $cartStore.get();
      expect(state.items).toHaveLength(1);
      expect(state.totalItems).toBe(15);
    });

    it('should combine catalog items (with logo) and custom items in the drawer state', () => {
      addItem({
        id: 'panduit',
        name: 'Panduit',
        sector: 'electrico',
        url: '/distribuidor-panduit-colombia',
        isTractor: true,
        logo: '/brands/panduit.png',
        quantity: 3,
      });
      const custom = addCustomItem('Cajas de paso 15x15 metálicas', 4, 'Calibre 18');

      const state = $cartStore.get();
      expect(state.items).toHaveLength(2);
      expect(state.totalItems).toBe(7);

      const catItem = state.items[0] as CatalogItem;
      const custItem = state.items[1] as CustomItem;

      expect(catItem.logo).toBe('/brands/panduit.png');
      expect(custItem.id).toBe(custom?.id);
      expect(custItem.notes).toBe('Calibre 18');

      updateQuantity('panduit', 5);
      expect($cartStore.get().totalItems).toBe(9);

      removeItem('panduit');
      expect($cartStore.get().items).toHaveLength(1);
      expect($cartStore.get().totalItems).toBe(4);

      clearCart();
      expect($cartStore.get().items).toHaveLength(0);
      expect($cartStore.get().totalItems).toBe(0);
    });
  });

  describe('4. Triple Commercial Action Bar (WhatsApp, Email & 45-Day Credit with RUT)', () => {
    it('should generate official WhatsApp requisition URL pointing exclusively to +57 301 419 1344', () => {
      addItem({ id: 'panduit', name: 'Panduit', quantity: 2, logo: '/brands/panduit.png' });
      addCustomItem('Curvas EMT 3/4', 10);

      const items = $cartStore.get().items;
      const waUrl = generateRequisitionWhatsAppUrl(items, mockStorage);
      const decoded = decodeURIComponent(waUrl);

      expect(waUrl).toContain('https://wa.me/573014191344?text=');
      expect(decoded).toContain('1. Panduit (2 unds)');
      expect(decoded).toContain('2. Curvas EMT 3/4 (10 unds) [Insumo Libre]');
      expect(decoded).toContain('Razón Social:');
      expect(decoded).toContain('SLA ≤ 5 min');
    });

    it('should build structured fallback mailto URL exclusively to serviciocliente@asoexi.com for standard requisition and 45-day credit', () => {
      addItem({ id: 'sika', name: 'Sika', quantity: 4, logo: '/brands/sika.png' });
      addCustomItem('Aditivo acelerante 20kg', 2, 'Entrega en obra Chapinero');

      const items = $cartStore.get().items;

      const standardMailto = buildRequisitionMailtoUrl(items, false);
      expect(standardMailto.startsWith('mailto:serviciocliente@asoexi.com?')).toBe(true);
      expect(standardMailto).not.toContain('gmail.com');
      expect(decodeURIComponent(standardMailto)).toContain('Sika');
      expect(decodeURIComponent(standardMailto)).toContain('Aditivo acelerante 20kg');
      expect(decodeURIComponent(standardMailto)).toContain('Entrega en obra Chapinero');

      const creditMailto = buildRequisitionMailtoUrl(items, true);
      expect(creditMailto.startsWith('mailto:serviciocliente@asoexi.com?')).toBe(true);
      expect(creditMailto).toContain('subject=Solicitud%20de%20Credito%2045%20Dias%20con%20RUT');
      expect(decodeURIComponent(creditMailto)).toContain('Crédito Comercial a 45 Días con RUT');
    });

    it('should dispatch open-quote-formal-modal CustomEvent with creditRequested payload', () => {
      const target = new EventTarget();
      const capturedEvents: Array<{ creditRequested: boolean }> = [];

      target.addEventListener('open-quote-formal-modal', (evt: Event) => {
        evt.preventDefault(); // Simulates Story 4.4 modal handling the event
        const customEvt = evt as CustomEvent<{ creditRequested: boolean }>;
        capturedEvents.push(customEvt.detail);
      });

      const handledStandard = dispatchQuoteFormalModalEvent(false, target);
      expect(handledStandard).toBe(true);
      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0]).toEqual({ creditRequested: false });

      const handledCredit = dispatchQuoteFormalModalEvent(true, target);
      expect(handledCredit).toBe(true);
      expect(capturedEvents).toHaveLength(2);
      expect(capturedEvents[1]).toEqual({ creditRequested: true });
    });

    it('should return false when open-quote-formal-modal is not canceled by any mounted listener (allowing mailto fallback)', () => {
      const target = new EventTarget();
      const handled = dispatchQuoteFormalModalEvent(true, target);
      expect(handled).toBe(false);
    });
  });

  describe('5. Integrated Catalog Brand Search inside QuoteDrawer (filterDrawerCatalogBrands)', () => {
    const mockSearchIndex: SearchIndexItem[] = buildSearchIndex(
      [
        {
          id: 'panduit',
          name: 'Panduit',
          sector: 'electrico',
          isTractor: true,
          logo: '/brands/panduit.png',
          description: 'Cableado estructurado y conectividad.',
        },
        {
          id: 'sika',
          name: 'Sika',
          sector: 'hidraulico-pinturas',
          isTractor: true,
          logo: '/brands/sika.svg',
          description: 'Impermeabilizantes y aditivos.',
        },
        {
          id: 'dewalt',
          name: 'DeWalt',
          sector: 'ferretero-construccion',
          isTractor: true,
          logo: '/brands/dewalt.png',
          description: 'Herramientas eléctricas.',
        },
      ],
      [
        {
          id: 'electrico',
          name: 'Sector Eléctrico Industrial',
          slug: 'sector-electrico',
          description: 'Conductores y breakers.',
        },
      ]
    );

    it('should filter only brand items (excluding sectors) matching the query inside QuoteDrawer', () => {
      const results = filterDrawerCatalogBrands(mockSearchIndex, 'electrico');
      expect(results.every((item) => item.type === 'brand')).toBe(true);
      expect(results.some((item) => item.id === 'panduit')).toBe(true);
    });

    it('should return matching brands with logo and limit results up to maxLimit', () => {
      const results = filterDrawerCatalogBrands(mockSearchIndex, 'sika', 5);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('sika');
      expect(results[0].logo).toBe('/brands/sika.svg');
    });

    it('should return empty array when query is empty or whitespace', () => {
      expect(filterDrawerCatalogBrands(mockSearchIndex, '')).toEqual([]);
      expect(filterDrawerCatalogBrands(mockSearchIndex, '   ')).toEqual([]);
    });
  });

  describe('6. Story 4.3: WhatsApp Length Safeguard Integration in QuoteDrawer ($cartStore -> Safeguard Action)', () => {
    it('should return direct navigation without safeguard when $cartStore has <= 8 items and <= 1200 chars', async () => {
      addItem({ id: 'panduit', name: 'Panduit', sector: 'electrico', quantity: 3 });
      addCustomItem('Caja metálica 20x20', 5, 'Calibre 16');

      const items = $cartStore.get().items;
      const payload = buildRequisitionWhatsAppPayload(items, undefined, mockStorage);
      expect(payload.requiresSafeguard).toBe(false);

      const copyMock = vi.fn().mockResolvedValue(true);
      const outcome = await executeRequisitionWhatsAppAction(items, copyMock, mockStorage);

      expect(outcome.mode).toBe('direct');
      expect(outcome.copied).toBe(false);
      expect(copyMock).not.toHaveBeenCalled();
      expect(outcome.payload.whatsappUrl).toContain('https://wa.me/573014191344?text=');
    });

    it('should copy fullMessage and return safeguard-copied outcome with confirmationNotice when $cartStore has > 8 items', async () => {
      for (let i = 1; i <= 9; i++) {
        addCustomItem(`Material eléctrico referencia #${i}`, i);
      }

      const items = $cartStore.get().items;
      expect(items).toHaveLength(9);

      const copyMock = vi.fn().mockResolvedValue(true);
      const outcome = await executeRequisitionWhatsAppAction(items, copyMock, mockStorage);

      expect(outcome.mode).toBe('safeguard-copied');
      expect(outcome.copied).toBe(true);
      expect(copyMock).toHaveBeenCalledWith(outcome.payload.fullMessage);
      expect(outcome.payload.confirmationNotice).toBe(
        '¡Lista de 9 materiales copiada al portapapeles! Pégala en el chat de WhatsApp'
      );
      expect(outcome.payload.whatsappUrl).toContain(
        encodeURIComponent(outcome.payload.safeIntroMessage)
      );
    });

    it('should return safeguard-fallback outcome when clipboard permissions are blocked on an extensive list (> 1200 chars)', async () => {
      for (let i = 1; i <= 4; i++) {
        addCustomItem(
          `Transformador seco trifásico clase H referencia industrial #${i}`,
          2,
          `Especificación técnica detallada para obra: ${'X'.repeat(310)}`
        );
      }

      const items = $cartStore.get().items;
      const copyMock = vi.fn().mockResolvedValue(false);
      const outcome = await executeRequisitionWhatsAppAction(items, copyMock, mockStorage);

      expect(outcome.mode).toBe('safeguard-fallback');
      expect(outcome.copied).toBe(false);
      expect(copyMock).toHaveBeenCalledWith(outcome.payload.fullMessage);
      expect(outcome.payload.requiresSafeguard).toBe(true);
      expect(outcome.payload.fullMessage).toContain('X'.repeat(310));
    });

    it('should NOT call event.preventDefault() when synchronous copy succeeds on an extensive list (allowing native <a target="_blank"> navigation without popup blocker)', async () => {
      for (let i = 1; i <= 9; i++) {
        addCustomItem(`Insumo eléctrico #${i}`, 1);
      }

      const items = $cartStore.get().items;
      const preventDefaultSpy = vi.fn();
      const syncCopyMock = vi.fn().mockReturnValue(true);
      const asyncCopyMock = vi.fn().mockResolvedValue(true);
      const onSafeguardCopiedSpy = vi.fn();

      const outcome = await executeRequisitionWhatsAppAction(items, {
        event: { preventDefault: preventDefaultSpy },
        syncCopyFn: syncCopyMock,
        asyncCopyFn: asyncCopyMock,
        onSafeguardCopied: onSafeguardCopiedSpy,
        storage: mockStorage,
      });

      expect(outcome.mode).toBe('safeguard-copied');
      expect(outcome.copied).toBe(true);
      expect(outcome.copiedSync).toBe(true);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(asyncCopyMock).not.toHaveBeenCalled();
      expect(onSafeguardCopiedSpy).toHaveBeenCalledWith(outcome.payload, true);
    });

    it('SHOULD call event.preventDefault() and invoke onSafeguardFallback when both sync and async clipboard copies fail', async () => {
      for (let i = 1; i <= 9; i++) {
        addCustomItem(`Insumo eléctrico #${i}`, 1);
      }

      const items = $cartStore.get().items;
      const preventDefaultSpy = vi.fn();
      const syncCopyMock = vi.fn().mockReturnValue(false);
      const asyncCopyMock = vi.fn().mockResolvedValue(false);
      const onSafeguardFallbackSpy = vi.fn();

      const outcome = await executeRequisitionWhatsAppAction(items, {
        event: { preventDefault: preventDefaultSpy },
        syncCopyFn: syncCopyMock,
        asyncCopyFn: asyncCopyMock,
        onSafeguardFallback: onSafeguardFallbackSpy,
        storage: mockStorage,
      });

      expect(outcome.mode).toBe('safeguard-fallback');
      expect(outcome.copied).toBe(false);
      expect(outcome.copiedSync).toBe(false);
      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      expect(onSafeguardFallbackSpy).toHaveBeenCalledWith(outcome.payload);
    });
  });
});
