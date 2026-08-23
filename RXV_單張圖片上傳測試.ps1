$ErrorActionPreference = "Stop"

$project = "D:\Pomodoro-app"
Set-Location $project

Write-Host "RXV 單張圖片上傳測試" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$line = Get-Content ".env.local" | Where-Object { $_ -match '^\s*RXV_IMAGE_ADMIN_KEY\s*=' } | Select-Object -First 1
if (-not $line) {
    Write-Host "UPLOAD FAIL: .env.local 找不到 RXV_IMAGE_ADMIN_KEY" -ForegroundColor Red
    exit 1
}
$key = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")

Add-Type -AssemblyName System.Windows.Forms
$dlg = New-Object System.Windows.Forms.OpenFileDialog
$dlg.Filter = "圖片|*.jpg;*.jpeg;*.png;*.webp"
$dlg.Title = "請選擇 1 張 RXV 測試圖片"
$dlg.Multiselect = $false

if ($dlg.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
    Write-Host "已取消，沒有上傳任何圖片。" -ForegroundColor Yellow
    exit 0
}

$file = $dlg.FileName
$bytes = [System.IO.File]::ReadAllBytes($file)
$ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()

$mime = switch ($ext) {
    ".png"  { "image/png" }
    ".webp" { "image/webp" }
    ".jpg"  { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    default { throw "不支援的圖片格式：$ext" }
}

$base64 = "data:$mime;base64," + [Convert]::ToBase64String($bytes)

$payload = @{
    base64        = $base64
    category_id   = "flower-plant"
    category_name = "花卉／植物"
    price_type    = "bundle"
    file_name     = [System.IO.Path]::GetFileName($file)
    mime_type     = $mime
    file_size     = $bytes.Length
}

$body = $payload | ConvertTo-Json -Depth 5 -Compress

try {
    $u = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/main?action=uploadImage" `
        -Method POST `
        -Headers @{"X-RXV-Image-Admin-Key" = $key} `
        -ContentType "application/json; charset=utf-8" `
        -Body $body `
        -TimeoutSec 120

    Write-Host ""
    Write-Host "UPLOAD PASS = $($u.success)" -ForegroundColor Green
    Write-Host "MANIFEST COUNT = $($u.manifest_count)" -ForegroundColor Green
    Write-Host "THUMBNAIL = $($u.thumbnail_url)" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "UPLOAD FAIL" -ForegroundColor Red
    $detail = $_.ErrorDetails.Message
    if (-not $detail) { $detail = $_.Exception.Message }
    Write-Host $detail -ForegroundColor Red
}
