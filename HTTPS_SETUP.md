# 本地 HTTPS 設定指南

## 目的
啟用本地 HTTPS 以便測試 Shopee iframe 解析功能（iframe 需要 HTTPS 環境才能正常工作）。

## 步驟 1：安裝 OpenSSL（如果尚未安裝）

### Windows 用戶
1. 下載並安裝 Git for Windows（已包含 OpenSSL）：
   - https://git-scm.com/download/win
   - 安裝時選擇「Use Git and optional Unix tools from the Command Prompt」

或者

2. 直接下載 OpenSSL for Windows：
   - https://slproweb.com/products/Win32OpenSSL.html
   - 選擇「Win64 OpenSSL v3.x.x Light」版本

### macOS 用戶
```bash
# OpenSSL 通常已預裝，如果沒有：
brew install openssl
```

### Linux 用戶
```bash
sudo apt-get install openssl  # Debian/Ubuntu
# 或
sudo yum install openssl      # CentOS/RHEL
```

## 步驟 2：生成 SSL 憑證

在專案根目錄（與 vite.config.ts 同層）執行：

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
```

這會生成兩個文件：
- `localhost.key` - 私鑰
- `localhost.crt` - 憑證

## 步驟 3：重啟開發伺服器

```bash
npm run dev
```

## 步驟 4：訪問 HTTPS 網址

啟動後訪問：
```
https://localhost:3000
```

### 首次訪問會顯示安全警告

瀏覽器會顯示「此連線不安全」或「Your connection is not private」，這是正常的（因為使用自簽憑證）。

解決方法：
- **Chrome/Edge**: 點擊「進階設定」→「繼續前往 localhost（不安全）」
- **Firefox**: 點擊「進階」→「接受風險並繼續」
- **Safari**: 點擊「顯示詳細資訊」→「訪問此網站」

## 步驟 5：測試 Shopee iframe 解析

現在可以正常使用 iframe 方式解析 Shopee 商品了！

## 注意事項

1. **憑證文件安全性**
   - `localhost.key` 和 `localhost.crt` 僅用於本地開發
   - 建議將它們添加到 `.gitignore` 中（如果尚未添加）

2. **憑證有效期**
   - 憑證有效期為 365 天
   - 過期後需重新生成

3. **生產環境**
   - 生產環境（Vercel）會自動提供 HTTPS
   - 不需要這些本地憑證文件

## 故障排除

### 問題：無法訪問 https://localhost:3000

**解決方案：**
1. 確認憑證文件已生成（檢查根目錄是否有 `localhost.key` 和 `localhost.crt`）
2. 確認開發伺服器已重啟
3. 清除瀏覽器快取並重新載入

### 問題：OpenSSL 命令不存在

**解決方案：**
- 參考「步驟 1」安裝 OpenSSL
- 或使用 Git Bash（如果已安裝 Git for Windows）

### 問題：iframe 仍然無法載入

**解決方案：**
1. 確認使用的是 `https://localhost:3000`（不是 `http://`）
2. 檢查瀏覽器控制台是否有錯誤訊息
3. 嘗試在不同瀏覽器中測試

## 替代方案

如果不想設定本地 HTTPS，可以直接部署到 Vercel 測試：
- Vercel 自動提供 HTTPS
- 訪問 `https://your-app.vercel.app` 即可測試 iframe 功能



