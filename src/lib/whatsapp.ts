import { CONTACT_PHONES, type ContactPhone } from './constants';

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola ASOEXI, vi su página web y deseo solicitar una cotización formal';

export const SESSION_ROTATION_STORAGE_KEY = 'asoexi_lead_rotation_index';

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
 * Retrieves the current session rotation index (0, 1, or 2).
 * If no valid index is present in storage, selects one equitably (1/3 probability)
 * and attempts to persist it in sessionStorage.
 */
export function getSessionRotationIndex(storage?: Storage): number {
  const safeStorage = getSafeStorage(storage);

  if (safeStorage) {
    try {
      const stored = safeStorage.getItem(SESSION_ROTATION_STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
          return parsed;
        }
      }
    } catch {
      // Storage access blocked or threw (e.g. strict private mode)
    }
  }

  // Generate equitable random index between 0 and 2 (1/3 each)
  const newIndex = Math.floor(Math.random() * 3);

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
 * Returns the 3 official commercial channels rotated cyclically according to the
 * session balance index:
 * - Index 0: [Geraldine, Sonia, Línea Corporativa]
 * - Index 1: [Sonia, Línea Corporativa, Geraldine]
 * - Index 2: [Línea Corporativa, Geraldine, Sonia]
 */
export function getBalancedAdvisors(storage?: Storage): ContactPhone[] {
  const index = getSessionRotationIndex(storage);
  const total = CONTACT_PHONES.length;

  if (total === 0) {
    return [];
  }

  const normalizedIndex = ((index % total) + total) % total;

  return Array.from({ length: total }, (_, i) => CONTACT_PHONES[(normalizedIndex + i) % total]);
}

/**
 * Returns the primary (highest priority) advisor assigned to the current session.
 */
export function getPrimaryAdvisor(storage?: Storage): ContactPhone {
  const balanced = getBalancedAdvisors(storage);
  return balanced[0] ?? CONTACT_PHONES[0];
}
