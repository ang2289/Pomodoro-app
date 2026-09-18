@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV 一鍵全自動啟動

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RXV-一鍵啟動.ps1"
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
  echo.
  echo ==========================================
  echo RXV 啟動失敗，錯誤視窗已保留。
  echo ==========================================
  pause
  exit /b %RC%
)

exit /b 0
