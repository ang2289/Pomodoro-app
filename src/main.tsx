import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './i18n'
import './index.css'
import './native-inputs.css'

// 在應用掛載前，根據 localStorage 中的 theme 同步 html 的 dark 類
const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'light'
if (typeof document !== 'undefined') {
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Affiliates.One 偶發 404/429 或外部 script 的 unhandled rejection，避免影響登入與主流程（特別是 dev overlay）
const RXV_AFFILIATES_ONE_RE = /(\bapi\.pub\.affiliates\.one\b)|(\bcdn\.affiliates\.one\b)|(\baffiliates\.one\b)/i
let rxvLastAffiliateToastAt = 0
async function rxvNotifyAffiliateIssueOnce() {
  const now = Date.now()
  if (now - rxvLastAffiliateToastAt < 15000) return
  rxvLastAffiliateToastAt = now
  try {
    const mod = await import('react-hot-toast')
    mod.toast.error('聯盟廣告服務暫時無法使用（不影響登入與主要功能）', { id: 'affiliates-one' })
  } catch {
    // ignore
  }
}

function rxvLooksLikeAffiliatesOneIssue(value: unknown) {
  const text = String(value || '')
  return RXV_AFFILIATES_ONE_RE.test(text)
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const anyEvent = event as any
      if (
        rxvLooksLikeAffiliatesOneIssue(anyEvent?.filename) ||
        rxvLooksLikeAffiliatesOneIssue(anyEvent?.message) ||
        rxvLooksLikeAffiliatesOneIssue(anyEvent?.error?.stack) ||
        rxvLooksLikeAffiliatesOneIssue(anyEvent?.error)
      ) {
        event.preventDefault()
        rxvNotifyAffiliateIssueOnce()
      }
    },
    true,
  )

  window.addEventListener('unhandledrejection', (event) => {
    const anyEvent = event as any
    if (rxvLooksLikeAffiliatesOneIssue(anyEvent?.reason?.stack) || rxvLooksLikeAffiliatesOneIssue(anyEvent?.reason)) {
      event.preventDefault()
      rxvNotifyAffiliateIssueOnce()
    }
  })
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
