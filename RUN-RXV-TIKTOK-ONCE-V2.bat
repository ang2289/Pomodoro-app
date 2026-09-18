@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV TikTok 自動跑一輪 v2

echo ==========================================
echo RXV TikTok 自動跑一輪 v2
echo 會自動挑圖、做 MP4、並送 TikTok API
echo ==========================================
echo.
choice /M "確認現在要自動產生並送出 1 支 TikTok 影片"
if errorlevel 2 exit /b 0

if not exist ".env.local" if exist "D:\Pomodoro-app\.env.local" copy /y "D:\Pomodoro-app\.env.local" ".env.local" >nul
set "RXV_SOURCE_ROOT=D:\Pomodoro-app"
set "RXV_AUTO_VIDEO_ROOT=D:\RXV-AutoVideo"
if exist "%~dp0node_modules" (
  set "NODE_PATH=%~dp0node_modules"
) else if exist "D:\Pomodoro-app\node_modules" (
  set "NODE_PATH=D:\Pomodoro-app\node_modules"
)

node server\rxv-image-publisher-v2.cjs --auto-once

echo.
echo 執行完成。上方若顯示 TikTok 草稿／收件匣，請到 TikTok App 完成最後發布。
pause
