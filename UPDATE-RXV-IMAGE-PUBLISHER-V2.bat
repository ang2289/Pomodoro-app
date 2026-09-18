@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0UPDATE-RXV-IMAGE-PUBLISHER-V2.ps1"
