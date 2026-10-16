/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GAMECLUB_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  GAMECLUB_BACKEND?: {
    tokenKey?: string;
    loginPayload?: (values: Record<string, FormDataEntryValue>) => unknown;
    registerPayload?: (values: Record<string, FormDataEntryValue>) => unknown;
    accessToken?: (data: Record<string, unknown>) => string | undefined;
  };
}
