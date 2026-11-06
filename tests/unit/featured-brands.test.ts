import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { brandSchema, type Brand } from '@/content.config';
import {
  SECTORS_META,
  EXPECTED_TRACTOR_BRANDS_BY_SECTOR,
  ALL_EXPECTED_TRACTOR_BRAND_IDS,
  filterTractorBrands,
  groupBrandsBySector,
  getBrandSiloUrl,
} from '@/lib/brands';

describe('Story 2.2: Vitrina Destacada de las Top 10 Marcas Tractoras en Home', () => {
  const brandsDir = path.resolve(process.cwd(), 'src/content/brands');

  // Load all on-disk brand JSON files
  const brandFiles = fs.readdirSync(brandsDir).filter((file) => file.endsWith('.json'));
  const allLoadedBrands: Brand[] = brandFiles.map((file) => {
    const filePath = path.join(brandsDir, file);
    return brandSchema.parse(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
  });

  describe('1. Verificación del Inventario Corporativo de Marcas Tractoras (10 Marcas)', () => {
    it('debe existir exactamente 10 marcas tractoras con isTractor: true en el inventario', () => {
      const tractorBrands = allLoadedBrands.filter((b) => b.isTractor);
      expect(tractorBrands).toHaveLength(10);
    });

    it('cada una de las 10 marcas tractoras requeridas debe existir en la colección', () => {
      const tractorBrandIds = allLoadedBrands.filter((b) => b.isTractor).map((b) => b.id);
      expect(ALL_EXPECTED_TRACTOR_BRAND_IDS).toHaveLength(10);

      for (const expectedId of ALL_EXPECTED_TRACTOR_BRAND_IDS) {
        expect(tractorBrandIds).toContain(expectedId);
      }
    });

    it('todas las marcas tractoras deben tener campos obligatorios completos y válidos', () => {
      const tractorBrands = allLoadedBrands.filter((b) => b.isTractor);
      tractorBrands.forEach((brand) => {
        expect(brand.id).toBeDefined();
        expect(brand.id.trim().length).toBeGreaterThan(0);
        expect(brand.name).toBeDefined();
        expect(brand.name.trim().length).toBeGreaterThan(0);
        expect(brand.sector).toBeDefined();
        expect(['electrico', 'ferretero-construccion', 'hidraulico-pinturas']).toContain(brand.sector);
        expect(brand.description).toBeDefined();
        expect(brand.description.trim().length).toBeGreaterThan(10);
        expect(brand.applicationNotes).toBeDefined();
        expect(brand.applicationNotes.trim().length).toBeGreaterThan(5);
        expect(brand.isTractor).toBe(true);
      });
    });
  });

  describe('2. Clasificación y Distribución Estricta por Sectores Industriales', () => {
    it('el Sector Eléctrico debe contener exactamente 3 marcas tractoras: Panduit, Centelsa by Nexans, Sylvania', () => {
      const electricBrands = allLoadedBrands.filter((b) => b.isTractor && b.sector === 'electrico');
      expect(electricBrands).toHaveLength(EXPECTED_TRACTOR_BRANDS_BY_SECTOR['electrico'].length);

      const electricIds = electricBrands.map((b) => b.id);
      expect(electricIds).toEqual(expect.arrayContaining([...EXPECTED_TRACTOR_BRANDS_BY_SECTOR['electrico']]));

      const panduit = electricBrands.find((b) => b.id === 'panduit');
      expect(panduit?.name).toBe('Panduit');

      const centelsa = electricBrands.find((b) => b.id === 'centelsa');
      expect(centelsa?.name).toBe('Centelsa by Nexans');

      const sylvania = electricBrands.find((b) => b.id === 'sylvania');
      expect(sylvania?.name).toBe('Sylvania');
    });

    it('el Sector Ferretero & Construcción debe contener exactamente 4 marcas tractoras: Supermastick PR, Stanley, DeWalt, Truper', () => {
      const ferreteroBrands = allLoadedBrands.filter(
        (b) => b.isTractor && b.sector === 'ferretero-construccion'
      );
      expect(ferreteroBrands).toHaveLength(EXPECTED_TRACTOR_BRANDS_BY_SECTOR['ferretero-construccion'].length);

      const ferreteroIds = ferreteroBrands.map((b) => b.id);
      expect(ferreteroIds).toEqual(
        expect.arrayContaining([...EXPECTED_TRACTOR_BRANDS_BY_SECTOR['ferretero-construccion']])
      );

      const supermastick = ferreteroBrands.find((b) => b.id === 'supermastick');
      expect(supermastick?.name).toBe('Supermastick PR');

      const stanley = ferreteroBrands.find((b) => b.id === 'stanley');
      expect(stanley?.name).toBe('Stanley');

      const dewalt = ferreteroBrands.find((b) => b.id === 'dewalt');
      expect(dewalt?.name).toBe('DeWalt');

      const truper = ferreteroBrands.find((b) => b.id === 'truper');
      expect(truper?.name).toBe('Truper');
    });

    it('el Sector Hidráulico & Pinturas debe contener exactamente 3 marcas tractoras: Pavco Wavin, Sika, Pintuco', () => {
      const hidraulicoBrands = allLoadedBrands.filter(
        (b) => b.isTractor && b.sector === 'hidraulico-pinturas'
      );
      expect(hidraulicoBrands).toHaveLength(EXPECTED_TRACTOR_BRANDS_BY_SECTOR['hidraulico-pinturas'].length);

      const hidraulicoIds = hidraulicoBrands.map((b) => b.id);
      expect(hidraulicoIds).toEqual(
        expect.arrayContaining([...EXPECTED_TRACTOR_BRANDS_BY_SECTOR['hidraulico-pinturas']])
      );

      const pavco = hidraulicoBrands.find((b) => b.id === 'pavco-wavin');
      expect(pavco?.name).toBe('Pavco Wavin');

      const sika = hidraulicoBrands.find((b) => b.id === 'sika');
      expect(sika?.name).toBe('Sika');

      const pintuco = hidraulicoBrands.find((b) => b.id === 'pintuco');
      expect(pintuco?.name).toBe('Pintuco');
    });
  });

  describe('3. Funciones Utilitarias de Filtrado y Agrupamiento Semántico', () => {
    it('filterTractorBrands debe filtrar exclusivamente marcas con isTractor: true', () => {
      const mixedList = [
        ...allLoadedBrands,
        {
          id: 'marca-no-tractora',
          name: 'Marca Regular',
          sector: 'electrico' as const,
          isTractor: false,
          description: 'Insumo secundario',
          applicationNotes: 'Uso general',
        },
      ];

      const filtered = filterTractorBrands(mixedList);
      expect(filtered).toHaveLength(10);
      expect(filtered.every((b) => b.isTractor)).toBe(true);
    });

    it('groupBrandsBySector debe agrupar las marcas en los 3 sectores en orden canónico', () => {
      const tractorBrands = filterTractorBrands(allLoadedBrands);
      const grouped = groupBrandsBySector(tractorBrands);

      expect(grouped).toHaveLength(3);
      expect(grouped[0].sector.id).toBe('electrico');
      expect(grouped[0].brands).toHaveLength(3);

      expect(grouped[1].sector.id).toBe('ferretero-construccion');
      expect(grouped[1].brands).toHaveLength(4);

      expect(grouped[2].sector.id).toBe('hidraulico-pinturas');
      expect(grouped[2].brands).toHaveLength(3);
    });

    it('filterTractorBrands debe manejar defensivamente elementos null o undefined sin lanzar errores', () => {
      const itemsWithNulls = [null, undefined, ...allLoadedBrands, null, undefined];
      const filtered = filterTractorBrands(itemsWithNulls as any);
      expect(filtered).toHaveLength(10);
      expect(filtered.every((b) => b && b.isTractor)).toBe(true);
    });

    it('groupBrandsBySector debe manejar defensivamente elementos null o undefined sin lanzar errores', () => {
      const itemsWithNulls = [null, undefined, ...filterTractorBrands(allLoadedBrands), null];
      const grouped = groupBrandsBySector(itemsWithNulls as any);
      expect(grouped).toHaveLength(3);
      expect(grouped[0].brands).toHaveLength(3);
      expect(grouped[1].brands).toHaveLength(4);
      expect(grouped[2].brands).toHaveLength(3);
    });

    it('debe soportar objetos Astro CollectionEntry<\'brands\'> con estructura { id, data }', () => {
      const collectionEntryMocks = [
        {
          id: 'sylvania',
          data: {
            id: 'sylvania',
            name: 'Sylvania',
            sector: 'electrico' as const,
            isTractor: true,
            description: 'Iluminación LED',
            applicationNotes: 'Bodegas',
          },
        },
        {
          id: 'panduit',
          data: {
            id: 'panduit',
            name: 'Panduit',
            sector: 'electrico' as const,
            isTractor: true,
            description: 'Conectividad',
            applicationNotes: 'Centros de datos',
          },
        },
        {
          id: 'centelsa',
          data: {
            id: 'centelsa',
            name: 'Centelsa by Nexans',
            sector: 'electrico' as const,
            isTractor: true,
            description: 'Cables',
            applicationNotes: 'Redes',
          },
        },
      ];

      const filtered = filterTractorBrands(collectionEntryMocks as any);
      expect(filtered).toHaveLength(3);

      const grouped = groupBrandsBySector(collectionEntryMocks as any);
      const electricSector = grouped.find((g) => g.sector.id === 'electrico');
      expect(electricSector).toBeDefined();
      expect(electricSector?.brands).toHaveLength(3);

      // Verify canonical sorting applied to CollectionEntry structure
      const brandIds = electricSector!.brands.map((b: any) => b.id);
      expect(brandIds).toEqual(['panduit', 'centelsa', 'sylvania']);
    });

    it('groupBrandsBySector debe ordenar las marcas en el orden canónico estricto dentro de cada sector', () => {
      // Reverse brand order input to ensure sorting logic takes precedence
      const reversedBrands = [...allLoadedBrands].reverse();
      const grouped = groupBrandsBySector(filterTractorBrands(reversedBrands));

      const electricIds = grouped[0].brands.map((b) => b.id);
      expect(electricIds).toEqual(['panduit', 'centelsa', 'sylvania']);

      const ferreteroIds = grouped[1].brands.map((b) => b.id);
      expect(ferreteroIds).toEqual(['supermastick', 'stanley', 'dewalt', 'truper']);

      const hidraulicoIds = grouped[2].brands.map((b) => b.id);
      expect(hidraulicoIds).toEqual(['pavco-wavin', 'sika', 'pintuco']);
    });

    it('cada sector agrupado debe incluir sus clases de borde industrial y slugs canónicos', () => {
      expect(SECTORS_META.electrico.accentBorderClass).toBe('border-t-sector-electrico');
      expect(SECTORS_META.electrico.slug).toBe('sector-electrico');

      expect(SECTORS_META['ferretero-construccion'].accentBorderClass).toBe('border-t-sector-ferretero');
      expect(SECTORS_META['ferretero-construccion'].slug).toBe('sector-ferretero-construccion');

      expect(SECTORS_META['hidraulico-pinturas'].accentBorderClass).toBe('border-t-sector-hidraulico');
      expect(SECTORS_META['hidraulico-pinturas'].slug).toBe('sector-hidraulico-pinturas');
    });
  });

  describe('4. Enlaces de Silo SEO y Resiliencia Defensiva (EDGE-2)', () => {
    it('getBrandSiloUrl debe normalizar identificadores en mayúsculas a minúsculas', () => {
      expect(getBrandSiloUrl('PANDUIT')).toBe('/distribuidor-panduit-colombia');
      expect(getBrandSiloUrl('  Centelsa  ')).toBe('/distribuidor-centelsa-colombia');
      expect(getBrandSiloUrl('DEWALT')).toBe('/distribuidor-dewalt-colombia');
    });

    it('getBrandSiloUrl debe generar la ruta canónica /distribuidor-[id]-colombia', () => {
      expect(getBrandSiloUrl('panduit')).toBe('/distribuidor-panduit-colombia');
      expect(getBrandSiloUrl('centelsa')).toBe('/distribuidor-centelsa-colombia');
      expect(getBrandSiloUrl('supermastick')).toBe('/distribuidor-supermastick-colombia');
      expect(getBrandSiloUrl('pavco-wavin')).toBe('/distribuidor-pavco-wavin-colombia');
    });

    it('getBrandSiloUrl debe retornar fallback defensivo "#" si id es nulo, indefinido o vacío', () => {
      expect(getBrandSiloUrl(null)).toBe('#');
      expect(getBrandSiloUrl(undefined)).toBe('#');
      expect(getBrandSiloUrl('')).toBe('#');
      expect(getBrandSiloUrl('   ')).toBe('#');
    });

    it('todas las 10 marcas tractoras deben generar una ruta canónica válida sin "#"', () => {
      ALL_EXPECTED_TRACTOR_BRAND_IDS.forEach((id) => {
        const siloUrl = getBrandSiloUrl(id);
        expect(siloUrl).toMatch(/^\/distribuidor-[a-z0-9-]+-colombia$/);
      });
    });
  });
});
