import type { CartItem, CatalogItem } from '@/stores/cart';

export const GA4_WHATSAPP_EVENT_NAME = 'lead_whatsapp_click' as const;
export const GOOGLE_ADS_EVENT_NAME = 'conversion' as const;

const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/i;
const GOOGLE_ADS_ID_PATTERN = /^AW-[A-Z0-9]{6,20}$/i;
const GOOGLE_ADS_CONVERSION_LABEL_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

export type BrandTier = 'tractor' | 'secondary' | 'general';
export type GoogleAdsConversionSource = 'whatsapp' | 'formal_quote';

export interface GoogleAdsConversionContext extends WhatsAppLeadContext {
  conversionSource?: GoogleAdsConversionSource;
  creditRequested?: boolean;
}

export interface GoogleAdsConversionOptions {
  adsId?: string | null;
  conversionLabel?: string | null;
  gtag?: unknown;
}

export interface GoogleAdsConversionPayload {
  send_to: string;
  origin_page: string;
  brand_origin: string;
  sector_origin: string;
  brand_tier: BrandTier;
  conversion_source: GoogleAdsConversionSource;
  credit_requested?: boolean;
  cta_location?: string;
  transport_type: 'beacon';
}

export interface WhatsAppLeadContext {
  originPage?: string | null;
  brandOrigin?: string | null;
  sectorOrigin?: string | null;
  isTractor?: boolean | null;
  brandTier?: BrandTier | null;
  ctaLocation?: string | null;
}

export interface WhatsAppLeadPayload {
  channel: 'corporate';
  origin_page: string;
  brand_origin: string;
  sector_origin: string;
  brand_tier: BrandTier;
  cta_location?: string;
}

export interface DelegatedClickOptions {
  doc?: Document | null;
  loc?: { pathname?: string } | null;
  gtag?: unknown;
}

