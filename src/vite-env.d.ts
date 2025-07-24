/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_SHEET_ID: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_BACKEND_API_URL_LOCALHOST: string
  readonly VITE_BACKEND_API_URL_PRODUCTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 