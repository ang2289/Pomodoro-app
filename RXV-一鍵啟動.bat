@echo off
chcp 65001 >nul
cd /d "%~dp0"
title RXV 一鍵全自動啟動
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RXV-一鍵啟動.ps1"
