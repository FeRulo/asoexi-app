import type { APIRoute } from 'astro';
import {
  MAX_RUT_FILE_SIZE_BYTES,
  OFFICIAL_QUOTE_RECIPIENT_EMAIL,
  QUOTE_FORMAL_SUCCESS_MESSAGE,
  quoteFormalRequestSchema,
  validateRutPdfFile,
  arrayBufferToBase64,
  buildQuoteEmailPayload,
  sendQuoteFormalEmail,
  formatZodFieldErrors,
  type QuoteApiResponse,
} from '@/lib/quote-formal';

export const prerender = false;

const MAX_REQUEST_BODY_BYTES = MAX_RUT_FILE_SIZE_BYTES + 262144;

interface RuntimeLocals {
  runtime?: {
    env?: Record<string, string | undefined>;
  };
}

function jsonResponse(body: QuoteApiResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function readEnvVar(locals: unknown, key: string): Promise<string | undefined> {
  // 1. Astro v6+ / @astrojs/cloudflare v14+: read from `cloudflare:workers` `env`
  try {
    const cfWorkersSpecifier: string = 'cloudflare:workers';
    const cfWorkers = (await import(/* @vite-ignore */ cfWorkersSpecifier)) as {
      env?: Record<string, unknown>;
    };
    const fromCf = cfWorkers?.env?.[key];
    if (typeof fromCf === 'string' && fromCf.trim()) {
      return fromCf.trim();
    }
  } catch {
    // Not running inside Cloudflare Workers runtime (e.g., Node/Vitest)
  }

  // 2. Fallback for mock/legacy locals.runtime.env (guarded because Astro v6+ throws on getter)
  try {
    const runtimeEnv = (locals as RuntimeLocals | undefined)?.runtime?.env;
    const fromRuntime = runtimeEnv?.[key];
    if (typeof fromRuntime === 'string' && fromRuntime.trim()) {
      return fromRuntime.trim();
    }
  } catch {
    // Astro v6+ removes Astro.locals.runtime.env and throws on access
  }

  // 3. Vite / Astro build-time or dev env
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  const fromMeta = metaEnv?.[key];
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim();
  }

  // 4. Node.js process.env fallback
  if (typeof process !== 'undefined' && process.env) {
    const fromProcess = process.env[key];
    if (typeof fromProcess === 'string' && fromProcess.trim()) {
      return fromProcess.trim();
    }
  }

  return undefined;
}

function parseItemsField(
  rawItems: unknown
): { ok: true; value: unknown[] } | { ok: false; message: string } {
  if (rawItems === undefined || rawItems === null) {
    return { ok: true, value: [] };
  }
  if (Array.isArray(rawItems)) {
    return { ok: true, value: rawItems };
  }
  if (typeof rawItems === 'string') {
    const trimmed = rawItems.trim();
    if (!trimmed) {
      return { ok: true, value: [] };
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return { ok: true, value: parsed };
      }
      return {
        ok: false,
        message: 'El listado de ítems debe ser un arreglo JSON válido.',
      };
    } catch {
      return {
        ok: false,
        message: 'El listado de ítems contiene JSON malformado.',
      };
    }
  }
  return {
    ok: false,
    message: 'El listado de ítems debe ser un arreglo válido.',
  };
}

