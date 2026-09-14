@echo off
chcp 65001 >nul
title RXV Small Pack Promoter v2
set "APP=%~dp0tools\rxv-small-pack-promoter-v2\index.html"
if not exist "%APP%" (
  echo Cannot find: %APP%
  pause
  exit /b 1
)
start "" "%APP%"
exit /b 0
