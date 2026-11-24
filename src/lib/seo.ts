import {
  BUSINESS_COMMERCE_SCHEMA,
  COMPANY_INFO,
  COMPANY_LOCATION,
  CONTACT_PHONES,
  SITE_METADATA,
} from '@/lib/constants';

export interface PageMetadataInput {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  currentPath?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  noindex?: boolean;
  ogTitle?: string;
  twitterTitle?: string;
}

export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogUrl: string;
  ogType: string;
  siteName: string;
  locale: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  noindex?: boolean;
}

export interface MetaTag {
  property?: string;
  name?: string;
  content: string;
}

const GSC_VERIFICATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{10,128}$/;

/**
 * Valida y sanitiza el token de verificación de Google Search Console.
 * Retorna null si está ausente, vacío o contiene caracteres fuera de [A-Za-z0-9_-]{10,128}.
 */
export function sanitizeGscVerificationToken(raw?: string | null): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  if (!GSC_VERIFICATION_TOKEN_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Resuelve el token de verificación GSC dando precedencia al prop explícito sobre la variable de entorno.
 * Un prop explícito (incluso null o vacío) anula el fallback de entorno.
 */
export function resolveGscVerificationToken(
  propToken?: string | null,
  envToken?: string | null
): string | null {
  return sanitizeGscVerificationToken(
    propToken !== undefined ? propToken : envToken
  );
}

function normalizeBaseUrl(baseUrl?: string): string {
  const fallback = SITE_METADATA.siteUrl.replace(/\/+$/, '');
  const trimmed = typeof baseUrl === 'string' ? baseUrl.trim() : '';
  if (!trimmed) {
    return fallback;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return fallback;
    }
    return parsed.origin.replace(/^http:/i, 'https:');
  } catch {
    return fallback;
  }
}

/**
 * Normaliza y resuelve una ruta o URL para obtener una URL canónica absoluta.
 * Garantiza protocolo https://, elimina query strings, hashes y barras duplicadas.
 */
export function resolveCanonicalUrl(
  pathOrUrl?: string,
  baseUrl: string = SITE_METADATA.siteUrl
): string {
  const cleanBase = normalizeBaseUrl(baseUrl);

  if (!pathOrUrl || pathOrUrl.trim() === '' || pathOrUrl.trim() === '/') {
    return `${cleanBase}/`;
  }

  // Despojar query params y hashes para canónicas limpias
  const withoutParams = pathOrUrl.trim().split('?')[0].split('#')[0];

  if (withoutParams === '' || withoutParams === '/') {
    return `${cleanBase}/`;
  }

  if (withoutParams.startsWith('http://') || withoutParams.startsWith('https://')) {
    const sanitized = withoutParams.replace(/^http:\/\//, 'https://');
    return sanitized.replace(/([^:])\/+/g, '$1/');
  }

  // Eliminar barras iniciales repetidas, colapsar barras duplicadas internas y asegurar prefijo '/'
  const cleanPath = '/' + withoutParams.replace(/^\/+/, '').replace(/\/+/g, '/');
  return `${cleanBase}${cleanPath}`;
}

/**
 * Resuelve la URL absoluta de una imagen para Open Graph y Twitter Cards.
 * Retorna siempre una URL absoluta válida con protocolo https://.
 */
export function resolveOgImageUrl(
  imageUrl?: string,
  baseUrl: string = SITE_METADATA.siteUrl
): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return SITE_METADATA.defaultOgImage;
  }

  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/^http:\/\//, 'https://');
  }

  const cleanBase = normalizeBaseUrl(baseUrl);
  const cleanPath = '/' + trimmed.replace(/^\/+/, '').replace(/\/+/g, '/');
  return `${cleanBase}${cleanPath}`;
}

/**
 * Construye el objeto completo de metadatos de una página con fallbacks institucionales.
 */
