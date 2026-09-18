@echo off
cd /d "%~dp0"
title RXV ONE CLICK
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RXV-ONECLICK.ps1"
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
  echo.
  echo RXV startup failed. This window will stay open.
  pause
)
exit /b %RC%