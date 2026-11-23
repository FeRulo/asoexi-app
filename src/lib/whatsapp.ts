import { CONTACT_PHONES, type ContactPhone } from './constants';

const SECTOR_NAME_BY_SLUG: Record<string, string> = {
  'electrico': 'Sector Eléctrico Industrial',
  'ferretero-construccion': 'Sector Ferretero & Construcción',
  'hidraulico-pinturas': 'Sector Hidráulico & Pinturas',
};

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola ASOEXI (Geraldine y Sonia), vi su página web y deseo solicitar una cotización formal';

export const SESSION_ROTATION_STORAGE_KEY = 'asoexi_lead_rotation_index';

/**
 * Configurable safeguard thresholds for WhatsApp deep links (EDGE-3 / Story 4.3).
 * Mobile browsers can truncate wa.me URLs when lists exceed 8 items or 1,200 characters.
 */
export const WHATSAPP_MAX_SAFE_ITEMS = 8;
export const WHATSAPP_MAX_SAFE_CHARS = 1200;

export interface RequisitionWhatsAppItem {
  id?: string;
  name: string;
  quantity?: number;
  sector?: string;
  isCustom?: boolean;
  notes?: string;
}

export interface RequisitionCustomerData {
  companyName?: string;
  nit?: string;
  phone?: string;
  deliveryAddress?: string;
  additionalNotes?: string;
}

export interface RequisitionWhatsAppPayload {
  requiresSafeguard: boolean;
  whatsappUrl: string;
  fullMessage: string;
  safeIntroMessage: string;
  confirmationNotice: string;
  itemCount: number;
  totalUnits: number;
  characterCount: number;
}

/**
 * Filter of contact channels enabled for official WhatsApp inquiries.
 * Centralized on the official Línea Corporativa configured in CONTACT_PHONES.
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
 * Generates direct wa.me link directly to the official corporate line.
 */
export function getDirectWhatsAppUrl(
  storage?: Storage,
  message: string = DEFAULT_WHATSAPP_MESSAGE
): string {
  const advisor = getPrimaryWhatsAppAdvisor(storage);
  return generateWhatsAppUrl(advisor.e164, message);
}

/**
 * Generates an official WhatsApp wa.me URL contextualized for quoting a specific brand.
 * Points to the centralized corporate line (+57 301 419 1344).
 * If brandName is empty, null, or whitespace, falls back safely to DEFAULT_WHATSAPP_MESSAGE.
 */
export function generateBrandQuoteWhatsAppUrl(
  brandName?: string | null,
  storage?: Storage
): string {
  const trimmed = brandName?.trim();
  if (!trimmed) {
    return getDirectWhatsAppUrl(storage, DEFAULT_WHATSAPP_MESSAGE);
  }
  const message = `Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar una cotización formal para la marca ${trimmed}`;
  return getDirectWhatsAppUrl(storage, message);
}

/**
 * Generates an official WhatsApp wa.me URL for requesting technical datasheet or factory catalog for a brand.
 * Points to the centralized corporate line (+57 301 419 1344).
 * If brandName is empty, null, or whitespace, falls back safely to DEFAULT_WHATSAPP_MESSAGE.
 */
export function generateBrandCatalogRequestWhatsAppUrl(
  brandName?: string | null,
  storage?: Storage
): string {
  const trimmed = brandName?.trim();
  if (!trimmed) {
    return getDirectWhatsAppUrl(storage, DEFAULT_WHATSAPP_MESSAGE);
  }
  const message = `Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar la ficha técnica o catálogo oficial de fábrica para la marca ${trimmed}`;
  return getDirectWhatsAppUrl(storage, message);
}

/**
 * Generates an official WhatsApp wa.me URL contextualized for quoting a multi-brand list of a specific industrial sector.
 * Points to the centralized corporate line (+57 301 419 1344).
 * If sectorName is empty, null, or whitespace, falls back safely to DEFAULT_WHATSAPP_MESSAGE.
 */
export function generateSectorQuoteWhatsAppUrl(
  sectorName?: string | null,
  storage?: Storage
): string {
  const trimmed = sectorName?.trim();
  if (!trimmed) {
    return getDirectWhatsAppUrl(storage, DEFAULT_WHATSAPP_MESSAGE);
  }
  const normalizedKey = trimmed.toLowerCase();
  const resolvedName = SECTOR_NAME_BY_SLUG[normalizedKey] ?? trimmed;

  const sectorLabel = resolvedName.toLowerCase().startsWith('sector')
    ? resolvedName
    : `Sector ${resolvedName}`;
  const message = `Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar una cotización formal para lista multimarca del ${sectorLabel}`;
  return getDirectWhatsAppUrl(storage, message);
}

/**
 * Generates an official WhatsApp wa.me URL for the Zero-Fail search mechanism.
 * Points to the centralized corporate line (+57 301 419 1344).
 * If query is empty, null, or whitespace, falls back safely to DEFAULT_WHATSAPP_MESSAGE.
 */
