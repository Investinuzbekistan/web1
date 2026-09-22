/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional POST endpoint for the enquiry form. Unset: fall back to mailto:. */
  readonly VITE_FORM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
