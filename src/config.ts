// 網站配置
export const config = {
  baseUrl: window.location.origin,
  // 正確組合 Supabase Edge Function URL
  summaryFunctionUrl: import.meta.env.VITE_SUMMARY_FUNCTION_URL,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
