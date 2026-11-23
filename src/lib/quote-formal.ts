import { z } from 'astro/zod';

export const CREDIT_CONTRACTUAL_NOTICE =
  'Línea de crédito comercial B2B sujeta a estudio de riesgo y verificación de RUT con antigüedad mínima de 1 año' as const;

export const MAX_RUT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (EDGE-3 / AD-7)

export const OFFICIAL_QUOTE_RECIPIENT_EMAIL = 'serviciocliente@asoexi.com' as const;

export const DEFAULT_QUOTE_SENDER_EMAIL =
  'ASOEXI S.A.S. <cotizaciones@asoexi.com>' as const;

export const RESEND_API_URL = 'https://api.resend.com/emails' as const;

export const RESEND_REQUEST_TIMEOUT_MS = 8000;

export const QUOTE_FORMAL_SUCCESS_MESSAGE =
  'Tu solicitud formal ha sido radicada exitosamente. Recibirás respuesta en tu correo institucional en horario hábil.' as const;

export const quoteFormalItemSchema = z.object({
  id: z.string().trim().max(120).optional(),
  name: z.string().trim().min(1, 'El nombre del ítem es obligatorio.').max(300),
  quantity: z.coerce.number().int().min(1).max(99999),
  isCustom: z.boolean().optional(),
  sector: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const quoteFormalRequestSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Ingresa la Razón Social de tu empresa.')
    .max(200, 'La Razón Social es demasiado larga.'),
  nit: z
    .string()
    .trim()
    .min(5, 'Ingresa un NIT empresarial válido.')
    .max(30, 'El NIT no debe superar 30 caracteres.')
    .regex(
      /^[0-9.\-\s]+$/,
      'El NIT solo debe contener números, puntos o guión (ej. 900480460-8).'
    )
    .refine(
      (v) => v.replace(/\D/g, '').length >= 5,
      'El NIT debe incluir al menos 5 dígitos numéricos.'
    ),
  contactName: z
    .string()
    .trim()
    .max(150, 'El nombre de contacto es demasiado largo.')
    .optional()
    .default(''),
  email: z
    .string()
    .trim()
    .max(200, 'El correo corporativo es demasiado largo.')
    .pipe(z.email('Ingresa un correo corporativo válido.')),
  phone: z
    .string()
    .trim()
    .max(40, 'El teléfono es demasiado largo.')
    .optional()
    .default(''),
  cityOrAddress: z
    .string()
    .trim()
    .min(3, 'Ingresa la ciudad y dirección de entrega en obra o empresa.')
    .max(300, 'La dirección es demasiado larga.'),
  creditRequested: z.boolean().default(false),
  notes: z
    .string()
    .trim()
    .max(2000, 'Las observaciones no deben superar 2000 caracteres.')
    .optional()
    .default(''),
  items: z.array(quoteFormalItemSchema).max(200).default([]),
});

export type QuoteFormalItem = z.infer<typeof quoteFormalItemSchema>;
export type QuoteFormalRequest = z.infer<typeof quoteFormalRequestSchema>;

export type PdfInspectionErrorCode =
  | 'MISSING_FILE'
  | 'INVALID_FILE_TYPE'
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_PDF_HEADER'
  | 'ENCRYPTED_PDF';

export type PdfInspectionResult =
  | {
      valid: true;
      sizeBytes: number;
      buffer?: ArrayBuffer;
    }
  | {
      valid: false;
      code: PdfInspectionErrorCode;
      message: string;
    };

export interface QuoteApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface QuoteApiResponse {
  ok: boolean;
  message?: string;
  referenceId?: string;
  error?: QuoteApiError;
}

export interface ResendAttachment {
  filename: string;
  content: string;
}

export interface ResendEmailPayload {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: ResendAttachment[];
}

export interface BuildQuoteEmailPayloadInput {
  request: QuoteFormalRequest;
  rutAttachment?: {
    filename: string;
    contentBase64: string;
  };
  fromEmail?: string;
}

export interface SendQuoteEmailOptions {
  apiKey: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export type SendQuoteEmailResult =
  | {
      ok: true;
      status: 200;
      referenceId: string;
    }
  | {
      ok: false;
      status: 502 | 504;
      code: 'UPSTREAM_TIMEOUT' | 'UPSTREAM_NETWORK_ERROR' | 'UPSTREAM_ERROR';
      message: string;
    };

const PDF_MAGIC_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d] as const; // %PDF-

/**
 * Inspects a PDF binary strictly in memory (Zero Data-at-Rest, ADR-4):
 * - Non-empty (byteLength > 0)
 * - Size <= 5 MB (EDGE-3)
 * - Magic header `%PDF-`
 * - Rejects password-protected / encrypted PDFs containing `/Encrypt` dictionary
 */
