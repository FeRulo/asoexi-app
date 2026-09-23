import { CONTACT_PHONES, type ContactPhone } from './constants';

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola ASOEXI, vi su página web y deseo solicitar una cotización formal';

export const SESSION_ROTATION_STORAGE_KEY = 'asoexi_lead_rotation_index';

/**
 * Filter of advisors enabled specifically for WhatsApp commercial inquiries.
 * Note: Línea Corporativa is voice-call only and excluded from WhatsApp deep links.
 */
export const WHATSAPP_ADVISORS: ContactPhone[] = CONTACT_PHONES.filter((p) => p.hasWhatsApp);

/**
 * Sanitizes any raw phone representation to E.164-compatible pure digits
 * suitable for WhatsApp wa.me links. If a 10-digit Colombian mobile number
 * is supplied without country prefix, 57 is automatically prepended.
 */
export function cleanPhoneForWhatsApp(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10 && digitsOnly.startsWith('3')) {
    return `57${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Generates an official WhatsApp wa.me URL with preloaded message.
 */
export function generateWhatsAppUrl(
  phone: string,
  message: string = DEFAULT_WHATSAPP_MESSAGE
): string {
  const clean = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function getSafeStorage(storage?: Storage): Storage | null {
  if (storage !== undefined) {
    return storage;
  }
  if (typeof window !== 'undefined') {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Retrieves the current session rotation index for WhatsApp advisors (0 or 1).
 * If no valid index is present in storage, selects one equitably (50/50 probability)
 * and attempts to persist it in sessionStorage.
 */
export function getSessionRotationIndex(storage?: Storage): number {
  const total = WHATSAPP_ADVISORS.length || 1;
  const safeStorage = getSafeStorage(storage);

  if (safeStorage) {
    try {
      const stored = safeStorage.getItem(SESSION_ROTATION_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < total) {
          return parsed;
        }
      }
    } catch {
      // Storage access blocked or threw (e.g. strict private mode)
    }
  }

  // Generate equitable random index between 0 and total - 1 (50/50 for Geraldine / Sonia)
  const newIndex = Math.floor(Math.random() * total);

  if (safeStorage) {
    try {
      safeStorage.setItem(SESSION_ROTATION_STORAGE_KEY, String(newIndex));
    } catch {
      // Storage write failed or quota exceeded
    }
  }

  return newIndex;
}

/**
 * Overrides or sets the session rotation index explicitly (useful for testing or specific routing).
 */
export function setSessionRotationIndex(index: number, storage?: Storage): void {
  const safeStorage = getSafeStorage(storage);
  if (safeStorage) {
    try {
      safeStorage.setItem(SESSION_ROTATION_STORAGE_KEY, String(index));
    } catch {
      // Storage write failed
    }
  }
}

/**
 * Returns WhatsApp commercial advisors rotated cyclically according to the 50/50 session index:
 * - Index 0: [Geraldine, Sonia]
 * - Index 1: [Sonia, Geraldine]
 */
export function getBalancedWhatsAppAdvisors(storage?: Storage): ContactPhone[] {
  const total = WHATSAPP_ADVISORS.length;
  if (total === 0) return [];

  const index = getSessionRotationIndex(storage);
  const normalizedIndex = ((index % total) + total) % total;

  return Array.from({ length: total }, (_, i) => WHATSAPP_ADVISORS[(normalizedIndex + i) % total]);
}

/**
 * Returns the primary (highest priority) WhatsApp advisor assigned to the current session (Geraldine or Sonia).
 */
export function getPrimaryWhatsAppAdvisor(storage?: Storage): ContactPhone {
  const balanced = getBalancedWhatsAppAdvisors(storage);
  return balanced[0] ?? WHATSAPP_ADVISORS[0] ?? CONTACT_PHONES[0];
}

/**
 * Generates direct wa.me link directly to the session-assigned WhatsApp advisor without any intermediate modal.
 */
export function getDirectWhatsAppUrl(
  storage?: Storage,
  message: string = DEFAULT_WHATSAPP_MESSAGE
): string {
  const advisor = getPrimaryWhatsAppAdvisor(storage);
  return generateWhatsAppUrl(advisor.e164, message);
}

/**
 * Returns all contact channels for the "Contacto Directo" section with WhatsApp advisors balanced
 * at the top and Línea Corporativa (call-only) positioned cleanly at the end.
 */
export function getBalancedAdvisors(storage?: Storage): ContactPhone[] {
  const whatsappBalanced = getBalancedWhatsAppAdvisors(storage);
  const callOnly = CONTACT_PHONES.filter((p) => !p.hasWhatsApp);
  return [...whatsappBalanced, ...callOnly];
}

/**
 * Returns the primary advisor for the current session.
 */
export function getPrimaryAdvisor(storage?: Storage): ContactPhone {
  return getPrimaryWhatsAppAdvisor(storage);
}
