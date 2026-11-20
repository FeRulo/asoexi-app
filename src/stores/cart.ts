import {
  persistentAtom,
  setPersistentEngine,
} from '@nanostores/persistent';
import type { WritableAtom } from 'nanostores';

export interface CatalogItem {
  id: string;
  name: string;
  sector?: string;
  url?: string;
  quantity: number;
  isTractor?: boolean;
  type?: string;
}

export interface CustomItem {
  id: string;
  name: string;
  isCustom: true;
  notes?: string;
  quantity: number;
}

export type CartItem = CatalogItem | CustomItem;

export interface CartState {
  items: CartItem[];
  totalItems: number;
}

export type CartItemInput = {
  id: string;
  name: string;
  sector?: string;
  url?: string;
  quantity?: number;
  isTractor?: boolean;
  type?: string;
  isCustom?: boolean;
  notes?: string;
};

export type CartSubscriber = (state: CartState) => void;

export const CART_STORAGE_KEY = 'asoexi_cart_v1';
export const LEGACY_CART_STORAGE_KEY = 'asoexi_cart';

let customStorage: Storage | null | undefined = undefined;

const safeEventsEngine = {
  addEventListener(_key: string, listener: any, restore: any) {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', listener);
      window.addEventListener('pageshow', restore);
    }
  },
  removeEventListener(_key: string, listener: any, restore: any) {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
      window.removeEventListener('pageshow', restore);
    }
  },
};

// Ensure SSR/Node environments don't throw ReferenceError on windowPersistentEvents
if (typeof window === 'undefined') {
  setPersistentEngine({}, safeEventsEngine);
}

/**
 * Strict quantity coercion according to EDGE-3 requirement:
 * - Range [1, 99999]
 * - Truncates decimals with Math.floor
 * - Defensively coerces invalid, negative, 0, NaN, or non-numeric values to 1
 * - Defensively clamps values above 99999 to 99999
 */
export function coerceQuantity(qty: unknown): number {
  if (typeof qty !== 'number' || isNaN(qty) || !isFinite(qty)) {
    return 1;
  }
  const floored = Math.floor(qty);
  if (floored < 1) {
    return 1;
  }
  if (floored > 99999) {
    return 99999;
  }
  return floored;
}

export function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function createStorageProxy(storage: Storage): Record<string, string> {
  return new Proxy({} as Record<string, string>, {
    get(_target, prop: string) {
      if (typeof prop === 'string') {
        const val = storage.getItem(prop);
        return val === null ? undefined : val;
      }
      return undefined;
    },
    set(_target, prop: string, value: string) {
      if (typeof prop === 'string') {
        storage.setItem(prop, String(value));
        return true;
      }
      return false;
    },
    deleteProperty(_target, prop: string) {
      if (typeof prop === 'string') {
        storage.removeItem(prop);
        return true;
      }
      return false;
    },
    has(_target, prop: string) {
      if (typeof prop === 'string') {
        return storage.getItem(prop) !== null;
      }
      return false;
    },
  });
}

export function setCartStorage(storage: Storage | null): void {
  customStorage = storage;
  if (storage) {
    setPersistentEngine(createStorageProxy(storage), safeEventsEngine);
  } else {
    setPersistentEngine({}, safeEventsEngine);
  }
}

export function getSafeStorage(): Storage | null {
  if (customStorage !== undefined) {
    return customStorage;
  }
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }
  return null;
}

function safeDecode(raw: string): CartState {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      const validItems = parsed.items.filter(
        (it: any) => it && typeof it === 'object' && it.id && it.name
      );
      const items: CartItem[] = validItems.map((it: any) => {
        const coercedQty = coerceQuantity(it.quantity);
        if (it.isCustom) {
          return {
            id: String(it.id),
            name: String(it.name),
            isCustom: true as const,
            quantity: coercedQty,
            notes: it.notes ? String(it.notes) : undefined,
          };
        }
        return {
          id: String(it.id),
          name: String(it.name),
          sector: it.sector ? String(it.sector) : undefined,
          url: it.url ? String(it.url) : undefined,
          quantity: coercedQty,
          isTractor: Boolean(it.isTractor),
          type: it.type ? String(it.type) : undefined,
        };
      });
      return {
        items,
        totalItems: calculateTotalItems(items),
      };
    }
  } catch {
    // Corrupt JSON or invalid structure fallback
  }
  return { items: [], totalItems: 0 };
}

function loadInitialState(): CartState {
  const storage = getSafeStorage();
  if (storage) {
    try {
      const rawV1 = storage.getItem(CART_STORAGE_KEY);
      if (rawV1 !== null) {
        return safeDecode(rawV1);
      }
      const rawLegacy = storage.getItem(LEGACY_CART_STORAGE_KEY);
      if (rawLegacy !== null) {
        return safeDecode(rawLegacy);
      }
    } catch {
      // Storage access error fallback
    }
  }
  return { items: [], totalItems: 0 };
}

function saveState(state: CartState): void {
  const storage = getSafeStorage();
  if (storage) {
    try {
      const serialized = JSON.stringify(state);
      storage.setItem(CART_STORAGE_KEY, serialized);
      storage.setItem(LEGACY_CART_STORAGE_KEY, serialized);
    } catch {
      // Storage quota or write error fallback
    }
  }
}

