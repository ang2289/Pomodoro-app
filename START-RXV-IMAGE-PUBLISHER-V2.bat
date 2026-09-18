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

node server\rxv-image-publisher-v2.cjs

echo.
echo 工具已停止。
pause
