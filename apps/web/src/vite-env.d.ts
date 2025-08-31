/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PASSWORD_MIN_ENTROPY: string
  readonly VITE_PASSWORD_WEAK_THRESHOLD: string
  readonly VITE_PASSWORD_FAIR_THRESHOLD: string
  readonly VITE_PASSWORD_GOOD_THRESHOLD: string
  readonly VITE_PASSWORD_STRONG_THRESHOLD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
