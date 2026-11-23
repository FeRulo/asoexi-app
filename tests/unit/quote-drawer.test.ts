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
} from '@/islands/QuoteDrawer';
import { generateRequisitionWhatsAppUrl } from '@/lib/whatsapp';

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

      expect(waUrl).toContain('https://wa.me/573014191344?text=');
      expect(waUrl).toContain(encodeURIComponent('1. Panduit (2 unds)'));
      expect(waUrl).toContain(encodeURIComponent('2. Curvas EMT 3/4 (10 unds)'));
      expect(waUrl).toContain(encodeURIComponent('SLA ≤ 5 min'));
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
});
