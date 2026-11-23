/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
  export const env: Record<string, string | undefined>;
}

interface ImportMetaEnv {
  readonly PUBLIC_GA4_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type GtagCommand = 'config' | 'event' | 'js' | 'set' | 'consent';

type GtagFunction = (
  command: GtagCommand | string,
  targetOrEvent: string | Date,
  params?: Record<string, unknown>
) => void;

interface Window {
  dataLayer?: unknown[];
  gtag?: GtagFunction;
  __waAnalyticsBound?: boolean;
}
