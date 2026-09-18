@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV TikTok OAuth 3006

if not exist ".env.local" if exist "D:\Pomodoro-app\.env.local" (
  copy /y "D:\Pomodoro-app\.env.local" ".env.local" >nul
)

set "DOTENV_CONFIG_PATH=%~dp0.env.local"
set "NODE_PATH=D:\Pomodoro-app\node_modules"
set "PORT=3006"

echo ==========================================
echo RXV TikTok OAuth / Video Server
echo http://localhost:3006
echo ==========================================
echo.

node -r dotenv/config server\image-to-video-server.cjs

echo.
echo [錯誤] 3006 服務已停止。
echo 請保留此視窗並截圖錯誤訊息。
pause
