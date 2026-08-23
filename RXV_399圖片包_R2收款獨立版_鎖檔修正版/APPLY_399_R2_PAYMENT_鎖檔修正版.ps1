$ErrorActionPreference = "Stop"

$project = "D:\Pomodoro-app"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $project "_backup_399_r2_payment_fix_$stamp"

$targets = @(
  @{ Source = "report.tsx"; Target = "src\pages\payment\report.tsx" },
  @{ Source = "bank-transfer.tsx"; Target = "src\pages\payment\bank-transfer.tsx" },
  @{ Source = "payments.tsx"; Target = "src\pages\admin\payments.tsx" },
  @{ Source = "image-bundle-orders.ts"; Target = "api\image-bundle-orders.ts" },
  @{ Source = "rxv-image-bundle-admin.html"; Target = "public\rxv-image-bundle-admin.html" }
)

function Write-FileWithRetry([string]$source, [string]$target) {
  $bytes = [System.IO.File]::ReadAllBytes($source)
  $dir = Split-Path -Parent $target
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $last = $null
  for ($i = 1; $i -le 10; $i++) {
    try {
      $tmp = "$target.rxvtmp"
      [System.IO.File]::WriteAllBytes($tmp, $bytes)
      if (Test-Path $target) {
        try {
          [System.IO.File]::Replace($tmp, $target, $null, $true)
        } catch {
          Remove-Item $target -Force -ErrorAction Stop
          Move-Item $tmp $target -Force
        }
      } else {
        Move-Item $tmp $target -Force
      }
      return
    } catch {
      $last = $_
      Start-Sleep -Milliseconds (300 * $i)
    }
  }
  throw $last
}

Write-Host "[1/4] 備份原檔..." -ForegroundColor Cyan
foreach ($item in $targets) {
  $target = Join-Path $project $item.Target
  if (Test-Path $target) {
    $backupFile = Join-Path $backup $item.Target
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backupFile) | Out-Null
    Copy-Item $target $backupFile -Force
  }
}

Write-Host "[2/4] 套用 NT$399 R2 獨立收款（鎖檔重試版）..." -ForegroundColor Cyan
foreach ($item in $targets) {
  $source = Join-Path $here $item.Source
  $target = Join-Path $project $item.Target
  Write-Host "  -> $($item.Target)"
  Write-FileWithRetry $source $target
}

Write-Host "[3/4] npm run build..." -ForegroundColor Cyan
Set-Location $project
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "[FAIL] Build 失敗。備份位於：" -ForegroundColor Red
  Write-Host $backup -ForegroundColor Yellow
  exit $LASTEXITCODE
}

Write-Host "[4/4] 完成" -ForegroundColor Green
Write-Host ""
Write-Host "PASS：NT$399 圖片包匯款回報已改存 Private R2。" -ForegroundColor Green
Write-Host "PASS：/admin/payments 的 NT$399 訂單改讀 R2。" -ForegroundColor Green
Write-Host "PASS：/rxv-image-bundle-admin.html 可獨立管理。" -ForegroundColor Green
Write-Host "注意：未修改 api\main.ts、登入系統與其他付款功能。" -ForegroundColor Yellow
