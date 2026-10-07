@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"
title RxV LINE Sticker Local Test

echo ==========================================
echo RxV LINE 貼圖本機測試版
echo GitHub branch: line-sticker-local-test-20261007
echo 不會部署到 Vercel
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 Node.js，請先安裝 Node.js。
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/3] 第一次使用，正在安裝套件...
  call npm install
  if errorlevel 1 (
    echo [錯誤] npm install 失敗。
    pause
    exit /b 1
  )
) else (
  echo [1/3] node_modules 已存在。
)

set VITE_DEV_PORT=3011

echo [2/3] 啟動 Vite 測試站：http://localhost:3011
start "RxV LINE Sticker Vite" cmd /k "cd /d ""%~dp0"" && set VITE_DEV_PORT=3011 && npx vite --config vite.config.ts --host 0.0.0.0 --port 3011 --strictPort"

echo [3/3] 等待網站啟動...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='http://127.0.0.1:3011'; for($i=0;$i -lt 60;$i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 1; if($r.StatusCode -ge 200){ exit 0 } } catch {}; Start-Sleep -Seconds 1 }; exit 1"

if errorlevel 1 (
  echo.
  echo [錯誤] 3011 沒有成功啟動。
  echo 請查看剛剛開啟的「RxV LINE Sticker Vite」黑色視窗錯誤訊息。
  pause
  exit /b 1
)

echo.
echo 已啟動，現在開啟 LINE 貼圖測試頁...
start "" "http://localhost:3011/tools/line-sticker?flow=1"

echo.
echo 測試網址：
echo http://localhost:3011/tools/line-sticker?flow=1
echo.
echo 測試完畢後，把「RxV LINE Sticker Vite」黑色視窗關閉即可。
pause
