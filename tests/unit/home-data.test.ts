import { describe, it, expect } from 'vitest';
import {
  VALUE_PILLARS,
  CORPORATE_CLIENTS,
  type ValuePillar,
  type CorporateClient,
} from '@/lib/constants';

describe('Home Data Contracts (Value Pillars & Corporate Clients)', () => {
  describe('Value Pillars (5 Pilares de Confianza Contractuales)', () => {
    it('should have exactly 5 contractual value pillars', () => {
      expect(VALUE_PILLARS).toHaveLength(5);
    });

    it('each pillar should satisfy the ValuePillar interface contract', () => {
      VALUE_PILLARS.forEach((pillar: ValuePillar) => {
        expect(pillar.id).toBeDefined();
        expect(pillar.id.trim().length).toBeGreaterThan(0);
        expect(pillar.title).toBeDefined();
        expect(pillar.title.trim().length).toBeGreaterThan(0);
        expect(pillar.shortTitle).toBeDefined();
        expect(pillar.shortTitle.trim().length).toBeGreaterThan(0);
        expect(pillar.description).toBeDefined();
        expect(pillar.description.trim().length).toBeGreaterThan(0);
        expect(pillar.highlight).toBeDefined();
        expect(pillar.highlight.trim().length).toBeGreaterThan(0);
        expect(pillar.icon).toBeDefined();
        expect(pillar.icon.trim().length).toBeGreaterThan(0);
      });
    });

    it('each pillar should have a unique id', () => {
      const ids = VALUE_PILLARS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include delivery pillar (24-48h Bogotá / 6h urgencias)', () => {
      const delivery = VALUE_PILLARS.find(
        (p) =>
          p.id.includes('entrega') ||
          p.title.toLowerCase().includes('entrega') ||
          p.description.includes('24-48h') ||
          p.description.includes('6h')
      );
      expect(delivery).toBeDefined();
      expect(delivery?.title).toMatch(/24-48h/i);
      expect(delivery?.description).toMatch(/24/);
      expect(delivery?.description).toMatch(/6\s*h/i);
    });

    it('should include commercial credit pillar (45 días con RUT)', () => {
      const credit = VALUE_PILLARS.find(
        (p) =>
          p.id.includes('credito') ||
          p.title.toLowerCase().includes('crédito') ||
          p.description.includes('45 días')
      );
      expect(credit).toBeDefined();
      expect(credit?.title).toMatch(/45\s*días/i);
      expect(credit?.description).toMatch(/45\s*días/i);
      expect(credit?.description).toMatch(/RUT/i);
    });

    it('should include 100% original brands pillar with factory warranty and technical sheets', () => {
      const brands = VALUE_PILLARS.find(
        (p) =>
          p.id.includes('marcas') ||
          p.title.toLowerCase().includes('originales') ||
          p.description.includes('originales')
      );
      expect(brands).toBeDefined();
      expect(brands?.title).toMatch(/100%\s*originales/i);
      expect(brands?.description).toMatch(/fábrica|certificados|conformidad|fichas/i);
    });

    it('should include minimum orders pillar starting at $50k Bogotá', () => {
      const minimums = VALUE_PILLARS.find(
        (p) =>
          p.id.includes('minimo') ||
          p.title.toLowerCase().includes('mínimo') ||
          p.description.includes('50.000') ||
          p.description.includes('50k')
      );
      expect(minimums).toBeDefined();
      expect(minimums?.title).toMatch(/50\.000|50k/i);
      expect(minimums?.description).toMatch(/Bogotá/i);
      expect(minimums?.description).toMatch(/50\.000/i);
    });

    it('should include 100% delivery logistics without counter sale nor warehouse pickup', () => {
      const logistics = VALUE_PILLARS.find(
        (p) =>
          p.id.includes('logistica') ||
          p.title.toLowerCase().includes('domicilio') ||
          p.description.includes('mostrador')
      );
      expect(logistics).toBeDefined();
      expect(logistics?.title).toMatch(/100%\s*a\s*domicilio|logística/i);
      expect(logistics?.description).toMatch(/obra|bodega/i);
      expect(logistics?.description).toMatch(/sin\s*venta\s*presencial|sin\s*mostrador|ni\s*retiro\s*en\s*bodega/i);
    });
  });

  describe('Corporate Clients (Social Proof / Clientes Corporativos)', () => {
    it('should have exactly 5 prominent corporate clients', () => {
      expect(CORPORATE_CLIENTS).toHaveLength(5);
    });

    it('each client should satisfy the CorporateClient interface contract', () => {
      CORPORATE_CLIENTS.forEach((client: CorporateClient) => {
        expect(client.id).toBeDefined();
        expect(client.id.trim().length).toBeGreaterThan(0);
        expect(client.name).toBeDefined();
        expect(client.name.trim().length).toBeGreaterThan(0);
        expect(client.sector).toBeDefined();
        expect(client.sector.trim().length).toBeGreaterThan(0);
        expect(client.highlight).toBeDefined();
        expect(client.highlight.trim().length).toBeGreaterThan(0);
        expect(client.logoAlt).toBeDefined();
        expect(client.logoAlt.trim().length).toBeGreaterThan(0);
      });
    });

    it('each corporate client should have a unique id', () => {
      const ids = CORPORATE_CLIENTS.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include Casalimpia', () => {
      const casalimpia = CORPORATE_CLIENTS.find(
        (c) => c.id === 'casalimpia' || c.name.toLowerCase().includes('casalimpia')
      );
      expect(casalimpia).toBeDefined();
      expect(casalimpia?.name).toContain('Casalimpia');
    });

    it('should include Unicentro', () => {
      const unicentro = CORPORATE_CLIENTS.find(
        (c) => c.id === 'unicentro' || c.name.toLowerCase().includes('unicentro')
      );
      expect(unicentro).toBeDefined();
      expect(unicentro?.name).toContain('Unicentro');
    });

    it('should include Andino', () => {
      const andino = CORPORATE_CLIENTS.find(
        (c) => c.id === 'andino' || c.name.toLowerCase().includes('andino')
      );
      expect(andino).toBeDefined();
      expect(andino?.name).toContain('Andino');
    });

    it('should include Winner Group', () => {
      const winner = CORPORATE_CLIENTS.find(
        (c) => c.id === 'winner-group' || c.name.toLowerCase().includes('winner')
      );
      expect(winner).toBeDefined();
      expect(winner?.name).toContain('Winner Group');
    });

    it('should include Multiplika', () => {
      const multiplika = CORPORATE_CLIENTS.find(
        (c) => c.id === 'multiplika' || c.name.toLowerCase().includes('multiplika')
      );
      expect(multiplika).toBeDefined();
      expect(multiplika?.name).toContain('Multiplika');
    });
  });
});
