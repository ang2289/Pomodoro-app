@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV 圖片自動推廣器 v2

echo ==========================================
echo RXV 圖片自動推廣器 v2
echo 多圖 + 字幕 + QR Code + MP3 + TikTok
echo MP4 只放本機，不上傳 Vercel
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 Node.js。
  pause
  exit /b 1
)

if not exist ".env.local" if exist "D:\Pomodoro-app\.env.local" (
  copy /y "D:\Pomodoro-app\.env.local" ".env.local" >nul
)

set "RXV_SOURCE_ROOT=D:\Pomodoro-app"
set "RXV_AUTO_VIDEO_ROOT=D:\RXV-AutoVideo"
set "RXV_TIKTOK_SAFE_VIDEO=1"

if exist "%~dp0node_modules" (
  set "NODE_PATH=%~dp0node_modules"
) else if exist "D:\Pomodoro-app\node_modules" (
  set "NODE_PATH=D:\Pomodoro-app\node_modules"
)

echo [TikTok] 檢查 localhost:3006...
powershell -NoProfile -Command "$c=Get-NetTCPConnection -LocalPort 3006 -State Listen -ErrorAction SilentlyContinue; if($c){exit 0}else{exit 1}"
if errorlevel 1 (
  echo [TikTok] 3006 尚未啟動，正在自動啟動授權服務...
  start "RXV TikTok OAuth 3006" /min cmd /c "cd /d D:\Pomodoro-app && set DOTENV_CONFIG_PATH=D:\Pomodoro-app\.env.local && set NODE_PATH=D:\Pomodoro-app\node_modules && node -r dotenv/config server\image-to-video-server.cjs"
  powershell -NoProfile -Command "for($i=0;$i -lt 20;$i++){Start-Sleep -Milliseconds 500; $c=Get-NetTCPConnection -LocalPort 3006 -State Listen -ErrorAction SilentlyContinue; if($c){exit 0}}; exit 1"
  if errorlevel 1 (
    echo [警告] TikTok 授權服務 3006 尚未成功啟動。
    echo       可先開另一個 PowerShell 執行：
    echo       cd D:\Pomodoro-app
    echo       $env:DOTENV_CONFIG_PATH='D:\Pomodoro-app\.env.local'
    echo       npm run server
  ) else (
    echo [TikTok] 3006 授權服務已啟動。
  )
) else (
  echo [TikTok] 3006 已在執行。
)

node server\rxv-image-publisher-v2.cjs

echo.
echo 工具已停止。
pause
