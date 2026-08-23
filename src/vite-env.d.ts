/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_API_KEY: string
  readonly VITE_GOOGLE_CALENDAR_CLIENT_ID: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Fallback for Next.js style env vars (for compatibility)
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  // Chant 功能開關（為了上線摘要與作業功能，暫時隱藏 chant 模組）
  readonly VITE_ENABLE_CHANT?: string
  readonly NEXT_PUBLIC_ENABLE_CHANT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}







