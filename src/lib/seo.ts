import { SITE_METADATA } from '@/lib/constants';

export interface PageMetadataInput {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  currentPath?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  noindex?: boolean;
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

/**
 * Normaliza y resuelve una ruta o URL para obtener una URL canónica absoluta.
 * Garantiza protocolo https://, elimina query strings, hashes y barras duplicadas.
 */
export function resolveCanonicalUrl(
  pathOrUrl?: string,
  baseUrl: string = SITE_METADATA.siteUrl
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '').replace(/^http:\/\//, 'https://');

  if (!pathOrUrl || pathOrUrl.trim() === '' || pathOrUrl.trim() === '/') {
    return `${cleanBase}/`;
  }

  // Despojar query params y hashes para canónicas limpias
  const withoutParams = pathOrUrl.trim().split('?')[0].split('#')[0];

  if (withoutParams === '' || withoutParams === '/') {
    return `${cleanBase}/`;
  }

  if (withoutParams.startsWith('http://') || withoutParams.startsWith('https://')) {
    return withoutParams.replace(/^http:\/\//, 'https://');
  }

  // Eliminar barras iniciales repetidas y asegurar prefijo '/'
  const cleanPath = '/' + withoutParams.replace(/^\/+/, '');
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

  const cleanBase = baseUrl.replace(/\/+$/, '').replace(/^http:\/\//, 'https://');
  const cleanPath = '/' + trimmed.replace(/^\/+/, '');
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
  const ogType = input?.type || SITE_METADATA.ogType;

  return {
    title,
    description,
    canonicalUrl,
    ogTitle: title,
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
    twitterTitle: title,
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
