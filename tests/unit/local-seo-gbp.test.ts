import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  ABOUT_DATA,
  COMPANY_INFO,
  COMPANY_LOCATION,
  GOOGLE_BUSINESS_PROFILE,
  LOCAL_DELIVERY_POLICY,
  LOCAL_HEADQUARTERS_ADDRESS,
  LOGISTIC_NOTICE,
  SITE_METADATA,
} from '@/lib/constants';
import {
  resolveCanonicalUrl,
  resolveGscVerificationToken,
  sanitizeGscVerificationToken,
} from '@/lib/seo';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf-8');
}

describe('Story 5.4: Verificación GSC, SEO On-Page Local (Bogotá / Venecia) y Google Business Profile', () => {
  describe('1. Sanitización y resolución de token Google Search Console', () => {
    it('retorna el token limpio cuando cumple /^[A-Za-z0-9_-]{10,128}$/', () => {
      expect(sanitizeGscVerificationToken('  abcDEF_0123456789-xyz  ')).toBe(
        'abcDEF_0123456789-xyz'
      );
      expect(sanitizeGscVerificationToken('0123456789')).toBe('0123456789');
      const maxLenToken = 'A'.repeat(128);
      expect(sanitizeGscVerificationToken(maxLenToken)).toBe(maxLenToken);
    });

    it('retorna null cuando el token está ausente, nulo o vacío', () => {
      expect(sanitizeGscVerificationToken(undefined)).toBeNull();
      expect(sanitizeGscVerificationToken(null)).toBeNull();
      expect(sanitizeGscVerificationToken('')).toBeNull();
      expect(sanitizeGscVerificationToken('     ')).toBeNull();
    });

    it('rechaza tokens inválidos, cortos, excesivamente largos o con intentos de inyección HTML', () => {
      expect(sanitizeGscVerificationToken('" /><script>alert(1)</script>')).toBeNull();
      expect(sanitizeGscVerificationToken('corto')).toBeNull();
      expect(sanitizeGscVerificationToken('123456789')).toBeNull(); // 9 chars
      expect(sanitizeGscVerificationToken('A'.repeat(129))).toBeNull(); // 129 chars
      expect(sanitizeGscVerificationToken('con espacio valido123')).toBeNull();
      expect(sanitizeGscVerificationToken('token_con_signo$1234')).toBeNull();
      expect(sanitizeGscVerificationToken('token<tag>123456')).toBeNull();
    });

    it('resolveGscVerificationToken da precedencia al prop sobre env (incluyendo null explícito)', () => {
      const validProp = 'propToken_0123456789';
      const validEnv = 'envToken_0123456789';

      // Prop válido prevalece sobre env válido
      expect(resolveGscVerificationToken(`  ${validProp}  `, validEnv)).toBe(validProp);

      // Prop explícito null o vacío anula un env válido
      expect(resolveGscVerificationToken(null, validEnv)).toBeNull();
      expect(resolveGscVerificationToken('', validEnv)).toBeNull();

      // Prop explícito inválido anula un env válido
      expect(resolveGscVerificationToken('" /><script>', validEnv)).toBeNull();

      // Prop undefined hace fallback al env válido
      expect(resolveGscVerificationToken(undefined, `  ${validEnv}  `)).toBe(validEnv);

      // Prop undefined con env ausente o inválido retorna null
      expect(resolveGscVerificationToken(undefined, undefined)).toBeNull();
      expect(resolveGscVerificationToken(undefined, 'corto')).toBeNull();
    });
  });

  describe('2. Contrato NAP Local y Google Business Profile (src/lib/constants.ts)', () => {
    it('compone dirección de sede en Barrio Venecia y define política de despacho sin mostrador', () => {
      expect(LOCAL_HEADQUARTERS_ADDRESS).toBe(
        `${COMPANY_LOCATION.streetAddress}, ${COMPANY_LOCATION.region}`
      );
      expect(LOCAL_HEADQUARTERS_ADDRESS).toBe(
        'Carrera 55 A No. 51 A 28 Sur, Barrio Venecia, Bogotá D.C.'
      );
      expect(LOCAL_DELIVERY_POLICY).toBe(
        'Despacho centralizado a domicilio a obras y bodegas en Bogotá y Sabana — Sin venta de mostrador ni retiro en bodega'
      );
    });

    it('preserva intactos LOGISTIC_NOTICE, COMPANY_INFO y referencia LOGISTIC_NOTICE en ABOUT_DATA', () => {
      expect(LOGISTIC_NOTICE).toBe(
        'Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)'
      );
      expect(COMPANY_INFO.noCounterNotice).toBe(LOGISTIC_NOTICE);
      expect(ABOUT_DATA.logistics.noCounterNotice).toBe(LOGISTIC_NOTICE);
    });

    it('define GOOGLE_BUSINESS_PROFILE con categorías, cobertura y URL atribuida con UTM normalizable', () => {
      expect(GOOGLE_BUSINESS_PROFILE.primaryCategory).toBe('Ferretería');
      expect(GOOGLE_BUSINESS_PROFILE.secondaryCategory).toBe(
        'Proveedor de equipos industriales'
      );
      expect(GOOGLE_BUSINESS_PROFILE.categories).toEqual([
        'Ferretería',
        'Proveedor de equipos industriales',
      ]);
      expect(GOOGLE_BUSINESS_PROFILE.serviceAreas).toEqual(['Bogotá', 'Sabana de Bogotá']);
      expect(GOOGLE_BUSINESS_PROFILE.mapsUrl).toBe(
        'https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6'
      );
      expect(GOOGLE_BUSINESS_PROFILE.mapsUrl).toBe(COMPANY_LOCATION.googleMapsUrl);
      expect(GOOGLE_BUSINESS_PROFILE.attributedWebsiteUrl).toBe(
        `${SITE_METADATA.siteUrl}/?utm_source=gbp&utm_medium=organic&utm_campaign=local`
      );

      // Evita duplicación de índice canónico ante parámetros UTM de GBP
      expect(resolveCanonicalUrl(GOOGLE_BUSINESS_PROFILE.attributedWebsiteUrl)).toBe(
        'https://asoexi.com/'
      );
    });

    it('enriquece ABOUT_DATA con Barrio Venecia y señales locales B2B', () => {
      expect(ABOUT_DATA.logistics.headquartersAddress).toBe(LOCAL_HEADQUARTERS_ADDRESS);
      const historyText = ABOUT_DATA.history.paragraphs.join(' ').toLowerCase();
      expect(historyText).toContain('venecia');
      expect(historyText).toContain('distribuidor ferretero bogotá');
      expect(historyText).toContain('proveedor de insumos industriales venecia bogotá');
      expect(historyText).toContain('materiales eléctricos sur de bogotá');
    });
  });

  describe('3. Tipado de entorno y componente SEOHead.astro', () => {
    it('declara PUBLIC_GOOGLE_SITE_VERIFICATION en src/env.d.ts', () => {
      const envDts = readProjectFile('src/env.d.ts');
      expect(envDts).toContain('readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;');
    });

    it('SEOHead.astro resuelve y renderiza condicionalmente meta google-site-verification', () => {
      const seoHead = readProjectFile('src/components/seo/SEOHead.astro');
      expect(seoHead).toContain('resolveGscVerificationToken');
      expect(seoHead).toContain('gscVerificationToken');
      expect(seoHead).toContain('import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION');
      expect(seoHead).toContain('name="google-site-verification"');
    });
  });

  describe('4. Coherencia NAP, enlace GBP accesible y SEO On-Page Local en Footer, Nosotros e Index', () => {
    it('Footer.astro expone sede en Barrio Venecia, política sin mostrador y enlace accesible a GBP sin tel: ni iframe', () => {
      const footer = readProjectFile('src/components/common/Footer.astro');
      expect(footer).toContain('LOCAL_HEADQUARTERS_ADDRESS');
      expect(footer).toContain('LOCAL_DELIVERY_POLICY');
      expect(footer).toContain('Sede administrativa y logística:');
      expect(footer).toContain('GOOGLE_BUSINESS_PROFILE.mapsUrl');
      expect(footer).toContain('min-h-[48px]');
      expect(footer).toContain('target="_blank"');
      expect(footer).toContain('rel="noopener noreferrer"');
      expect(footer).toContain('focus:ring-2');
      expect(footer).not.toMatch(/href=["']tel:/i);
      expect(footer).not.toMatch(/<iframe\b/i);
    });

    it('nosotros.astro expone sede en Barrio Venecia, política operativa sin duplicación, enlace GBP y descripción SERP ≤165 chars', () => {
      const nosotros = readProjectFile('src/pages/nosotros.astro');

      expect(nosotros).toContain('LOCAL_HEADQUARTERS_ADDRESS');
      expect(nosotros).toContain('LOCAL_DELIVERY_POLICY');
      expect(nosotros).toContain('Sede administrativa y logística:');
      expect(nosotros).toContain('GOOGLE_BUSINESS_PROFILE.mapsUrl');
      expect(nosotros).toContain('min-h-[48px]');
      expect(nosotros).toContain('target="_blank"');
      expect(nosotros).toContain('rel="noopener noreferrer"');
      expect(nosotros).toContain('focus:ring-2');
      expect(nosotros).not.toContain('{LOCAL_DELIVERY_POLICY}. {ABOUT_DATA.logistics.noCounterNotice}');
      expect(nosotros).not.toMatch(/href=["']tel:/i);
      expect(nosotros).not.toMatch(/<iframe\b/i);

      const descMatch = nosotros.match(/const pageDescription\s*=\s*'([^']+)'/);
      expect(descMatch, 'pageDescription debe estar definida en nosotros.astro').not.toBeNull();
      expect(descMatch![1].length).toBeLessThanOrEqual(165);
    });

    it('index.astro integra términos locales B2B en #sectores y mantiene description SERP ≤165 chars con clúster 5.1', () => {
      const index = readProjectFile('src/pages/index.astro');
      const lowerIndex = index.toLowerCase();

      const descMatch = index.match(/description="([^"]+)"/);
      expect(descMatch, 'description debe estar definida en index.astro').not.toBeNull();
      const description = descMatch![1];
      expect(description.length).toBeLessThanOrEqual(165);
      expect(description.toLowerCase()).toContain(
        'distribuidor mayorista de insumos para mantenimiento'
      );
      expect(description).toContain('Bogotá');
      expect(description).toContain('NIT 900480460-8');
      expect(description.toLowerCase()).toContain('despacho a domicilio');

      expect(lowerIndex).toContain('distribuidor ferretero bogotá');
      expect(lowerIndex).toContain('proveedor de insumos industriales venecia bogotá');
      expect(lowerIndex).toContain('materiales eléctricos sur de bogotá');
    });
  });

  describe('5. Auditoría de HTML compilado en dist/client/ (cuando existe build)', () => {
    it('verifica NAP Venecia, política sin mostrador, enlaces GBP en Footer y Nosotros, keywords locales y meta GSC en index.html y nosotros/index.html', () => {
      const distClient = path.join(PROJECT_ROOT, 'dist/client');
      const pages = ['index.html', 'nosotros/index.html'];

      if (!fs.existsSync(path.join(distClient, 'index.html'))) {
        return;
      }

      for (const relPath of pages) {
        const fullPath = path.join(distClient, relPath);
        expect(fs.existsSync(fullPath), `${relPath} debe existir en dist/client/`).toBe(true);

        const html = fs.readFileSync(fullPath, 'utf-8');
        const lowerHtml = html.toLowerCase();

        // NAP Venecia + política sin mostrador
        expect(html, `${relPath} debe incluir dirección en Barrio Venecia`).toContain(
          'Carrera 55 A No. 51 A 28 Sur, Barrio Venecia, Bogotá D.C.'
        );
        expect(html, `${relPath} debe incluir política de despacho centralizado`).toContain(
          'Despacho centralizado a domicilio a obras y bodegas en Bogotá y Sabana — Sin venta de mostrador ni retiro en bodega'
        );

        // Enlaces accesibles a Google Business Profile
        const anchorTags = html.match(/<a\b[^>]*>/g) ?? [];
        const gbpAnchors = anchorTags.filter((tag) =>
          tag.includes('https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6')
        );
        if (relPath === 'nosotros/index.html') {
          expect(
            gbpAnchors.length,
            'nosotros/index.html debe incluir enlaces GBP en main (2) y Footer (1)'
          ).toBeGreaterThanOrEqual(3);

          const mainMatch = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
          expect(mainMatch, 'nosotros/index.html debe contener <main>').not.toBeNull();
          const mainAnchors = mainMatch![0].match(/<a\b[^>]*>/g) ?? [];
          const mainGbpAnchors = mainAnchors.filter((tag) =>
            tag.includes('https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6')
          );
          expect(
            mainGbpAnchors.length,
            'nosotros/index.html debe incluir al menos 2 enlaces GBP dentro de <main>'
          ).toBeGreaterThanOrEqual(2);
        } else {
          expect(
            gbpAnchors.length,
            `${relPath} debe incluir enlace a Google Business Profile`
          ).toBeGreaterThanOrEqual(1);
        }

        for (const tag of gbpAnchors) {
          expect(tag).toContain('target="_blank"');
          expect(tag).toContain('rel="noopener noreferrer"');
          expect(tag).toContain('min-h-[48px]');
        }

        // Términos locales B2B
        expect(lowerHtml, `${relPath} debe incluir distribuidor ferretero bogotá`).toContain(
          'distribuidor ferretero bogotá'
        );
        expect(
          lowerHtml,
          `${relPath} debe incluir proveedor de insumos industriales venecia bogotá`
        ).toContain('proveedor de insumos industriales venecia bogotá');
        expect(
          lowerHtml,
          `${relPath} debe incluir materiales eléctricos sur de bogotá`
        ).toContain('materiales eléctricos sur de bogotá');

        // Sin iframes pesados ni enlaces tel:
        expect(html).not.toMatch(/href=["']tel:/i);
        expect(html).not.toMatch(/<iframe\b[^>]*google\.com\/maps/i);

        // Si existe cualquier <meta> de google-site-verification, su content debe ser un token válido no vacío
        const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
        const gscMetaTags = metaTags.filter((tag) =>
          /\bname\s*=\s*(["']?)google-site-verification\1(?=\s|\/?>)/i.test(tag)
        );
        for (const tag of gscMetaTags) {
          const contentMatch = tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
          const contentValue =
            contentMatch?.[1] ?? contentMatch?.[2] ?? contentMatch?.[3] ?? '';
          expect(
            sanitizeGscVerificationToken(contentValue),
            `${relPath} contiene meta google-site-verification con content inválido: ${tag}`
          ).not.toBeNull();
        }
      }
    });
  });
});
