@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0.."
title RXV Image Free Download Manager - Local QA
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node LTS before running.
  pause
  exit /b 1
)
if not exist "node_modules\@aws-sdk\client-s3" (
  echo Installing project dependencies. This may take several minutes...
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    echo npm ci failed. No images were changed.
    pause
    exit /b 1
  )
)
:menu
cls
echo ==========================================================
echo RXV Image Free Download Manager - TEST BRANCH
echo NO action is automatic. LIVE R2 writes require confirmation.
echo ==========================================================
echo 1. Preview only ^(READ ONLY^)
echo 2. Release 10 images ^(LIVE R2, confirmation required^)
echo 3. Release ALL locked images ^(LIVE R2, confirmation required^)
echo 4. Restore original catalog + remove only created copies
echo 0. Exit
echo.
set /p "choice=Choose an option: "
if "%choice%"=="1" set "MODE=preview" & goto run
if "%choice%"=="2" set "MODE=test" & goto run
if "%choice%"=="3" set "MODE=all" & goto run
if "%choice%"=="4" set "MODE=restore" & goto run
if "%choice%"=="0" exit /b 0
goto menu
:run
echo.
echo Running mode: %MODE%
node scripts\rxv-images-batch-free.mjs --mode=%MODE%
echo.
if errorlevel 1 (
  echo FAILED / STOPPED. See errors above. Do NOT delete your backup folder.
) else (
  echo Finished. If you ran a release, manually check direct downloads in the browser.
)
pause
goto menu
