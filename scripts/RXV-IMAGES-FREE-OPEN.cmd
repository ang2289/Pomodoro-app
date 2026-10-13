@echo off
setlocal EnableExtensions
cd /d "%~dp0.."
title RXV Image Free Manager - QA (not production deployment)
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node LTS and retry.
  pause
  exit /b 1
)
if not exist "node_modules\@aws-sdk\client-s3" (
  echo First run: installing Node dependencies in this QA worktree.
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    echo Dependency install failed. Nothing changed in R2.
    pause
    exit /b 1
  )
)
powershell -NoProfile -STA -ExecutionPolicy Bypass -File "%~dp0RXV-IMAGES-FREE-GUI.ps1"
if errorlevel 1 (
  echo GUI was unable to start. Console fallback:
  echo scripts\RXV-IMAGES-FREE-TOOL.cmd
  pause
)
