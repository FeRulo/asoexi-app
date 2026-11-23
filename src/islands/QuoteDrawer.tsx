import { useState, useEffect, useRef } from 'preact/hooks';
import {
  $cartStore,
  resolveItemLogoUrl,
  getBrandTypographicInitials,
  type CartState,
  type CartItem,
  type CatalogItem,
  type CustomItem,
} from '@/stores/cart';
import {
  type SearchIndexItem,
  sanitizeSearchQuery,
  filterSearchIndex,
} from '@/lib/search';
import { generateRequisitionWhatsAppUrl } from '@/lib/whatsapp';

export { resolveItemLogoUrl, getBrandTypographicInitials };

/**
 * Filters the search index inside QuoteDrawer returning only actionable brand items.
 */
export function filterDrawerCatalogBrands(
  index: SearchIndexItem[],
  rawQuery?: string | null,
  maxLimit: number = 6
): SearchIndexItem[] {
  const matches = filterSearchIndex(index, rawQuery);
  return matches.filter((item) => item.type === 'brand').slice(0, maxLimit);
}

function isCustomCartItem(item: CartItem): item is CustomItem {
  return 'isCustom' in item && item.isCustom === true;
}

export const QUOTE_DRAWER_COPY = {
  title: 'Lista de Requisición B2B',
  subtitle: 'Abastecimiento multimarca con entrega 100% a domicilio en obra o planta',
  minimumTicketTitle: 'Condiciones de Despacho y Pedido Mínimo Sugerido',
  minimumTicketReminder:
    'Ticket mínimo sugerido: $200.000 COP en Bogotá / $100.000 - $300.000 COP Sabana (según municipio). Despacho 100% a domicilio en obra sin venta por mostrador.',
  excelPdfShortcut:
    '¿Tienes listado completo en Excel o PDF? Puedes adjuntarlo directamente en WhatsApp tras abrir el chat',
  primaryWhatsAppAction: 'Cotizar por WhatsApp (SLA ≤ 5 min en horario hábil)',
  secondaryEmailAction: '¿Sin WhatsApp? Enviar requisición a serviciocliente@asoexi.com',
  specialCreditAction: 'Solicitar Crédito a 45 Días con RUT',
} as const;

const SECTOR_LABELS: Record<string, string> = {
  'electrico': 'Sector Eléctrico',
  'ferretero-construccion': 'Ferretería & Construcción',
  'hidraulico-pinturas': 'Hidráulico & Pinturas',
};

const SECTOR_BADGE_CLASSES: Record<string, string> = {
  'electrico': 'text-red-700 bg-red-50 border-red-200/60',
  'ferretero-construccion': 'text-amber-800 bg-amber-50 border-amber-200/60',
  'hidraulico-pinturas': 'text-blue-700 bg-blue-50 border-blue-200/60',
};

/**
 * Builds a structured mailto URL targeting exclusively serviciocliente@asoexi.com
 * as an accessible fallback when QuoteFormalModal (Story 4.4) is not yet mounted.
 */
