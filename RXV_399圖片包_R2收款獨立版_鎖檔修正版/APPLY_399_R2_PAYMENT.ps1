$ErrorActionPreference = "Stop"

$project = "D:\Pomodoro-app"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $project "_backup_399_r2_payment_$stamp"

$targets = @{
  "report.tsx" = "src\pages\payment\report.tsx"
  "bank-transfer.tsx" = "src\pages\payment\bank-transfer.tsx"
  "payments.tsx" = "src\pages\admin\payments.tsx"
  "image-bundle-orders.ts" = "api\image-bundle-orders.ts"
  "rxv-image-bundle-admin.html" = "public\rxv-image-bundle-admin.html"
}

Write-Host "[1/4] 備份原檔..." -ForegroundColor Cyan
foreach ($entry in $targets.GetEnumerator()) {
  $target = Join-Path $project $entry.Value
  if (Test-Path $target) {
    $backupFile = Join-Path $backup $entry.Value
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backupFile) | Out-Null
    Copy-Item $target $backupFile -Force
  }
}

Write-Host "[2/4] 套用 NT$399 R2 獨立收款..." -ForegroundColor Cyan
foreach ($entry in $targets.GetEnumerator()) {
  $source = Join-Path $here $entry.Key
  $target = Join-Path $project $entry.Value
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item $source $target -Force
  Write-Host "  -> $($entry.Value)"
}

Write-Host "[3/4] 執行 npm run build..." -ForegroundColor Cyan
Set-Location $project
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "[FAIL] Build 失敗。原檔備份在：" -ForegroundColor Red
  Write-Host $backup -ForegroundColor Yellow
  exit $LASTEXITCODE
}

Write-Host "[4/4] 完成" -ForegroundColor Green
Write-Host ""
Write-Host "PASS：NT$399 圖片包匯款回報已改存 Private R2。" -ForegroundColor Green
Write-Host "PASS：/admin/payments 的 NT$399 訂單改讀 R2，不依賴 Supabase。" -ForegroundColor Green
Write-Host "PASS：另有獨立後台 /rxv-image-bundle-admin.html。" -ForegroundColor Green
Write-Host ""
Write-Host "注意：此腳本沒有修改 api\main.ts、登入系統、其他付款功能或 R2 圖片庫。" -ForegroundColor Yellow
Write-Host "備份：" $backup