function normalizeText(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeOriginPage(value?: string | null): string | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  const stripped = normalized.split(/[?#]/, 1)[0]?.trim() ?? '';
  return stripped.length > 0 ? stripped : null;
}

function normalizeGeneralableValue(value?: string | null): string {
  const normalized = normalizeText(value);
  if (!normalized || normalized.toLowerCase() === 'general') {
    return 'general';
  }
  return normalized;
}

function parseBooleanAttr(value?: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function getSafePathname(loc?: { pathname?: string } | null): string {
  try {
    const candidate =
      loc?.pathname ??
      (typeof window !== 'undefined' ? window.location?.pathname : undefined);
    const normalized = normalizeText(candidate);
    return normalized ?? '/';
  } catch {
    return '/';
  }
}

/**
 * Validates and normalizes a GA4 Measurement ID (e.g. G-ABC12345).
 * Returns null if missing, malformed, or containing unsafe characters.
 */
export function sanitizeGa4MeasurementId(rawId?: string | null): string | null {
  const normalized = normalizeText(rawId);
  if (!normalized) return null;
  if (!GA4_MEASUREMENT_ID_PATTERN.test(normalized)) {
    return null;
  }
  return normalized.toUpperCase();
}

/**
 * Validates and normalizes a Google Ads Conversion ID (e.g. AW-123456789).
 * Returns null if missing, malformed, or containing unsafe characters.
 */
export function sanitizeGoogleAdsId(rawId?: string | null): string | null {
  const normalized = normalizeText(rawId);
  if (!normalized) return null;
  if (!GOOGLE_ADS_ID_PATTERN.test(normalized)) {
    return null;
  }
  return normalized.toUpperCase();
}

/**
 * Validates a Google Ads conversion label while preserving its original casing.
 * Returns null if missing, malformed, or containing unsafe characters.
 */
export function sanitizeGoogleAdsConversionLabel(rawLabel?: string | null): string | null {
  const normalized = normalizeText(rawLabel);
  if (!normalized) return null;
  if (!GOOGLE_ADS_CONVERSION_LABEL_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

/**
 * Builds a validated Google Ads `send_to` target (`AW-XXXXXXXXX/LABEL`).
 * Returns null if either the Ads ID or conversion label is missing or invalid.
 */
export function buildGoogleAdsSendTo(
  rawAdsId?: string | null,
  rawLabel?: string | null
): string | null {
  const adsId = sanitizeGoogleAdsId(rawAdsId);
  const label = sanitizeGoogleAdsConversionLabel(rawLabel);
  if (!adsId || !label) return null;
  return `${adsId}/${label}`;
}

/**
 * Resolves the single primary ID used to load `gtag.js`, prioritizing GA4 over Google Ads.
 */
export function resolvePrimaryGtagScriptId(
  rawGa4Id?: string | null,
  rawAdsId?: string | null
): string | null {
  const ga4Id = sanitizeGa4MeasurementId(rawGa4Id);
  if (ga4Id) return ga4Id;
  return sanitizeGoogleAdsId(rawAdsId);
}

/**
 * Builds a clean, PII-free GA4 event payload for `lead_whatsapp_click`.
 */
export function buildWhatsAppLeadPayload(
  context?: WhatsAppLeadContext | null
): WhatsAppLeadPayload {
  const originPage = sanitizeOriginPage(context?.originPage) ?? getSafePathname();
  const brandOrigin = normalizeGeneralableValue(context?.brandOrigin);
  const sectorOrigin = normalizeGeneralableValue(context?.sectorOrigin);
  const ctaLocation = normalizeText(context?.ctaLocation);

  let brandTier: BrandTier;
  if (
    context?.brandTier === 'tractor' ||
    context?.brandTier === 'secondary' ||
    context?.brandTier === 'general'
  ) {
    brandTier = context.brandTier;
  } else if (brandOrigin === 'general') {
    brandTier = 'general';
  } else if (context?.isTractor === true) {
    brandTier = 'tractor';
  } else {
    brandTier = 'secondary';
  }

  const payload: WhatsAppLeadPayload = {
    channel: 'corporate',
    origin_page: originPage,
    brand_origin: brandOrigin,
    sector_origin: sectorOrigin,
    brand_tier: brandTier,
  };

  if (ctaLocation) {
    payload.cta_location = ctaLocation;
  }

  return payload;
}

/**
 * Derives brand, sector, and tier attribution from a multi-brand requisition list.
 * - 0 catalog brands (empty or custom-only) -> 'general'
 * - 1 catalog brand -> brand name, its sector (or 'general'), and its tier
 * - >1 catalog brands -> 'multi_brand', shared sector or 'multi_sector', 'tractor' if >=1 tractor
 */
export function deriveRequisitionAnalyticsContext(
  items?: ReadonlyArray<CartItem> | null
): WhatsAppLeadContext {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      brandOrigin: 'general',
      sectorOrigin: 'general',
      brandTier: 'general',
    };
  }

  const catalogItems: CatalogItem[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    if ('isCustom' in item && item.isCustom === true) continue;
    const name = normalizeText(item.name);
    if (!name) continue;
    catalogItems.push(item as CatalogItem);
  }

  if (catalogItems.length === 0) {
    return {
      brandOrigin: 'general',
      sectorOrigin: 'general',
      brandTier: 'general',
    };
  }

  const uniqueBrands = new Map<string, CatalogItem>();
  for (const item of catalogItems) {
    const key = normalizeText(item.name)!.toLowerCase();
    const existing = uniqueBrands.get(key);
    if (!existing) {
      uniqueBrands.set(key, item);
    } else {
      uniqueBrands.set(key, {
        ...existing,
        sector: normalizeText(existing.sector) ?? normalizeText(item.sector) ?? undefined,
        isTractor: Boolean(existing.isTractor || item.isTractor),
      });
    }
  }

  if (uniqueBrands.size === 1) {
    const single = Array.from(uniqueBrands.values())[0];
    const isTractor = Boolean(single.isTractor);
    return {
      brandOrigin: normalizeText(single.name) ?? 'general',
      sectorOrigin: normalizeText(single.sector) ?? 'general',
      isTractor,
      brandTier: isTractor ? 'tractor' : 'secondary',
    };
  }

  const distinctSectors = new Map<string, string>();
  let hasTractor = false;
  for (const item of uniqueBrands.values()) {
    const sector = normalizeText(item.sector);
    if (sector) {
      const sectorKey = sector.toLowerCase();
      if (!distinctSectors.has(sectorKey)) {
        distinctSectors.set(sectorKey, sector);
      }
    }
    if (item.isTractor) {
      hasTractor = true;
    }
  }

  const sectorOrigin =
    distinctSectors.size === 0
      ? 'general'
      : distinctSectors.size === 1
        ? Array.from(distinctSectors.values())[0]
        : 'multi_sector';

  return {
    brandOrigin: 'multi_brand',
    sectorOrigin,
    isTractor: hasTractor,
    brandTier: hasTractor ? 'tractor' : 'secondary',
  };
}

/**
 * Reads page-level brand/sector/tractor context from `document.body` data-page-* attributes.
 */
export function readPageAnalyticsContext(
  doc?: Document | null,
  loc?: { pathname?: string } | null
): WhatsAppLeadContext {
  try {
    const targetDoc = doc ?? (typeof document !== 'undefined' ? document : null);
    const body = targetDoc?.body;
    const brandOrigin = normalizeText(
      body?.dataset?.pageBrand ?? body?.getAttribute?.('data-page-brand')
    );
    const sectorOrigin = normalizeText(
      body?.dataset?.pageSector ?? body?.getAttribute?.('data-page-sector')
    );
    const tractorRaw =
      body?.dataset?.pageTractor ?? body?.getAttribute?.('data-page-tractor');
    const isTractor = parseBooleanAttr(tractorRaw);

    const context: WhatsAppLeadContext = {
      originPage: getSafePathname(loc),
    };

    if (brandOrigin) context.brandOrigin = brandOrigin;
    if (sectorOrigin) context.sectorOrigin = sectorOrigin;
    if (isTractor !== undefined) context.isTractor = isTractor;

    return context;
  } catch {
    return { originPage: getSafePathname(loc) };
  }
}

/**
 * Extracts WhatsApp lead attribution from a clicked element's `data-wa-*` attributes,
 * falling back to page-level `data-page-*` attributes when local values are absent.
 */
export function extractWhatsAppClickContextFromElement(
  element?: Element | null,
  doc?: Document | null,
  loc?: { pathname?: string } | null
): WhatsAppLeadContext {
  const pageContext = readPageAnalyticsContext(doc, loc);

  try {
    if (!element || typeof element.getAttribute !== 'function') {
      return pageContext;
    }

    const localBrand = normalizeText(element.getAttribute('data-wa-brand'));
    const localSector = normalizeText(element.getAttribute('data-wa-sector'));
    const localTractor = parseBooleanAttr(element.getAttribute('data-wa-tractor'));
    const localLocation = normalizeText(element.getAttribute('data-wa-location'));

    const brandOrigin = localBrand ?? pageContext.brandOrigin;
    const sectorOrigin = localSector ?? pageContext.sectorOrigin;
    const isTractor =
      localTractor !== undefined
        ? localTractor
        : localBrand
          ? undefined
          : pageContext.isTractor;

    const merged: WhatsAppLeadContext = {
      originPage: pageContext.originPage,
    };

    if (brandOrigin) merged.brandOrigin = brandOrigin;
    if (sectorOrigin) merged.sectorOrigin = sectorOrigin;
    if (isTractor !== undefined) merged.isTractor = isTractor;
    if (localLocation) merged.ctaLocation = localLocation;

    return merged;
  } catch {
    return pageContext;
  }
}

function getDefaultGoogleAdsConfig(): { adsId?: string; conversionLabel?: string } {
  try {
    return {
      adsId: import.meta.env.PUBLIC_GOOGLE_ADS_ID,
      conversionLabel: import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
    };
  } catch {
    return {};
  }
}

/**
 * Emits a non-blocking, PII-free Google Ads `conversion` event via `window.gtag`.
 * Silently degrades (returns false) when credentials are missing/invalid,
 * under adblockers, SSR, or runtime errors.
 */
export function trackGoogleAdsConversion(
  context?: GoogleAdsConversionContext | null,
  options?: GoogleAdsConversionOptions
): boolean {
  try {
    const defaults = getDefaultGoogleAdsConfig();
    const rawAdsId = options?.adsId !== undefined ? options.adsId : defaults.adsId;
    const rawLabel =
      options?.conversionLabel !== undefined
        ? options.conversionLabel
        : defaults.conversionLabel;

    const sendTo = buildGoogleAdsSendTo(rawAdsId, rawLabel);
    if (!sendTo) {
      return false;
    }

    const gtagFn =
      options?.gtag !== undefined
        ? options.gtag
        : typeof window !== 'undefined'
          ? window.gtag
          : undefined;

    if (typeof gtagFn !== 'function') {
      return false;
    }

    const base = buildWhatsAppLeadPayload(context);
    const payload: GoogleAdsConversionPayload = {
      send_to: sendTo,
      origin_page: base.origin_page,
      brand_origin: base.brand_origin,
      sector_origin: base.sector_origin,
      brand_tier: base.brand_tier,
      conversion_source: context?.conversionSource ?? 'whatsapp',
      transport_type: 'beacon',
    };

    if (typeof context?.creditRequested === 'boolean') {
      payload.credit_requested = context.creditRequested;
    }
    if (base.cta_location) {
      payload.cta_location = base.cta_location;
    }

    (gtagFn as (cmd: string, eventName: string, params: GoogleAdsConversionPayload) => void)(
      'event',
      GOOGLE_ADS_EVENT_NAME,
      payload
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Emits a Google Ads `conversion` event for a successful formal quote / 45-day credit submission.
 */
export function trackFormalQuoteConversion(
  context?: GoogleAdsConversionContext | null,
  options?: GoogleAdsConversionOptions
): boolean {
  return trackGoogleAdsConversion(
    {
      ...context,
      conversionSource: 'formal_quote',
    },
    options
  );
}

/**
 * Emits `lead_whatsapp_click` to GA4 via `window.gtag` and conditionally fires
 * the Google Ads `conversion` event when `PUBLIC_GOOGLE_ADS_ID` + label are configured.
 * Silently degrades (returns false) under adblockers, SSR, or runtime errors
 * without ever blocking WhatsApp navigation.
 */
export function trackWhatsAppLead(
  context?: WhatsAppLeadContext | null,
  gtagOverride?: unknown,
  adsOptions?: Omit<GoogleAdsConversionOptions, 'gtag'>
): boolean {
  try {
    const gtagFn =
      gtagOverride !== undefined
        ? gtagOverride
        : typeof window !== 'undefined'
          ? window.gtag
          : undefined;

    if (typeof gtagFn !== 'function') {
      return false;
    }

    const payload = buildWhatsAppLeadPayload(context);
    (gtagFn as (cmd: string, eventName: string, params: WhatsAppLeadPayload) => void)(
      'event',
      GA4_WHATSAPP_EVENT_NAME,
      payload
    );

    trackGoogleAdsConversion(
      {
        ...context,
        conversionSource: 'whatsapp',
      },
      {
        ...adsOptions,
        gtag: gtagFn,
      }
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Handles delegated document click events for static WhatsApp CTAs.
 * Skips island-managed links (`data-wa-managed="island"`) and modal triggers
 * (`data-open-contact-modal`) to guarantee zero duplicate events.
 */
export function handleDelegatedWhatsAppClick(
  target: EventTarget | null,
  options?: DelegatedClickOptions
): boolean {
  try {
    if (!target) {
      return false;
    }

    const element =
      typeof (target as Element).closest === 'function'
        ? (target as Element)
        : ((target as Node | null)?.parentElement ?? null);

    if (!element || typeof element.closest !== 'function') {
      return false;
    }

    const matched = element.closest(
      'a[href*="wa.me/"], [data-direct-whatsapp], a[href="#cotizar"], a[href="/#cotizar"]'
    );
    if (!matched) {
      return false;
    }

    if (
      matched.closest('[data-wa-managed="island"]') ||
      matched.closest('[data-open-contact-modal]')
    ) {
      return false;
    }

    const context = extractWhatsAppClickContextFromElement(
      matched,
      options?.doc,
      options?.loc
    );
    return trackWhatsAppLead(context, options?.gtag);
  } catch {
    return false;
  }
}
