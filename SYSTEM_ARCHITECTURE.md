# 系統架構文件

> 此文件供 ChatGPT 對照使用，避免路徑錯誤或邏輯打架

## 📁 關鍵檔案結構

```
pomodoro-app/
├── api/                          # Vercel Serverless Functions（必須在根目錄）
│   ├── register.ts              # 註冊 API
│   ├── login.ts                 # 登入 API
│   ├── summary.ts               # 摘要 API（含扣點邏輯）
│   ├── ai.ts                    # AI 相關 API
│   ├── commerce.ts              # 電商相關 API
│   ├── expand-url.ts            # URL 展開 API
│   ├── generate-video.ts        # 影片生成 API
│   ├── google-tts.ts            # Google TTS API
│   ├── admin/
│   │   └── usage.ts             # 管理員使用統計 API
│   └── ecpay/
│       ├── create-credit-order.ts
│       └── credit-webhook.ts
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx        # 登入/註冊頁面
│   │   └── summary/
│   │       └── index.tsx        # 摘要功能頁面
│   ├── lib/
│   │   └── auth.ts              # 登入狀態工具函數
│   └── hooks/
│       └── useSummaryAction.ts  # 摘要功能 Hook
├── supabase/
│   ├── migrations/              # 資料庫 Migration 檔案
│   └── functions/               # Supabase Edge Functions
│       └── auto-summary/        # AI 摘要 Edge Function
├── package.json
└── vite.config.ts
```

---

## 🔌 API 端點功能說明

### 1. `/api/register` (POST)
**位置**: `api/register.ts`

**功能**: 使用者註冊
- **輸入**: `{ email: string, password: string }`
- **輸出**: `{ userId: string }`
- **流程**:
  1. 檢查 email 是否已存在（查詢 `users` 表）
  2. 使用 bcrypt 加密密碼（salt rounds: 10）
  3. 建立使用者記錄到 `users` 表
  4. 自動建立 `user_credits` 記錄（初始點數 10000）
  5. 回傳 `userId` (UUID)

**錯誤碼**:
- `409`: Email 已註冊
- `400`: 缺少 email 或 password
- `500`: 資料庫錯誤

**CORS**: 
- `Access-Control-Allow-Origin: http://localhost:3001`
- 支援 OPTIONS preflight

---

### 2. `/api/login` (POST)
**位置**: `api/login.ts`

**功能**: 使用者登入
- **輸入**: `{ email: string, password: string }`
- **輸出**: `{ userId: string }` 或 `{ success: false, error: string }`
- **流程**:
  1. 正規化 email（小寫 + trim）
  2. 從 `users` 表查詢使用者（取得 `id`, `password_hash`）
  3. 使用 bcrypt.compare 驗證密碼
  4. 成功後回傳 `userId`

**錯誤碼**:
- `401`: Email 或密碼錯誤（統一訊息，不洩露使用者是否存在）
- `400`: 缺少 email 或 password
- `500`: 伺服器錯誤

---

### 3. `/api/summary` (POST)
**位置**: `api/summary.ts`

**功能**: AI 摘要功能（含扣點邏輯）
- **輸入**: `{ userId: string, text: string }`
- **輸出**: `{ summary: string, keywords: string[], traffic_keywords: string[], remaining_chars: number }`
- **流程**:
  1. 查詢 `user_credits.remaining_chars`
  2. 檢查點數是否足夠（<= 0 回傳 403）
  3. 呼叫 Supabase Edge Function: `/functions/v1/auto-summary`
  4. 計算使用字數（input_chars + output_chars）
  5. 更新 `user_credits.remaining_chars`
  6. 寫入 `usage_logs` 記錄
  7. 回傳摘要結果與剩餘點數

**錯誤碼**:
- `403`: 點數不足
- `404`: 使用者點數記錄不存在
- `400`: 缺少 userId 或 text
- `500`: AI 服務或資料庫錯誤

**扣點邏輯**:
- `input_chars = text.length`
- `output_chars = JSON.stringify(aiResponse).length`（包含所有回傳欄位）
- `total_chars = input_chars + output_chars`
- `after_remaining = Math.max(0, before_remaining - total_chars)`

---

## 🔐 登入狀態管理

### 存儲位置
**localStorage Key**: `userId`

### 存儲時機
1. **註冊成功**: `localStorage.setItem('userId', data.userId)` (在 `LoginPage.tsx:96`)
2. **登入成功**: `localStorage.setItem('userId', data.userId)` (在 `LoginPage.tsx:40`)

### 讀取方式
- **直接讀取**: `localStorage.getItem('userId')`
- **使用工具函數**: `getCurrentUserId()` (在 `src/lib/auth.ts:11`)

### 工具函數 (`src/lib/auth.ts`)
```typescript
const USER_ID_KEY = 'userId'

getCurrentUserId(): string | null      // 取得當前使用者 ID
isLoggedIn(): boolean                  // 檢查是否已登入
logout(): void                         // 登出（移除 userId）
```

### 檢查登入狀態的頁面
- `src/pages/summary/index.tsx:12` - 載入時檢查，未登入導向 `/login`
- `src/hooks/useSummaryAction.ts:11` - 使用時檢查 userId

