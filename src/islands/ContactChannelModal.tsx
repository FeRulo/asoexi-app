import { useState, useEffect, useRef } from 'preact/hooks';
import { type ContactPhone } from '@/lib/constants';
import { getBalancedAdvisors, generateWhatsAppUrl } from '@/lib/whatsapp';

export default function ContactChannelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [advisors, setAdvisors] = useState<ContactPhone[]>([]);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    // Initial load of balanced channels
    setAdvisors(getBalancedAdvisors());

    const handleOpen = () => {
      setIsOpen((prev) => {
        if (!prev) {
          previousActiveElement.current = document.activeElement as HTMLElement | null;
        }
        return true;
      });
      setAdvisors(getBalancedAdvisors());
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    window.addEventListener('open-contact-modal', handleOpen);
    window.addEventListener('close-contact-modal', handleClose);

    return () => {
      window.removeEventListener('open-contact-modal', handleOpen);
      window.removeEventListener('close-contact-modal', handleClose);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus close button on open with cleanup
      const focusTimer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
          return;
        }

        // Circular focus trap within modal container
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
        clearTimeout(focusTimer);
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleBackdropClick = (e: MouseEvent) => {
    // Only close if both mousedown and click originated on the backdrop container itself
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      aria-describedby="contact-modal-desc"
      onMouseDown={handleMouseDown}
      onClick={handleBackdropClick}
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        ref={modalContentRef}
        class="w-full bg-white rounded-t-lg sm:rounded-industrial p-5 sm:p-6 shadow-2xl animate-slide-up sm:animate-fade-in max-h-[92vh] sm:max-h-[90vh] overflow-y-auto sm:w-full sm:max-w-md border border-slate-200"
      >
        {/* Modal Header */}
        <div class="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-industrial mb-1">
              <span class="w-1.5 h-1.5 bg-primary"></span>
              Atención Inmediata
            </div>
            <h2 id="contact-modal-title" class="font-display font-bold text-lg text-secondary">
              Seleccionar Canal de Cotización
            </h2>
            <p id="contact-modal-desc" class="text-xs text-slate-500 mt-0.5">
              Comunícate directamente con nuestras ejecutivas comerciales para cotizaciones y asesoría técnica.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeModal}
            aria-label="Cerrar selector de canales de contacto"
            class="flex items-center justify-center w-12 h-12 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-industrial transition-colors shrink-0 -mr-2 -mt-2 min-h-[48px] min-w-[48px]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Advisors Channels List */}
        <div class="mt-4 space-y-3">
          {advisors.map((advisor, index) => {
            const isPrimary = index === 0;
            const waUrl = generateWhatsAppUrl(advisor.e164);

            return (
              <div
                key={advisor.id}
                class={`p-3.5 rounded-industrial border transition-all ${
                  isPrimary
                    ? 'border-primary/40 bg-gradient-to-r from-red-50/50 via-white to-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div class="flex items-center justify-between mb-2.5">
                  <div class="flex items-center gap-2">
                    <div
                      class={`w-8 h-8 rounded-industrial flex items-center justify-center font-bold text-xs ${
                        isPrimary
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-secondary text-white'
                      }`}
                    >
                      {advisor.name.charAt(0)}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-display font-bold text-xs sm:text-sm text-secondary">
                          {advisor.name}
                        </span>
                        {isPrimary && (
                          <span class="px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold uppercase tracking-wider rounded-industrial">
                            Prioritario
                          </span>
                        )}
                      </div>
                      <span class="text-[11px] text-slate-500 block font-medium">
                        {advisor.role} · <span class="font-mono text-slate-700">{advisor.display}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Buttons (Height ≥ 48px for WCAG 2.2 AA) */}
                <div class={`grid gap-2 mt-2 ${advisor.hasWhatsApp ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {advisor.hasWhatsApp && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Cotizar por WhatsApp con ${advisor.name}`}
                      class="bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs px-3.5 py-2.5 rounded-industrial min-h-[48px] flex items-center justify-center gap-1.5 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-1 text-center"
                    >
                      <svg class="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <a
                    href={`tel:${advisor.e164}`}
                    aria-label={`Llamar a ${advisor.name}: ${advisor.display}`}
                    class="bg-secondary hover:bg-slate-800 text-white font-semibold text-xs px-3 py-2.5 rounded-industrial min-h-[48px] flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 text-center"
                  >
                    <svg class="w-4 h-4 shrink-0 text-amber-industrial" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Llamar</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logistics microcopy & notice */}
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>📦 Despacho directo a tu obra o bodega en Bogotá y Colombia (sin mostrador presencial).</span>
        </div>
      </div>
    </div>
  );
}
