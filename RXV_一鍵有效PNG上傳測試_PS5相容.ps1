$ErrorActionPreference = "Stop"

$project = "D:\Pomodoro-app"
Set-Location $project

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " RXV 一鍵有效 PNG 上傳測試（PowerShell 5 相容）" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Show-ErrorDetail {
    param($err)
    $detail = ""
    try {
        if ($err.ErrorDetails -and $err.ErrorDetails.Message) {
            $detail = $err.ErrorDetails.Message
        }
    } catch {}
    if (-not $detail) {
        try {
            if ($err.Exception -and $err.Exception.Message) {
                $detail = $err.Exception.Message
            }
        } catch {}
    }
    if (-not $detail) {
        $detail = "未知錯誤"
    }
    Write-Host $detail -ForegroundColor Red
}

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
$headers = @{ "X-RXV-Image-Admin-Key" = $key }

Write-Host "[1/5] 管理金鑰：已讀取（不顯示內容）" -ForegroundColor Green

# 2) 讀取上傳前數量
try {
    $before = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=admin-list-images" `
        -Headers $headers `
        -Method Get `
        -TimeoutSec 30

    $beforeCount = [int]$before.total
    Write-Host "[2/5] 上傳前圖片數量：$beforeCount" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] 讀取圖片清單失敗" -ForegroundColor Red
    Show-ErrorDetail $_
    exit 1
}

# 3) 用 System.Drawing 真正產生合法 64x64 PNG
Add-Type -AssemblyName System.Drawing

$tempFile = Join-Path $env:TEMP ("rxv-valid-test-" + [guid]::NewGuid().ToString("N") + ".png")
$bmp = New-Object System.Drawing.Bitmap 64,64
$g = [System.Drawing.Graphics]::FromImage($bmp)

try {
    $g.Clear([System.Drawing.Color]::White)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 120, 180, 120))
    try {
        $g.FillEllipse($brush, 12, 12, 40, 40)
    }
    finally {
        $brush.Dispose()
    }

    $bmp.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
    $g.Dispose()
    $bmp.Dispose()
}

$bytes = [System.IO.File]::ReadAllBytes($tempFile)
$base64 = [Convert]::ToBase64String($bytes)

Write-Host "[3/5] 已建立合法 64x64 PNG，大小：$($bytes.Length) bytes" -ForegroundColor Green

# 4) 上傳
$payload = @{
    base64        = "data:image/png;base64,$base64"
    category_id   = "flower-plant"
    category_name = "花卉／植物"
    price_type    = "bundle"
    file_name     = "rxv-valid-test-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".png"
    mime_type     = "image/png"
    file_size     = $bytes.Length
}

$body = $payload | ConvertTo-Json -Depth 5 -Compress

Write-Host "[4/5] 正在上傳合法 PNG..." -ForegroundColor Yellow

try {
    $upload = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=uploadImage" `
        -Headers $headers `
        -Method Post `
        -ContentType "application/json; charset=utf-8" `
        -Body $body `
        -TimeoutSec 120

    Write-Host ""
    Write-Host "UPLOAD PASS = $($upload.success)" -ForegroundColor Green
    Write-Host "MANIFEST COUNT = $($upload.manifest_count)" -ForegroundColor Green
    Write-Host "THUMBNAIL = $($upload.thumbnail_url)" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "UPLOAD FAIL" -ForegroundColor Red
    Show-ErrorDetail $_

    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

# 5) 驗證數量
Start-Sleep -Seconds 1

try {
    $after = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=admin-list-images" `
        -Headers $headers `
        -Method Get `
        -TimeoutSec 30

    $afterCount = [int]$after.total
    Write-Host "[5/5] 上傳後圖片數量：$afterCount" -ForegroundColor Green

    Write-Host ""
    if ($afterCount -eq ($beforeCount + 1)) {
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host " 測試成功：$beforeCount -> $afterCount" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
    }
    else {
        Write-Host "==========================================" -ForegroundColor Yellow
        Write-Host " API 上傳成功，但數量驗證不是 +1" -ForegroundColor Yellow
        Write-Host " Before=$beforeCount  After=$afterCount" -ForegroundColor Yellow
        Write-Host "==========================================" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[WARN] 上傳成功，但第二次清單驗證失敗；以 MANIFEST COUNT 為準。" -ForegroundColor Yellow
}

if (Test-Path $tempFile) {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
}
