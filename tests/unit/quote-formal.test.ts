import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  CREDIT_CONTRACTUAL_NOTICE,
  MAX_RUT_FILE_SIZE_BYTES,
  OFFICIAL_QUOTE_RECIPIENT_EMAIL,
  QUOTE_FORMAL_SUCCESS_MESSAGE,
  quoteFormalRequestSchema,
  inspectPdfBuffer,
  validateRutPdfFile,
  arrayBufferToBase64,
  buildQuoteEmailPayload,
  buildQuoteFormalFormData,
  sendQuoteFormalEmail,
  type QuoteFormalRequest,
} from '@/lib/quote-formal';
import { GET, POST } from '@/pages/api/quote';

function createPdfBytes(
  content: string = '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF'
): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(content);
  const copy = new Uint8Array(new ArrayBuffer(encoded.byteLength));
  copy.set(encoded);
  return copy;
}

function createValidRequest(overrides: Partial<QuoteFormalRequest> = {}): QuoteFormalRequest {
  return {
    companyName: 'Constructora Andina S.A.S.',
    nit: '900123456-7',
    contactName: 'Carlos Mendoza',
    email: 'compras@constructoraandina.com.co',
    phone: '+57 310 555 1234',
    cityOrAddress: 'Bogotá - Calle 100 # 19-61, Obra Torre Norte',
    creditRequested: false,
    notes: 'Requiere entrega programada en obra con certificado RETIE.',
    items: [
      {
        id: 'panduit',
        name: 'Panduit',
        quantity: 10,
        isCustom: false,
        sector: 'electrico',
      },
      {
        id: 'custom-1',
        name: 'Tubería Conduit EMT 3/4"',
        quantity: 25,
        isCustom: true,
        notes: 'Tramos de 3 metros',
      },
    ],
    ...overrides,
  };
}

function createMockApiContext(
  request: Request,
  envOverrides: Record<string, string | undefined> = { RESEND_API_KEY: 're_test_key_123' }
) {
  return {
    request,
    locals: {
      runtime: {
        env: envOverrides,
      },
    },
  } as unknown as Parameters<typeof POST>[0];
}

