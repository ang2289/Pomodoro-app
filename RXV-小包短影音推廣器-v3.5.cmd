@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV 小包短影音推廣器 v3.5

if not exist "node_modules" (
  echo 找不到 node_modules，請先執行 npm install
  pause
  exit /b 1
)

echo 啟動 RXV 小包短影音推廣器 v3.5...
node "tools\rxv-small-pack-video-promoter-v3-5\server.mjs"
pause
