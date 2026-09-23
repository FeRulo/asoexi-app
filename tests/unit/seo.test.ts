import { describe, it, expect } from 'vitest';
import {
  resolveCanonicalUrl,
  resolveOgImageUrl,
  buildPageMetadata,
  generateOpenGraphTags,
  type PageMetadataInput,
} from '@/lib/seo';
import { SITE_METADATA } from '@/lib/constants';

describe('SEO & Open Graph Utilities (src/lib/seo.ts)', () => {
  describe('resolveCanonicalUrl', () => {
    it('should resolve root path to site URL with trailing slash or clean root', () => {
      expect(resolveCanonicalUrl('/')).toBe('https://asoexi.com/');
      expect(resolveCanonicalUrl('')).toBe('https://asoexi.com/');
      expect(resolveCanonicalUrl()).toBe('https://asoexi.com/');
    });

    it('should resolve subpaths to absolute URLs without duplicate slashes', () => {
      expect(resolveCanonicalUrl('/nosotros')).toBe('https://asoexi.com/nosotros');
      expect(resolveCanonicalUrl('nosotros')).toBe('https://asoexi.com/nosotros');
      expect(resolveCanonicalUrl('//nosotros')).toBe('https://asoexi.com/nosotros');
      expect(resolveCanonicalUrl('/catalogo/herramientas')).toBe('https://asoexi.com/catalogo/herramientas');
    });

    it('should strip query parameters and anchor hashes from canonical URLs', () => {
      expect(resolveCanonicalUrl('/nosotros?utm_source=google&utm_medium=cpc')).toBe('https://asoexi.com/nosotros');
      expect(resolveCanonicalUrl('/#cotizar')).toBe('https://asoexi.com/');
      expect(resolveCanonicalUrl('/nosotros?fbclid=xyz#contacto')).toBe('https://asoexi.com/nosotros');
    });

    it('should preserve and enforce https on absolute URLs', () => {
      expect(resolveCanonicalUrl('https://asoexi.com/nosotros')).toBe('https://asoexi.com/nosotros');
      expect(resolveCanonicalUrl('http://asoexi.com/nosotros')).toBe('https://asoexi.com/nosotros');
    });

    it('should respect custom base URL if provided', () => {
      expect(resolveCanonicalUrl('/nosotros', 'https://custom.asoexi.com')).toBe(
        'https://custom.asoexi.com/nosotros'
      );
    });
  });

  describe('resolveOgImageUrl', () => {
    it('should fallback to default og image if not provided', () => {
      expect(resolveOgImageUrl()).toBe('https://asoexi.com/og-image.jpg');
      expect(resolveOgImageUrl('')).toBe('https://asoexi.com/og-image.jpg');
      expect(resolveOgImageUrl(undefined)).toBe('https://asoexi.com/og-image.jpg');
    });

    it('should resolve relative image paths to absolute URLs without double slashes', () => {
      expect(resolveOgImageUrl('/og-image.jpg')).toBe('https://asoexi.com/og-image.jpg');
      expect(resolveOgImageUrl('//og-image.jpg')).toBe('https://asoexi.com/og-image.jpg');
      expect(resolveOgImageUrl('images/custom.png')).toBe('https://asoexi.com/images/custom.png');
    });

    it('should return already absolute image URLs ensuring https', () => {
      const absoluteUrl = 'https://cdn.asoexi.com/og/nosotros.jpg';
      expect(resolveOgImageUrl(absoluteUrl)).toBe(absoluteUrl);
      expect(resolveOgImageUrl('http://cdn.asoexi.com/og/nosotros.jpg')).toBe(absoluteUrl);
    });
  });

  describe('buildPageMetadata', () => {
    it('should construct complete metadata with defaults when input is empty', () => {
      const meta = buildPageMetadata();

      expect(meta.title).toBe(SITE_METADATA.defaultTitle);
      expect(meta.description).toBe(SITE_METADATA.defaultDescription);
      expect(meta.canonicalUrl).toBe('https://asoexi.com/');
      expect(meta.ogTitle).toBe(SITE_METADATA.defaultTitle);
      expect(meta.ogDescription).toBe(SITE_METADATA.defaultDescription);
      expect(meta.ogImage).toBe('https://asoexi.com/og-image.jpg');
      expect(meta.ogImageAlt).toBe(SITE_METADATA.defaultTitle);
      expect(meta.ogImageWidth).toBe('1200');
      expect(meta.ogImageHeight).toBe('630');
      expect(meta.ogUrl).toBe('https://asoexi.com/');
      expect(meta.ogType).toBe('website');
      expect(meta.siteName).toBe(SITE_METADATA.siteName);
      expect(meta.locale).toBe('es_CO');
      expect(meta.twitterCard).toBe('summary_large_image');
      expect(meta.twitterTitle).toBe(SITE_METADATA.defaultTitle);
      expect(meta.twitterDescription).toBe(SITE_METADATA.defaultDescription);
      expect(meta.twitterImage).toBe('https://asoexi.com/og-image.jpg');
      expect(meta.twitterImageAlt).toBe(SITE_METADATA.defaultTitle);
      expect(meta.noindex).toBeUndefined();
    });

    it('should override title, description, path, image, imageAlt and type when provided', () => {
      const input: PageMetadataInput = {
        title: 'Nosotros | ASOEXI S.A.S.',
        description: 'Conoce la trayectoria de más de 7 años de ASOEXI S.A.S. en suministro industrial.',
        currentPath: '/nosotros',
        image: '/og-nosotros.jpg',
        imageAlt: 'Equipo corporativo de ASOEXI S.A.S.',
        type: 'article',
        noindex: true,
      };

      const meta = buildPageMetadata(input);

      expect(meta.title).toBe(input.title);
      expect(meta.description).toBe(input.description);
      expect(meta.canonicalUrl).toBe('https://asoexi.com/nosotros');
      expect(meta.ogTitle).toBe(input.title);
      expect(meta.ogDescription).toBe(input.description);
      expect(meta.ogImage).toBe('https://asoexi.com/og-nosotros.jpg');
      expect(meta.ogImageAlt).toBe('Equipo corporativo de ASOEXI S.A.S.');
      expect(meta.ogUrl).toBe('https://asoexi.com/nosotros');
      expect(meta.ogType).toBe('article');
      expect(meta.twitterTitle).toBe(input.title);
      expect(meta.twitterDescription).toBe(input.description);
      expect(meta.twitterImage).toBe('https://asoexi.com/og-nosotros.jpg');
      expect(meta.twitterImageAlt).toBe('Equipo corporativo de ASOEXI S.A.S.');
      expect(meta.noindex).toBe(true);
    });

    it('should prioritize explicit canonicalUrl if given', () => {
      const meta = buildPageMetadata({
        currentPath: '/nosotros',
        canonicalUrl: 'https://asoexi.com/about-us',
      });
      expect(meta.canonicalUrl).toBe('https://asoexi.com/about-us');
      expect(meta.ogUrl).toBe('https://asoexi.com/about-us');
    });

    it('should fallback to currentPath when canonicalUrl is whitespace only', () => {
      const meta = buildPageMetadata({
        currentPath: '/nosotros',
        canonicalUrl: '   ',
      });
      expect(meta.canonicalUrl).toBe('https://asoexi.com/nosotros');
    });
  });

  describe('generateOpenGraphTags', () => {
    it('should generate all required Open Graph and Twitter Card tags with absolute URLs and alt text', () => {
      const meta = buildPageMetadata({
        title: 'Nosotros | ASOEXI S.A.S.',
        description: 'Historia y protocolos de seguridad.',
        currentPath: '/nosotros',
        imageAlt: 'Logo y portada institucional de ASOEXI',
      });

      const tags = generateOpenGraphTags(meta);

      const findProp = (prop: string) => tags.find((t) => t.property === prop)?.content;
      const findName = (name: string) => tags.find((t) => t.name === name)?.content;

      // Open Graph
      expect(findProp('og:title')).toBe('Nosotros | ASOEXI S.A.S.');
      expect(findProp('og:description')).toBe('Historia y protocolos de seguridad.');
      expect(findProp('og:url')).toBe('https://asoexi.com/nosotros');
      expect(findProp('og:type')).toBe('website');
      expect(findProp('og:site_name')).toBe('ASOEXI S.A.S.');
      expect(findProp('og:locale')).toBe('es_CO');
      expect(findProp('og:image')).toBe('https://asoexi.com/og-image.jpg');
      expect(findProp('og:image:alt')).toBe('Logo y portada institucional de ASOEXI');
      expect(findProp('og:image:width')).toBe('1200');
      expect(findProp('og:image:height')).toBe('630');

      // Twitter Cards
      expect(findName('twitter:card')).toBe('summary_large_image');
      expect(findName('twitter:title')).toBe('Nosotros | ASOEXI S.A.S.');
      expect(findName('twitter:description')).toBe('Historia y protocolos de seguridad.');
      expect(findName('twitter:image')).toBe('https://asoexi.com/og-image.jpg');
      expect(findName('twitter:image:alt')).toBe('Logo y portada institucional de ASOEXI');

      // Verification: all URLs are absolute https://
      expect(findProp('og:url')).toMatch(/^https:\/\/asoexi\.com/);
      expect(findProp('og:image')).toMatch(/^https:\/\/asoexi\.com/);
      expect(findName('twitter:image')).toMatch(/^https:\/\/asoexi\.com/);
    });
  });
});
