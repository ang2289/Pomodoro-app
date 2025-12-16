# 管理者 API 文件

## 查詢使用者用量 API

### 端點
```
GET /api/admin/usage?userId=xxx
```

### 權限要求
- 僅限管理者存取
- 需要提供有效的 Supabase Auth Token

### 驗證方式

#### 1. 環境變數方式（推薦）
在 Vercel 環境變數中設定：
```
ADMIN_EMAILS=admin@example.com,manager@example.com
```

#### 2. Supabase User Metadata 方式（進階）
可以在 `user_profiles` 表中新增 `is_admin` 欄位，或使用 Supabase Auth 的 user metadata。

### 請求範例

```bash
curl -X GET \
  "https://your-domain.com/api/admin/usage?userId=user-uuid-here" \
  -H "Authorization: Bearer YOUR_SUPABASE_AUTH_TOKEN"
```

### 回應格式

#### 成功回應 (200)
```json
{
  "success": true,
  "userId": "user-uuid-here",
  "currentCredits": 5000,
  "creditsUpdatedAt": "2024-01-15T10:30:00Z",
  "totalLogs": 50,
  "logs": [
    {
      "feature": "summary",
      "total_chars": 1500,
      "input_chars": 1000,
      "output_chars": 500,
      "before_remaining": 6500,
      "after_remaining": 5000,
      "created_at": "2024-01-15T10:25:00Z"
    },
    // ... 最多 100 筆
  ]
}
```

#### 錯誤回應

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

**403 Forbidden**
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

**400 Bad Request**
```json
{
  "error": "Bad Request",
  "message": "Missing or invalid userId parameter"
}
```

### 使用場景

此 API 主要用於：
- 客服糾紛處理
- 使用者點數異常查詢
- 使用行為分析
- 帳務對帳

### 安全性

- ⚠️ **重要**：此 API 會暴露使用者的詳細使用紀錄，僅限管理者使用
- 所有請求都會驗證管理者的身份
- 建議在生產環境中：
  - 設定 IP 白名單
  - 記錄所有查詢操作
  - 定期審查管理者權限

### 環境變數設定

在 Vercel Dashboard → Settings → Environment Variables 中設定：

```
ADMIN_EMAILS=admin@example.com,manager@example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 測試

```bash
# 1. 取得 Supabase Auth Token（從前端登入後取得）
TOKEN="your-supabase-auth-token"

# 2. 查詢使用者用量
curl -X GET \
  "http://localhost:3000/api/admin/usage?userId=USER_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

