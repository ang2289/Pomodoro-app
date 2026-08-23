$ErrorActionPreference = "Stop"

$project = "D:\Pomodoro-app"
Set-Location $project

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " RXV 一鍵小圖上傳測試" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1) 讀取管理金鑰（不顯示內容）
$envFile = Join-Path $project ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "[FAIL] 找不到 .env.local" -ForegroundColor Red
    exit 1
}

$keyLine = Get-Content $envFile |
    Where-Object { $_ -match '^\s*RXV_IMAGE_ADMIN_KEY\s*=' } |
    Select-Object -First 1

if (-not $keyLine) {
    Write-Host "[FAIL] .env.local 找不到 RXV_IMAGE_ADMIN_KEY" -ForegroundColor Red
    exit 1
}

$key = ($keyLine -split '=', 2)[1].Trim().Trim('"').Trim("'")
Write-Host "[1/4] 管理金鑰：已讀取（不顯示內容）" -ForegroundColor Green

$headers = @{
    "X-RXV-Image-Admin-Key" = $key
}

# 2) 先讀目前 manifest 數量
try {
    $before = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=admin-list-images" `
        -Headers $headers `
        -Method Get `
        -TimeoutSec 30

    $beforeCount = [int]$before.total
    Write-Host "[2/4] 上傳前圖片數量：$beforeCount" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] 無法讀取目前圖片數量" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    exit 1
}

# 3) 建立一張極小 PNG，不需選檔
# 1x1 PNG，合法圖片，可供 sharp 解碼、縮圖與 WebP 轉換
$smallPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlVn9sAAAAASUVORK5CYII="
$fileName = "rxv-r2-small-test-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".png"

$payload = @{
    base64        = "data:image/png;base64,$smallPngBase64"
    category_id   = "flower-plant"
    category_name = "花卉／植物"
    price_type    = "bundle"
    file_name     = $fileName
    mime_type     = "image/png"
    file_size     = 68
}

$body = $payload | ConvertTo-Json -Depth 5 -Compress

Write-Host "[3/4] 正在上傳 1x1 測試 PNG..." -ForegroundColor Yellow

try {
    $upload = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=uploadImage" `
        -Headers $headers `
        -Method Post `
        -ContentType "application/json; charset=utf-8" `
        -Body $body `
        -TimeoutSec 60

    if (-not $upload.success) {
        throw "UPLOAD_RETURNED_FALSE"
    }

    Write-Host ""
    Write-Host "UPLOAD PASS = True" -ForegroundColor Green
    Write-Host "MANIFEST COUNT = $($upload.manifest_count)" -ForegroundColor Green
    Write-Host "THUMBNAIL = $($upload.thumbnail_url)" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "UPLOAD FAIL" -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "若後端 rollback 正常，本次失敗不應增加 manifest 數量。" -ForegroundColor Yellow
    exit 1
}

# 4) 再讀一次確認數量
Start-Sleep -Seconds 1

try {
    $after = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=admin-list-images" `
        -Headers $headers `
        -Method Get `
        -TimeoutSec 30

    $afterCount = [int]$after.total

    Write-Host ""
    Write-Host "[4/4] 上傳後圖片數量：$afterCount" -ForegroundColor Green
    Write-Host ""

    if ($afterCount -eq ($beforeCount + 1)) {
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host " 測試成功：$beforeCount -> $afterCount" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
    } else {
        Write-Host "==========================================" -ForegroundColor Yellow
        Write-Host " 上傳 API 成功，但數量驗證不一致" -ForegroundColor Yellow
        Write-Host " Before=$beforeCount  After=$afterCount" -ForegroundColor Yellow
        Write-Host "==========================================" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[WARN] 上傳成功，但第二次讀取清單失敗。" -ForegroundColor Yellow
    Write-Host "請以 MANIFEST COUNT 為準。" -ForegroundColor Yellow
}
