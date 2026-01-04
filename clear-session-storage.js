// ⚠️ 一次性清理腳本：清除舊的 session 和 localStorage 狀態
// 使用方法：在瀏覽器 DevTools Console 中執行此腳本

console.log('🧹 開始清理 sessionStorage 和 localStorage...')

// 1. 清空所有 sessionStorage
try {
  sessionStorage.clear()
  console.log('✅ sessionStorage 已清空')
} catch (e) {
  console.error('❌ 清空 sessionStorage 失敗:', e)
}

// 2. 清空 localStorage 中的 Supabase 相關 key
try {
  const supabaseKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.startsWith('sb-') || // Supabase session keys
      key.includes('supabase') || // 其他 supabase 相關
      key.includes('auth') // auth 相關
    )) {
      supabaseKeys.push(key)
    }
  }
  
  supabaseKeys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`✅ 已移除 localStorage key: ${key}`)
  })
  
  if (supabaseKeys.length === 0) {
    console.log('ℹ️ 沒有找到 Supabase 相關的 localStorage key')
  } else {
    console.log(`✅ 共移除 ${supabaseKeys.length} 個 Supabase 相關的 localStorage key`)
  }
} catch (e) {
  console.error('❌ 清空 localStorage 失敗:', e)
}

// 3. 重新整理頁面
console.log('🔄 3 秒後自動重新整理頁面...')
setTimeout(() => {
  window.location.reload()
}, 3000)