export function buildPageMetadata(input?: PageMetadataInput): PageMetadata {
  const title = input?.title?.trim() || SITE_METADATA.defaultTitle;
  const description = input?.description?.trim() || SITE_METADATA.defaultDescription;

  // Si canonicalUrl es un string vacío o de espacios, hacer fallback a currentPath
  const rawCanonical = input?.canonicalUrl?.trim() ? input.canonicalUrl : input?.currentPath;
  const canonicalUrl = resolveCanonicalUrl(rawCanonical);

  const ogImage = resolveOgImageUrl(input?.image);
  const imageAlt = input?.imageAlt?.trim() || title;
  const ogType = input?.type?.trim() || SITE_METADATA.ogType;
  const ogTitle = input?.ogTitle?.trim() || title;
  const twitterTitle = input?.twitterTitle?.trim() || ogTitle;

  return {
    title,
    description,
    canonicalUrl,
    ogTitle,
    ogDescription: description,
    ogImage,
    ogImageAlt: imageAlt,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogUrl: canonicalUrl,
    ogType,
    siteName: SITE_METADATA.siteName,
    locale: SITE_METADATA.locale,
    twitterCard: SITE_METADATA.twitterCard,
    twitterTitle,
    twitterDescription: description,
    twitterImage: ogImage,
    twitterImageAlt: imageAlt,
    noindex: input?.noindex,
  };
}

/**
 * Genera el conjunto estandarizado de etiquetas meta Open Graph y Twitter Cards.
 */
export function generateOpenGraphTags(metadata: PageMetadata): MetaTag[] {
  return [
    // Open Graph
    { property: 'og:title', content: metadata.ogTitle },
    { property: 'og:description', content: metadata.ogDescription },
    { property: 'og:url', content: metadata.ogUrl },
    { property: 'og:type', content: metadata.ogType },
    { property: 'og:site_name', content: metadata.siteName },
    { property: 'og:locale', content: metadata.locale },
    { property: 'og:image', content: metadata.ogImage },
    { property: 'og:image:alt', content: metadata.ogImageAlt },
    { property: 'og:image:width', content: metadata.ogImageWidth },
    { property: 'og:image:height', content: metadata.ogImageHeight },

    // Twitter Cards
    { name: 'twitter:card', content: metadata.twitterCard },
    { name: 'twitter:title', content: metadata.twitterTitle },
    { name: 'twitter:description', content: metadata.twitterDescription },
    { name: 'twitter:image', content: metadata.twitterImage },
    { name: 'twitter:image:alt', content: metadata.twitterImageAlt },
  ];
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface SchemaListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface SchemaBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: SchemaListItem[];
  [key: string]: unknown;
}

export interface SchemaPostalAddress {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface SchemaGeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface SchemaOpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export interface SchemaAreaServed {
  '@type': 'City' | 'AdministrativeArea' | 'Country';
  name: string;
}

export interface SchemaContactPoint {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  email: string;
  areaServed: string;
  availableLanguage: string;
}

export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  legalName: string;
  alternateName: string;
  taxID: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  telephone: string;
  email: string;
  address: SchemaPostalAddress;
  contactPoint: SchemaContactPoint[];
  areaServed: SchemaAreaServed[];
}

export interface SchemaLocalBusiness {
  '@context': 'https://schema.org';
  '@type': ['HardwareStore', 'WholesaleStore'];
  '@id': string;
  name: string;
  legalName: string;
  alternateName: string;
  taxID: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  telephone: string;
  email: string;
  priceRange: string;
  currenciesAccepted: string;
  paymentAccepted: string;
  publicAccess: boolean;
  address: SchemaPostalAddress;
  geo: SchemaGeoCoordinates;
  hasMap: string;
  openingHoursSpecification: SchemaOpeningHoursSpecification[];
  areaServed: SchemaAreaServed[];
  parentOrganization: {
    '@id': string;
  };
}

export type JsonLdNode =
  | SchemaOrganization
  | SchemaLocalBusiness
  | SchemaBreadcrumbList
  | Record<string, unknown>;

export type JsonLdInput = JsonLdNode | Array<JsonLdNode>;

function buildPostalAddress(): SchemaPostalAddress {
  return {
    '@type': 'PostalAddress',
    streetAddress: COMPANY_LOCATION.streetAddress,
    addressLocality: COMPANY_LOCATION.locality,
    addressRegion: COMPANY_LOCATION.region,
    postalCode: COMPANY_LOCATION.postalCode,
    addressCountry: COMPANY_LOCATION.countryCode,
  };
}

function buildAreaServed(): SchemaAreaServed[] {
  return BUSINESS_COMMERCE_SCHEMA.areaServed.map((item) => ({
    '@type': item.type,
    name: item.name,
  }));
}

function getCorporatePhone(): string {
  return CONTACT_PHONES[0]?.e164 ?? '+573014191344';
}

/**
 * Genera el esquema Schema.org Organization oficial de ASOEXI S.A.S.
 */
