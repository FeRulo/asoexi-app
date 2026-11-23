import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  COMPANY_LOCATION,
  BUSINESS_COMMERCE_SCHEMA,
} from '@/lib/constants';
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateInstitutionalSchemas,
  generateBreadcrumbsSchema,
} from '@/lib/seo';
import { buildSectorBreadcrumbs, buildBrandBreadcrumbs } from '@/lib/brands';

describe('Story 5.2: Schema.org JSON-LD LocalBusiness (HardwareStore) & BreadcrumbList', () => {
  describe('Corporate Location & Commerce Constants (src/lib/constants.ts)', () => {
    it('should define official Barrio Venecia headquarters location and geo coordinates', () => {
      expect(COMPANY_LOCATION.streetAddress).toBe('Carrera 55 A No. 51 A 28 Sur, Barrio Venecia');
      expect(COMPANY_LOCATION.neighborhood).toBe('Barrio Venecia');
      expect(COMPANY_LOCATION.locality).toBe('Bogotá');
      expect(COMPANY_LOCATION.region).toBe('Bogotá D.C.');
      expect(COMPANY_LOCATION.postalCode).toBe('110611');
      expect(COMPANY_LOCATION.countryCode).toBe('CO');
      expect(COMPANY_LOCATION.geo).toEqual({
        latitude: 4.5937,
        longitude: -74.1378,
      });
      expect(COMPANY_LOCATION.googleMapsUrl).toBe('https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6');
    });

    it('should define official commercial parameters, opening hours and areaServed', () => {
      expect(BUSINESS_COMMERCE_SCHEMA.priceRange).toBe('$$');
      expect(BUSINESS_COMMERCE_SCHEMA.currenciesAccepted).toBe('COP');
      expect(BUSINESS_COMMERCE_SCHEMA.paymentAccepted).toBe('Cash, Credit Card, Bank Transfer');
      expect(BUSINESS_COMMERCE_SCHEMA.officialEmail).toBe('serviciocliente@asoexi.com');
      expect(BUSINESS_COMMERCE_SCHEMA.openingHours).toEqual([
        {
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '07:30',
          closes: '16:30',
        },
        {
          dayOfWeek: ['Saturday'],
          opens: '08:00',
          closes: '12:00',
        },
      ]);
      expect(BUSINESS_COMMERCE_SCHEMA.areaServed).toEqual([
        { type: 'City', name: 'Bogotá' },
        { type: 'AdministrativeArea', name: 'Sabana de Bogotá' },
        { type: 'Country', name: 'Colombia' },
      ]);
    });
  });

  describe('Organization & HardwareStore/WholesaleStore JSON-LD Generators (src/lib/seo.ts)', () => {
    it('should generate valid Organization schema with official corporate data', () => {
      const org = generateOrganizationSchema();

      expect(org['@context']).toBe('https://schema.org');
      expect(org['@type']).toBe('Organization');
      expect(org['@id']).toBe('https://asoexi.com/#organization');
      expect(org.name).toBe('ASOEXI S.A.S.');
      expect(org.legalName).toBe('ASOEXI S.A.S.');
      expect(org.alternateName).toBe('ASOEXI');
      expect(org.taxID).toBe('900480460-8');
      expect(org.url).toBe('https://asoexi.com');
      expect(org.logo).toBe('https://asoexi.com/logo.svg');
      expect(org.image).toBe('https://asoexi.com/og-image.jpg');
      expect(org.telephone).toBe('+573014191344');
      expect(org.email).toBe('serviciocliente@asoexi.com');

      expect(org.address).toEqual({
        '@type': 'PostalAddress',
        streetAddress: 'Carrera 55 A No. 51 A 28 Sur, Barrio Venecia',
        addressLocality: 'Bogotá',
        addressRegion: 'Bogotá D.C.',
        postalCode: '110611',
        addressCountry: 'CO',
      });
      expect('neighborhood' in org.address).toBe(false);

      expect(org.contactPoint).toEqual([
        {
          '@type': 'ContactPoint',
          telephone: '+573014191344',
          contactType: 'sales',
          email: 'serviciocliente@asoexi.com',
          areaServed: 'CO',
          availableLanguage: 'Spanish',
        },
      ]);

      expect(org.areaServed).toEqual([
        { '@type': 'City', name: 'Bogotá' },
        { '@type': 'AdministrativeArea', name: 'Sabana de Bogotá' },
        { '@type': 'Country', name: 'Colombia' },
      ]);
    });

    it('should generate valid LocalBusiness schema with dual @type HardwareStore & WholesaleStore', () => {
      const localBusiness = generateLocalBusinessSchema();

      expect(localBusiness['@context']).toBe('https://schema.org');
      expect(localBusiness['@type']).toEqual(['HardwareStore', 'WholesaleStore']);
      expect(localBusiness['@id']).toBe('https://asoexi.com/#localbusiness');
      expect(localBusiness.name).toBe('ASOEXI S.A.S.');
      expect(localBusiness.legalName).toBe('ASOEXI S.A.S.');
      expect(localBusiness.alternateName).toBe('ASOEXI');
      expect(localBusiness.taxID).toBe('900480460-8');
      expect(localBusiness.url).toBe('https://asoexi.com');
      expect(localBusiness.logo).toBe('https://asoexi.com/logo.svg');
      expect(localBusiness.image).toBe('https://asoexi.com/og-image.jpg');
      expect(localBusiness.telephone).toBe('+573014191344');
      expect(localBusiness.email).toBe('serviciocliente@asoexi.com');
      expect(localBusiness.priceRange).toBe('$$');
      expect(localBusiness.currenciesAccepted).toBe('COP');
      expect(localBusiness.paymentAccepted).toBe('Cash, Credit Card, Bank Transfer');
      expect(localBusiness.publicAccess).toBe(false);

      expect(localBusiness.address).toEqual({
        '@type': 'PostalAddress',
        streetAddress: 'Carrera 55 A No. 51 A 28 Sur, Barrio Venecia',
        addressLocality: 'Bogotá',
        addressRegion: 'Bogotá D.C.',
        postalCode: '110611',
        addressCountry: 'CO',
      });
      expect('neighborhood' in localBusiness.address).toBe(false);

      expect(localBusiness.geo).toEqual({
        '@type': 'GeoCoordinates',
        latitude: 4.5937,
        longitude: -74.1378,
      });
      expect(localBusiness.hasMap).toBe('https://maps.app.goo.gl/rcs1uzyGVfvJ48xK6');

      expect(localBusiness.openingHoursSpecification).toEqual([
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '07:30',
          closes: '16:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '08:00',
          closes: '12:00',
        },
      ]);

      expect(localBusiness.areaServed).toEqual([
        { '@type': 'City', name: 'Bogotá' },
        { '@type': 'AdministrativeArea', name: 'Sabana de Bogotá' },
        { '@type': 'Country', name: 'Colombia' },
      ]);

      expect(localBusiness.parentOrganization).toEqual({
        '@id': 'https://asoexi.com/#organization',
      });
    });

    it('should return [Organization, HardwareStore/WholesaleStore] from generateInstitutionalSchemas', () => {
      const schemas = generateInstitutionalSchemas();
      expect(schemas).toHaveLength(2);
      expect(schemas[0]['@type']).toBe('Organization');
      expect(schemas[1]['@type']).toEqual(['HardwareStore', 'WholesaleStore']);
    });

    it('should normalize non-canonical baseUrl and fallback safely on whitespace or malformed URLs', () => {
      const [orgHttp, localHttp] = generateInstitutionalSchemas('http://asoexi.com///');
      expect(orgHttp['@id']).toBe('https://asoexi.com/#organization');
      expect(orgHttp.url).toBe('https://asoexi.com');
      expect(orgHttp.logo).toBe('https://asoexi.com/logo.svg');
      expect(orgHttp.image).toBe('https://asoexi.com/og-image.jpg');
      expect(localHttp['@id']).toBe('https://asoexi.com/#localbusiness');
      expect(localHttp.parentOrganization).toEqual({ '@id': 'https://asoexi.com/#organization' });

      for (const invalidBase of ['   ', 'http://', 'https://', 'asoexi.com', 'ftp://asoexi.com']) {
        const [orgFallback, localFallback] = generateInstitutionalSchemas(invalidBase);
        expect(orgFallback['@id']).toBe('https://asoexi.com/#organization');
        expect(orgFallback.url).toBe('https://asoexi.com');
        expect(orgFallback.logo).toBe('https://asoexi.com/logo.svg');
        expect(orgFallback.image).toBe('https://asoexi.com/og-image.jpg');
        expect(localFallback['@id']).toBe('https://asoexi.com/#localbusiness');
      }
    });

    it('should never expose @gmail.com, personal lines, tel: URIs or invalid PostalAddress neighborhood property', () => {
      const serialized = JSON.stringify(generateInstitutionalSchemas());
      expect(serialized).not.toContain('@gmail.com');
      expect(serialized).not.toContain('tel:');
      expect(serialized).not.toContain('3044013761');
      expect(serialized).not.toContain('"neighborhood"');
    });
  });

  describe('Sector & Brand BreadcrumbList Hierarchy', () => {
    it('should build canonical 2-tier breadcrumbs for all 3 sector hubs', () => {
      expect(buildSectorBreadcrumbs('electrico')).toEqual([
        { name: 'Inicio', url: '/' },
        { name: 'Sector Eléctrico', url: '/sector-electrico' },
      ]);

      expect(buildSectorBreadcrumbs('ferretero-construccion')).toEqual([
        { name: 'Inicio', url: '/' },
        { name: 'Sector Ferretero & Construcción', url: '/sector-ferretero-construccion' },
      ]);

      expect(buildSectorBreadcrumbs('hidraulico-pinturas')).toEqual([
        { name: 'Inicio', url: '/' },
        { name: 'Sector Hidráulico & Pinturas', url: '/sector-hidraulico-pinturas' },
      ]);
    });

    it('should safely return only Inicio for invalid, prototype, empty or null sectorId and normalize whitespace/case', () => {
      expect(buildSectorBreadcrumbs('  ELECTRICO  ')).toEqual([
        { name: 'Inicio', url: '/' },
        { name: 'Sector Eléctrico', url: '/sector-electrico' },
      ]);

      expect(buildSectorBreadcrumbs('invalido')).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs('constructor')).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs('toString')).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs('__proto__')).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs('')).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs('   ')).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs(null)).toEqual([{ name: 'Inicio', url: '/' }]);
      expect(buildSectorBreadcrumbs(undefined)).toEqual([{ name: 'Inicio', url: '/' }]);
    });

    it('should generate valid 1-based BreadcrumbList for sector hubs with absolute canonical URLs', () => {
      const schema = generateBreadcrumbsSchema(buildSectorBreadcrumbs('electrico'));
      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://asoexi.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sector Eléctrico',
            item: 'https://asoexi.com/sector-electrico',
          },
        ],
      });
    });

    it('should preserve 3-tier BreadcrumbList hierarchy for brand silos (Inicio > Sector > Marca)', () => {
      const items = buildBrandBreadcrumbs('Panduit', 'panduit', 'electrico');
      const schema = generateBreadcrumbsSchema(items);
      expect(schema.itemListElement).toEqual([
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://asoexi.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sector Eléctrico',
          item: 'https://asoexi.com/sector-electrico',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Panduit',
          item: 'https://asoexi.com/distribuidor-panduit-colombia',
        },
      ]);
    });

    it('should filter out breadcrumb items with empty or whitespace-only name and renumber positions sequentially', () => {
      const schema = generateBreadcrumbsSchema([
        { name: 'Inicio', url: '/' },
        { name: '   ', url: '/x' },
        { name: '', url: '/y' },
        { name: 'Marca' },
      ]);

      expect(schema.itemListElement).toEqual([
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://asoexi.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Marca',
        },
      ]);
    });
    it('should omit item URL for fragment-only, query-only, and javascript: URLs', () => {
      const schema = generateBreadcrumbsSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Hash', url: '#' },
        { name: 'Fragmento', url: '  #top  ' },
        { name: 'Query', url: '?x=1' },
        { name: 'UnsafeLower', url: 'javascript:alert(1)' },
        { name: 'UnsafeUpper', url: '  JAVASCRIPT:void(0)  ' },
      ]);

      expect(schema.itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://asoexi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Hash' },
        { '@type': 'ListItem', position: 3, name: 'Fragmento' },
        { '@type': 'ListItem', position: 4, name: 'Query' },
        { '@type': 'ListItem', position: 5, name: 'UnsafeLower' },
        { '@type': 'ListItem', position: 6, name: 'UnsafeUpper' },
      ]);
    });
  });

  describe('Page Templates, BaseLayout Forwarding & Compiled HTML Audit', () => {
    const readProjectFile = (relPath: string) =>
      fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf-8');

    it('should wire exact jsonLd bindings into Home, Nosotros and forward jsonLd in BaseLayout', () => {
      const homeSource = readProjectFile('src/pages/index.astro');
      expect(homeSource).toMatch(/const institutionalSchemas = generateInstitutionalSchemas\(\);/);
      expect(homeSource).toMatch(/<BaseLayout[\s\S]*?jsonLd=\{institutionalSchemas\}/);

      const nosotrosSource = readProjectFile('src/pages/nosotros.astro');
      expect(nosotrosSource).toMatch(/\.\.\.generateInstitutionalSchemas\(\)/);
      expect(nosotrosSource).toMatch(/generateBreadcrumbsSchema\(\[\s*\{ name: 'Inicio', url: '\/' \},\s*\{ name: 'Nosotros', url: '\/nosotros' \},\s*\]\)/);
      expect(nosotrosSource).toMatch(/<BaseLayout[\s\S]*?jsonLd=\{pageSchemas\}/);

      const baseLayoutSource = readProjectFile('src/layouts/BaseLayout.astro');
      expect(baseLayoutSource).toMatch(/<SEOHead[\s\S]*?jsonLd=\{jsonLd\}/);
    });

    it('should wire BreadcrumbList via buildSectorBreadcrumbs into all 3 sector hub pages', () => {
      const sectorPages = [
        { file: 'src/pages/sector-electrico.astro', id: 'electrico' },
        { file: 'src/pages/sector-ferretero-construccion.astro', id: 'ferretero-construccion' },
        { file: 'src/pages/sector-hidraulico-pinturas.astro', id: 'hidraulico-pinturas' },
      ];

      for (const page of sectorPages) {
        const source = readProjectFile(page.file);
        expect(source).toContain(
          `const breadcrumbsSchema = generateBreadcrumbsSchema(buildSectorBreadcrumbs('${page.id}'));`
        );
        expect(source).toMatch(/<BaseLayout[\s\S]*?jsonLd=\{breadcrumbsSchema\}/);
      }
    });

    it('should preserve BreadcrumbList injection in brand silo template and safe escaping in SEOHead', () => {
      const brandSiloSource = readProjectFile('src/pages/distribuidor-[brand]-colombia.astro');
      expect(brandSiloSource).toContain('buildBrandBreadcrumbs');
      expect(brandSiloSource).toContain('generateBreadcrumbsSchema');
      expect(brandSiloSource).toMatch(/<BaseLayout[\s\S]*?jsonLd=\{breadcrumbsSchema\}/);

      const seoHeadSource = readProjectFile('src/components/seo/SEOHead.astro');
      expect(seoHeadSource).toContain('jsonLd.filter(Boolean)');
      expect(seoHeadSource).toContain("replace(/</g, '\\\\u003c')");
    });

    it('should validate compiled JSON-LD script blocks in dist/client when build output exists', () => {
      const distClient = path.resolve(process.cwd(), 'dist/client');
      const homeHtmlPath = path.join(distClient, 'index.html');
      if (!fs.existsSync(homeHtmlPath)) {
        return;
      }

      const extractJsonLd = (htmlPath: string): Record<string, unknown>[] => {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        return matches.map((m) => JSON.parse(m[1]) as Record<string, unknown>);
      };

      for (const rel of ['index.html', 'nosotros/index.html']) {
        const blocks = extractJsonLd(path.join(distClient, rel));
        const org = blocks.find((b) => b['@type'] === 'Organization');
        const lb = blocks.find(
          (b) =>
            Array.isArray(b['@type']) &&
            b['@type'].includes('HardwareStore') &&
            b['@type'].includes('WholesaleStore')
        );
        expect(org).toBeDefined();
        expect(lb).toBeDefined();
        expect(JSON.stringify(blocks)).not.toContain('"neighborhood"');
        expect(JSON.stringify(blocks)).not.toContain('@gmail.com');
        if (rel === 'nosotros/index.html') {
          const bc = blocks.find((b) => b['@type'] === 'BreadcrumbList');
          expect(bc).toBeDefined();
        }
      }

      for (const slug of [
        'sector-electrico',
        'sector-ferretero-construccion',
        'sector-hidraulico-pinturas',
      ]) {
        const blocks = extractJsonLd(path.join(distClient, slug, 'index.html'));
        const bc = blocks.find((b) => b['@type'] === 'BreadcrumbList');
        expect(bc).toBeDefined();
      }
    });
  });
});
