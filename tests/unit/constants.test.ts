import { describe, it, expect } from 'vitest';
import {
  COMPANY_INFO,
  CONTACT_PHONES,
  OFFICIAL_EMAILS,
  BUSINESS_HOURS,
  NAVIGATION_LINKS,
  LOGISTIC_NOTICE,
  LOGISTIC_HERO_PROPOSITION,
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

  it('should provide all official phone numbers in strict E.164 format and display format', () => {
    const e164Regex = /^\+57\d{10}$/;

    expect(CONTACT_PHONES).toHaveLength(3);

    const geraldine = CONTACT_PHONES.find((p) => p.id === 'geraldine');
    expect(geraldine).toBeDefined();
    expect(geraldine?.name).toBe('Geraldine');
    expect(geraldine?.e164).toMatch(e164Regex);
    expect(geraldine?.e164).toBe('+573186397212');
    expect(geraldine?.display).toContain('318 639 7212');
    expect(geraldine?.hasWhatsApp).toBe(true);

    const sonia = CONTACT_PHONES.find((p) => p.id === 'sonia');
    expect(sonia).toBeDefined();
    expect(sonia?.name).toBe('Sonia');
    expect(sonia?.e164).toMatch(e164Regex);
    expect(sonia?.e164).toBe('+573204498881');
    expect(sonia?.display).toContain('320 449 8881');
    expect(sonia?.hasWhatsApp).toBe(true);

    const corporate = CONTACT_PHONES.find((p) => p.id === 'corporate');
    expect(corporate).toBeDefined();
    expect(corporate?.name).toBe('Línea Corporativa');
    expect(corporate?.e164).toMatch(e164Regex);
    expect(corporate?.e164).toBe('+573044013761');
    expect(corporate?.display).toContain('304 401 3761');
    expect(corporate?.hasWhatsApp).toBe(false);
  });

  it('should provide all official corporate emails with valid format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(OFFICIAL_EMAILS).toHaveLength(3);
    OFFICIAL_EMAILS.forEach((item) => {
      expect(item.email).toMatch(emailRegex);
    });

    const emailAddresses = OFFICIAL_EMAILS.map((item) => item.email);
    expect(emailAddresses).toContain('asesorventas1@asoexi.com');
    expect(emailAddresses).toContain('asesorventas3@asoexi.com');
    expect(emailAddresses).toContain('servicioclienteasoexi@gmail.com');
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
});