export function inspectPdfBuffer(input: ArrayBuffer | Uint8Array): PdfInspectionResult {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  if (bytes.byteLength === 0) {
    return {
      valid: false,
      code: 'EMPTY_FILE',
      message: 'El archivo RUT está vacío. Sube un certificado RUT en PDF válido.',
    };
  }

  if (bytes.byteLength > MAX_RUT_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: 'El archivo RUT supera el límite máximo permitido de 5 MB.',
    };
  }

  if (bytes.byteLength < PDF_MAGIC_HEADER.length) {
    return {
      valid: false,
      code: 'INVALID_PDF_HEADER',
      message: 'El archivo adjunto no es un PDF válido (cabecera %PDF- ausente).',
    };
  }

  for (let i = 0; i < PDF_MAGIC_HEADER.length; i++) {
    if (bytes[i] !== PDF_MAGIC_HEADER[i]) {
      return {
        valid: false,
        code: 'INVALID_PDF_HEADER',
        message: 'El archivo adjunto no corresponde a un documento PDF válido (%PDF-).',
      };
    }
  }

  // Decode in chunks as Latin-1 to safely inspect up to 5 MB without call stack overflow
  const chunkSize = 0x8000;
  let latin1 = '';
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
    latin1 += String.fromCharCode(...chunk);
  }

  if (latin1.includes('/Encrypt')) {
    return {
      valid: false,
      code: 'ENCRYPTED_PDF',
      message:
        'El PDF del RUT está protegido con contraseña o cifrado. Sube una copia sin contraseña de apertura.',
    };
  }

  return {
    valid: true,
    sizeBytes: bytes.byteLength,
  };
}

/**
 * Validates a File/Blob as a non-encrypted PDF <= 5 MB strictly in memory.
 */
export async function validateRutPdfFile(
  file: File | Blob | null | undefined,
  explicitName?: string
): Promise<PdfInspectionResult> {
  if (!file) {
    return {
      valid: false,
      code: 'MISSING_FILE',
      message: 'Adjunta el certificado RUT de tu empresa en formato PDF (máx. 5 MB).',
    };
  }

  const fileName = (explicitName ?? ('name' in file ? file.name : '') ?? '').trim();
  const mimeType = (file.type ?? '').split(';')[0].trim().toLowerCase();
  const hasPdfExtension = fileName.toLowerCase().endsWith('.pdf');
  const isPdfMime = mimeType === 'application/pdf';
  const isGenericMime = mimeType === '' || mimeType === 'application/octet-stream';

  if (mimeType && !isPdfMime && !isGenericMime) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: 'Formato no permitido. El certificado RUT debe ser estrictamente un archivo PDF (.pdf).',
    };
  }

  if (fileName && !hasPdfExtension) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: 'Extensión no permitida. Sube el certificado RUT en formato PDF (.pdf).',
    };
  }

  if (!isPdfMime && !hasPdfExtension) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: 'El certificado RUT debe ser estrictamente un archivo PDF (.pdf).',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      code: 'EMPTY_FILE',
      message: 'El archivo RUT está vacío. Sube un certificado RUT en PDF válido.',
    };
  }

  if (file.size > MAX_RUT_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: 'El archivo RUT supera el límite máximo permitido de 5 MB.',
    };
  }

  const buffer = await file.arrayBuffer();
  const inspection = inspectPdfBuffer(buffer);
  if (!inspection.valid) {
    return inspection;
  }
  return {
    valid: true,
    sizeBytes: inspection.sizeBytes,
    buffer,
  };
}

/**
 * Encodes an ArrayBuffer or Uint8Array to Base64 using Web-standard `btoa`
 * (compatible with Cloudflare Workers Edge runtime, browsers, and Node >= 22).
 */
