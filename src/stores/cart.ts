export interface CartItem {
  id: string;
  name: string;
  sector?: string;
  url?: string;
  quantity: number;
  isTractor?: boolean;
  type?: string;
}

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
};

export type CartSubscriber = (state: CartState) => void;

const CART_STORAGE_KEY = 'asoexi_cart';

let customStorage: Storage | null | undefined = undefined;

export function setCartStorage(storage: Storage | null): void {
  customStorage = storage;
}

function getSafeStorage(): Storage | null {
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

function loadInitialState(): CartState {
  const storage = getSafeStorage();
  if (storage) {
    try {
      const raw = storage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          const totalItems = parsed.items.reduce(
            (sum: number, it: CartItem) => sum + (it.quantity || 1),
            0
          );
          return { items: parsed.items, totalItems };
        }
      }
    } catch {
      // Storage access or parse error fallback
    }
  }
  return { items: [], totalItems: 0 };
}

function saveState(state: CartState): void {
  const storage = getSafeStorage();
  if (storage) {
    try {
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage save error fallback
    }
  }
}

class CartStore {
  private state: CartState;
  private subscribers: Set<CartSubscriber> = new Set();

  constructor() {
    this.state = loadInitialState();
  }

  get(): CartState {
    return this.state;
  }

  subscribe(callback: CartSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    saveState(this.state);
    for (const sub of this.subscribers) {
      sub(this.state);
    }
  }

  addItem(input: CartItemInput): void {
    const qtyToAdd = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const existingIndex = this.state.items.findIndex((i) => i.id === input.id);

    let updatedItems: CartItem[];

    if (existingIndex >= 0) {
      updatedItems = this.state.items.map((item, idx) => {
        if (idx === existingIndex) {
          return { ...item, quantity: item.quantity + qtyToAdd };
        }
        return item;
      });
    } else {
      const newItem: CartItem = {
        id: input.id,
        name: input.name,
        sector: input.sector,
        url: input.url,
        quantity: qtyToAdd,
        isTractor: input.isTractor,
        type: input.type,
      };
      updatedItems = [...this.state.items, newItem];
    }

    const totalItems = updatedItems.reduce((acc, it) => acc + it.quantity, 0);
    this.state = { items: updatedItems, totalItems };
    this.notify();
  }

  removeItem(id: string): void {
    const updatedItems = this.state.items.filter((item) => item.id !== id);
    const totalItems = updatedItems.reduce((acc, it) => acc + it.quantity, 0);
    this.state = { items: updatedItems, totalItems };
    this.notify();
  }

  clear(): void {
    this.state = { items: [], totalItems: 0 };
    this.notify();
  }

  reset(): void {
    this.state = loadInitialState();
    this.notify();
  }

  syncFromStorage(): void {
    this.state = loadInitialState();
    for (const sub of this.subscribers) {
      sub(this.state);
    }
  }
}

export const cartStore = new CartStore();
export const $cartStore = cartStore;

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      cartStore.syncFromStorage();
    }
  });
}

export function resetCartStore(): void {
  cartStore.clear();
}
