@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
set "TOOL=%ROOT%tools\rxv-small-pack-promoter\index.html"
if not exist "%TOOL%" (
  echo [RXV] 找不到推廣器檔案：
  echo %TOOL%
  echo.
  echo 請確認 tools\rxv-small-pack-promoter\index.html 已下載。
  pause
  exit /b 1
)
start "" "%TOOL%"
exit /b 0
