// 功能開關設定檔（全站共用）
// 用於控制功能的顯示與隱藏

export const featureFlags = {
  // Supabase 受限期間預設關閉；在部署環境設為 true 即可恢復原有功能。
  supabaseFeaturesEnabled: import.meta.env.VITE_SUPABASE_FEATURES_ENABLED === 'true',
  videoTool: true,       // RxV AI 影音工具（已啟用）
  priceCompare: false,   // 商品搜尋與比價（未完成）
  pomodoro: true,        // 番茄鐘（已上線）
  summary: true,         // 摘要工具（已上線，供綠界審核）
}


























