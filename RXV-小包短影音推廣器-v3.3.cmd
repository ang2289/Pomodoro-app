@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV 小包短影音推廣器 v3.3

echo ========================================
echo RXV 小包短影音推廣器 v3.3
echo MP3 背景音樂版
echo ========================================
echo.

if not exist "node_modules" (
  echo 找不到 node_modules。
  echo 請先在 D:\Pomodoro-app 執行 npm install
  echo.
  pause
  exit /b 1
)

if not exist "tools\rxv-small-pack-video-promoter-v3-3\server.mjs" (
  echo 找不到 v3.3 server.mjs，請重新取得工具檔案。
  pause
  exit /b 1
)

echo 啟動中，瀏覽器會自動開啟...
echo MP4 會輸出到 D:\RXV-短影音輸出

echo 關閉這個視窗就會停止工具。
echo.
node "tools\rxv-small-pack-video-promoter-v3-3\server.mjs"

echo.
echo 工具已停止。
pause
