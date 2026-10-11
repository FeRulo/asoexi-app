import { CONTACT_PHONES, type ContactPhone } from './constants';

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola ASOEXI (Geraldine y Sonia), vi su página web y deseo solicitar una cotización formal';

export const SESSION_ROTATION_STORAGE_KEY = 'asoexi_lead_rotation_index';

/**
 * Filter of contact channels enabled for official WhatsApp inquiries.
 * Centralized on the official Línea Corporativa (+57 304 401 3761).
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
 * Retrieves the session rotation index (0 for centralized corporate line).
 * Preserved for backward compatibility.
 */
export function getSessionRotationIndex(storage?: Storage): number {
  const safeStorage = getSafeStorage(storage);
  if (safeStorage) {
    try {
      const stored = safeStorage.getItem(SESSION_ROTATION_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // Storage access blocked or threw
    }
  }
  return 0;
}

/**
 * Overrides or sets the session rotation index explicitly (preserved for compatibility/testing).
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
 * Returns WhatsApp commercial channels.
 * 100% of inquiries are centralized on the official Línea Corporativa.
 */
export function getBalancedWhatsAppAdvisors(storage?: Storage): ContactPhone[] {
  void storage;
  return WHATSAPP_ADVISORS.length > 0 ? [...WHATSAPP_ADVISORS] : [...CONTACT_PHONES];
}

/**
 * Returns the primary WhatsApp channel (Línea Corporativa oficial).
 */
export function getPrimaryWhatsAppAdvisor(storage?: Storage): ContactPhone {
  void storage;
  return WHATSAPP_ADVISORS[0] ?? CONTACT_PHONES[0];
}

/**
 * Generates direct wa.me link directly to the corporate line (+57 304 401 3761).
 */
export function getDirectWhatsAppUrl(
  storage?: Storage,
  message: string = DEFAULT_WHATSAPP_MESSAGE
): string {
  const advisor = getPrimaryWhatsAppAdvisor(storage);
  return generateWhatsAppUrl(advisor.e164, message);
}

/**
 * Returns all active contact channels.
 * Points to the unified corporate line for both calls and WhatsApp.
 */
export function getBalancedAdvisors(storage?: Storage): ContactPhone[] {
  void storage;
  return [...CONTACT_PHONES];
}

/**
 * Returns the primary corporate contact channel.
 */
export function getPrimaryAdvisor(storage?: Storage): ContactPhone {
  return getPrimaryWhatsAppAdvisor(storage);
}