export function buildRequisitionMailtoUrl(
  items: CartItem[],
  creditRequested: boolean = false
): string {
  const recipient = 'serviciocliente@asoexi.com';
  const subject = creditRequested
    ? 'Solicitud%20de%20Credito%2045%20Dias%20con%20RUT'
    : encodeURIComponent('Solicitud de Cotización B2B Multimarca - ASOEXI S.A.S.');

  const lines: string[] = [
    'Hola equipo comercial de ASOEXI S.A.S. (Geraldine y Sonia),',
    '',
    creditRequested
      ? 'Deseo radicar una solicitud formal de cotización y estudio de Crédito Comercial a 45 Días con RUT adjunto para la siguiente requisición:'
      : 'Deseo solicitar una cotización formal B2B para la siguiente lista de requisición multimarca:',
    '',
  ];

  if (items && items.length > 0) {
    items.forEach((item, idx) => {
      const isCustom = isCustomCartItem(item);
      const tag = isCustom ? '[Insumo Libre]' : '[Marca Catálogo]';
      const notes =
        isCustom && item.notes ? ` — Nota: ${item.notes}` : '';
      lines.push(`${idx + 1}. ${tag} ${item.name} — Cantidad: ${item.quantity} und(s)${notes}`);
    });
  } else {
    lines.push('- (Adjunto listado de materiales / especificaciones de obra en este correo)');
  }

  lines.push(
    '',
    'Datos de la empresa solicitante:',
    '- Razón Social:',
    '- NIT:',
    '- Nombre de contacto:',
    '- Teléfono / Celular:',
    '- Ciudad / Dirección de entrega en obra:',
    creditRequested ? '- Adjunto certificado RUT actualizado para validación de cupo a 45 días.' : ''
  );

  const body = encodeURIComponent(lines.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n'));
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

/**
 * Dispatches the `open-quote-formal-modal` CustomEvent for Story 4.4 integration.
 * Listeners that handle the modal should call `event.preventDefault()`.
 * Returns true if a listener handled (canceled) the event, or false if fallback should run.
 */
export function dispatchQuoteFormalModalEvent(
  creditRequested: boolean,
  target?: EventTarget | null
): boolean {
  const eventTarget =
    target ?? (typeof window !== 'undefined' ? window : null);
  if (!eventTarget) {
    return false;
  }

  const event = new CustomEvent('open-quote-formal-modal', {
    detail: { creditRequested },
    cancelable: true,
  });

  // dispatchEvent returns false if event.preventDefault() was called by a listener
  const notCanceled = eventTarget.dispatchEvent(event);
  return !notCanceled;
}

export default function QuoteDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartState, setCartState] = useState<CartState>(() => $cartStore.get());
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  // Integrated catalog brand search state inside QuoteDrawer
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchIndexItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [addedBrandIds, setAddedBrandIds] = useState<Record<string, boolean>>({});

  // Custom item form state
  const [isCustomFormExpanded, setIsCustomFormExpanded] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1');
  const [customNotes, setCustomNotes] = useState('');
  const [customError, setCustomError] = useState('');
  const [customSuccess, setCustomSuccess] = useState(false);

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const customSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCatalogSearchIndex = async () => {
    if (searchIndex.length > 0 || isLoadingIndex) return;
    setIsLoadingIndex(true);
    try {
      const response = await fetch('/search-index.json');
      if (response.ok) {
        const data: SearchIndexItem[] = await response.json();
        setSearchIndex(data);
      }
    } catch {
      // Silent fallback: user can still add custom items freely
    } finally {
      setIsLoadingIndex(false);
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  };

  // Subscribe to reactive $cartStore
  useEffect(() => {
    const unsubscribe = $cartStore.subscribe((state) => {
      setCartState(state);
    });
    return () => {
      unsubscribe();
      if (customSuccessTimerRef.current) {
        clearTimeout(customSuccessTimerRef.current);
        customSuccessTimerRef.current = null;
      }
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
        searchDebounceTimerRef.current = null;
      }
    };
  }, []);

  // Re-filter when searchIndex finishes loading if user already typed a query
  useEffect(() => {
    if (searchIndex.length > 0 && searchQuery.trim().length > 0) {
      setSearchResults(filterDrawerCatalogBrands(searchIndex, searchQuery));
    }
  }, [searchIndex]);

  // Global open-quote-drawer / close-quote-drawer listeners
  useEffect(() => {
    const handleOpen = () => {
      // Ensure LiveSearchModal or ContactChannelModal are closed cleanly before opening Drawer
      window.dispatchEvent(new CustomEvent('close-search-modal'));
      window.dispatchEvent(new CustomEvent('close-contact-modal'));

      setIsOpen((prev) => {
        if (!prev) {
          previousActiveElement.current = document.activeElement as HTMLElement | null;
        }
        return true;
      });
      loadCatalogSearchIndex();
    };

    const handleClose = () => {
      closeDrawer();
    };

    window.addEventListener('open-quote-drawer', handleOpen);
    window.addEventListener('close-quote-drawer', handleClose);

    return () => {
      window.removeEventListener('open-quote-drawer', handleOpen);
      window.removeEventListener('close-quote-drawer', handleClose);
    };
  }, []);

  // Singleton visual coexistence, scroll lock & WCAG 2.2 AA Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const mascotWidget = document.getElementById('floating-whatsapp-widget');
    if (mascotWidget) {
      mascotWidget.classList.add('opacity-0', 'pointer-events-none');
    }
    const mobileBar = document.getElementById('mobile-sticky-bar');
    if (mobileBar) {
      mobileBar.classList.add('opacity-0', 'pointer-events-none');
    }

    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            !drawerRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (
            document.activeElement === last ||
            !drawerRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = '';
      if (mascotWidget && !mascotWidget.classList.contains('translate-y-8')) {
        mascotWidget.classList.remove('opacity-0', 'pointer-events-none');
      }
      if (mobileBar && !mobileBar.classList.contains('translate-y-full')) {
        mobileBar.classList.remove('opacity-0', 'pointer-events-none');
      }
      window.dispatchEvent(new Event('scroll'));
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMouseDown = (e: MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      closeDrawer();
    }
  };

  const handleToggleCustomForm = () => {
    setIsCustomFormExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => customInputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (searchIndex.length === 0 && !isLoadingIndex) {
      loadCatalogSearchIndex();
    }

    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      const sanitized = sanitizeSearchQuery(val);
      if (!sanitized) {
        setSearchResults([]);
        return;
      }
      setSearchResults(filterDrawerCatalogBrands(searchIndex, sanitized));
    }, 120);
  };

  const handleQuickAddCatalogBrand = (brand: SearchIndexItem) => {
    $cartStore.addItem({
      id: brand.id,
      name: brand.name,
      sector: brand.sector,
      url: brand.url,
      isTractor: brand.isTractor,
      type: brand.type,
      logo: brand.logo ?? null,
    });

    setAddedBrandIds((prev) => ({ ...prev, [brand.id]: true }));
    setTimeout(() => {
      setAddedBrandIds((prev) => ({ ...prev, [brand.id]: false }));
    }, 1200);
  };

  const handleAddCustomSubmit = (e: Event) => {
    e.preventDefault();
    const trimmedDesc = customDescription.trim();
    if (!trimmedDesc) {
      setCustomError('Ingresa la descripción de la referencia o insumo requerido.');
      customInputRef.current?.focus();
      return;
    }

    const parsedQty = parseInt(customQuantity, 10);
    const created = $cartStore.addCustomItem(
      trimmedDesc,
      isNaN(parsedQty) ? 1 : parsedQty,
      customNotes.trim() || undefined
    );

    if (created) {
      setCustomDescription('');
      setCustomQuantity('1');
      setCustomNotes('');
      setCustomError('');
      setCustomSuccess(true);
      if (customSuccessTimerRef.current) {
        clearTimeout(customSuccessTimerRef.current);
      }
      customSuccessTimerRef.current = setTimeout(() => {
        setCustomSuccess(false);
        customSuccessTimerRef.current = null;
      }, 2000);
    }
  };

  const handleFormalModalTrigger = (creditRequested: boolean, e: MouseEvent) => {
    const handledByModal = dispatchQuoteFormalModalEvent(creditRequested);
    if (handledByModal) {
      e.preventDefault();
      closeDrawer();
    } else {
      // Allows default mailto fallback navigation or closes drawer cleanly
      closeDrawer();
    }
  };

  if (!isOpen) return null;

  const whatsappRequisitionUrl = generateRequisitionWhatsAppUrl(cartState.items);
  const emailFallbackUrl = buildRequisitionMailtoUrl(cartState.items, false);
  const creditFallbackUrl = buildRequisitionMailtoUrl(cartState.items, true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-drawer-title"
      onMouseDown={handleMouseDown}
      onClick={handleBackdropClick}
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
    >
      <div
        ref={drawerRef}
        class="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-slide-up sm:animate-fade-in"
      >
        {/* Drawer Header */}
        <div class="p-4 sm:p-5 bg-secondary text-white border-b border-slate-700/80 flex items-start justify-between gap-3 shrink-0">
          <div class="min-w-0">
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-industrial border border-emerald-500/30 mb-1.5">
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Cajón Persistente Multimarca · SLA ≤ 5 min</span>
            </div>
            <h2 id="quote-drawer-title" class="font-display font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
              <span>{QUOTE_DRAWER_COPY.title}</span>
              <span class="px-2 py-0.5 text-xs font-mono font-bold bg-primary text-white rounded-industrial">
                {cartState.totalItems}
              </span>
            </h2>
            <p class="text-xs text-slate-300 mt-0.5 leading-snug">
              {QUOTE_DRAWER_COPY.subtitle}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar cajón de cotización"
            class="flex items-center justify-center w-12 h-12 text-slate-300 hover:text-white hover:bg-white/10 rounded-industrial transition-colors shrink-0 min-h-[48px] min-w-[48px] cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body: Integrated Brand Search + Items List + Custom Item Form + Logistics Info */}
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/60">
          {/* Integrated Catalog Brand Search inside QuoteDrawer */}
          <div class="bg-white border border-slate-200 rounded-industrial p-3.5 shadow-2xs space-y-2.5">
            <label
              for="drawer-brand-search-input"
              class="block font-display font-bold text-xs uppercase tracking-wider text-secondary"
            >
              Buscar y agregar marca del catálogo (~40 marcas)
            </label>
            <div class="relative flex items-center">
              <svg
                class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                id="drawer-brand-search-input"
                type="search"
                value={searchQuery}
                onInput={(e) =>
                  handleSearchInputChange((e.target as HTMLInputElement).value)
                }
                placeholder="Escribe marca o sector (Panduit, Sika, DeWalt, Pavco...)"
                class="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-industrial text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Limpiar búsqueda de marca en el cajón"
                  class="absolute right-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-secondary rounded-industrial cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Instant Search Results inside QuoteDrawer */}
            {sanitizeSearchQuery(searchQuery).length > 0 && (
              <div class="pt-1">
                {isLoadingIndex ? (
                  <p class="text-xs text-slate-500 py-2 text-center">
                    Cargando catálogo de marcas...
                  </p>
                ) : searchResults.length > 0 ? (
                  <ul
                    role="list"
                    aria-label="Resultados de búsqueda en el cajón"
                    class="divide-y divide-slate-100 border border-slate-200 rounded-industrial bg-slate-50/60 max-h-56 overflow-y-auto"
                  >
                    {searchResults.map((brand) => {
                      const logoKey = `search:${brand.id}:${brand.logo ?? ''}`;
                      const validLogo = !brokenLogos[logoKey]
                        ? resolveItemLogoUrl(brand.logo)
                        : null;
                      const isRecentlyAdded = addedBrandIds[brand.id];
                      const inCartItem = cartState.items.find((i) => i.id === brand.id);

                      return (
                        <li
                          key={brand.id}
                          class="p-2.5 flex items-center justify-between gap-2.5 hover:bg-white transition-colors"
                        >
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-10 h-10 rounded-industrial border border-slate-200 bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                              {validLogo ? (
                                <img
                                  src={validLogo}
                                  alt={`Logotipo oficial de ${brand.name}`}
                                  width="36"
                                  height="28"
                                  loading="lazy"
                                  onError={() =>
                                    setBrokenLogos((prev) => ({ ...prev, [logoKey]: true }))
                                  }
                                  class="max-h-7 max-w-[34px] w-auto h-auto object-contain"
                                />
                              ) : (
                                <span class="font-display font-extrabold text-[10px] tracking-wider uppercase text-secondary">
                                  {getBrandTypographicInitials(brand.name)}
                                </span>
                              )}
                            </div>
                            <div class="min-w-0">
                              <p class="font-display font-bold text-xs text-secondary truncate flex items-center gap-1.5">
                                <span>{brand.name}</span>
                                {inCartItem && (
                                  <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded-industrial">
                                    En lista: {inCartItem.quantity}
                                  </span>
                                )}
                              </p>
                              <p class="text-[11px] text-slate-500 truncate">
                                {brand.sectorName}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuickAddCatalogBrand(brand)}
                            aria-label={`Agregar ${brand.name} a la requisición`}
                            class={`px-3 py-2 min-h-[48px] text-xs font-bold rounded-industrial shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer ${
                              isRecentlyAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-primary hover:bg-primary-hover text-white'
                            }`}
                          >
                            {isRecentlyAdded ? (
                              <span>¡Agregado!</span>
                            ) : (
                              <>
                                <span class="text-sm font-bold">+</span>
                                <span>{inCartItem ? 'Sumar +1' : 'Agregar'}</span>
                              </>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-industrial flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span class="text-amber-900">
                      ¿No está en catálogo web? Agrégalo como insumo libre bajo pedido:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cleanTerm = sanitizeSearchQuery(searchQuery);
                        setCustomDescription(cleanTerm);
                        setIsCustomFormExpanded(true);
                        setSearchQuery('');
                        setSearchResults([]);
                        setTimeout(() => customInputRef.current?.focus(), 50);
                      }}
                      class="px-3 py-2 min-h-[48px] bg-secondary hover:bg-secondary-hover text-white font-bold text-xs rounded-industrial shrink-0 cursor-pointer"
                    >
                      + Usar &ldquo;{sanitizeSearchQuery(searchQuery)}&rdquo; como insumo libre
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toolbar: Count & Clear Cart */}
          {cartState.items.length > 0 && (
            <div class="flex items-center justify-between text-xs text-slate-600 pb-1 border-b border-slate-200">
              <span class="font-semibold">
                {cartState.items.length} {cartState.items.length === 1 ? 'referencia o marca' : 'referencias / marcas'} ({cartState.totalItems} {cartState.totalItems === 1 ? 'unidad' : 'unidades'})
              </span>
              <button
                type="button"
                onClick={() => $cartStore.clear()}
                class="min-h-[48px] px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-industrial transition-colors inline-flex items-center cursor-pointer"
              >
                Vaciar lista
              </button>
            </div>
          )}

          {/* Items List or Empty State */}
          {cartState.items.length === 0 ? (
            <div class="bg-white border border-dashed border-slate-300 rounded-industrial p-6 text-center space-y-3">
              <div class="w-12 h-12 mx-auto rounded-industrial bg-slate-100 text-slate-500 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-display font-bold text-sm text-secondary">
                  Tu lista de requisición está vacía
                </h3>
                <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Agrega marcas oficiales desde el catálogo o incorpora referencias e insumos personalizados de obra con el botón inferior.
                </p>
              </div>
              <div class="pt-1 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    window.dispatchEvent(new CustomEvent('open-search-modal'));
                  }}
                  class="px-3.5 py-2.5 text-xs font-bold text-secondary bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-industrial min-h-[48px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Explorar catálogo de marcas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomFormExpanded(true);
                    setTimeout(() => customInputRef.current?.focus(), 50);
                  }}
                  class="px-3.5 py-2.5 text-xs font-bold text-primary bg-red-50 hover:bg-red-100 border border-red-200 rounded-industrial min-h-[48px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="font-bold text-sm">+</span>
                  <span>Agregar insumo libre</span>
                </button>
              </div>
            </div>
          ) : (
            <ul role="list" class="space-y-3">
              {cartState.items.map((item) => {
                const isCustom = isCustomCartItem(item);
                const catalogItem = !isCustom ? (item as CatalogItem) : null;
                const customItem = isCustom ? (item as CustomItem) : null;
                const rawLogo = catalogItem ? catalogItem.logo : null;
                const logoKey = `${item.id}:${rawLogo ?? ''}`;
                const validLogo =
                  !brokenLogos[logoKey] ? resolveItemLogoUrl(rawLogo) : null;
                const sectorKey = catalogItem && catalogItem.sector ? catalogItem.sector : '';
                const sectorLabel = SECTOR_LABELS[sectorKey] || sectorKey;
                const sectorBadge =
                  SECTOR_BADGE_CLASSES[sectorKey] ||
                  'text-slate-700 bg-slate-100 border-slate-200';

                return (
                  <li
                    key={item.id}
                    class="p-3.5 bg-white border border-slate-200 rounded-industrial shadow-2xs flex flex-col gap-3"
                  >
                    <div class="flex items-start justify-between gap-3">
                      {/* Brand Logo / Typographic Fallback or Custom Icon */}
                      <div class="w-14 h-14 rounded-industrial border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                        {isCustom ? (
                          <div class="w-full h-full bg-amber-50 text-amber-800 rounded-industrial flex flex-col items-center justify-center text-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span class="text-[8px] font-bold uppercase tracking-tighter mt-0.5">
                              Libre
                            </span>
                          </div>
                        ) : validLogo ? (
                          <img
                            src={validLogo}
                            alt={`Logotipo oficial de ${item.name}`}
                            width="52"
                            height="40"
                            loading="lazy"
                            onError={() =>
                              setBrokenLogos((prev) => ({ ...prev, [logoKey]: true }))
                            }
                            class="max-h-10 max-w-[48px] w-auto h-auto object-contain"
                          />
                        ) : (
                          <div
                            class="w-full h-full bg-slate-100 text-secondary rounded-industrial flex flex-col items-center justify-center"
                            title={item.name}
                          >
                            <span class="font-display font-extrabold text-xs tracking-wider uppercase">
                              {getBrandTypographicInitials(item.name)}
                            </span>
                            <span class="text-[8px] uppercase text-slate-500 font-bold">
                              Marca
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Item Title, Badges & Notes */}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap mb-1">
                          {isCustom ? (
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 rounded-industrial">
                              Insumo Libre / Obra
                            </span>
                          ) : (
                            <>
                              {sectorLabel && (
                                <span
                                  class={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-industrial border ${sectorBadge}`}
                                >
                                  {sectorLabel}
                                </span>
                              )}
                              {catalogItem?.isTractor && (
                                <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-industrial">
                                  Tractora
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <h3 class="font-display font-bold text-sm text-secondary break-words">
                          {catalogItem?.url ? (
                            <a
                              href={catalogItem.url}
                              onClick={closeDrawer}
                              class="hover:text-primary hover:underline focus:outline-none focus:underline"
                            >
                              {item.name}
                            </a>
                          ) : (
                            item.name
                          )}
                        </h3>

                        {customItem?.notes && (
                          <p class="text-xs text-slate-600 mt-1 bg-slate-50 px-2.5 py-1.5 rounded-industrial border border-slate-200/80">
                            <strong class="font-semibold text-slate-700">Nota:</strong> {customItem.notes}
                          </p>
                        )}
                      </div>

                      {/* Delete Item Button (≥ 48x48px accessible target) */}
                      <button
                        type="button"
                        onClick={() => $cartStore.removeItem(item.id)}
                        aria-label={`Eliminar ${item.name} de la requisición`}
                        title={`Eliminar ${item.name}`}
                        class="w-12 h-12 min-w-[48px] min-h-[48px] -mr-1 -mt-1 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-industrial transition-colors shrink-0 cursor-pointer"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity Stepper Controls */}
                    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span class="text-xs font-medium text-slate-500">
                        Cantidad solicitada:
                      </span>

                      <div class="flex items-center border border-slate-300 rounded-industrial bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              $cartStore.updateQuantity(item.id, item.quantity - 1);
                            } else {
                              $cartStore.removeItem(item.id);
                            }
                          }}
                          aria-label={
                            item.quantity > 1
                              ? `Disminuir cantidad de ${item.name}`
                              : `Eliminar ${item.name}`
                          }
                          class="w-12 h-12 min-h-[48px] min-w-[48px] flex items-center justify-center text-secondary hover:bg-slate-100 font-bold text-base transition-colors cursor-pointer select-none"
                        >
                          &minus;
                        </button>

                        <input
                          type="number"
                          min="1"
                          max="99999"
                          aria-label={`Cantidad para ${item.name}`}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt((e.target as HTMLInputElement).value, 10);
                            $cartStore.updateQuantity(item.id, isNaN(val) ? 1 : val);
                          }}
                          class="w-14 h-12 min-h-[48px] text-center font-mono font-bold text-xs text-secondary border-x border-slate-200 focus:outline-none focus:bg-slate-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            $cartStore.updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          class="w-12 h-12 min-h-[48px] min-w-[48px] flex items-center justify-center text-secondary hover:bg-slate-100 font-bold text-base transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Interactive Custom Item Form: + Agregar insumo o nota libre */}
          <div class="bg-white border border-slate-200 rounded-industrial p-4 shadow-2xs">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h3 class="font-display font-bold text-xs uppercase tracking-wider text-secondary">
                  + Agregar insumo o nota libre
                </h3>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  ¿Necesitas calibres específicos, tuberías, EPP o referencias fuera de vitrina? Agrégalos aquí:
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleCustomForm}
                aria-expanded={isCustomFormExpanded}
                aria-controls="custom-item-form"
                class="px-3 py-2 text-xs font-bold text-primary bg-red-50 hover:bg-red-100 border border-red-200 rounded-industrial min-h-[48px] min-w-[48px] shrink-0 transition-colors cursor-pointer"
              >
                {isCustomFormExpanded ? 'Ocultar' : '+ Agregar'}
              </button>
            </div>

            {isCustomFormExpanded && (
              <form id="custom-item-form" onSubmit={handleAddCustomSubmit} class="mt-3 space-y-3">
                <div>
                  <label
                    for="custom-item-desc"
                    class="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Descripción del insumo o referencia de obra *
                  </label>
                  <input
                    ref={customInputRef}
                    id="custom-item-desc"
                    type="text"
                    value={customDescription}
                    onInput={(e) => {
                      setCustomDescription((e.target as HTMLInputElement).value);
                      if (customError) setCustomError('');
                    }}
                    placeholder='Ej: 20 tubos conduit EMT 3/4", Cable THHN #12 rojo, Sika 1 x 20kg...'
                    class="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-industrial text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label
                      for="custom-item-qty"
                      class="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Cantidad
                    </label>
                    <input
                      id="custom-item-qty"
                      type="number"
                      min="1"
                      max="99999"
                      value={customQuantity}
                      onInput={(e) =>
                        setCustomQuantity((e.target as HTMLInputElement).value)
                      }
                      class="w-full px-3 py-2.5 text-xs sm:text-sm font-mono bg-white border border-slate-300 rounded-industrial text-secondary focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label
                      for="custom-item-notes"
                      class="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Especificación o nota opcional
                    </label>
                    <input
                      id="custom-item-notes"
                      type="text"
                      value={customNotes}
                      onInput={(e) =>
                        setCustomNotes((e.target as HTMLInputElement).value)
                      }
                      placeholder="Ej: Certificación RETIE / Urgente en obra..."
                      class="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-industrial text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                    />
                  </div>
                </div>

                {customError && (
                  <p role="alert" class="text-xs font-semibold text-red-600">
                    {customError}
                  </p>
                )}

                {customSuccess && (
                  <p role="status" class="text-xs font-semibold text-emerald-700">
                    ¡Insumo libre agregado a tu lista de requisición!
                  </p>
                )}

                <button
                  type="submit"
                  class="w-full min-h-[48px] px-4 py-2.5 bg-secondary hover:bg-secondary-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-industrial shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span class="text-sm font-bold">+</span>
                  <span>Incorporar Insumo a la Lista</span>
                </button>
              </form>
            )}
          </div>

          {/* Dispatch Conditions Block: Ticket Mínimo & Excel/PDF Shortcut */}
          <div class="bg-amber-50/80 border border-amber-200 rounded-industrial p-4 space-y-2.5 text-xs">
            <div class="flex items-start gap-2.5">
              <svg
                class="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
              <div>
                <h4 class="font-display font-bold text-amber-900">
                  {QUOTE_DRAWER_COPY.minimumTicketTitle}
                </h4>
                <p class="text-amber-900/90 mt-0.5 leading-relaxed">
                  {QUOTE_DRAWER_COPY.minimumTicketReminder}
                </p>
              </div>
            </div>

            <div class="pt-2 border-t border-amber-200/80 flex items-start gap-2 text-emerald-900 bg-emerald-50/80 p-2.5 rounded-industrial border border-emerald-200/80">
              <svg
                class="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <p class="font-semibold text-[11px] leading-snug">
                {QUOTE_DRAWER_COPY.excelPdfShortcut}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Triple Commercial Action Bar */}
        <div class="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-2.5 shrink-0 shadow-lg">
          {/* 1. Primary Action: WhatsApp with SLA <= 5 min */}
          <a
            href={whatsappRequisitionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeDrawer}
            class="w-full min-h-[48px] px-4 py-3 bg-whatsapp hover:bg-whatsapp-hover text-white font-display font-bold text-xs sm:text-sm rounded-industrial shadow-sm transition-colors flex items-center justify-center gap-2 text-center focus:outline-none focus:ring-2 focus:ring-whatsapp"
          >
            <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>{QUOTE_DRAWER_COPY.primaryWhatsAppAction}</span>
          </a>

          {/* 2. Secondary Action: Send requisition to serviciocliente@asoexi.com */}
          <a
            href={emailFallbackUrl}
            onClick={(e) => handleFormalModalTrigger(false, e)}
            class="w-full min-h-[48px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-secondary border border-slate-300 font-semibold text-xs rounded-industrial transition-colors flex items-center justify-center gap-2 text-center focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <svg class="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{QUOTE_DRAWER_COPY.secondaryEmailAction}</span>
          </a>

          {/* 3. Special Action Link: 45-Day Commercial Credit with RUT */}
          <div class="pt-0.5 text-center">
            <a
              href={creditFallbackUrl}
              onClick={(e) => handleFormalModalTrigger(true, e)}
              class="w-full min-h-[48px] px-3 py-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover hover:bg-red-50/70 rounded-industrial transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="underline underline-offset-2">{QUOTE_DRAWER_COPY.specialCreditAction}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
