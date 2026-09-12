@echo off
echo ========================================
echo 生成本地 HTTPS SSL 憑證
echo ========================================
echo.

REM 檢查是否已安裝 Git (包含 OpenSSL)
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 未找到 Git，請先安裝 Git for Windows
    echo 下載地址: https://git-scm.com/download/win
    echo.
    echo 或者，請手動執行以下命令（需要先安裝 OpenSSL）:
    echo openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
    pause
    exit /b 1
)

echo [資訊] 使用 Git Bash 中的 OpenSSL...
echo.

REM 嘗試使用 Git Bash 中的 openssl
if exist "C:\Program Files\Git\usr\bin\openssl.exe" (
    "C:\Program Files\Git\usr\bin\openssl.exe" req -x509 -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
) else if exist "C:\Program Files (x86)\Git\usr\bin\openssl.exe" (
    "C:\Program Files (x86)\Git\usr\bin\openssl.exe" req -x509 -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
) else (
    echo [錯誤] 未找到 OpenSSL
    echo.
    echo 請選擇以下其中一種方法:
    echo.
    echo 方法 1: 安裝 Git for Windows (推薦)
    echo   下載: https://git-scm.com/download/win
    echo.
    echo 方法 2: 使用 Git Bash 執行命令
    echo   開啟 Git Bash，在專案根目錄執行:
    echo   openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
    echo.
    echo 方法 3: 直接部署到 Vercel 測試 (最簡單)
    echo   Vercel 自動提供 HTTPS，不需要本地憑證
    pause
    exit /b 1
)

if exist "localhost.key" if exist "localhost.crt" (
    echo.
    echo [成功] SSL 憑證已生成！
    echo   文件: localhost.key
    echo   文件: localhost.crt
    echo.
    echo 下一步: 重新啟動開發伺服器 (npm run dev)
    echo 然後訪問: https://localhost:3000
) else (
    echo.
    echo [錯誤] 憑證生成失敗
    echo 請檢查錯誤訊息並重試
)

echo.
pause



