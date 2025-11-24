# Vercel 環境變數設定指南

## 修復 Edge Function 401 未授權錯誤

為了修復 `/auto-summary` Edge Function 回傳 401 未授權的問題，請在 Vercel 專案設定中新增以下環境變數：

### 必需環境變數

在 Vercel Dashboard → Settings → Environment Variables 中新增：

```
VITE_SUPABASE_URL=https://icuxwmpdpsfhztsbyeds.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

或者使用 Next.js 格式（如果 Vercel 使用此格式）：

```
NEXT_PUBLIC_SUPABASE_URL=https://icuxwmpdpsfhztsbyeds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 可選環境變數

如果需要後端 API 路由（目前專案為前端直接呼叫，通常不需要）：

```
SUPABASE_SERVICE_KEY=your-service-key-here
HF_API_KEY=your-hf-api-key-here
```

## 設定步驟

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案：`Pomodoro-app`
3. 進入 **Settings** → **Environment Variables**
4. 新增上述環境變數
5. 選擇環境（Production、Preview、Development）
6. 點擊 **Save**
7. 重新部署專案（或等待自動部署）

## 驗證設定

部署完成後，檢查：
- Edge Function 呼叫是否成功（不再出現 401 錯誤）
- 摘要功能是否正常運作

## 注意事項

- `SUPABASE_SERVICE_KEY` 有完整權限，**請勿在前端程式碼中使用**
- 環境變數設定後需要重新部署才會生效
- 建議在 Production、Preview、Development 三個環境都設定相同的值