---

## 🗄️ Supabase 資料表結構

### 1. `users` 表（使用者登入）
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**索引**:
- `idx_users_email` on `email`

**用途**:
- 儲存使用者 Email 與加密後的密碼
- **不使用 Supabase Auth**，完全自訂驗證系統
- `id` 作為所有其他表的 `user_id` 外鍵

---

### 2. `user_credits` 表（使用者點數）
```sql
CREATE TABLE public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  remaining_chars INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**索引**:
- `idx_user_credits_user_id` on `user_id`

**用途**:
- 每個使用者只有一筆記錄（`user_id` 為 PRIMARY KEY）
- `remaining_chars`: 剩餘可用字數點數
- 註冊時自動建立，初始點數 10000
- 每次使用 AI 功能時扣點

**相關欄位**（可能有額外的 migration 新增）:
- `total_credits` (可能): 總購買點數
- `trial_credits` (可能): 試用點數
- `paid_credits` (可能): 付費點數
- `trial_expires_at` (可能): 試用到期時間
- `anon_token` (可能): 匿名使用者 token

---

### 3. `usage_logs` 表（使用紀錄）
```sql
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('summary', 'homework')),
  input_chars INTEGER NOT NULL DEFAULT 0,
  output_chars INTEGER NOT NULL DEFAULT 0,
  total_chars INTEGER NOT NULL DEFAULT 0,
  before_remaining INTEGER NOT NULL,
  after_remaining INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**索引**:
- `idx_usage_logs_user_id` on `user_id`
- `idx_usage_logs_created_at` on `created_at DESC`
- `idx_usage_logs_feature` on `feature`

**用途**:
- 記錄每次 AI 功能使用的詳細資訊
- `feature`: 'summary'（摘要）或 'homework'（作業解題）
- 記錄使用前後的點數變化

---

### 4. `payment_reports` 表（付款紀錄）
**位置**: `supabase/migrations/create_payment_reports_table.sql`

**用途**: 儲存付款相關紀錄（可能用於點數購買）

---

### 5. `credit_topups` 表（點數儲值）
**位置**: `supabase/migrations/create_credit_topups_table.sql`

**用途**: 儲存點數儲值紀錄

---

### 其他表（與登入系統無關）
- `chant_logs` - 誦經紀錄
- `chant_wishes` - 許願牆
- `chant_wish_supports` - 許願支援
- `chant_wish_lights` - 許願點燈
- `chant_comments` - 許願評論
- `wishes` - 願望
- `wish_comments` - 願望評論
- `wish_lights` - 願望點燈

---

## 🔑 環境變數

### 前端環境變數 (`.env.local`)
```
VITE_SUPABASE_URL=https://icuxwmpdpsfhztsbyeds.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_REGISTER_API_URL=https://icuxwmpdpsfhztsbyeds.supabase.co/functions/v1/register
```

### 後端環境變數 (Vercel)
```
VITE_SUPABASE_URL 或 SUPABASE_URL
VITE_SUPABASE_ANON_KEY 或 SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY  （⚠️ 後端專用，前端不可使用）
```

---

## 🔒 安全機制

### RLS (Row Level Security)
- **users 表**: 允許所有操作（由後端 API 控制權限）
- **user_credits 表**: 允許所有操作（由後端 API 控制權限）
- **usage_logs 表**: 允許所有操作（由後端 API 控制權限）

**注意**: 
- 不使用 Supabase Auth，因此 RLS 政策設定為開放
- 所有資料庫操作都使用 `SERVICE_ROLE_KEY` 執行（可繞過 RLS）
- 權限控制由後端 API 實作（例如：檢查 userId 是否匹配）

### 密碼處理
- 使用 `bcryptjs` 加密（salt rounds: 10）
- 不儲存明文密碼
- 驗證時使用 `bcrypt.compare()`

---

## 🚨 重要注意事項

### 1. API 路徑
- **前端呼叫**: 使用完整 URL `https://pomodoro-app.vercel.app/api/register`
- **Vercel Serverless Functions**: 必須放在專案根目錄的 `api/` 資料夾
- **不是** `src/api/`，必須是根目錄的 `api/`

### 2. 登入狀態
- **只使用 localStorage**，不使用 sessionStorage（除了 `useSummaryAction.ts` 中有備用檢查）
- **Key 名稱**: `userId`（固定）
- **登出**: 只需移除 localStorage 中的 `userId`

### 3. 資料庫外鍵
- `user_credits.user_id` → `users.id`
- `usage_logs.user_id` → `users.id`
- 所有外鍵都使用 `ON DELETE CASCADE`

### 4. Supabase Client
- **前端**: 使用 `VITE_SUPABASE_ANON_KEY`（受限於 RLS）
- **後端 API**: 使用 `SUPABASE_SERVICE_ROLE_KEY`（可繞過 RLS）
- **後端 API 設定**: `{ auth: { persistSession: false } }`

### 5. CORS
- **register.ts**: `Access-Control-Allow-Origin: http://localhost:3001`
- 支援 OPTIONS preflight 請求

---

## 📝 更新日期
最後更新: 2025-01-XX
