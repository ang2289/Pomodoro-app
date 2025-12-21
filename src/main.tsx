import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './i18n'
import './index.css'
import './native-inputs.css'
import { supabase } from './utils/supabaseClient'

// 🔍 DEBUG: 應用啟動時檢查初始 session（用於 OAuth callback 後驗證）
const checkInitialSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('🔍 [main.tsx] 應用啟動時檢查初始 session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      provider: session?.user?.app_metadata?.provider,
      error,
      urlHash: window.location.hash, // OAuth callback 會在 hash 中
    })
  } catch (err) {
    console.error('❌ [main.tsx] 檢查初始 session 失敗:', err)
  }
}
checkInitialSession()

// 在應用掛載前，根據 localStorage 中的 theme 同步 html 的 dark 類
const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'light'
if (typeof document !== 'undefined') {
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)

