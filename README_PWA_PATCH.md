# RxV PWA 進階版 Patch

覆蓋路徑：

- public/manifest.json
- public/sw.js
- public/icon.png
- public/icon512.png
- public/icons/icon-*.png
- src/components/PWAInstallPrompt.tsx
- src/layouts/MainLayout.tsx

功能：

1. Android Chrome 一鍵加入桌面
2. iPhone / iPad 顯示「分享 → 加入主畫面」教學
3. Service Worker 基礎快取，不快取 /api、Supabase、Shopee、goods-share 動態頁，避免影響既有功能
4. 加入工具捷徑：Shopee 短影音、手機文案、QR Code、AI 摘要
5. 通知提醒按鈕：使用者允許後可發測試提醒，並保留後續行銷提醒擴充點

注意：

- 真正的遠端推播需要後端 Push Subscription + VAPID key，這版先不動你的 API 數量與後端結構，避免破壞現有功能。
- 如果 index.html 尚未加入 manifest/apple meta，請參考 docs/index_html_head_snippet.txt。
