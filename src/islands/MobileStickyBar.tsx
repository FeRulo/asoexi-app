import { CONTACT_PHONES } from '@/lib/constants';
import { generateWhatsAppUrl } from '@/lib/whatsapp';

export default function MobileStickyBar() {
  const corporatePhone = CONTACT_PHONES[0];
  const whatsAppUrl = generateWhatsAppUrl(corporatePhone.e164);

  return (
    <div
      role="region"
      aria-label="Acceso rápido de contacto móvil"
      class="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg"
    >
      <div class="flex items-center gap-2">
        {/* Botón Llamar Línea Corporativa */}
        <a
          href={`tel:${corporatePhone.e164}`}
          aria-label={`Llamar Línea Corporativa: ${corporatePhone.display}`}
          class="flex-1 bg-secondary hover:bg-slate-800 text-white font-display font-bold text-[11px] sm:text-xs uppercase tracking-normal px-2 py-2 rounded-industrial min-h-[48px] flex items-center justify-center gap-1.5 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 text-center"
        >
          <svg class="w-4 h-4 text-amber-industrial shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span class="truncate">Llamar Corporativo</span>
        </a>

        {/* Botón Cotizar WhatsApp con Avatar Integrado */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cotizar por WhatsApp a la Línea Corporativa"
          class="flex-1 bg-whatsapp hover:bg-whatsapp-hover text-white font-display font-bold text-[11px] sm:text-xs uppercase tracking-normal px-2 py-2 rounded-industrial min-h-[48px] flex items-center justify-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-whatsapp focus:ring-offset-1 text-center"
        >
          {/* Mini Avatar Integrado de la Mascota */}
          <div class="relative w-8 h-8 rounded-full overflow-hidden border border-white/90 shadow-xs bg-white shrink-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              aria-hidden="true"
              class="w-full h-full object-cover pointer-events-none"
              src="/animated/greeting-float.mp4"
            />
          </div>
          <span class="truncate">Cotizar WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
