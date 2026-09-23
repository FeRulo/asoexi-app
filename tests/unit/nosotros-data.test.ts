import { describe, it, expect } from 'vitest';
import { ABOUT_DATA, SITE_METADATA } from '@/lib/constants';

describe('Institutional Data Contracts (ABOUT_DATA & SITE_METADATA)', () => {
  describe('SITE_METADATA', () => {
    it('should define official site metadata with absolute production URL', () => {
      expect(SITE_METADATA.siteUrl).toBe('https://asoexi.com');
      expect(SITE_METADATA.siteName).toBe('ASOEXI S.A.S.');
      expect(SITE_METADATA.locale).toBe('es_CO');
      expect(SITE_METADATA.ogType).toBe('website');
      expect(SITE_METADATA.twitterCard).toBe('summary_large_image');
      expect(SITE_METADATA.defaultOgImage).toBe('https://asoexi.com/og-image.jpg');
    });

    it('should contain robust default title and description', () => {
      expect(SITE_METADATA.defaultTitle).toContain('ASOEXI S.A.S.');
      expect(SITE_METADATA.defaultTitle).toContain('Distribuidor Mayorista');
      expect(SITE_METADATA.defaultDescription).toContain('7 años');
      expect(SITE_METADATA.defaultDescription).toContain('despacho a domicilio');
    });
  });

  describe('ABOUT_DATA Institutional Content', () => {
    it('should satisfy the AboutData contract structure', () => {
      expect(ABOUT_DATA.badge).toBeDefined();
      expect(ABOUT_DATA.heroTitle).toBeDefined();
      expect(ABOUT_DATA.heroSubtitle).toBeDefined();
      expect(ABOUT_DATA.history).toBeDefined();
      expect(ABOUT_DATA.mission).toBeDefined();
      expect(ABOUT_DATA.vision).toBeDefined();
      expect(ABOUT_DATA.logistics).toBeDefined();
      expect(ABOUT_DATA.safetyProtocols).toBeDefined();
    });

    it('should include correct hero narrative and trajectory badge', () => {
      expect(ABOUT_DATA.badge).toContain('Trayectoria y Solvencia B2B');
      expect(ABOUT_DATA.heroTitle).toContain('Más de 7 Años Abasteciendo a la Industria');
      expect(ABOUT_DATA.heroSubtitle).toMatch(/fábrica|entregas|garantía/i);
    });

    it('should contain corporate history highlighting experience and B2B track record', () => {
      expect(ABOUT_DATA.history.title).toBeDefined();
      expect(ABOUT_DATA.history.paragraphs.length).toBeGreaterThan(0);
      const combinedHistory = ABOUT_DATA.history.paragraphs.join(' ');
      expect(combinedHistory).toMatch(/7\s*años/i);
      expect(combinedHistory).toMatch(/900480460-8/); // NIT
      expect(combinedHistory).toMatch(/ASOEXI/i);
      expect(ABOUT_DATA.history.stats.length).toBeGreaterThanOrEqual(3);
    });

    it('should define mission and vision aligned with wholesale industrial supply', () => {
      expect(ABOUT_DATA.mission.title).toBeDefined();
      expect(ABOUT_DATA.mission.description.length).toBeGreaterThan(50);
      expect(ABOUT_DATA.mission.description).toMatch(/abastec|suministr|solución/i);

      expect(ABOUT_DATA.vision.title).toBeDefined();
      expect(ABOUT_DATA.vision.description.length).toBeGreaterThan(50);
      expect(ABOUT_DATA.vision.description).toMatch(/líder|referente|nacional/i);
    });

    it('should enforce the mandatory 100% home/worksite delivery without counter sale policy', () => {
      expect(ABOUT_DATA.logistics.headquartersAddress).toContain('Carrera 55 A No. 51 A 28 Sur');
      expect(ABOUT_DATA.logistics.headquartersAddress).toContain('Bogotá');

      const notice = ABOUT_DATA.logistics.noCounterNotice;
      expect(notice).toMatch(/sin\s*venta\s*presencial\s*por\s*mostrador/i);
      expect(notice).toMatch(/ni\s*(retiro|entrega)\s*en\s*bodega/i);

      expect(ABOUT_DATA.logistics.administrativeNotice).toMatch(/sede\s*administrativa/i);
      expect(ABOUT_DATA.logistics.features.length).toBeGreaterThanOrEqual(3);
    });

    it('should define comprehensive SG-SST safety protocols', () => {
      const items = ABOUT_DATA.safetyProtocols.items;
      expect(items.length).toBeGreaterThanOrEqual(4);

      // Check for EPPs homologados
      const eppItem = items.find(
        (i) => i.id.includes('epp') || i.title.toLowerCase().includes('epp') || i.description.toLowerCase().includes('epp')
      );
      expect(eppItem).toBeDefined();
      expect(eppItem?.description).toMatch(/homologad|certificad/i);

      // Check for Trazabilidad de lotes
      const lotesItem = items.find(
        (i) => i.id.includes('trazabilidad') || i.title.toLowerCase().includes('trazabilidad') || i.description.toLowerCase().includes('lote')
      );
      expect(lotesItem).toBeDefined();

      // Check for Fichas técnicas SDS
      const sdsItem = items.find(
        (i) => i.id.includes('sds') || i.title.toLowerCase().includes('sds') || i.description.toLowerCase().includes('sds') || i.description.toLowerCase().includes('fichas')
      );
      expect(sdsItem).toBeDefined();

      // Check for Entrega segura en obra
      const entregaItem = items.find(
        (i) => i.id.includes('obra') || i.title.toLowerCase().includes('obra') || i.description.toLowerCase().includes('descarga') || i.description.toLowerCase().includes('entrega')
      );
      expect(entregaItem).toBeDefined();
    });
  });
});
