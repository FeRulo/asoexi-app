import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  generateSectorQuoteWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
} from '@/lib/whatsapp';
import {
  SECTOR_TECHNICAL_CONTENT,
  getSectorTechnicalContent,
  getSectorBrands,
  EXPECTED_TRACTOR_BRANDS_BY_SECTOR,
} from '@/lib/brands';
import { brandSchema, type Brand, type SectorId } from '@/content.config';

describe('Story 2.3: Hubs de Sectores Industriales y Contenido Semántico de Mantenimiento', () => {
  const OFFICIAL_PHONE_DIGITS = '573014191344';
  const brandsDir = path.resolve(process.cwd(), 'src/content/brands');

  // Load on-disk brands
  const brandFiles = fs.readdirSync(brandsDir).filter((file) => file.endsWith('.json'));
  const allLoadedBrands: Brand[] = brandFiles.map((file) => {
    const filePath = path.join(brandsDir, file);
    return brandSchema.parse(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
  });

  describe('1. Generador de URLs de WhatsApp para Cotización de Lista Multimarca por Sector', () => {
    it('debe generar enlace wa.me apuntando a la Línea Corporativa Oficial (+57 301 419 1344)', () => {
      const url = generateSectorQuoteWhatsAppUrl('Sector Eléctrico Industrial');
      expect(url).toContain(`https://wa.me/${OFFICIAL_PHONE_DIGITS}`);
      expect(url).not.toContain('3044013761');
    });

    it('debe incluir el nombre del sector y el contexto de cotización multimarca en el mensaje pre-cargado', () => {
      const sectorName = 'Sector Eléctrico Industrial';
      const url = generateSectorQuoteWhatsAppUrl(sectorName);
      const parsed = new URL(url);
      const textParam = parsed.searchParams.get('text');

      expect(textParam).toBeDefined();
      expect(textParam).toContain('lista multimarca');
      expect(textParam).toContain(sectorName);
      expect(textParam).toContain('cotización');
    });

    it('debe codificar correctamente caracteres especiales y ampersands (&)', () => {
      const sectorName = 'Sector Ferretero & Construcción';
      const url = generateSectorQuoteWhatsAppUrl(sectorName);
      const parsed = new URL(url);
      const textParam = parsed.searchParams.get('text');

      expect(textParam).toContain('Sector Ferretero & Construcción');
      expect(url).toContain(encodeURIComponent('Sector Ferretero & Construcción'));
    });

    it('debe realizar fallback seguro a DEFAULT_WHATSAPP_MESSAGE si sectorName es nulo, indefinido o vacío', () => {
      const urlEmpty = generateSectorQuoteWhatsAppUrl('');
      expect(urlEmpty).toContain(`https://wa.me/${OFFICIAL_PHONE_DIGITS}`);
      expect(urlEmpty).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));

      const urlWhitespace = generateSectorQuoteWhatsAppUrl('   ');
      expect(urlWhitespace).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));

      const urlNull = generateSectorQuoteWhatsAppUrl(null);
      expect(urlNull).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));

      const urlUndefined = generateSectorQuoteWhatsAppUrl(undefined);
      expect(urlUndefined).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
    });

    it('debe generar URLs válidas para los 3 sectores industriales oficiales', () => {
      const sectors = [
        'Sector Eléctrico Industrial',
        'Sector Ferretero & Construcción',
        'Sector Hidráulico & Pinturas',
      ];

      for (const sector of sectors) {
        const url = generateSectorQuoteWhatsAppUrl(sector);
        expect(url.startsWith(`https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=`)).toBe(true);
        expect(decodeURIComponent(url)).toContain(sector);
        expect(decodeURIComponent(url)).toContain('lista multimarca');
      }
    });

    it('debe resolver el nombre oficial cuando se le pasa un SectorId literal', () => {
      const urlElectrico = generateSectorQuoteWhatsAppUrl('electrico');
      expect(decodeURIComponent(urlElectrico)).toContain('Sector Eléctrico Industrial');

      const urlFerretero = generateSectorQuoteWhatsAppUrl('ferretero-construccion');
      expect(decodeURIComponent(urlFerretero)).toContain('Sector Ferretero & Construcción');

      const urlHidraulico = generateSectorQuoteWhatsAppUrl('hidraulico-pinturas');
      expect(decodeURIComponent(urlHidraulico)).toContain('Sector Hidráulico & Pinturas');
    });
  });

  describe('2. Integridad de Contenido Semántico B2B y Mantenimiento (SECTOR_TECHNICAL_CONTENT)', () => {
    const requiredSectors: SectorId[] = ['electrico', 'ferretero-construccion', 'hidraulico-pinturas'];

    it('debe contener metadata técnica completa para los 3 sectores industriales', () => {
      requiredSectors.forEach((sectorId) => {
        const content = SECTOR_TECHNICAL_CONTENT[sectorId];
        expect(content).toBeDefined();
        expect(content.id).toBe(sectorId);
        expect(content.name).toBeDefined();
        expect(content.slug).toBeDefined();
        expect(content.h1).toBeDefined();
        expect(content.subtitle).toBeDefined();
        expect(content.maintenanceFocus).toBeDefined();
        expect(content.technicalCategoriesHeading).toBeDefined();
        expect(content.technicalCategories.length).toBeGreaterThanOrEqual(3);
        expect(content.onDemandNotice).toBeDefined();
        expect(content.onDemandNotice.heading).toBeDefined();
        expect(content.onDemandNotice.description).toBeDefined();
        expect(content.seo).toBeDefined();
        expect(content.seo.title).toBeDefined();
        expect(content.seo.description).toBeDefined();
        expect(content.seo.canonicalPath).toBeDefined();
      });
    });

    it('Sector Eléctrico: debe incorporar términos B2B obligatorios (cableado estructurado, breakers, RETIE, canalización)', () => {
      const electric = SECTOR_TECHNICAL_CONTENT['electrico'];
      const serialized = JSON.stringify(electric).toLowerCase();

      expect(serialized).toContain('cableado estructurado');
      expect(serialized).toContain('breakers');
      expect(serialized).toContain('retie');
      expect(serialized).toContain('canalización');
      expect(serialized).toContain('gabinetes');
    });

    it('Sector Ferretero & Construcción: debe incorporar términos B2B obligatorios (herramientas de potencia, abrasivos, fijaciones, masillas, drywall)', () => {
      const ferretero = SECTOR_TECHNICAL_CONTENT['ferretero-construccion'];
      const serialized = JSON.stringify(ferretero).toLowerCase();

      expect(serialized).toContain('herramientas de potencia');
      expect(serialized).toContain('masillas');
      expect(serialized).toContain('fijaciones');
      expect(serialized).toContain('drywall');
      expect(serialized).toContain('discos de corte');
    });

    it('Sector Hidráulico & Pinturas: debe incorporar términos B2B obligatorios (tuberías de planta, fluidos a presión, recubrimientos epóxicos, impermeabilización)', () => {
      const hidraulico = SECTOR_TECHNICAL_CONTENT['hidraulico-pinturas'];
      const serialized = JSON.stringify(hidraulico).toLowerCase();

      expect(serialized).toContain('tuberías de planta');
      expect(serialized).toContain('fluidos a presión');
      expect(serialized).toContain('recubrimientos epóxicos');
      expect(serialized).toContain('impermeabilización');
      expect(serialized).toContain('alto tráfico');
    });

    it('el aviso de disponibilidad bajo pedido debe aclarar el despacho formal de marcas secundarias y referencias no visibles', () => {
      requiredSectors.forEach((sectorId) => {
        const notice = SECTOR_TECHNICAL_CONTENT[sectorId].onDemandNotice;
        const text = (notice.heading + ' ' + notice.description).toLowerCase();

        expect(text).toContain('pedido');
        expect(text).toContain('fábrica');
        expect(text).toContain('cotización');
      });
    });

    it('getSectorTechnicalContent debe resolver el contenido por sector o retornar null defensivamente ante sectores desconocidos', () => {
      expect(getSectorTechnicalContent('electrico')?.id).toBe('electrico');
      expect(getSectorTechnicalContent('ferretero-construccion')?.id).toBe('ferretero-construccion');
      expect(getSectorTechnicalContent('hidraulico-pinturas')?.id).toBe('hidraulico-pinturas');

      expect(getSectorTechnicalContent('sector-inexistente')).toBeNull();
      expect(getSectorTechnicalContent(null as any)).toBeNull();
      expect(getSectorTechnicalContent(undefined as any)).toBeNull();
      expect(getSectorTechnicalContent('')).toBeNull();
    });
  });

  describe('3. Resolución y Ordenamiento de Marcas por Sector (Tractoras Primero)', () => {
    it('getSectorBrands debe filtrar y ordenar marcas priorizando las marcas tractoras en orden canónico', () => {
      const electricBrands = getSectorBrands(allLoadedBrands, 'electrico');
      expect(electricBrands).toHaveLength(3);
      expect(electricBrands.map((b) => b.id)).toEqual(EXPECTED_TRACTOR_BRANDS_BY_SECTOR['electrico']);

      const ferreteroBrands = getSectorBrands(allLoadedBrands, 'ferretero-construccion');
      expect(ferreteroBrands).toHaveLength(4);
      expect(ferreteroBrands.map((b) => b.id)).toEqual(EXPECTED_TRACTOR_BRANDS_BY_SECTOR['ferretero-construccion']);

      const hidraulicoBrands = getSectorBrands(allLoadedBrands, 'hidraulico-pinturas');
      expect(hidraulicoBrands).toHaveLength(3);
      expect(hidraulicoBrands.map((b) => b.id)).toEqual(EXPECTED_TRACTOR_BRANDS_BY_SECTOR['hidraulico-pinturas']);
    });

    it('debe posicionar marcas tractoras antes que marcas secundarias', () => {
      const mixedBrands = [
        {
          id: 'marca-secundaria-z',
          name: 'Z Insumos Eléctricos',
          sector: 'electrico' as const,
          isTractor: false,
          description: 'Insumos secundarios',
          applicationNotes: 'General',
        },
        ...allLoadedBrands.filter((b) => b.sector === 'electrico'),
        {
          id: 'marca-secundaria-a',
          name: 'A Insumos Eléctricos',
          sector: 'electrico' as const,
          isTractor: false,
          description: 'Insumos secundarios',
          applicationNotes: 'General',
        },
      ];

      const sorted = getSectorBrands(mixedBrands, 'electrico');
      expect(sorted).toHaveLength(5);

      // First 3 should be tractor brands in canonical order
      expect(sorted[0].id).toBe('panduit');
      expect(sorted[1].id).toBe('centelsa');
      expect(sorted[2].id).toBe('sylvania');

      // Secondary brands should be positioned after tractor brands
      expect(sorted[3].id).toBe('marca-secundaria-a');
      expect(sorted[4].id).toBe('marca-secundaria-z');
    });

    it('getSectorBrands debe manejar defensivamente arreglos vacíos o con valores nulos', () => {
      const result = getSectorBrands([null, undefined] as any, 'electrico');
      expect(result).toEqual([]);

      const invalidSector = getSectorBrands(allLoadedBrands, 'invalido' as any);
      expect(invalidSector).toEqual([]);
    });

    it('debe soportar objetos Astro CollectionEntry<\'brands\'> con estructura { id, data }', () => {
      const collectionEntries = allLoadedBrands
        .filter((b) => b.sector === 'electrico')
        .map((b) => ({ id: b.id, data: b }));

      const sorted = getSectorBrands(collectionEntries as any, 'electrico');
      expect(sorted).toHaveLength(3);
      expect(sorted.map((item: any) => item.data.id)).toEqual(['panduit', 'centelsa', 'sylvania']);
    });
  });
});
