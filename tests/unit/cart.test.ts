import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  $cartStore,
  cartStore,
  addItem,
  addCustomItem,
  updateQuantity,
  removeItem,
  clearCart,
  resetCartStore,
  setCartStorage,
  syncFromStorage,
  initCartStorageListener,
  coerceQuantity,
  type CatalogItem,
  type CustomItem,
  type CartState,
} from '@/stores/cart';

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

describe('Nano Stores CartStore ($cartStore) — B2B Requisition (Story 4.1)', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    setCartStorage(mockStorage);
    resetCartStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Coercion Helper (coerceQuantity - EDGE-3)', () => {
    it('should maintain valid positive integers in range [1, 99999]', () => {
      expect(coerceQuantity(1)).toBe(1);
      expect(coerceQuantity(50)).toBe(50);
      expect(coerceQuantity(99999)).toBe(99999);
    });

    it('should floor floating point values to integers', () => {
      expect(coerceQuantity(5.9)).toBe(5);
      expect(coerceQuantity(12.1)).toBe(12);
    });

    it('should defensively coerce 0, negative values, and sub-1 decimals to 1', () => {
      expect(coerceQuantity(0)).toBe(1);
      expect(coerceQuantity(-10)).toBe(1);
      expect(coerceQuantity(-0.5)).toBe(1);
      expect(coerceQuantity(0.8)).toBe(1);
    });

    it('should defensively clamp values above 99999 to 99999', () => {
      expect(coerceQuantity(100000)).toBe(99999);
      expect(coerceQuantity(5000000)).toBe(99999);
    });

    it('should defensively reset NaN, undefined, null and non-numeric values to 1', () => {
      expect(coerceQuantity(NaN)).toBe(1);
      expect(coerceQuantity(null)).toBe(1);
      expect(coerceQuantity(undefined)).toBe(1);
      expect(coerceQuantity('100' as unknown as number)).toBe(1);
      expect(coerceQuantity(Infinity)).toBe(1);
    });
  });

  describe('2. Initialization & Backward Compatibility', () => {
    it('should initialize empty state with 0 totalItems when storage is clean', () => {
      const state = $cartStore.get();
      expect(state.items).toEqual([]);
      expect(state.totalItems).toBe(0);
    });

    it('should export both $cartStore and cartStore as identical reference', () => {
      expect($cartStore).toBe(cartStore);
    });

    it('should support both standalone action functions and store method aliases', () => {
      expect(typeof addItem).toBe('function');
      expect(typeof $cartStore.addItem).toBe('function');
      expect(typeof addCustomItem).toBe('function');
      expect(typeof $cartStore.addCustomItem).toBe('function');
      expect(typeof updateQuantity).toBe('function');
      expect(typeof $cartStore.updateQuantity).toBe('function');
      expect(typeof removeItem).toBe('function');
      expect(typeof $cartStore.removeItem).toBe('function');
      expect(typeof clearCart).toBe('function');
      expect(typeof $cartStore.clear).toBe('function');
    });

    it('should load initial state from localStorage corporate key (asoexi_cart_v1)', () => {
      const savedState: CartState = {
        items: [
          { id: 'panduit', name: 'Panduit', sector: 'electrico', quantity: 3 },
          { id: 'custom-123', name: 'Alambre dulce #18', isCustom: true, quantity: 2 },
        ],
        totalItems: 5,
      };
      mockStorage.setItem('asoexi_cart_v1', JSON.stringify(savedState));
      syncFromStorage();

      const current = $cartStore.get();
      expect(current.items.length).toBe(2);
      expect(current.totalItems).toBe(5);
    });

    it('should gracefully handle and discard corrupt JSON in storage without throwing', () => {
      mockStorage.setItem('asoexi_cart_v1', 'CORRUPT_JSON{{{[[[');
      syncFromStorage();

      const current = $cartStore.get();
      expect(current.items).toEqual([]);
      expect(current.totalItems).toBe(0);
    });

    it('should filter out null or primitive elements in items array during safeDecode', () => {
      const corruptedItems = {
        items: [
          null,
          'invalid_primitive_string',
          42,
          { id: 'panduit', name: 'Panduit', quantity: 2 },
          { missing_id: true, name: 'Broken' },
          { id: 'sika', name: 'Sika', quantity: 3 },
        ],
        totalItems: 5,
      };
      mockStorage.setItem('asoexi_cart_v1', JSON.stringify(corruptedItems));
      syncFromStorage();

      const state = $cartStore.get();
      expect(state.items.length).toBe(2);
      expect(state.items[0].id).toBe('panduit');
      expect(state.items[1].id).toBe('sika');
      expect(state.totalItems).toBe(5);
    });

    it('should prioritize empty stateV1 over legacy storage and not resurrect cleared items', () => {
      const emptyV1State: CartState = { items: [], totalItems: 0 };
      const legacyState: CartState = {
        items: [{ id: 'panduit', name: 'Panduit', quantity: 5 }],
        totalItems: 5,
      };
      mockStorage.setItem('asoexi_cart_v1', JSON.stringify(emptyV1State));
      mockStorage.setItem('asoexi_cart', JSON.stringify(legacyState));

      syncFromStorage();

      const current = $cartStore.get();
      expect(current.items).toEqual([]);
      expect(current.totalItems).toBe(0);
    });

    it('should not write back to storage during syncFromStorage (preventing multi-tab ping-pong loop)', () => {
      const setItemSpy = vi.spyOn(mockStorage, 'setItem');
      syncFromStorage();
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('3. Catalog Item Operations (addItem)', () => {
    it('should add a new catalog item with default quantity 1 if not specified and preserve logo', () => {
      addItem({
        id: 'panduit',
        name: 'Panduit',
        sector: 'electrico',
        url: '/distribuidor-panduit-colombia',
        isTractor: true,
        logo: '/brands/panduit.png',
      });

      const state = $cartStore.get();
      expect(state.items.length).toBe(1);
      const item = state.items[0] as CatalogItem;
      expect(item.id).toBe('panduit');
      expect(item.name).toBe('Panduit');
      expect(item.sector).toBe('electrico');
      expect(item.quantity).toBe(1);
      expect(item.isTractor).toBe(true);
      expect(item.logo).toBe('/brands/panduit.png');
      expect(state.totalItems).toBe(1);
    });

    it('should normalize empty, whitespace, "#" or "javascript:" logo to null in addItem and safeDecode', () => {
      addItem({
        id: 'sika',
        name: 'Sika',
        logo: '   ',
      });
      addItem({
        id: 'dewalt',
        name: 'DeWalt',
        logo: '#',
      });
      addItem({
        id: 'stanley',
        name: 'Stanley',
        logo: 'JavaScript:alert(1)',
      });

      const items = $cartStore.get().items as CatalogItem[];
      expect(items[0].logo).toBeNull();
      expect(items[1].logo).toBeNull();
      expect(items[2].logo).toBeNull();

      mockStorage.setItem(
        'asoexi_cart_v1',
        JSON.stringify({
          items: [
            { id: 'panduit', name: 'Panduit', quantity: 2, logo: ' /brands/panduit.png ' },
            { id: 'dewalt', name: 'DeWalt', quantity: 1, logo: '' },
            { id: 'sika', name: 'Sika', quantity: 1, logo: '#' },
            { id: 'truper', name: 'Truper', quantity: 1, logo: 'javascript:void(0)' },
          ],
          totalItems: 5,
        })
      );
      syncFromStorage();

      const synced = $cartStore.get().items as CatalogItem[];
      expect(synced[0].logo).toBe('/brands/panduit.png');
      expect(synced[1].logo).toBeNull();
      expect(synced[2].logo).toBeNull();
      expect(synced[3].logo).toBeNull();
    });

    it('should preserve existing valid logo when re-adding item with null/invalid logo, and update logo when valid new logo is provided', () => {
      addItem({
        id: 'panduit',
        name: 'Panduit',
        quantity: 1,
        logo: '/brands/panduit-v1.png',
      });
      expect(($cartStore.get().items[0] as CatalogItem).logo).toBe('/brands/panduit-v1.png');

      // Re-adding with null or '#' preserves existing valid logo
      addItem({
        id: 'panduit',
        name: 'Panduit',
        quantity: 2,
        logo: null,
      });
      addItem({
        id: 'panduit',
        name: 'Panduit',
        quantity: 1,
        logo: '#',
      });
      const preserved = $cartStore.get().items[0] as CatalogItem;
      expect(preserved.quantity).toBe(4);
      expect(preserved.logo).toBe('/brands/panduit-v1.png');

      // Re-adding with a new valid logo updates it
      addItem({
        id: 'panduit',
        name: 'Panduit',
        quantity: 1,
        logo: '/brands/panduit.png',
      });
      const updated = $cartStore.get().items[0] as CatalogItem;
      expect(updated.quantity).toBe(5);
      expect(updated.logo).toBe('/brands/panduit.png');
    });

    it('should add a catalog item with specific quantity coerced', () => {
      addItem({
        id: 'sika',
        name: 'Sika',
        sector: 'hidraulico-pinturas',
        quantity: 5,
      });

      const state = $cartStore.get();
      expect(state.items[0].quantity).toBe(5);
      expect(state.totalItems).toBe(5);
    });

    it('should increment quantity when adding an existing catalog item', () => {
      addItem({ id: 'sika', name: 'Sika', quantity: 2 });
      addItem({ id: 'sika', name: 'Sika', quantity: 3 });

      const state = $cartStore.get();
      expect(state.items.length).toBe(1);
      expect(state.items[0].quantity).toBe(5);
      expect(state.totalItems).toBe(5);
    });

    it('should clamp accumulated quantity to 99999 when incrementing beyond max', () => {
      addItem({ id: 'sika', name: 'Sika', quantity: 99990 });
      addItem({ id: 'sika', name: 'Sika', quantity: 20 });

      const state = $cartStore.get();
      expect(state.items[0].quantity).toBe(99999);
      expect(state.totalItems).toBe(99999);
    });

    it('should safely do nothing when addItem is called with null, undefined, or missing id', () => {
      addItem(null as any);
      addItem(undefined as any);
      addItem({} as any);
      addItem({ name: 'No ID' } as any);
      expect($cartStore.get().items.length).toBe(0);
      expect($cartStore.get().totalItems).toBe(0);
    });
  });

  describe('4. Custom Item Operations (addCustomItem)', () => {
    it('should add a custom item with unique ID prefix custom- and isCustom: true', () => {
      const item = addCustomItem('Cinta aislante 3M amarilla', 4, 'Para tablero de control');

      expect(item).not.toBeNull();
      expect(item?.id).toMatch(/^custom-/);
      expect(item?.name).toBe('Cinta aislante 3M amarilla');
      expect(item?.isCustom).toBe(true);
      expect(item?.quantity).toBe(4);
      expect(item?.notes).toBe('Para tablero de control');

      const state = $cartStore.get();
      expect(state.items.length).toBe(1);
      expect(state.totalItems).toBe(4);
    });

    it('should default quantity to 1 for custom item when omitted or invalid', () => {
      const item = addCustomItem('Puntilla con cabeza 2 pulgadas', -10);

      expect(item).not.toBeNull();
      expect(item?.quantity).toBe(1);
      expect($cartStore.get().totalItems).toBe(1);
    });

    it('should reject and not add custom item when description is empty or whitespace', () => {
      const itemEmpty = addCustomItem('');
      const itemWhitespace = addCustomItem('    ');

      expect(itemEmpty).toBeNull();
      expect(itemWhitespace).toBeNull();
      expect($cartStore.get().items.length).toBe(0);
      expect($cartStore.get().totalItems).toBe(0);
    });

    it('should support mixed cart with CatalogItem and CustomItem', () => {
      addItem({ id: 'dewalt', name: 'DeWalt', quantity: 2 });
      addCustomItem('Discos de corte 4.5 pulg', 10);

      const state = $cartStore.get();
      expect(state.items.length).toBe(2);
      expect(state.totalItems).toBe(12);

      const catalog = state.items.find((i) => i.id === 'dewalt') as CatalogItem;
      const custom = state.items.find((i) => i.id.startsWith('custom-')) as CustomItem;

      expect(catalog).toBeDefined();
      expect(catalog.quantity).toBe(2);
      expect(custom).toBeDefined();
      expect(custom.isCustom).toBe(true);
      expect(custom.quantity).toBe(10);
    });
  });

  describe('5. Quantity Modification (updateQuantity - EDGE-3)', () => {
    beforeEach(() => {
      addItem({ id: 'panduit', name: 'Panduit', quantity: 2 });
      addItem({ id: 'sika', name: 'Sika', quantity: 1 });
    });

    it('should update quantity to valid integer and recalculate totalItems', () => {
      updateQuantity('panduit', 10);

      const state = $cartStore.get();
      const panduit = state.items.find((i) => i.id === 'panduit');
      expect(panduit?.quantity).toBe(10);
      expect(state.totalItems).toBe(11); // 10 + 1 (sika)
    });

    it('should defensively coerce sub-1 or negative values to 1', () => {
      updateQuantity('panduit', -5);
      expect($cartStore.get().items.find((i) => i.id === 'panduit')?.quantity).toBe(1);

      updateQuantity('panduit', 0);
      expect($cartStore.get().items.find((i) => i.id === 'panduit')?.quantity).toBe(1);
    });

    it('should defensively clamp values > 99999 to 99999', () => {
      updateQuantity('panduit', 150000);
      expect($cartStore.get().items.find((i) => i.id === 'panduit')?.quantity).toBe(99999);
    });

    it('should floor decimal quantities to integers', () => {
      updateQuantity('panduit', 7.9);
      expect($cartStore.get().items.find((i) => i.id === 'panduit')?.quantity).toBe(7);
    });

    it('should do nothing if item id is not in cart', () => {
      updateQuantity('non-existent', 5);
      expect($cartStore.get().totalItems).toBe(3);
    });
  });

  describe('6. Item Removal & Clearing', () => {
    beforeEach(() => {
      addItem({ id: 'panduit', name: 'Panduit', quantity: 3 });
      addItem({ id: 'sika', name: 'Sika', quantity: 2 });
    });

    it('should remove existing item and decrement totalItems', () => {
      removeItem('panduit');

      const state = $cartStore.get();
      expect(state.items.length).toBe(1);
      expect(state.items[0].id).toBe('sika');
      expect(state.totalItems).toBe(2);
    });

    it('should not alter state if removeItem called with non-existent id', () => {
      removeItem('unknown-brand');

      const state = $cartStore.get();
      expect(state.items.length).toBe(2);
      expect(state.totalItems).toBe(5);
    });

    it('should clear cart completely and reset totalItems to 0', () => {
      clearCart();

      const state = $cartStore.get();
      expect(state.items).toEqual([]);
      expect(state.totalItems).toBe(0);
      expect(mockStorage.getItem('asoexi_cart_v1')).toBe(JSON.stringify({ items: [], totalItems: 0 }));
    });
  });

  describe('7. Reactivity & Subscribers', () => {
    it('should notify subscribers immediately upon subscribing with current state', () => {
      addItem({ id: 'dewalt', name: 'DeWalt', quantity: 2 });

      const subscriber = vi.fn();
      const unsubscribe = $cartStore.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          totalItems: 2,
        })
      );

      unsubscribe();
    });

    it('should notify subscriber on each mutation and stop after unsubscribe', () => {
      const subscriber = vi.fn();
      const unsubscribe = $cartStore.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledTimes(1);

      addItem({ id: 'sika', name: 'Sika', quantity: 1 });
      expect(subscriber).toHaveBeenCalledTimes(2);

      updateQuantity('sika', 5);
      expect(subscriber).toHaveBeenCalledTimes(3);

      unsubscribe();

      removeItem('sika');
      expect(subscriber).toHaveBeenCalledTimes(3);
    });
  });

  describe('8. Cross-Tab Multi-Window Synchronization', () => {
    it('should synchronize state when another tab modifies asoexi_cart_v1 in storage', () => {
      const externalState: CartState = {
        items: [
          { id: 'centelsa', name: 'Centelsa by Nexans', quantity: 8 },
          { id: 'custom-99', name: 'Curvas Conduit 1 pulg', isCustom: true, quantity: 4 },
        ],
        totalItems: 12,
      };

      mockStorage.setItem('asoexi_cart_v1', JSON.stringify(externalState));
      syncFromStorage();

      const synced = $cartStore.get();
      expect(synced.totalItems).toBe(12);
      expect(synced.items.length).toBe(2);
      expect(synced.items[0].id).toBe('centelsa');
      expect(synced.items[1].id).toBe('custom-99');
    });

    it('should respond to window storage event and synchronize state', () => {
      const windowTarget = new EventTarget();
      const originalWindow = (globalThis as any).window;
      (globalThis as any).window = windowTarget;

      const cleanup = initCartStorageListener();

      try {
        const externalState: CartState = {
          items: [{ id: 'truper', name: 'Truper', quantity: 3 }],
          totalItems: 3,
        };
        mockStorage.setItem('asoexi_cart_v1', JSON.stringify(externalState));

        const event = Object.assign(new Event('storage'), {
          key: 'asoexi_cart_v1',
          newValue: JSON.stringify(externalState),
        });
        windowTarget.dispatchEvent(event);

        expect($cartStore.get().totalItems).toBe(3);
        expect($cartStore.get().items[0].id).toBe('truper');
      } finally {
        cleanup();
        (globalThis as any).window = originalWindow;
      }
    });
  });
});
