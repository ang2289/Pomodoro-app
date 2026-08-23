$ErrorActionPreference = "Stop"
$project = "D:\Pomodoro-app"
$source = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/5] 備份本次會動到的檔案..."
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $project "_backup_clean_image_admin_$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$filesToBackup = @(
  "src\pages\admin\images.tsx",
  "src\pages\admin\images-list.tsx",
  "scripts\dev-image-admin-api.ts"
)
foreach ($rel in $filesToBackup) {
  $src = Join-Path $project $rel
  if (Test-Path $src) {
    $dst = Join-Path $backup $rel
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dst) | Out-Null
    Copy-Item $src $dst -Force
  }
}

Write-Host "[2/5] 建立獨立正式 API：api/image-admin.ts"
Copy-Item (Join-Path $source "image-admin.ts") (Join-Path $project "api\image-admin.ts") -Force

Write-Host "[3/5] 更新本機 API bridge"
Copy-Item (Join-Path $source "dev-image-admin-api.ts") (Join-Path $project "scripts\dev-image-admin-api.ts") -Force

Write-Host "[4/5] 將兩個正式 React 圖片後台改用 /api/image-admin"
$targets = @(
  (Join-Path $project "src\pages\admin\images.tsx"),
  (Join-Path $project "src\pages\admin\images-list.tsx")
)
foreach ($file in $targets) {
  $text = [System.IO.File]::ReadAllText($file)
  $next = $text.Replace("/api/main?action=", "/api/image-admin?action=")
  if ($next -eq $text) {
    Write-Host "[WARN] $file 沒找到 /api/main?action=，請人工檢查。" -ForegroundColor Yellow
  }
  [System.IO.File]::WriteAllText($file, $next, [System.Text.UTF8Encoding]::new($false))
}

Write-Host "[5/5] npm run build"
Set-Location $project
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAIL] build 失敗；沒有動 api/main.ts，備份位於 $backup" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "PASS：正式圖片後台已改用獨立 /api/image-admin。" -ForegroundColor Green
Write-Host "api/main.ts 完全沒有被此腳本修改。" -ForegroundColor Green
Write-Host "下一步可執行：npm run dev:image-admin" -ForegroundColor Cyan
