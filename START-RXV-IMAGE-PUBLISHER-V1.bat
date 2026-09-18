@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo RXV 圖片自動推廣器 v1
echo 零成本：R2 + 本機 SQLite + TikTok 待發清單
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 Node.js，請先使用目前 Pomodoro-app 的 Node 環境。
  pause
  exit /b 1
)

node server\rxv-image-publisher-v1.cjs

echo.
echo 工具已停止。
pause
