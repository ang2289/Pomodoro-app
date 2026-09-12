$ErrorActionPreference = "Stop"
$project = "D:\Pomodoro-app"
$script = Join-Path $project "scripts\delete-old-supabase-images.ts"

Write-Host "[1/3] 安裝安全刪除腳本..." -ForegroundColor Cyan
Copy-Item (Join-Path $PSScriptRoot "delete-old-supabase-images.ts") $script -Force

Set-Location $project

Write-Host "[2/3] 先做 Dry Run，只列出、不刪除..." -ForegroundColor Cyan
npm exec tsx scripts/delete-old-supabase-images.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "[STOP] Dry Run 失敗，尚未刪除任何檔案。" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "[3/3] 若上面顯示約 1409 個 images/ 舊檔，請再執行以下指令真正刪除：" -ForegroundColor Yellow
Write-Host "npm exec tsx scripts/delete-old-supabase-images.ts -- --confirm-delete" -ForegroundColor Green
