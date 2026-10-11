import { describe, it, expect } from 'vitest';
import {
  COMPANY_INFO,
  CONTACT_PHONES,
  COMMERCIAL_ADVISORS,
  OFFICIAL_EMAILS,
  BUSINESS_HOURS,
  NAVIGATION_LINKS,
  LOGISTIC_NOTICE,
  LOGISTIC_HERO_PROPOSITION,
  QUOTE_SLA_NOTICE,
  MINIMUM_ORDER_COP,
  VALUE_PILLARS,
} from '@/lib/constants';

describe('Corporate Constants & Identity Contracts (ASOEXI S.A.S.)', () => {
  it('should define official company identity and tax details', () => {
    expect(COMPANY_INFO.name).toBe('ASOEXI S.A.S.');
    expect(COMPANY_INFO.commercialName).toBe('ASOEXI');
    expect(COMPANY_INFO.legalName).toBe('ASOEXI S.A.S.');
    expect(COMPANY_INFO.nit).toBe('900480460-8');
    expect(COMPANY_INFO.address).toContain('Carrera 55 A No. 51 A 28 Sur');
    expect(COMPANY_INFO.city).toBe('Bogotá');
  });

  it('should enforce the exact mandatory logistics microcopy without store counter', () => {
    const expectedNotice =
      'Sede administrativa y despacho logístico a domicilio (sin venta presencial por mostrador ni retiro en bodega)';
    expect(LOGISTIC_NOTICE).toBe(expectedNotice);
    expect(COMPANY_INFO.noCounterNotice).toBe(expectedNotice);
  });

  it('should define a positive commercial logistics value proposition for hero', () => {
    expect(LOGISTIC_HERO_PROPOSITION).toContain('Despacho directo a tu bodega u obra a nivel nacional');
    expect(LOGISTIC_HERO_PROPOSITION).toContain('Sede administrativa centralizada');
  });

  it('should enforce unified corporate contact phone with WhatsApp and voice calls', () => {
    const e164Regex = /^\+57\d{10}$/;

    // Strictly 1 unified corporate line — personal numbers removed from contact directory
    expect(CONTACT_PHONES).toHaveLength(1);

    const corporate = CONTACT_PHONES[0];
    expect(corporate.id).toBe('corporate');
    expect(corporate.name).toBe('Línea Corporativa');
    expect(corporate.e164).toMatch(e164Regex);
    expect(corporate.e164).toBe('+573044013761');
    expect(corporate.display).toContain('304 401 3761');
    expect(corporate.hasWhatsApp).toBe(true);
    expect(corporate.role).toMatch(/Atención|Comercial|Cotizaciones/i);

    // Verify personal lines are NOT exposed in CONTACT_PHONES
    const personalIds = CONTACT_PHONES.map((p) => p.id);
    expect(personalIds).not.toContain('geraldine');
    expect(personalIds).not.toContain('sonia');
  });

  it('should define commercial advisors team (Geraldine and Sonia) for humanized B2B care', () => {
    expect(COMMERCIAL_ADVISORS).toBeDefined();
    expect(COMMERCIAL_ADVISORS).toHaveLength(2);

    const advisorNames = COMMERCIAL_ADVISORS.map((a) => a.name);
    expect(advisorNames).toContain('Geraldine');
    expect(advisorNames).toContain('Sonia');

    COMMERCIAL_ADVISORS.forEach((advisor) => {
      expect(advisor.name).toBeDefined();
      expect(advisor.role).toBeDefined();
    });
  });

  it('should provide all official corporate emails without any @gmail.com addresses', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(OFFICIAL_EMAILS).toHaveLength(3);
    OFFICIAL_EMAILS.forEach((item) => {
      expect(item.email).toMatch(emailRegex);
      expect(item.email).not.toContain('@gmail.com');
      expect(item.email).toContain('@asoexi.com');
    });

    const emailAddresses = OFFICIAL_EMAILS.map((item) => item.email);
    expect(emailAddresses).toContain('asesorventas1@asoexi.com');
    expect(emailAddresses).toContain('asesorventas3@asoexi.com');
    expect(emailAddresses).toContain('serviciocliente@asoexi.com');
  });

  it('should define quote SLA notice and minimum order COP amount', () => {
    expect(QUOTE_SLA_NOTICE).toContain('5 minutos');
    expect(QUOTE_SLA_NOTICE).toContain('horario hábil');
    expect(MINIMUM_ORDER_COP).toBe(200000);
  });

  it('should define rebalanced value pillars hierarchy with logistics at the top and minimums at $200k', () => {
    expect(VALUE_PILLARS).toHaveLength(5);
    // Position 1 (Insignia): Rapid delivery
    expect(VALUE_PILLARS[0].id).toBe('entregas-rapidas');
    expect(VALUE_PILLARS[0].badge).toBe('Logística Inmediata');

    // Position 2: 100% home delivery
    expect(VALUE_PILLARS[1].id).toBe('logistica-domicilio');

    // Position 3: 100% original brands
    expect(VALUE_PILLARS[2].id).toBe('marcas-originales');

    // Position 4: Commercial credit up to 45 days
    expect(VALUE_PILLARS[3].id).toBe('credito-comercial');

    // Position 5: Minimum order from $200.000 COP
    expect(VALUE_PILLARS[4].id).toBe('minimos-accesibles');
    expect(VALUE_PILLARS[4].title).toContain('200.000');
    expect(VALUE_PILLARS[4].description).toContain('200.000');
  });

  it('should define accurate official business hours', () => {
    expect(BUSINESS_HOURS.weekdays).toContain('Lunes a Viernes');
    expect(BUSINESS_HOURS.weekdays).toContain('7:30');
    expect(BUSINESS_HOURS.weekdays).toContain('16:30');

    expect(BUSINESS_HOURS.saturdays).toContain('Sábados');
    expect(BUSINESS_HOURS.saturdays).toContain('8:00');
    expect(BUSINESS_HOURS.saturdays).toContain('12:00');
  });

  it('should define core navigation links including sectors and CTA', () => {
    expect(NAVIGATION_LINKS.length).toBeGreaterThan(0);
    const labels = NAVIGATION_LINKS.map((link) => link.label);
    expect(labels).toContain('Inicio');
    expect(labels).toContain('Sectores');
    expect(labels).toContain('Nosotros');
    expect(labels).toContain('Marcas');

    const ctaLink = NAVIGATION_LINKS.find((link) => link.isCta);
    expect(ctaLink).toBeDefined();
    expect(ctaLink?.label).toBe('Cotizar Insumos');
    expect(ctaLink?.isCta).toBe(true);
    expect(ctaLink?.href).toBeDefined();
  });

  it('should verify that institutional animated mascot video assets exist in public directory', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const greetingPath = path.resolve(process.cwd(), 'public/animated/greeting-float.mp4');
    const callPath = path.resolve(process.cwd(), 'public/animated/recieve-call-float.mp4');

    expect(fs.existsSync(greetingPath)).toBe(true);
    expect(fs.existsSync(callPath)).toBe(true);

    const greetingSize = fs.statSync(greetingPath).size;
    const callSize = fs.statSync(callPath).size;

    // Both video assets are ultra-lightweight (< 120 KB each)
    expect(greetingSize).toBeLessThan(120 * 1024);
    expect(callSize).toBeLessThan(120 * 1024);
  });
});

