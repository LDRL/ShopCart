/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Axios client. */
  readonly VITE_API_URL?: string
  /** Backend origin consumed by the Vite dev proxy. */
  readonly VITE_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