export function arrayBufferToBase64(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Escapes HTML special characters to prevent markup injection in transactional emails.
 */
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes an uploaded PDF filename before attaching it to an email payload.
 */
export function sanitizePdfFilename(rawName?: string | null): string {
  const cleaned = (rawName ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 120);

  if (!cleaned || cleaned === '.pdf') {
    return 'RUT_Empresa.pdf';
  }
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

/**
 * Builds the structured HTML + plain text Resend REST API email payload
 * addressed strictly to `serviciocliente@asoexi.com`.
 */
export function buildQuoteEmailPayload({
  request,
  rutAttachment,
  fromEmail,
}: BuildQuoteEmailPayloadInput): ResendEmailPayload {
  const requestTypeLabel = request.creditRequested
    ? 'Crédito 45 Días + RUT'
    : 'Cotización Formal B2B';

  const safeCompany = request.companyName.replace(/[\r\n]+/g, ' ').trim();
  const safeNit = request.nit.replace(/[\r\n]+/g, ' ').trim();
  const subject = `[${requestTypeLabel}] ${safeCompany} (NIT ${safeNit})`;

  const itemsHtml =
    request.items.length > 0
      ? request.items
          .map((item, idx) => {
            const tag = item.isCustom ? 'Insumo Libre' : 'Marca Catálogo';
            const notesCell = item.notes ? `<br/><small style="color:#475569;">Nota: ${escapeHtml(item.notes)}</small>` : '';
            return `<tr>
              <td style="padding:8px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
              <td style="padding:8px;border:1px solid #cbd5e1;"><strong>${escapeHtml(item.name)}</strong>${notesCell}</td>
              <td style="padding:8px;border:1px solid #cbd5e1;">${tag}</td>
              <td style="padding:8px;border:1px solid #cbd5e1;text-align:center;"><strong>${item.quantity}</strong></td>
            </tr>`;
          })
          .join('')
      : `<tr><td colspan="4" style="padding:10px;border:1px solid #cbd5e1;color:#475569;">Sin referencias específicas en el cajón — revisar observaciones o requerimiento adjunto.</td></tr>`;

  const itemsText =
    request.items.length > 0
      ? request.items
          .map((item, idx) => {
            const tag = item.isCustom ? '[Insumo Libre]' : '[Marca Catálogo]';
            const noteSuffix = item.notes ? ` — Nota: ${item.notes}` : '';
            return `${idx + 1}. ${tag} ${item.name} — Cantidad: ${item.quantity} und(s)${noteSuffix}`;
          })
          .join('\n')
      : '- Sin referencias específicas en el cajón (ver observaciones).';

  const creditSectionHtml = request.creditRequested
    ? `<div style="margin:16px 0;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;">
        <p style="margin:0 0 4px 0;font-weight:700;color:#991b1b;">Solicitud de Línea de Crédito Comercial a 45 Días</p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;">${escapeHtml(CREDIT_CONTRACTUAL_NOTICE)}</p>
        ${
          rutAttachment
            ? `<p style="margin:6px 0 0 0;font-size:12px;color:#334155;">Certificado RUT adjunto en PDF: <strong>${escapeHtml(sanitizePdfFilename(rutAttachment.filename))}</strong></p>`
            : ''
        }
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<body style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;margin:0;padding:20px;background:#f8fafc;">
  <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;padding:24px;">
    <h1 style="margin:0 0 8px 0;font-size:20px;color:#0f172a;">Nueva Solicitud B2B — ${escapeHtml(requestTypeLabel)}</h1>
    <p style="margin:0 0 16px 0;font-size:13px;color:#475569;">Radicada desde el portal corporativo de ASOEXI S.A.S.</p>
    ${creditSectionHtml}
    <h2 style="font-size:15px;margin:18px 0 8px 0;color:#0f172a;">Datos de la Empresa Solicitante</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 8px;border:1px solid #cbd5e1;background:#f8fafc;width:34%;"><strong>Razón Social</strong></td><td style="padding:6px 8px;border:1px solid #cbd5e1;">${escapeHtml(request.companyName)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #cbd5e1;background:#f8fafc;"><strong>NIT</strong></td><td style="padding:6px 8px;border:1px solid #cbd5e1;">${escapeHtml(request.nit)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #cbd5e1;background:#f8fafc;"><strong>Contacto</strong></td><td style="padding:6px 8px;border:1px solid #cbd5e1;">${escapeHtml(request.contactName || 'No especificado')}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #cbd5e1;background:#f8fafc;"><strong>Correo Corporativo</strong></td><td style="padding:6px 8px;border:1px solid #cbd5e1;">${escapeHtml(request.email)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #cbd5e1;background:#f8fafc;"><strong>Teléfono</strong></td><td style="padding:6px 8px;border:1px solid #cbd5e1;">${escapeHtml(request.phone || 'No especificado')}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #cbd5e1;background:#f8fafc;"><strong>Ciudad / Dirección Entrega</strong></td><td style="padding:6px 8px;border:1px solid #cbd5e1;">${escapeHtml(request.cityOrAddress)}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:18px 0 8px 0;color:#0f172a;">Detalle de Requisición (${request.items.length} ítems)</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#0f172a;color:#ffffff;">
          <th style="padding:8px;border:1px solid #0f172a;">#</th>
          <th style="padding:8px;border:1px solid #0f172a;text-align:left;">Marca / Insumo</th>
          <th style="padding:8px;border:1px solid #0f172a;text-align:left;">Tipo</th>
          <th style="padding:8px;border:1px solid #0f172a;">Cantidad</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    ${
      request.notes
        ? `<h2 style="font-size:15px;margin:18px 0 8px 0;color:#0f172a;">Observaciones Adicionales</h2>
           <p style="margin:0;padding:10px;background:#f8fafc;border:1px solid #cbd5e1;font-size:13px;white-space:pre-line;">${escapeHtml(request.notes)}</p>`
        : ''
    }
    <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="margin:0;font-size:11px;color:#64748b;">ASOEXI S.A.S. · NIT 900480460-8 · Línea Corporativa: +57 301 419 1344 · Despacho 100% a domicilio en obra y empresas.</p>
  </div>
</body>
</html>`;

  const textLines = [
    `NUEVA SOLICITUD B2B — ${requestTypeLabel.toUpperCase()}`,
    '================================================',
    `Razón Social: ${request.companyName}`,
    `NIT: ${request.nit}`,
    `Contacto: ${request.contactName || 'No especificado'}`,
    `Correo Corporativo: ${request.email}`,
    `Teléfono: ${request.phone || 'No especificado'}`,
    `Ciudad / Dirección de Entrega: ${request.cityOrAddress}`,
    `Solicita Crédito a 45 Días: ${request.creditRequested ? 'SÍ (RUT PDF adjunto)' : 'No'}`,
  ];

  if (request.creditRequested) {
    textLines.push(`Aviso Contractual: ${CREDIT_CONTRACTUAL_NOTICE}`);
  }

  textLines.push('', `DETALLE DE REQUISICIÓN (${request.items.length} ítems):`, itemsText);

  if (request.notes) {
    textLines.push('', 'OBSERVACIONES ADICIONALES:', request.notes);
  }

  textLines.push(
    '',
    '--',
    'ASOEXI S.A.S. | NIT 900480460-8 | Línea Corporativa: +57 301 419 1344'
  );

  const payload: ResendEmailPayload = {
    from: fromEmail?.trim() || DEFAULT_QUOTE_SENDER_EMAIL,
    to: [OFFICIAL_QUOTE_RECIPIENT_EMAIL],
    reply_to: request.email,
    subject,
    html,
    text: textLines.join('\n'),
  };

  if (rutAttachment) {
    payload.attachments = [
      {
        filename: sanitizePdfFilename(rutAttachment.filename),
        content: rutAttachment.contentBase64,
      },
    ];
  }

  return payload;
}

/**
 * Builds a multipart FormData payload ready to POST to `/api/quote`.
 */
export function buildQuoteFormalFormData(
  request: QuoteFormalRequest,
  rutFile?: File | null
): FormData {
  const formData = new FormData();
  formData.append('companyName', request.companyName);
  formData.append('nit', request.nit);
  formData.append('contactName', request.contactName ?? '');
  formData.append('email', request.email);
  formData.append('phone', request.phone ?? '');
  formData.append('cityOrAddress', request.cityOrAddress);
  formData.append('creditRequested', request.creditRequested ? 'true' : 'false');
  formData.append('notes', request.notes ?? '');
  formData.append('items', JSON.stringify(request.items ?? []));

  if (rutFile) {
    formData.append('rutFile', rutFile, rutFile.name || 'RUT.pdf');
  }

  return formData;
}

/**
 * Extracts flat fieldErrors from a ZodError for structured API and UI feedback.
 */
export function formatZodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * Dispatches the transactional email via Resend REST API with a defensive AbortController timeout.
 */
export async function sendQuoteFormalEmail(
  payload: ResendEmailPayload,
  options: SendQuoteEmailOptions
): Promise<SendQuoteEmailResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const timeoutMs = options.timeoutMs ?? RESEND_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        code: 'UPSTREAM_ERROR',
        message:
          'No fue posible procesar el envío en el servidor de correo en este momento. Intenta de nuevo o escríbenos a serviciocliente@asoexi.com.',
      };
    }

    let referenceId = `ASOEXI-${Date.now()}`;
    try {
      const data = (await response.json()) as { id?: string };
      if (data && typeof data.id === 'string' && data.id.trim()) {
        referenceId = data.id.trim();
      }
    } catch {
      // Fallback reference ID if response body is empty
    }

    return {
      ok: true,
      status: 200,
      referenceId,
    };
  } catch (err) {
    const isAbort =
      controller.signal.aborted ||
      (err instanceof Error &&
        (err.name === 'AbortError' || err.message.toLowerCase().includes('abort')));

    if (isAbort) {
      return {
        ok: false,
        status: 504,
        code: 'UPSTREAM_TIMEOUT',
        message:
          'El servicio de correo tardó demasiado en responder. Por favor intenta nuevamente o envíanos tu solicitud a serviciocliente@asoexi.com.',
      };
    }

    return {
      ok: false,
      status: 502,
      code: 'UPSTREAM_NETWORK_ERROR',
      message:
        'Error de conexión al radicar la solicitud formal. Verifica tu red o usa el correo de respaldo serviciocliente@asoexi.com.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