function parseBooleanField(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') {
    return raw.trim().toLowerCase() === 'true' || raw.trim() === '1';
  }
  return false;
}

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      ok: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Método no permitido. Envía solicitudes de cotización mediante POST a /api/quote.',
      },
    } satisfies QuoteApiResponse),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Allow: 'POST',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message:
              'La solicitud supera el tamaño máximo permitido (5 MB para el certificado RUT).',
            fieldErrors: {
              rutFile: 'El archivo RUT supera el límite máximo permitido de 5 MB.',
            },
          },
        },
        413
      );
    }
  }

  const contentType = (request.headers.get('content-type') ?? '').toLowerCase();

  let rawPayload: Record<string, unknown> = {};
  let uploadedRutFile: File | null = null;

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const parsedItems = parseItemsField(formData.get('items'));
      if (!parsedItems.ok) {
        return jsonResponse(
          {
            ok: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: parsedItems.message,
              fieldErrors: { items: parsedItems.message },
            },
          },
          400
        );
      }

      rawPayload = {
        companyName: String(formData.get('companyName') ?? ''),
        nit: String(formData.get('nit') ?? ''),
        contactName: String(formData.get('contactName') ?? ''),
        email: String(formData.get('email') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        cityOrAddress: String(formData.get('cityOrAddress') ?? ''),
        creditRequested: parseBooleanField(formData.get('creditRequested')),
        notes: String(formData.get('notes') ?? ''),
        items: parsedItems.value,
      };

      const fileEntry = formData.get('rutFile');
      if (fileEntry instanceof File && (fileEntry.size > 0 || fileEntry.name.trim().length > 0)) {
        uploadedRutFile = fileEntry;
      }
    } else if (contentType.includes('application/json')) {
      const parsedBody = (await request.json()) as Record<string, unknown>;
      if (!parsedBody || typeof parsedBody !== 'object') {
        return jsonResponse(
          {
            ok: false,
            error: {
              code: 'INVALID_JSON',
              message: 'El cuerpo JSON de la solicitud no es válido.',
            },
          },
          400
        );
      }
      const parsedItems = parseItemsField(parsedBody.items);
      if (!parsedItems.ok) {
        return jsonResponse(
          {
            ok: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: parsedItems.message,
              fieldErrors: { items: parsedItems.message },
            },
          },
          400
        );
      }
      rawPayload = {
        ...parsedBody,
        creditRequested: parseBooleanField(parsedBody.creditRequested),
        items: parsedItems.value,
      };
    } else {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: 'UNSUPPORTED_CONTENT_TYPE',
            message:
              'Formato de petición no soportado. Usa multipart/form-data o application/json.',
          },
        },
        400
      );
    }
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'MALFORMED_REQUEST',
          message: 'No se pudo leer el contenido de la solicitud.',
        },
      },
      400
    );
  }

  const parsed = quoteFormalRequestSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Verifica los campos obligatorios de tu solicitud corporativa.',
          fieldErrors: formatZodFieldErrors(parsed.error),
        },
      },
      400
    );
  }

  const validatedRequest = parsed.data;
  let rutAttachment: { filename: string; contentBase64: string } | undefined;

  if (validatedRequest.creditRequested) {
    if (!uploadedRutFile) {
      const missingMsg =
        'Para solicitar línea de crédito a 45 días es obligatorio adjuntar el certificado RUT en formato PDF (máx. 5 MB).';
      return jsonResponse(
        {
          ok: false,
          error: {
            code: 'RUT_REQUIRED',
            message: missingMsg,
            fieldErrors: {
              rutFile: missingMsg,
            },
          },
        },
        400
      );
    }

    // Strictly in-memory inspection (Zero Data-at-Rest, ADR-4) — single read reused for Base64
    const inspection = await validateRutPdfFile(uploadedRutFile);
    if (!inspection.valid) {
      const status = inspection.code === 'FILE_TOO_LARGE' ? 413 : 400;
      return jsonResponse(
        {
          ok: false,
          error: {
            code: inspection.code,
            message: inspection.message,
            fieldErrors: {
              rutFile: inspection.message,
            },
          },
        },
        status
      );
    }

    const arrayBuffer = inspection.buffer ?? (await uploadedRutFile.arrayBuffer());
    rutAttachment = {
      filename: uploadedRutFile.name || 'RUT_Empresa.pdf',
      contentBase64: arrayBufferToBase64(arrayBuffer),
    };
  }

  const resendApiKey = await readEnvVar(locals, 'RESEND_API_KEY');
  if (!resendApiKey) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `El servicio de correo transaccional no está configurado temporalmente. Envíanos tu solicitud directamente a ${OFFICIAL_QUOTE_RECIPIENT_EMAIL}.`,
        },
      },
      502
    );
  }

  const fromEmail = await readEnvVar(locals, 'RESEND_FROM_EMAIL');
  const emailPayload = buildQuoteEmailPayload({
    request: validatedRequest,
    rutAttachment,
    fromEmail,
  });

  const sendResult = await sendQuoteFormalEmail(emailPayload, {
    apiKey: resendApiKey,
  });

  if (!sendResult.ok) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: sendResult.code,
          message: sendResult.message,
        },
      },
      sendResult.status
    );
  }

  return jsonResponse(
    {
      ok: true,
      message: QUOTE_FORMAL_SUCCESS_MESSAGE,
      referenceId: sendResult.referenceId,
    },
    200
  );
};