describe('Story 4.4: Motor de Cotización Formal, Crédito 45 Días y Endpoint /api/quote (TDD)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('1. Constantes Normativas (SEC-2, EDGE-3, AD-7)', () => {
    it('debe exponer exactamente el microcopy contractual SEC-2 para crédito a 45 días', () => {
      expect(CREDIT_CONTRACTUAL_NOTICE).toBe(
        'Línea de crédito comercial B2B sujeta a estudio de riesgo y verificación de RUT con antigüedad mínima de 1 año'
      );
    });

    it('debe fijar el límite de archivo RUT en 5 MB exactos y destinatario oficial serviciocliente@asoexi.com', () => {
      expect(MAX_RUT_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
      expect(OFFICIAL_QUOTE_RECIPIENT_EMAIL).toBe('serviciocliente@asoexi.com');
      expect(OFFICIAL_QUOTE_RECIPIENT_EMAIL).not.toContain('gmail.com');
    });
  });

  describe('2. Validación de Esquema Zod (quoteFormalRequestSchema)', () => {
    it('debe validar una solicitud corporativa completa estándar sin crédito', () => {
      const payload = createValidRequest({ creditRequested: false });
      const result = quoteFormalRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('Constructora Andina S.A.S.');
        expect(result.data.nit).toBe('900123456-7');
        expect(result.data.email).toBe('compras@constructoraandina.com.co');
        expect(result.data.items).toHaveLength(2);
      }
    });

    it('debe permitir enviar solicitud formal incluso si el carrito está vacío (solo con notas)', () => {
      const payload = createValidRequest({
        items: [],
        notes: 'Solicito cotización de lista adjunta para obra en Tocancipá.',
      });
      const result = quoteFormalRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('debe rechazar campos obligatorios vacíos o correo corporativo inválido', () => {
      const result = quoteFormalRequestSchema.safeParse({
        companyName: '',
        nit: '12',
        email: 'correo-invalido',
        cityOrAddress: '',
        creditRequested: false,
        items: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldKeys = result.error.issues.map((issue) => String(issue.path[0]));
        expect(fieldKeys).toContain('companyName');
        expect(fieldKeys).toContain('nit');
        expect(fieldKeys).toContain('email');
        expect(fieldKeys).toContain('cityOrAddress');
      }
    });

    it('debe rechazar NIT con caracteres alfabéticos malformados o sin dígitos suficientes', () => {
      const resultAlpha = quoteFormalRequestSchema.safeParse(
        createValidRequest({ nit: 'ABC-INVALIDO!' })
      );
      expect(resultAlpha.success).toBe(false);

      const resultDashes = quoteFormalRequestSchema.safeParse(
        createValidRequest({ nit: '-----' })
      );
      expect(resultDashes.success).toBe(false);
    });
  });

  describe('3. Inspección de Binarios PDF en Memoria (Zero Data-at-Rest, EDGE-3)', () => {
    it('debe aceptar un buffer PDF válido ≤ 5 MB sin cifrado', () => {
      const bytes = createPdfBytes();
      const result = inspectPdfBuffer(bytes);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.sizeBytes).toBe(bytes.byteLength);
      }
    });

    it('debe rechazar un buffer vacío (0 bytes)', () => {
      const result = inspectPdfBuffer(new Uint8Array(0));
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('EMPTY_FILE');
      }
    });

    it('debe rechazar un PDF que supere 5 MB (EDGE-3)', () => {
      const oversized = new Uint8Array(MAX_RUT_FILE_SIZE_BYTES + 1);
      oversized.set(createPdfBytes('%PDF-1.7\n'), 0);
      const result = inspectPdfBuffer(oversized);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('FILE_TOO_LARGE');
      }
    });

    it('debe rechazar un archivo sin cabecera mágica %PDF-', () => {
      const fakePdf = new TextEncoder().encode('<html><body>Not a PDF</body></html>');
      const result = inspectPdfBuffer(fakePdf);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('INVALID_PDF_HEADER');
      }
    });

    it('debe rechazar un PDF cifrado o protegido con contraseña que contenga diccionario /Encrypt', () => {
      const encryptedPdf = createPdfBytes(
        '%PDF-1.7\n1 0 obj\n<< /Filter /Standard /V 4 /R 4 >>\nendobj\ntrailer\n<< /Size 2 /Root 1 0 R /Encrypt 2 0 R >>\n%%EOF'
      );
      const result = inspectPdfBuffer(encryptedPdf);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('ENCRYPTED_PDF');
        expect(result.message).toMatch(/contraseña|cifrado/i);
      }
    });

    it('validateRutPdfFile debe validar archivo File PDF válido y rechazar .xlsx / .png', async () => {
      const validFile = new File([createPdfBytes()], 'RUT_Empresa_2026.pdf', {
        type: 'application/pdf',
      });
      const validRes = await validateRutPdfFile(validFile);
      expect(validRes.valid).toBe(true);

      const xlsxFile = new File([new TextEncoder().encode('PK\x03\x04')], 'rut.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const xlsxRes = await validateRutPdfFile(xlsxFile);
      expect(xlsxRes.valid).toBe(false);
      if (!xlsxRes.valid) {
        expect(xlsxRes.code).toBe('INVALID_FILE_TYPE');
      }

      const pngFile = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'rut.png', {
        type: 'image/png',
      });
      const pngRes = await validateRutPdfFile(pngFile);
      expect(pngRes.valid).toBe(false);

      const parameterizedMimeFile = new File([createPdfBytes()], 'rut_param.pdf', {
        type: 'application/pdf; charset=binary',
      });
      const paramRes = await validateRutPdfFile(parameterizedMimeFile);
      expect(paramRes.valid).toBe(true);
    });

    it('arrayBufferToBase64 debe codificar correctamente en Base64 estándar Web sin depender de disco', () => {
      const bytes = createPdfBytes('%PDF-1.7');
      const b64 = arrayBufferToBase64(bytes);
      expect(b64).toBe(btoa('%PDF-1.7'));
    });
  });

  describe('4. Construcción de Payload de Correo Resend y Despacho con Timeout Defensivo', () => {
    it('debe construir payload HTML y texto hacia serviciocliente@asoexi.com con reply_to del comprador', () => {
      const req = createValidRequest({ creditRequested: true });
      const b64 = arrayBufferToBase64(createPdfBytes());
      const payload = buildQuoteEmailPayload({
        request: req,
        rutAttachment: {
          filename: 'RUT_Constructora.pdf',
          contentBase64: b64,
        },
      });

      expect(payload.to).toEqual(['serviciocliente@asoexi.com']);
      expect(payload.reply_to).toBe('compras@constructoraandina.com.co');
      expect(payload.subject).toContain('Crédito 45 Días');
      expect(payload.subject).toContain('Constructora Andina S.A.S.');
      expect(payload.html).toContain('900123456-7');
      expect(payload.html).toContain('Panduit');
      expect(payload.html).toContain('Tubería Conduit EMT 3/4');
      expect(payload.html).toContain(CREDIT_CONTRACTUAL_NOTICE);
      expect(payload.text).toContain('Constructora Andina S.A.S.');
      expect(payload.attachments).toHaveLength(1);
      expect(payload.attachments?.[0]).toEqual({
        filename: 'RUT_Constructora.pdf',
        content: b64,
      });
    });

    it('debe escapar caracteres HTML en entradas del usuario para prevenir inyección en el correo', () => {
      const req = createValidRequest({
        companyName: '<script>alert("xss")</script> Industrial S.A.',
      });
      const payload = buildQuoteEmailPayload({ request: req });
      expect(payload.html).not.toContain('<script>');
      expect(payload.html).toContain('&lt;script&gt;');
    });

    it('sendQuoteFormalEmail debe retornar ok=true con referenceId cuando Resend responde 200', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 'email_resend_999' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const payload = buildQuoteEmailPayload({ request: createValidRequest() });
      const result = await sendQuoteFormalEmail(payload, {
        apiKey: 're_test_123',
        fetchFn: fetchMock,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.referenceId).toBe('email_resend_999');
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.resend.com/emails');
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test_123');
    });

    it('sendQuoteFormalEmail debe abortar limpiamente y retornar 504 ante timeout (AbortError)', async () => {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      const fetchMock = vi.fn().mockRejectedValue(abortErr);

      const payload = buildQuoteEmailPayload({ request: createValidRequest() });
      const result = await sendQuoteFormalEmail(payload, {
        apiKey: 're_test_123',
        timeoutMs: 50,
        fetchFn: fetchMock,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(504);
        expect(result.code).toBe('UPSTREAM_TIMEOUT');
      }
    });
  });

  describe('5. Endpoint Serverless POST /api/quote (src/pages/api/quote.ts)', () => {
    it('debe responder HTTP 200 para cotización estándar por correo (multipart/form-data sin RUT)', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 're_msg_standard_1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      vi.stubGlobal('fetch', fetchMock);

      const formData = buildQuoteFormalFormData(createValidRequest({ creditRequested: false }));
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.referenceId).toBe('re_msg_standard_1');
      expect(body.message).toBe(QUOTE_FORMAL_SUCCESS_MESSAGE);
    });

    it('debe responder HTTP 200 para solicitud de crédito 45 días con RUT PDF válido adjunto en memoria', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 're_msg_credit_1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      vi.stubGlobal('fetch', fetchMock);

      const rutFile = new File([createPdfBytes()], 'RUT_Andina.pdf', {
        type: 'application/pdf',
      });
      const formData = buildQuoteFormalFormData(
        createValidRequest({ creditRequested: true }),
        rutFile
      );
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.referenceId).toBe('re_msg_credit_1');

      const sentPayload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(sentPayload.to).toEqual(['serviciocliente@asoexi.com']);
      expect(sentPayload.attachments).toHaveLength(1);
      expect(sentPayload.attachments[0].filename).toBe('RUT_Andina.pdf');
    });

    it('debe soportar peticiones JSON válidas sin archivo adjunto', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 're_msg_json_1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      vi.stubGlobal('fetch', fetchMock);

      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createValidRequest({ creditRequested: false })),
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.referenceId).toBe('re_msg_json_1');
    });

    it('debe responder HTTP 400 cuando creditRequested es true pero falta el archivo RUT', async () => {
      const formData = buildQuoteFormalFormData(createValidRequest({ creditRequested: true }));
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('RUT_REQUIRED');
      expect(body.error.fieldErrors.rutFile).toBeTruthy();
    });

    it('debe responder HTTP 413 cuando el archivo RUT supera 5 MB', async () => {
      const bigBytes = new Uint8Array(MAX_RUT_FILE_SIZE_BYTES + 10);
      bigBytes.set(createPdfBytes('%PDF-1.7\n'), 0);
      const oversizedFile = new File([bigBytes], 'RUT_Gigante.pdf', {
        type: 'application/pdf',
      });

      const formData = buildQuoteFormalFormData(
        createValidRequest({ creditRequested: true }),
        oversizedFile
      );
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(413);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('FILE_TOO_LARGE');
    });

    it('debe responder HTTP 400 cuando el PDF del RUT está protegido con contraseña (/Encrypt)', async () => {
      const encryptedFile = new File(
        [createPdfBytes('%PDF-1.7\n<< /Encrypt 3 0 R >>\n%%EOF')],
        'RUT_Cifrado.pdf',
        { type: 'application/pdf' }
      );

      const formData = buildQuoteFormalFormData(
        createValidRequest({ creditRequested: true }),
        encryptedFile
      );
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('ENCRYPTED_PDF');
    });

    it('debe responder HTTP 502 cuando Resend retorna error 5xx', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Internal upstream error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      vi.stubGlobal('fetch', fetchMock);

      const formData = buildQuoteFormalFormData(createValidRequest({ creditRequested: false }));
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(502);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('UPSTREAM_ERROR');
    });

    it('debe responder HTTP 504 cuando Resend excede el timeout defensivo', async () => {
      const abortErr = new Error('Timeout');
      abortErr.name = 'AbortError';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr));

      const formData = buildQuoteFormalFormData(createValidRequest({ creditRequested: false }));
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(504);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('UPSTREAM_TIMEOUT');
    });

    it('debe responder HTTP 400 VALIDATION_ERROR con fieldErrors ante campos inválidos', async () => {
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: '',
          nit: '-----',
          email: 'no-es-correo',
          cityOrAddress: '',
          creditRequested: false,
          items: [],
        }),
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.fieldErrors.companyName).toBeTruthy();
      expect(body.error.fieldErrors.nit).toBeTruthy();
      expect(body.error.fieldErrors.email).toBeTruthy();
      expect(body.error.fieldErrors.cityOrAddress).toBeTruthy();
    });

    it('debe responder HTTP 400 VALIDATION_ERROR ante JSON malformado en items', async () => {
      const formData = buildQuoteFormalFormData(createValidRequest({ creditRequested: false }));
      formData.set('items', '{bad-json');
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.fieldErrors.items).toBeTruthy();
    });

    it('debe responder HTTP 400 UNSUPPORTED_CONTENT_TYPE ante Content-Type no soportado', async () => {
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'hola',
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('UNSUPPORTED_CONTENT_TYPE');
    });

    it('debe responder HTTP 413 FILE_TOO_LARGE cuando Content-Length supera el límite antes de leer el cuerpo', async () => {
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(MAX_RUT_FILE_SIZE_BYTES + 300000),
        },
        body: JSON.stringify(createValidRequest()),
      });

      const res = await POST(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(413);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('FILE_TOO_LARGE');
    });

    it('debe responder HTTP 502 SERVICE_UNAVAILABLE cuando falta RESEND_API_KEY', async () => {
      const req = new Request('https://asoexi.com/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createValidRequest()),
      });

      const res = await POST(createMockApiContext(req, {}));
      const body = await res.json();

      expect(res.status).toBe(502);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('GET /api/quote debe responder HTTP 405 con cabecera Allow: POST', async () => {
      const req = new Request('https://asoexi.com/api/quote', { method: 'GET' });
      const res = await GET(createMockApiContext(req));
      const body = await res.json();

      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe('POST');
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});