export function generateSearchZeroFailWhatsAppUrl(
  query?: string | null,
  storage?: Storage
): string {
  const trimmed = query?.trim();
  if (!trimmed) {
    return getDirectWhatsAppUrl(storage, DEFAULT_WHATSAPP_MESSAGE);
  }
  const message = `Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y busco cotizar la referencia "${trimmed}" que no encontré listada. ¿Me pueden cotizar bajo pedido de fábrica?`;
  return getDirectWhatsAppUrl(storage, message);
}

const MAX_SAFE_INTRO_FIELD_CHARS = 120;

function clampSafeIntroField(value: string | undefined, placeholder: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return placeholder;
  if (trimmed.length <= MAX_SAFE_INTRO_FIELD_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_SAFE_INTRO_FIELD_CHARS - 1)}…`;
}

function normalizePositiveQuantity(quantity?: number): number {
  return typeof quantity === 'number' && Number.isFinite(quantity) && quantity >= 1
    ? Math.floor(quantity)
    : 1;
}

/**
 * Formats the complete B2B requisition message structured around the 6 key corporate data points:
 * 1. Razón Social
 * 2. NIT
 * 3. Teléfono
 * 4. Dirección de entrega
 * 5. Referencias con cantidades
 * 6. Notas de insumos libres
 */
export function formatRequisitionFullMessage(
  items?: ReadonlyArray<RequisitionWhatsAppItem> | null,
  customer?: RequisitionCustomerData
): string {
  if (!items || items.length === 0) {
    return DEFAULT_WHATSAPP_MESSAGE;
  }

  const companyName = customer?.companyName?.trim() || '(Pendiente completar en el chat)';
  const nit = customer?.nit?.trim() || '(Pendiente completar en el chat)';
  const phone = customer?.phone?.trim() || '(Pendiente completar en el chat)';
  const deliveryAddress =
    customer?.deliveryAddress?.trim() || '(Ciudad / dirección de entrega en obra)';

  const referencesLines = items.map((item, index) => {
    const qtyNum = normalizePositiveQuantity(item.quantity);
    const qtyLabel = `(${qtyNum} ${qtyNum === 1 ? 'und' : 'unds'})`;
    const isCustom = item.isCustom === true;
    const customSuffix = isCustom ? ' [Insumo Libre]' : '';
    const rawSector = item.sector?.trim() || '';
    const resolvedSector = rawSector
      ? SECTOR_NAME_BY_SLUG[rawSector.toLowerCase()] ?? rawSector
      : '';
    const sectorSuffix = !isCustom && resolvedSector ? ` — ${resolvedSector}` : '';

    return `   ${index + 1}. ${item.name.trim()} ${qtyLabel}${customSuffix}${sectorSuffix}`;
  });

  const collectedNotes: string[] = [];
  items.forEach((item) => {
    const note = item.notes?.trim();
    if (note) {
      collectedNotes.push(`   - ${item.name.trim()}: ${note}`);
    }
  });

  if (customer?.additionalNotes?.trim()) {
    collectedNotes.push(`   - Especificación adicional: ${customer.additionalNotes.trim()}`);
  }

  const notesBlock =
    collectedNotes.length > 0
      ? collectedNotes.join('\n')
      : '   - Sin notas de insumos libres adicionales';

  return [
    'Hola ASOEXI (Geraldine y Sonia), vi su catálogo web y deseo solicitar una cotización formal B2B:',
    '',
    `1. Razón Social: ${companyName}`,
    `2. NIT: ${nit}`,
    `3. Teléfono: ${phone}`,
    `4. Dirección de entrega: ${deliveryAddress}`,
    '5. Referencias con cantidades:',
    referencesLines.join('\n'),
    '6. Notas de insumos libres:',
    notesBlock,
    '',
    'Quedo atento a su respuesta formal (SLA ≤ 5 min).',
  ].join('\n');
}

/**
 * Formats a short, URL-safe introductory WhatsApp message when EDGE-3 length safeguard triggers
 * (> 8 items or > 1,200 characters). Preserves the corporate greeting, item/unit summary,
 * and company data placeholders while instructing the buyer to paste the copied full list below.
 */
export function formatRequisitionSafeIntroMessage(
  items?: ReadonlyArray<RequisitionWhatsAppItem> | null,
  customer?: RequisitionCustomerData
): string {
  if (!items || items.length === 0) {
    return DEFAULT_WHATSAPP_MESSAGE;
  }

  const itemCount = items.length;
  const totalUnits = items.reduce((acc, item) => acc + normalizePositiveQuantity(item.quantity), 0);

  const companyName = clampSafeIntroField(customer?.companyName, '(Pendiente completar)');
  const nit = clampSafeIntroField(customer?.nit, '(Pendiente completar)');
  const phone = clampSafeIntroField(customer?.phone, '(Pendiente completar)');
  const deliveryAddress = clampSafeIntroField(
    customer?.deliveryAddress,
    '(Ciudad / dirección en obra)'
  );

  return [
    `Hola ASOEXI (Geraldine y Sonia), deseo solicitar una cotización formal B2B para una lista extensa de ${itemCount} materiales (${totalUnits} ${totalUnits === 1 ? 'unidad' : 'unidades'}).`,
    '',
    `1. Razón Social: ${companyName}`,
    `2. NIT: ${nit}`,
    `3. Teléfono: ${phone}`,
    `4. Dirección de entrega: ${deliveryAddress}`,
    '5. Referencias con cantidades y 6. Notas de insumos libres: (Pego el listado completo copiado a continuación)',
    '',
    'Quedo atento a su respuesta formal (SLA ≤ 5 min).',
  ].join('\n');
}

/**
 * Evaluates EDGE-3 thresholds (> 8 items or > 1,200 characters) and builds the full WhatsApp
 * requisition payload including the safe deep link URL, clipboard text, and confirmation notice.
 */
export function buildRequisitionWhatsAppPayload(
  items?: ReadonlyArray<RequisitionWhatsAppItem> | null,
  customer?: RequisitionCustomerData,
  storage?: Storage
): RequisitionWhatsAppPayload {
  if (!items || items.length === 0) {
    const defaultUrl = getDirectWhatsAppUrl(storage, DEFAULT_WHATSAPP_MESSAGE);
    return {
      requiresSafeguard: false,
      whatsappUrl: defaultUrl,
      fullMessage: DEFAULT_WHATSAPP_MESSAGE,
      safeIntroMessage: DEFAULT_WHATSAPP_MESSAGE,
      confirmationNotice: '',
      itemCount: 0,
      totalUnits: 0,
      characterCount: DEFAULT_WHATSAPP_MESSAGE.length,
    };
  }

  const itemCount = items.length;
  const totalUnits = items.reduce((acc, item) => acc + normalizePositiveQuantity(item.quantity), 0);

  const fullMessage = formatRequisitionFullMessage(items, customer);
  const safeIntroMessage = formatRequisitionSafeIntroMessage(items, customer);
  const characterCount = fullMessage.length;

  const requiresSafeguard =
    itemCount > WHATSAPP_MAX_SAFE_ITEMS || characterCount > WHATSAPP_MAX_SAFE_CHARS;

  const targetMessage = requiresSafeguard ? safeIntroMessage : fullMessage;
  const whatsappUrl = getDirectWhatsAppUrl(storage, targetMessage);
  const confirmationNotice = `¡Lista de ${itemCount} materiales copiada al portapapeles! Pégala en el chat de WhatsApp`;

  return {
    requiresSafeguard,
    whatsappUrl,
    fullMessage,
    safeIntroMessage,
    confirmationNotice,
    itemCount,
    totalUnits,
    characterCount,
  };
}

/**
 * Synchronously copies text to the device clipboard inside a user click gesture
 * using a temporary off-screen `<textarea>` and `document.execCommand('copy')`.
 * Restores the previous `document.activeElement` and guarantees DOM cleanup in a `finally` block.
 */
export function copyTextToClipboardSync(text: string): boolean {
  if (!text) return false;

  if (
    typeof document === 'undefined' ||
    !document.body ||
    typeof document.createElement !== 'function'
  ) {
    return false;
  }

  const prevFocus = (document.activeElement as HTMLElement | null) ?? null;
  let textarea: HTMLTextAreaElement | null = null;
  let appended = false;

  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    appended = true;

    textarea.focus();
    textarea.select();
    if (typeof textarea.setSelectionRange === 'function') {
      textarea.setSelectionRange(0, text.length);
    }

    const legacyDoc = document as unknown as {
      execCommand?: (commandId: string) => boolean;
    };
    if (typeof legacyDoc.execCommand === 'function') {
      return Boolean(legacyDoc.execCommand('copy'));
    }
    return false;
  } catch {
    return false;
  } finally {
    if (appended && textarea && document.body) {
      try {
        document.body.removeChild(textarea);
      } catch {
        // Ignore removal error
      }
    }
    try {
      prevFocus?.focus?.();
    } catch {
      // Ignore focus restoration error
    }
  }
}

/**
 * Copies text to the device clipboard inside a user click gesture.
 * Prioritizes synchronous `copyTextToClipboardSync` so mobile browsers preserve the user gesture
 * for opening WhatsApp, and falls back to `navigator.clipboard.writeText` only if sync copy fails.
 * Never throws unhandled exceptions.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (copyTextToClipboardSync(text)) {
    return true;
  }

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Generates an official WhatsApp wa.me URL for quoting a multibrand requisition list.
 * Points to the centralized corporate line (+57 301 419 1344).
 * Uses the 6-key-data template for standard lists, the safe introductory message when
 * EDGE-3 safeguard thresholds (> 8 items or > 1,200 chars) are exceeded, or
 * DEFAULT_WHATSAPP_MESSAGE if the list is empty.
 */
export function generateRequisitionWhatsAppUrl(
  items?: ReadonlyArray<RequisitionWhatsAppItem> | null,
  storage?: Storage,
  customer?: RequisitionCustomerData
): string {
  return buildRequisitionWhatsAppPayload(items, customer, storage).whatsappUrl;
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

