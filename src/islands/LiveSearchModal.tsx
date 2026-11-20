import { useState, useEffect, useRef } from 'preact/hooks';
import type { SearchIndexItem } from '@/lib/search';
import { sanitizeSearchQuery, filterSearchIndex } from '@/lib/search';
import {
  generateSearchZeroFailWhatsAppUrl,
  generateRequisitionWhatsAppUrl,
  generateBrandQuoteWhatsAppUrl,
} from '@/lib/whatsapp';
import { $cartStore, type CartState } from '@/stores/cart';

const SECTOR_BADGE_CLASSES: Record<string, string> = {
  'electrico': 'text-red-700 bg-red-50 border-red-200/60',
  'ferretero-construccion': 'text-amber-800 bg-amber-50 border-amber-200/60',
  'hidraulico-pinturas': 'text-blue-700 bg-blue-50 border-blue-200/60',
};

export default function LiveSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchIndexItem[]>([]);
  const [results, setResults] = useState<SearchIndexItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [indexError, setIndexError] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [cartState, setCartState] = useState<CartState>(() => $cartStore.get());

  useEffect(() => {
    const unsubscribe = $cartStore.subscribe((state) => {
      setCartState(state);
    });
    return unsubscribe;
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lazy load the static search index on-demand
  const loadSearchIndex = async () => {
    if (index.length > 0 || isLoadingIndex) return;
    setIsLoadingIndex(true);
    setIndexError(false);

    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }
      const data: SearchIndexItem[] = await response.json();
      setIndex(data);
    } catch {
      setIndexError(true);
    } finally {
      setIsLoadingIndex(false);
    }
  };

  // Open / Close events and global keyboard shortcut `/`
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen((prev) => {
        if (!prev) {
          previousActiveElement.current = document.activeElement as HTMLElement | null;
        }
        return true;
      });
      loadSearchIndex();
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Shortcut `/` to open search modal, ignored inside editable fields
      if (e.key === '/' && !isOpen) {
        const target = e.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          if (
            tagName === 'INPUT' ||
            tagName === 'TEXTAREA' ||
            tagName === 'SELECT' ||
            target.isContentEditable
          ) {
            return;
          }
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        e.preventDefault();
        handleOpen();
      }
    };

    window.addEventListener('open-search-modal', handleOpen);
    window.addEventListener('close-search-modal', handleClose);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('open-search-modal', handleOpen);
      window.removeEventListener('close-search-modal', handleClose);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, index.length, isLoadingIndex]);

  // Modal open side effects: scroll lock, focus trap, autofocus, hide floating mascot
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Hide mascot widget and mobile sticky bar dynamically while modal is open
    const mascotWidget = document.getElementById('floating-whatsapp-widget');
    if (mascotWidget) {
      mascotWidget.classList.add('opacity-0', 'pointer-events-none');
    }
    const mobileBar = document.getElementById('mobile-sticky-bar');
    if (mobileBar) {
      mobileBar.classList.add('opacity-0', 'pointer-events-none');
    }

    // Focus input on open
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }

      // Circular focus trap
      if (e.key === 'Tab' && modalContentRef.current) {
        const focusable = modalContentRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalContentRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalContentRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      if (mascotWidget) {
        mascotWidget.classList.remove('opacity-0', 'pointer-events-none');
      }
      if (mobileBar) {
        mobileBar.classList.remove('opacity-0', 'pointer-events-none');
      }
      // Re-dispatch scroll event so BaseLayout observer preserves hidden state if user is at #cotizar
      window.dispatchEvent(new Event('scroll'));
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Re-run search/filtering when index finishes loading if query is non-empty
  useEffect(() => {
    if (index.length > 0 && query.trim().length > 0) {
      const sanitized = sanitizeSearchQuery(query);
      if (sanitized) {
        setResults(filterSearchIndex(index, sanitized));
      }
    }
  }, [index]);

  const closeModal = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setIsOpen(false);
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  };

  // Debounced search (150ms)
  const handleInputChange = (val: string) => {
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const sanitized = sanitizeSearchQuery(val);
      if (!sanitized) {
        setResults([]);
        return;
      }
      const filtered = filterSearchIndex(index, sanitized);
      setResults(filtered);
    }, 150);
  };

  // Immediate search for suggestion chips
  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const filtered = filterSearchIndex(index, suggestion);
    setResults(filtered);
    inputRef.current?.focus();
  };

  const handleAddToCart = (item: SearchIndexItem) => {
    $cartStore.addItem({
      id: item.id,
      name: item.name,
      sector: item.sector,
      url: item.url,
      isTractor: item.isTractor,
      type: item.type,
    });

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const handleMouseDown = (e: MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      closeModal();
    }
  };

  if (!isOpen) return null;

  const sanitizedQuery = sanitizeSearchQuery(query);
  const showZeroFail =
    sanitizedQuery.length > 0 && results.length === 0 && !isLoadingIndex && !indexError;
  const zeroFailWhatsAppUrl = generateSearchZeroFailWhatsAppUrl(sanitizedQuery);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      onMouseDown={handleMouseDown}
      onClick={handleBackdropClick}
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 md:pt-16"
    >
      <div
        ref={modalContentRef}
        class="border border-slate-200 shadow-2xl rounded-industrial bg-white max-w-2xl w-full mx-auto overflow-hidden flex flex-col max-h-[85vh] animate-slide-up sm:animate-fade-in"
      >
        {/* Search Header & Input */}
        <div class="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 sm:gap-3">
          <div class="relative flex-1 flex items-center">
            <svg
              class="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none"
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
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results-list"
              aria-autocomplete="list"
              id="search-modal-input"
              value={query}
              onInput={(e) => handleInputChange((e.target as HTMLInputElement).value)}
              placeholder="Buscar marcas (Panduit, Sika, DeWalt...), sectores o insumos..."
              class="w-full pl-10 pr-10 py-3 text-sm sm:text-base bg-white border border-slate-300 rounded-industrial text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[48px] [&::-webkit-search-cancel-button]:hidden"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  inputRef.current?.focus();
                }}
                aria-label="Limpiar búsqueda"
                class="absolute right-3 p-1 text-slate-400 hover:text-secondary rounded-full"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* ESC Badge */}
          <kbd
            class="hidden sm:inline-flex items-center px-2 py-1 text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-300 rounded-industrial select-none"
            title="Presiona Escape para cerrar"
          >
            ESC
          </kbd>

          {/* Close Button */}
          <button
            type="button"
            onClick={closeModal}
            aria-label="Cerrar buscador"
            class="flex items-center justify-center w-12 h-12 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-industrial transition-colors shrink-0 min-h-[48px] min-w-[48px]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Results */}
        <div id="search-results-list" class="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Loading Indicator */}
          {isLoadingIndex && (
            <div class="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
              <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Cargando catálogo mayorista...</span>
            </div>
          )}

          {/* Network / Index Error */}
          {indexError && (
            <div class="p-4 bg-red-50 border border-red-200 rounded-industrial text-center">
              <p class="text-sm font-semibold text-red-800">
                No pudimos cargar el catálogo en este momento.
              </p>
              <p class="text-xs text-red-600 mt-1 mb-3">
                Puedes comunicarte directamente con nuestros asesores comerciales por WhatsApp para cotizar cualquier referencia.
              </p>
              <a
                href={generateSearchZeroFailWhatsAppUrl(sanitizedQuery || 'Catálogo general')}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-semibold rounded-industrial min-h-[48px]"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          )}

          {/* Initial State: Suggestions */}
          {!isLoadingIndex && !indexError && sanitizedQuery.length === 0 && (
            <div class="py-6 px-2 text-center">
              <h2 id="search-modal-title" class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Marcas Tractoras y Sectores Destacados
              </h2>
              <div class="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                {[
                  'Panduit',
                  'Centelsa by Nexans',
                  'Sylvania',
                  'Supermastick PR',
                  'Stanley',
                  'DeWalt',
                  'Truper',
                  'Pavco Wavin',
                  'Sika',
                  'Pintuco',
                ].map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleChipClick(brand)}
                    class="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 text-xs font-semibold rounded-industrial border border-slate-200 transition-colors cursor-pointer"
                  >
                    {brand}
                  </button>
                ))}
              </div>
              <p class="text-[11px] text-slate-400 mt-5">
                Presiona <kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">/</kbd> en cualquier momento para buscar.
              </p>
            </div>
          )}

          {/* Results List */}
          {!isLoadingIndex && results.length > 0 && (
            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-xs text-slate-500 px-1 pb-1">
                <span>{results.length} coincidencia{results.length > 1 ? 's' : ''} en el catálogo:</span>
                <span class="text-[11px]">Entrega directa en obra</span>
              </div>

              {results.map((item) => {
                const badgeClass =
                  SECTOR_BADGE_CLASSES[item.sector] || 'text-slate-700 bg-slate-100 border-slate-200';
                const isAdded = addedItemIds[item.id];

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    class="p-3.5 bg-white border border-slate-200 hover:border-primary/40 rounded-industrial shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          class={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-industrial border ${badgeClass}`}
                        >
                          {item.sectorName}
                        </span>
                        {item.isTractor && (
                          <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-industrial">
                            Tractora
                          </span>
                        )}
                        <span class="text-[10px] text-slate-400 capitalize">
                          {item.type === 'brand' ? 'Marca Oficial' : 'Sector Industrial'}
                        </span>
                      </div>

                      <h3 class="font-display font-bold text-base text-secondary group-hover:text-primary transition-colors">
                        <a href={item.url} onClick={closeModal} class="focus:outline-none focus:underline">
                          {item.name}
                        </a>
                      </h3>

                      <p class="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Actions: View Link + Requisition Button + Direct Quote (Brands) OR Sector Link (Sectors) */}
                    <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {item.type === 'brand' ? (
                        <>
                          <a
                            href={item.url}
                            onClick={closeModal}
                            class="px-3 py-2 text-xs font-semibold text-secondary hover:text-primary hover:bg-slate-100 rounded-industrial transition-colors min-h-[44px] flex items-center"
                          >
                            Ver ficha →
                          </a>

                          <a
                            href={generateBrandQuoteWhatsAppUrl(item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeModal}
                            class="p-2 text-slate-400 hover:text-whatsapp hover:bg-emerald-50 rounded-industrial transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
                            title={`Cotizar solo ${item.name} por WhatsApp`}
                            aria-label={`Cotizar ${item.name} directamente por WhatsApp`}
                          >
                            <svg class="w-4 h-4 fill-current text-whatsapp" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            aria-label={`Agregar ${item.name} a la lista de requisición`}
                            class={`px-3 py-2 text-xs font-semibold rounded-industrial transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-primary hover:bg-primary-hover text-white shadow-2xs'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>¡Agregado!</span>
                              </>
                            ) : (
                              <>
                                <span class="font-bold text-sm">+</span>
                                <span>Agregar a requisición</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <a
                          href={item.url}
                          onClick={closeModal}
                          class="px-3.5 py-2 text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 rounded-industrial transition-colors min-h-[44px] flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Ver sector</span>
                          <span aria-hidden="true">→</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Zero-Fail State: Proactive WhatsApp fallback */}
          {showZeroFail && (
            <div class="bg-amber-50/70 border border-amber-200 rounded-industrial p-5 text-center sm:text-left space-y-3.5 animate-fade-in">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-industrial bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-industrial border border-emerald-200 mb-1">
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>Suministro de Fábrica Bajo Pedido · SLA ≤ 5 min</span>
                  </div>
                  <h3 class="font-display font-bold text-base text-secondary">
                    ¿No encontraste &ldquo;{sanitizedQuery}&rdquo; en el catálogo web?
                  </h3>
                  <p class="text-xs text-slate-700 mt-1 leading-relaxed">
                    No te preocupes. Suministramos todo el portafolio de fábrica bajo pedido. Cotiza directamente <strong class="text-secondary font-semibold">&ldquo;{sanitizedQuery}&rdquo;</strong> con nuestros asesores comerciales (Geraldine y Sonia).
                  </p>
                </div>
              </div>

              <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={zeroFailWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeModal}
                  aria-label={`Cotizar ${sanitizedQuery} por WhatsApp`}
                  class="w-full sm:w-auto flex-1 bg-whatsapp hover:bg-whatsapp-hover text-white font-semibold text-xs px-4 py-3 rounded-industrial min-h-[48px] flex items-center justify-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-whatsapp"
                >
                  <svg class="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Cotizar &ldquo;{sanitizedQuery}&rdquo; por WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Requisition Bar (Active when >= 1 item in cart) */}
        {cartState.items.length > 0 && (
          <div class="px-4 py-3 bg-secondary text-white border-t border-slate-700/80 flex flex-col gap-2.5 shadow-inner">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-7 h-7 rounded-industrial bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {cartState.totalItems}
                </span>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-white flex items-center gap-2 flex-wrap">
                    <span>Lista de Requisición</span>
                    <span class="text-[10px] text-slate-300 font-normal">
                      ({cartState.items.length} {cartState.items.length === 1 ? 'marca/insumo' : 'marcas/insumos'} · {cartState.totalItems} {cartState.totalItems === 1 ? 'unidad' : 'unidades'})
                    </span>
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => $cartStore.clear()}
                  class="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors cursor-pointer"
                  title="Vaciar toda la lista de requisición"
                >
                  Vaciar
                </button>

                <a
                  href={generateRequisitionWhatsAppUrl(cartState.items)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeModal}
                  class="inline-flex items-center gap-2 px-3.5 py-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-semibold rounded-industrial min-h-[44px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-whatsapp"
                  title="Cotizar lista multimarca por WhatsApp"
                >
                  <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Cotizar lista ({cartState.totalItems} {cartState.totalItems === 1 ? 'und' : 'unds'}) en WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Chips de ítems visibles sin truncar */}
            <div class="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
              {cartState.items.map((item) => (
                <div
                  key={item.id}
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/95 border border-slate-700/80 rounded-industrial text-[11px] text-slate-200 shadow-2xs hover:border-slate-600 transition-colors"
                >
                  <span class="font-medium text-white">{item.name}</span>
                  <span class="px-1 py-0.2 bg-primary/20 text-primary text-[10px] font-bold rounded">
                    {item.quantity} {item.quantity === 1 ? 'und' : 'unds'}
                  </span>
                  <button
                    type="button"
                    onClick={() => $cartStore.removeItem(item.id)}
                    class="text-slate-400 hover:text-red-400 transition-colors cursor-pointer text-xs font-bold leading-none px-0.5"
                    title={`Eliminar ${item.name}`}
                    aria-label={`Eliminar ${item.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span>Despacho 100% a domicilio en obra (Bogotá y Sabana)</span>
          </div>
          <span class="hidden sm:inline text-slate-400">Línea Corporativa: +57 301 419 1344</span>
        </div>
      </div>
    </div>
  );
}
