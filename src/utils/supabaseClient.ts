import { createClient } from '@supabase/supabase-js'

// Fallback 機制：優先使用環境變數，如果沒有則使用預設值
// 支援 Vite (VITE_*) 和 Next.js (NEXT_PUBLIC_*) 格式的環境變數
const getSupabaseUrl = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://kagoxcvsluzalisjqnif.supabase.co' // Fallback
  )
}

const getSupabaseAnonKey = () => {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ294Y3ZzbHV6YWxpc2pxbmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjM3NTksImV4cCI6MjA3NTEzOTc1OX0.g3f0IosTYKac2sIqJZpiC4iTuDUWha3FuVhvIY2_RZ4' // Fallback
  )
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 匯出配置供其他模組使用
export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  serviceKey: 
    import.meta.env.VITE_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    undefined,
}

