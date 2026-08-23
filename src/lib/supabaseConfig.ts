/**
 * Supabase 配置檔案
 * 統一管理 Supabase URL 和 Keys，支援環境變數 fallback
 * 支援 Vite (VITE_*) 和 Next.js (NEXT_PUBLIC_*) 格式
 */

// 獲取 Supabase URL（支援多種環境變數格式）
export const getSupabaseUrl = (): string => {
  // 優先使用 Vite 環境變數（開發環境）
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL
  }
  
  // 支援 Next.js 格式（Vercel Production 環境）
  // 在 Vite 中，NEXT_PUBLIC_* 變數需要透過 import.meta.env 讀取
  if (import.meta.env.NEXT_PUBLIC_SUPABASE_URL) {
    return import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  }
  
  // 支援 Node.js process.env（後端/SSR 使用）
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  
  // 最後嘗試直接讀取 process.env（Vercel 環境）
  if (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) {
    return process.env.VITE_SUPABASE_URL
  }
  
  // Fallback: 使用預設的 Supabase URL
  return 'https://icuxwmpdpsfhztsbyeds.supabase.co'
}

// 獲取 Supabase Anon Key
export const getSupabaseAnonKey = (): string => {
  // 優先使用 Vite 環境變數（開發環境）
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY
  }
  
  // 支援 Next.js 格式（Vercel Production 環境）
  if (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
  
  // 支援 Node.js process.env（後端/SSR 使用）
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
  
  // 最後嘗試直接讀取 process.env（Vercel 環境）
  if (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) {
    return process.env.VITE_SUPABASE_ANON_KEY
  }
  
  // Fallback: 使用預設的 anon key（如果環境變數未設定）
  return ''
}

// 獲取 Supabase Service Key（僅用於後端，不應暴露在前端）
// 匯出配置物件
export const SUPABASE_CONFIG = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
}
