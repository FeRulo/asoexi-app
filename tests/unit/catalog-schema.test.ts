import { describe, it, expect } from 'vitest';
import { brandSchema, categorySchema, SECTOR_IDS } from '@/content.config';
import fs from 'fs';
import path from 'path';

describe('Catalog Zod Schemas & Content Collections Integrity (TDD - Story 2.1)', () => {
  describe('brandSchema Unit Tests', () => {
    it('should validate a valid brand object with full details', () => {
      const validBrand = {
        id: 'panduit',
        name: 'Panduit',
        sector: 'electrico',
        isTractor: true,
        logo: '/brands/panduit.svg',
        description: 'Líder en infraestructura física, eléctrica y de red para centros de datos y plantas.',
        applicationNotes: 'Soluciones de cableado estructurado, amarras y organizadores.',
        pdfCatalogUrl: '/catalogs/panduit-2026.pdf',
      };

      const result = brandSchema.parse(validBrand);
      expect(result).toEqual(validBrand);
    });

    it('should validate a valid brand with null/undefined logo (EDGE-2 fallback)', () => {
      const brandWithoutLogo = {
        id: 'generic-brand',
        name: 'Generic Brand',
        sector: 'ferretero-construccion',
        isTractor: false,
        logo: null,
        description: 'Herramientas manuales de uso pesado.',
        applicationNotes: 'Mantenimiento locativo.',
        pdfCatalogUrl: null,
      };

      const result = brandSchema.parse(brandWithoutLogo);
      expect(result.logo).toBeNull();
      expect(result.pdfCatalogUrl).toBeNull();

      // Also without logo and pdfCatalogUrl specified (undefined / omitted)
      const brandOmitted = {
        id: 'omitted-brand',
        name: 'Omitted Brand',
        sector: 'hidraulico-pinturas',
        isTractor: false,
        description: 'Pinturas industriales.',
        applicationNotes: 'Recubrimiento epóxico.',
      };
      const parsedOmitted = brandSchema.parse(brandOmitted);
      expect(parsedOmitted.id).toBe('omitted-brand');
    });

    it('should accept empty string as logo (EDGE-2)', () => {
      const brandEmptyLogo = {
        id: 'empty-logo-brand',
        name: 'Empty Logo Brand',
        sector: 'electrico',
        isTractor: false,
        logo: '',
        description: 'Cintas aislantes.',
        applicationNotes: 'Empalmes eléctricos.',
      };
      const result = brandSchema.parse(brandEmptyLogo);
      expect(result.logo).toBe('');
    });

    it('should reject invalid sector values not defined in SECTOR_IDS', () => {
      const invalidSectorBrand = {
        id: 'bad-sector',
        name: 'Bad Sector Brand',
        sector: 'automotriz',
        isTractor: false,
        description: 'Repuestos para carros.',
        applicationNotes: 'Mecánica.',
      };

      expect(() => brandSchema.parse(invalidSectorBrand)).toThrow();
    });

    it('should reject when mandatory fields are missing', () => {
      // Missing name
      expect(() =>
        brandSchema.parse({
          id: 'test',
          sector: 'electrico',
          isTractor: true,
          description: 'Desc',
          applicationNotes: 'Notes',
        })
      ).toThrow();

      // Missing description
      expect(() =>
        brandSchema.parse({
          id: 'test',
          name: 'Test',
          sector: 'electrico',
          isTractor: true,
          applicationNotes: 'Notes',
        })
      ).toThrow();

      // Missing isTractor
      expect(() =>
        brandSchema.parse({
          id: 'test',
          name: 'Test',
          sector: 'electrico',
          description: 'Desc',
          applicationNotes: 'Notes',
        })
      ).toThrow();

      // Missing id
      expect(() =>
        brandSchema.parse({
          name: 'Test',
          sector: 'electrico',
          isTractor: true,
          description: 'Desc',
          applicationNotes: 'Notes',
        })
      ).toThrow();
    });
  });

  describe('categorySchema Unit Tests', () => {
    it('should validate valid industrial sector category objects', () => {
      const validCategory = {
        id: 'electrico',
        name: 'Sector Eléctrico Industrial',
        slug: 'sector-electrico',
        description: 'Conductores certificados RETIE, canalización, protección y cableado estructurado.',
        shortDescription: 'Cables, breakers, canalización y conectividad',
        icon: 'bolt',
      };

      const result = categorySchema.parse(validCategory);
      expect(result.id).toBe('electrico');
      expect(result.slug).toBe('sector-electrico');
    });

    it('should reject invalid sector IDs for categories', () => {
      const invalidCat = {
        id: 'textil',
        name: 'Sector Textil',
        slug: 'sector-textil',
        description: 'Telas industriales',
      };

      expect(() => categorySchema.parse(invalidCat)).toThrow();
    });

    it('should reject category missing mandatory fields', () => {
      expect(() =>
        categorySchema.parse({
          id: 'electrico',
          description: 'Desc',
        })
      ).toThrow();
    });
  });

  describe('Content Files On-Disk Validation (src/content/)', () => {
    const brandsDir = path.resolve(process.cwd(), 'src/content/brands');
    const categoriesDir = path.resolve(process.cwd(), 'src/content/categories');

    it('should validate all category JSON files on disk against categorySchema', () => {
      expect(fs.existsSync(categoriesDir)).toBe(true);
      const files = fs.readdirSync(categoriesDir).filter((f) => f.endsWith('.json'));
      expect(files.length).toBe(3);

      const parsedIds: string[] = [];
      for (const file of files) {
        const filePath = path.join(categoriesDir, file);
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const parsed = categorySchema.parse(raw);
        parsedIds.push(parsed.id);
      }

      for (const sectorId of SECTOR_IDS) {
        expect(parsedIds).toContain(sectorId);
      }
    });

    it('should validate all 10 tractor brands exist and parse cleanly against brandSchema', () => {
      expect(fs.existsSync(brandsDir)).toBe(true);
      const files = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.json'));
      expect(files.length).toBeGreaterThanOrEqual(10);

      const requiredTractorBrandIds = [
        // Sector Eléctrico
        'panduit',
        'centelsa',
        'sylvania',
        // Sector Ferretero y Construcción
        'supermastick',
        'stanley',
        'dewalt',
        'truper',
        // Sector Hidráulico y Pinturas
        'pavco-wavin',
        'sika',
        'pintuco',
      ];

      for (const id of requiredTractorBrandIds) {
        const filePath = path.join(brandsDir, `${id}.json`);
        expect(fs.existsSync(filePath), `Brand file ${id}.json must exist`).toBe(true);

        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const parsed = brandSchema.parse(raw);
        expect(parsed.id).toBe(id);
        expect(parsed.isTractor).toBe(true);
        expect(SECTOR_IDS).toContain(parsed.sector);
      }
    });
  });
});
