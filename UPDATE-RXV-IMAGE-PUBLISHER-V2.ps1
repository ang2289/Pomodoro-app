$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host '=== RXV v2 一鍵更新 ===' -ForegroundColor Cyan

try {
  $conn = Get-NetTCPConnection -LocalPort 3018 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn -and $conn.OwningProcess) {
    Write-Host "停止舊版 v2 PID $($conn.OwningProcess)..."
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  }
} catch {}

if (-not (Test-Path '.env.local') -and (Test-Path 'D:\Pomodoro-app\.env.local')) {
  Copy-Item 'D:\Pomodoro-app\.env.local' '.env.local' -Force
}

Write-Host '同步 GitHub main...'
git fetch origin main
if ($LASTEXITCODE -ne 0) { throw 'git fetch 失敗' }
git reset --hard origin/main
if ($LASTEXITCODE -ne 0) { throw 'git reset 失敗' }

Write-Host '更新完成，啟動 v2...' -ForegroundColor Green
Start-Process -FilePath (Join-Path $Root 'START-RXV-IMAGE-PUBLISHER-V2.bat') -WorkingDirectory $Root