const $rawStore = persistentAtom<CartState>(
  CART_STORAGE_KEY,
  loadInitialState(),
  {
    encode: JSON.stringify,
    decode: safeDecode,
  }
);

export function addItem(input: CartItemInput): void {
  if (!input || typeof input !== 'object' || !input.id) return;
  const qtyToAdd = coerceQuantity(input.quantity);
  const current = $rawStore.get();
  const existingIndex = current.items.findIndex((i) => i.id === input.id);

  let updatedItems: CartItem[];

  if (existingIndex >= 0) {
    updatedItems = current.items.map((item, idx) => {
      if (idx === existingIndex) {
        const newQty = coerceQuantity(item.quantity + qtyToAdd);
        return { ...item, quantity: newQty };
      }
      return item;
    });
  } else {
    if (input.isCustom) {
      const newCustom: CustomItem = {
        id: input.id,
        name: input.name,
        isCustom: true,
        quantity: qtyToAdd,
        notes: input.notes,
      };
      updatedItems = [...current.items, newCustom];
    } else {
      const newCatalog: CatalogItem = {
        id: input.id,
        name: input.name,
        sector: input.sector,
        url: input.url,
        quantity: qtyToAdd,
        isTractor: input.isTractor,
        type: input.type,
      };
      updatedItems = [...current.items, newCatalog];
    }
  }

  const newState: CartState = {
    items: updatedItems,
    totalItems: calculateTotalItems(updatedItems),
  };

  saveState(newState);
  $rawStore.set(newState);
}

export function addCustomItem(
  description: string,
  quantity?: number,
  notes?: string
): CustomItem | null {
  const trimmed = description?.trim();
  if (!trimmed) {
    return null;
  }

  const qty = coerceQuantity(quantity);
  const uniqueId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const newItem: CustomItem = {
    id: uniqueId,
    name: trimmed,
    isCustom: true,
    quantity: qty,
    notes: notes?.trim() || undefined,
  };

  const current = $rawStore.get();
  const updatedItems = [...current.items, newItem];
  const newState: CartState = {
    items: updatedItems,
    totalItems: calculateTotalItems(updatedItems),
  };

  saveState(newState);
  $rawStore.set(newState);
  return newItem;
}

export function updateQuantity(id: string, quantity: number): void {
  const current = $rawStore.get();
  const exists = current.items.some((i) => i.id === id);
  if (!exists) {
    return;
  }

  const coerced = coerceQuantity(quantity);
  const updatedItems = current.items.map((item) => {
    if (item.id === id) {
      return { ...item, quantity: coerced };
    }
    return item;
  });

  const newState: CartState = {
    items: updatedItems,
    totalItems: calculateTotalItems(updatedItems),
  };

  saveState(newState);
  $rawStore.set(newState);
}

export function removeItem(id: string): void {
  const current = $rawStore.get();
  const exists = current.items.some((i) => i.id === id);
  if (!exists) {
    return;
  }

  const updatedItems = current.items.filter((item) => item.id !== id);
  const newState: CartState = {
    items: updatedItems,
    totalItems: calculateTotalItems(updatedItems),
  };

  saveState(newState);
  $rawStore.set(newState);
}

export function clearCart(): void {
  const emptyState: CartState = { items: [], totalItems: 0 };
  saveState(emptyState);
  $rawStore.set(emptyState);
}

export function syncFromStorage(): void {
  const syncedState = loadInitialState();
  const oldValue = ($rawStore as any).value;
  ($rawStore as any).value = syncedState;
  ($rawStore as any).notify(oldValue);
}

export function resetCartStore(): void {
  const storage = getSafeStorage();
  if (storage) {
    try {
      storage.removeItem(CART_STORAGE_KEY);
      storage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // Storage access error fallback
    }
  }
  const oldValue = ($rawStore as any).value;
  ($rawStore as any).value = { items: [], totalItems: 0 };
  ($rawStore as any).notify(oldValue);
}

export type CartStore = WritableAtom<CartState> & {
  addItem: typeof addItem;
  addCustomItem: typeof addCustomItem;
  updateQuantity: typeof updateQuantity;
  removeItem: typeof removeItem;
  clear: typeof clearCart;
  reset: typeof resetCartStore;
  syncFromStorage: typeof syncFromStorage;
};

const rawSubscribe = $rawStore.subscribe.bind($rawStore);
const singleArgSubscribe = (callback: CartSubscriber): (() => void) => {
  return rawSubscribe((state: CartState) => {
    callback(state);
  });
};

export const $cartStore: CartStore = Object.assign($rawStore, {
  addItem,
  addCustomItem,
  updateQuantity,
  removeItem,
  clear: clearCart,
  reset: resetCartStore,
  syncFromStorage,
  subscribe: singleArgSubscribe,
});

export const cartStore = $cartStore;

export function initCartStorageListener(): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY || event.key === LEGACY_CART_STORAGE_KEY) {
      syncFromStorage();
    }
  };
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('storage', handler);
  };
}

if (typeof window !== 'undefined') {
  initCartStorageListener();
}