export function generateOrganizationSchema(
  baseUrl: string = SITE_METADATA.siteUrl
): SchemaOrganization {
  const cleanBase = normalizeBaseUrl(baseUrl);
  const telephone = getCorporatePhone();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${cleanBase}/#organization`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    alternateName: COMPANY_INFO.commercialName,
    taxID: COMPANY_INFO.nit,
    url: cleanBase,
    logo: resolveOgImageUrl('/logo.svg', cleanBase),
    image: resolveOgImageUrl('/og-image.jpg', cleanBase),
    description: SITE_METADATA.defaultDescription,
    telephone,
    email: BUSINESS_COMMERCE_SCHEMA.officialEmail,
    address: buildPostalAddress(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone,
        contactType: 'sales',
        email: BUSINESS_COMMERCE_SCHEMA.officialEmail,
        areaServed: COMPANY_LOCATION.countryCode,
        availableLanguage: 'Spanish',
      },
    ],
    areaServed: buildAreaServed(),
  };
}

/**
 * Genera el esquema Schema.org LocalBusiness (HardwareStore + WholesaleStore) de ASOEXI S.A.S.
 */
export function generateLocalBusinessSchema(
  baseUrl: string = SITE_METADATA.siteUrl
): SchemaLocalBusiness {
  const cleanBase = normalizeBaseUrl(baseUrl);
  const telephone = getCorporatePhone();

  return {
    '@context': 'https://schema.org',
    '@type': ['HardwareStore', 'WholesaleStore'],
    '@id': `${cleanBase}/#localbusiness`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    alternateName: COMPANY_INFO.commercialName,
    taxID: COMPANY_INFO.nit,
    url: cleanBase,
    logo: resolveOgImageUrl('/logo.svg', cleanBase),
    image: resolveOgImageUrl('/og-image.jpg', cleanBase),
    description: SITE_METADATA.defaultDescription,
    telephone,
    email: BUSINESS_COMMERCE_SCHEMA.officialEmail,
    priceRange: BUSINESS_COMMERCE_SCHEMA.priceRange,
    currenciesAccepted: BUSINESS_COMMERCE_SCHEMA.currenciesAccepted,
    paymentAccepted: BUSINESS_COMMERCE_SCHEMA.paymentAccepted,
    publicAccess: false,
    address: buildPostalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_LOCATION.geo.latitude,
      longitude: COMPANY_LOCATION.geo.longitude,
    },
    hasMap: COMPANY_LOCATION.googleMapsUrl,
    openingHoursSpecification: BUSINESS_COMMERCE_SCHEMA.openingHours.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...spec.dayOfWeek],
      opens: spec.opens,
      closes: spec.closes,
    })),
    areaServed: buildAreaServed(),
    parentOrganization: {
      '@id': `${cleanBase}/#organization`,
    },
  };
}

/**
 * Genera el par institucional de esquemas JSON-LD: [Organization, HardwareStore/WholesaleStore].
 */
export function generateInstitutionalSchemas(
  baseUrl: string = SITE_METADATA.siteUrl
): [SchemaOrganization, SchemaLocalBusiness] {
  return [
    generateOrganizationSchema(baseUrl),
    generateLocalBusinessSchema(baseUrl),
  ];
}

/**
 * Genera el esquema Schema.org BreadcrumbList con URLs canónicas absolutas.
 * Filtra items sin nombre válido antes de asignar posiciones 1-based y omite URLs vacías.
 */
export function generateBreadcrumbsSchema(
  items?: BreadcrumbItem[] | null,
  baseUrl: string = SITE_METADATA.siteUrl
): SchemaBreadcrumbList {
  if (!items || !Array.isArray(items)) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [],
    };
  }

  const itemListElement: SchemaListItem[] = items
    .filter(
      (item): item is BreadcrumbItem =>
        Boolean(
          item &&
            typeof item === 'object' &&
            typeof item.name === 'string' &&
            item.name.trim().length > 0
        )
    )
    .map((item, index) => {
      const listItem: SchemaListItem = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name.trim(),
      };
      if (typeof item.url === 'string') {
        const trimmedUrl = item.url.trim();
        if (
          trimmedUrl.length > 0 &&
          !trimmedUrl.startsWith('#') &&
          !trimmedUrl.startsWith('?') &&
          !/^javascript:/i.test(trimmedUrl)
        ) {
          listItem.item = resolveCanonicalUrl(trimmedUrl, baseUrl);
        }
      }
      return listItem;
    });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export const generateBreadcrumbListSchema = generateBreadcrumbsSchema;

