import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeSearchQuery,
  filterSearchIndex,
  buildSearchIndex,
  type SearchIndexItem,
} from '@/lib/search';
import {
  generateSearchZeroFailWhatsAppUrl,
  generateRequisitionWhatsAppUrl,
} from '@/lib/whatsapp';
import { $cartStore, cartStore, resetCartStore, setCartStorage } from '@/stores/cart';
import type { Brand, Category } from '@/content.config';

vi.mock('astro:content', async () => {
  const fsModule = await import('fs');
  const pathModule = await import('path');
  return {
    getCollection: vi.fn(async (collection: string) => {
      const dir = pathModule.join(process.cwd(), 'src/content', collection);
      if (!fsModule.existsSync(dir)) return [];
      const files = fsModule.readdirSync(dir);
      return files
        .filter((f: string) => f.endsWith('.json'))
        .map((file: string) => ({
          id: file.replace(/\.json$/, ''),
          data: JSON.parse(fsModule.readFileSync(pathModule.join(dir, file), 'utf-8')),
        }));
    }),
  };
});

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

describe('LiveSearch & Zero-Fail Search System (TDD - Story 2.4)', () => {
  const sampleBrands: Brand[] = [
    {
      id: 'panduit',
      name: 'Panduit',
      sector: 'electrico',
      isTractor: true,
      logo: null,
      description: 'Líder en cableado estructurado, amarras y conectividad industrial.',
      applicationNotes: 'Cables UTP categoría 6A, bandejas portacables y rotuladoras.',
      pdfCatalogUrl: null,
      productFamilies: ['Cableado Estructurado', 'Bandejas Portacables'],
      sourcingNotes: null,
    },
    {
      id: 'sika',
      name: 'Sika',
      sector: 'hidraulico-pinturas',
      isTractor: true,
      logo: null,
      description: 'Impermeabilizantes, aditivos para concreto y selladores elastoméricos.',
      applicationNotes: 'Sika 1, Sikaflex 1A y membranas líquidas para cubiertas.',
      pdfCatalogUrl: null,
      productFamilies: ['Impermeabilizantes', 'Aditivos para Concreto'],
      sourcingNotes: null,
    },
    {
      id: 'dewalt',
      name: 'DeWalt',
      sector: 'ferretero-construccion',
      isTractor: true,
      logo: null,
      description: 'Herramientas de potencia para trabajo pesado y rotomartillos SDS.',
      applicationNotes: 'Taladros percutores, pulidoras angulares y discos abrasivos.',
      pdfCatalogUrl: null,
      productFamilies: ['Herramientas Eléctricas', 'Rotomartillos SDS'],
      sourcingNotes: null,
    },
    {
      id: 'schneider',
      name: 'Schneider Electric',
      sector: 'electrico',
      isTractor: false,
      logo: null,
      description: 'Breakers termomagnéticos, contactores y tableros eléctricos.',
      applicationNotes: 'Interruptores de caja moldeada y arrancadores suaves.',
      pdfCatalogUrl: null,
      productFamilies: ['Breakers Termomagnéticos', 'Contactores'],
      sourcingNotes: null,
    },
  ];

  const sampleCategories: Category[] = [
    {
      id: 'electrico',
      name: 'Sector Eléctrico Industrial',
      slug: 'sector-electrico',
      description: 'Conductores certificados RETIE y cableado estructurado.',
      shortDescription: 'Cables, breakers y canalización',
    },
    {
      id: 'ferretero-construccion',
      name: 'Sector Ferretero & Construcción',
      slug: 'sector-ferretero-construccion',
      description: 'Herramientas de potencia y sistemas de construcción liviana.',
      shortDescription: 'Herramientas pesadas y masillas',
    },
    {
      id: 'hidraulico-pinturas',
      name: 'Sector Hidráulico & Pinturas',
      slug: 'sector-hidraulico-pinturas',
      description: 'Tuberías de planta, recubrimientos epóxicos e impermeabilización.',
      shortDescription: 'Tuberías y químicos de construcción',
    },
  ];

  describe('1. Sanitization (sanitizeSearchQuery)', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(sanitizeSearchQuery('   panduit   ')).toBe('panduit');
    });

    it('should collapse multiple spaces into a single space', () => {
      expect(sanitizeSearchQuery('cable   utp    cat6')).toBe('cable utp cat6');
    });

    it('should safely strip potentially dangerous characters (<> \'` ) while preserving slashes and dimension quotes', () => {
      expect(sanitizeSearchQuery('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeSearchQuery("panduit' or 1=1--")).toBe('panduit or 1=1--');
      expect(sanitizeSearchQuery('tubería pvc 1/2"')).toBe('tubería pvc 1/2"');
      expect(sanitizeSearchQuery('cable 3x10 AWG & tubería 2"')).toBe('cable 3x10 AWG & tubería 2"');
    });

    it('should handle metacharacters without throwing regex or syntax errors', () => {
      expect(sanitizeSearchQuery('*** ??? +++')).toBe('*** ??? +++');
      expect(sanitizeSearchQuery('panduit (cat6) [sika]')).toBe('panduit (cat6) [sika]');
    });

    it('should return empty string for null, undefined or empty queries', () => {
      expect(sanitizeSearchQuery(null)).toBe('');
      expect(sanitizeSearchQuery(undefined)).toBe('');
      expect(sanitizeSearchQuery('')).toBe('');
      expect(sanitizeSearchQuery('     ')).toBe('');
    });
  });

  describe('2. Search Index Construction (buildSearchIndex)', () => {
    it('should compile brands and sectors into canonical SearchIndexItem objects', () => {
      const index = buildSearchIndex(sampleBrands, sampleCategories);
      expect(index.length).toBe(sampleBrands.length + sampleCategories.length);

      const panduitItem = index.find((item) => item.id === 'panduit');
      expect(panduitItem).toBeDefined();
      expect(panduitItem?.type).toBe('brand');
      expect(panduitItem?.name).toBe('Panduit');
      expect(panduitItem?.sector).toBe('electrico');
      expect(panduitItem?.isTractor).toBe(true);
      expect(panduitItem?.url).toBe('/distribuidor-panduit-colombia');

      const electricoCategory = index.find((item) => item.id === 'electrico');
      expect(electricoCategory).toBeDefined();
      expect(electricoCategory?.type).toBe('sector');
      expect(electricoCategory?.url).toBe('/sector-electrico');
    });

    it('should generate canonical URLs correctly for brands and sectors', () => {
      const index = buildSearchIndex(sampleBrands, sampleCategories);
      const brand = index.find((i) => i.id === 'dewalt');
      expect(brand?.url).toBe('/distribuidor-dewalt-colombia');

      const sector = index.find((i) => i.id === 'ferretero-construccion');
      expect(sector?.url).toBe('/sector-ferretero-construccion');
    });
  });

  describe('3. Search Filtering (filterSearchIndex)', () => {
    let index: SearchIndexItem[];

    beforeEach(() => {
      index = buildSearchIndex(sampleBrands, sampleCategories);
    });

    it('should return an empty array when search query is empty or only whitespace', () => {
      expect(filterSearchIndex(index, '')).toEqual([]);
      expect(filterSearchIndex(index, '   ')).toEqual([]);
      expect(filterSearchIndex(index, null)).toEqual([]);
      expect(filterSearchIndex(index, undefined)).toEqual([]);
    });

    it('should find exact and partial brand names case-insensitively', () => {
      const results = filterSearchIndex(index, 'panduit');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('panduit');

      const upper = filterSearchIndex(index, 'SIKA');
      expect(upper.length).toBeGreaterThan(0);
      expect(upper[0].id).toBe('sika');
    });

    it('should tokenize queries treating commas, periods, semicolons, and spaces as separators', () => {
      const resultsWithComma = filterSearchIndex(index, 'sika, impermeabilizante');
      expect(resultsWithComma.length).toBeGreaterThanOrEqual(1);
      expect(resultsWithComma[0].id).toBe('sika');

      const singleComma = filterSearchIndex(index, 'sika,');
      expect(singleComma.some((r) => r.id === 'sika')).toBe(true);

      const semiColon = filterSearchIndex(index, 'dewalt;');
      expect(semiColon.some((r) => r.id === 'dewalt')).toBe(true);

      const period = filterSearchIndex(index, 'panduit.');
      expect(period.some((r) => r.id === 'panduit')).toBe(true);
    });

    it('should be diacritic and accent insensitive (e.g. electrico vs eléctrico)', () => {
      const withoutAccent = filterSearchIndex(index, 'electrico');
      const withAccent = filterSearchIndex(index, 'eléctrico');

      expect(withoutAccent.some((r) => r.id === 'electrico')).toBe(true);
      expect(withAccent.some((r) => r.id === 'electrico')).toBe(true);
    });

    it('should match keywords from application notes or descriptions', () => {
      const results = filterSearchIndex(index, 'impermeabilizantes');
      expect(results.some((r) => r.id === 'sika')).toBe(true);

      const rotomartillos = filterSearchIndex(index, 'rotomartillos');
      expect(rotomartillos.some((r) => r.id === 'dewalt')).toBe(true);
    });

    it('should prioritize tractor brands and exact name matches over secondary matches', () => {
      const results = filterSearchIndex(index, 'electrico');
      expect(results.length).toBeGreaterThan(0);
      // Tractor brands or exact name match should be at the top
      expect(results[0].name.toLowerCase()).toContain('eléctrico');
    });

    it('should return empty array for unlisted references (Zero-Fail Trigger)', () => {
      const zeroResults = filterSearchIndex(index, 'taladro hilti');
      expect(zeroResults).toEqual([]);

      const unknownBrand = filterSearchIndex(index, 'bosch professional');
      expect(unknownBrand).toEqual([]);
    });

    it('should be safe from regex crashes when metacharacters are entered', () => {
      expect(() => filterSearchIndex(index, '***')).not.toThrow();
      expect(() => filterSearchIndex(index, '??? [(')).not.toThrow();
      expect(() => filterSearchIndex(index, '\\d+')).not.toThrow();
    });
  });

  describe('4. Zero-Fail WhatsApp Fallback (generateSearchZeroFailWhatsAppUrl)', () => {
    const OFFICIAL_NUMBER = '573014191344';

    it('should generate official wa.me URL targeting Línea Corporativa (+57 301 419 1344)', () => {
      const url = generateSearchZeroFailWhatsAppUrl('taladro hilti');
      expect(url).toContain(`https://wa.me/${OFFICIAL_NUMBER}`);
      expect(url).not.toContain('3044013761');
    });

    it('should include the unlisted term in the pre-loaded WhatsApp message', () => {
      const term = 'taladro hilti';
      const url = generateSearchZeroFailWhatsAppUrl(term);
      const parsed = new URL(url);
      const text = parsed.searchParams.get('text');

      expect(text).toBeDefined();
      expect(text).toContain(term);
      expect(text).toContain('cotizar');
      expect(text).toMatch(/Geraldine y Sonia/);
    });

    it('should properly encode special characters and spaces in the URL', () => {
      const term = 'cable 3x10 AWG & tubería 2"';
      const url = generateSearchZeroFailWhatsAppUrl(term);
      const parsed = new URL(url);
      const text = parsed.searchParams.get('text');

      expect(text).toContain(term);
    });

    it('should fall back to default corporate message when query is empty or whitespace', () => {
      const urlEmpty = generateSearchZeroFailWhatsAppUrl('');
      expect(urlEmpty).toContain(`https://wa.me/${OFFICIAL_NUMBER}`);

      const urlWhitespace = generateSearchZeroFailWhatsAppUrl('    ');
      expect(urlWhitespace).toContain(`https://wa.me/${OFFICIAL_NUMBER}`);
    });
  });

  describe('5. Cart Store ($cartStore)', () => {
    let mockStorage: MockStorage;

    beforeEach(() => {
      mockStorage = new MockStorage();
      setCartStorage(mockStorage);
      resetCartStore();
    });

    it('should initialize with an empty item list and 0 count', () => {
      const state = $cartStore.get();
      expect(state.items).toEqual([]);
      expect(state.totalItems).toBe(0);
    });

    it('should export both $cartStore and cartStore as the same instance', () => {
      expect($cartStore).toBe(cartStore);
    });

    it('should add a brand item to the cart requisition list', () => {
      $cartStore.addItem({
        id: 'panduit',
        name: 'Panduit',
        sector: 'electrico',
        url: '/distribuidor-panduit-colombia',
        isTractor: true,
      });

      const state = $cartStore.get();
      expect(state.items.length).toBe(1);
      expect(state.items[0].id).toBe('panduit');
      expect(state.items[0].name).toBe('Panduit');
      expect(state.items[0].quantity).toBe(1);
      expect(state.totalItems).toBe(1);
    });

    it('should increment item quantity if the same item is added multiple times', () => {
      $cartStore.addItem({
        id: 'sika',
        name: 'Sika',
      });
      $cartStore.addItem({
        id: 'sika',
        name: 'Sika',
      });

      const state = $cartStore.get();
      expect(state.items.length).toBe(1);
      expect(state.items[0].id).toBe('sika');
      expect(state.items[0].quantity).toBe(2);
      expect(state.totalItems).toBe(2);
    });

    it('should notify subscribers when items are added', () => {
      const subscriber = vi.fn();
      const unsubscribe = $cartStore.subscribe(subscriber);

      // Initial notification on subscribe
      expect(subscriber).toHaveBeenCalledTimes(1);

      $cartStore.addItem({
        id: 'dewalt',
        name: 'DeWalt',
      });

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenLastCalledWith(
        expect.objectContaining({
          totalItems: 1,
          items: [expect.objectContaining({ id: 'dewalt' })],
        })
      );

      unsubscribe();
      $cartStore.addItem({ id: 'sika', name: 'Sika' });
      expect(subscriber).toHaveBeenCalledTimes(2); // no further call
    });

    it('should persist cart items in storage', () => {
      $cartStore.addItem({
        id: 'panduit',
        name: 'Panduit',
      });

      expect(mockStorage.getItem('asoexi_cart')).not.toBeNull();
      const stored = JSON.parse(mockStorage.getItem('asoexi_cart') || '{}');
      expect(stored.items[0].id).toBe('panduit');
    });

    it('should remove items correctly and clear cart', () => {
      $cartStore.addItem({ id: 'panduit', name: 'Panduit' });
      $cartStore.addItem({ id: 'sika', name: 'Sika' });

      expect($cartStore.get().totalItems).toBe(2);

      $cartStore.removeItem('panduit');
      expect($cartStore.get().totalItems).toBe(1);
      expect($cartStore.get().items.some((i) => i.id === 'panduit')).toBe(false);

      $cartStore.clear();
      expect($cartStore.get().totalItems).toBe(0);
      expect($cartStore.get().items).toEqual([]);
    });

    it('should synchronize state when another tab modifies localStorage (cross-tab storage event)', () => {
      // Simulate external tab update
      const externalCartState = {
        items: [
          {
            id: 'centelsa',
            name: 'Centelsa by Nexans',
            quantity: 3,
          },
        ],
        totalItems: 3,
      };
      mockStorage.setItem('asoexi_cart', JSON.stringify(externalCartState));

      // Trigger sync directly or via storage event
      cartStore.syncFromStorage();

      const synced = $cartStore.get();
      expect(synced.totalItems).toBe(3);
      expect(synced.items[0].id).toBe('centelsa');
      expect(synced.items[0].quantity).toBe(3);
    });

    it('should generate properly formatted requisition WhatsApp URL from cart items', () => {
      $cartStore.clear();
      $cartStore.addItem({ id: 'dewalt', name: 'DeWalt', quantity: 2 });
      $cartStore.addItem({ id: 'sika', name: 'Sika' });

      const state = $cartStore.get();
      const url = generateRequisitionWhatsAppUrl(state.items, mockStorage);

      expect(url).toContain('https://wa.me/573014191344?text=');
      expect(url).toContain(encodeURIComponent('1. DeWalt (2 unds)'));
      expect(url).toContain(encodeURIComponent('2. Sika'));
      expect(url).toContain(encodeURIComponent('SLA ≤ 5 min'));
    });
  });

  describe('6. Static Endpoint Handler (src/pages/search-index.json.ts)', () => {
    it('should execute GET handler and return valid JSON response under 35 KB matching collections', async () => {
      const { GET } = await import('@/pages/search-index.json');
      const response = await GET({} as any);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const bodyText = await response.text();
      expect(Buffer.byteLength(bodyText, 'utf-8')).toBeLessThan(35 * 1024);

      const items = JSON.parse(bodyText);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(13);

      const panduit = items.find((i: SearchIndexItem) => i.id === 'panduit');
      expect(panduit).toBeDefined();
      expect(panduit?.isTractor).toBe(true);
      expect(panduit?.url).toBe('/distribuidor-panduit-colombia');

      const electrico = items.find((i: SearchIndexItem) => i.id === 'electrico');
      expect(electrico).toBeDefined();
      expect(electrico?.type).toBe('sector');
      expect(electrico?.url).toBe('/sector-electrico');
    });
  });
});
