param()

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

$envPath = Join-Path (Get-Location) '.env.local'
if (-not (Test-Path $envPath)) {
  throw "找不到 $envPath"
}

$backupDir = Join-Path (Get-Location) 'backup\image-admin-r2-credentials'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $backupDir ".env.local.$stamp.bak"
Copy-Item $envPath $backupPath -Force

Write-Host ''
Write-Host 'RXV R2 圖片後台憑證更新' -ForegroundColor Cyan
Write-Host '只更新本機 .env.local，不修改 APP、不修改 R2 catalog。' -ForegroundColor DarkGray
Write-Host ''

$accountId = (Read-Host '請貼上 Cloudflare Account ID').Trim()
$accessKeyId = (Read-Host '請貼上 R2 Access Key ID').Trim()
$secretSecure = Read-Host '請貼上 R2 Secret Access Key（畫面不顯示）' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretSecure)
try {
  $secretAccessKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim()
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

if (-not $accountId -or -not $accessKeyId -or -not $secretAccessKey) {
  throw 'Account ID / Access Key ID / Secret Access Key 不可空白。'
}

$text = [IO.File]::ReadAllText($envPath)

function Set-EnvValue([string]$name, [string]$value) {
  $escapedName = [Regex]::Escape($name)
  $pattern = "(?m)^\s*$escapedName\s*=.*$"
  $line = "$name=$value"
  if ([Regex]::IsMatch($script:text, $pattern)) {
    $script:text = [Regex]::Replace($script:text, $pattern, $line)
  } else {
    $script:text = $script:text.TrimEnd() + "`r`n$line`r`n"
  }
}

Set-EnvValue 'R2_ACCOUNT_ID' $accountId
Set-EnvValue 'R2_ACCESS_KEY_ID' $accessKeyId
Set-EnvValue 'R2_SECRET_ACCESS_KEY' $secretAccessKey
Set-EnvValue 'R2_PUBLIC_BUCKET_NAME' 'rxv-healing-images-public'
Set-EnvValue 'R2_PRIVATE_BUCKET_NAME' 'rxv-healing-images-staging'

# 若已有 VITE_PUBLIC_R2_URL，讓 R2_PUBLIC_ASSET_URL 跟它一致。
$viteMatch = [Regex]::Match($text, '(?m)^\s*VITE_PUBLIC_R2_URL\s*=\s*(.+?)\s*$')
if ($viteMatch.Success -and $viteMatch.Groups[1].Value.Trim()) {
  Set-EnvValue 'R2_PUBLIC_ASSET_URL' $viteMatch.Groups[1].Value.Trim()
}

[IO.File]::WriteAllText($envPath, $text, (New-Object Text.UTF8Encoding($false)))

Write-Host ''
Write-Host '已更新 .env.local。' -ForegroundColor Green
Write-Host "備份：$backupPath"
Write-Host ''
Write-Host '下一步請執行：' -ForegroundColor Yellow
Write-Host 'node scripts/diagnose-r2-image-admin.mjs'
Write-Host ''
Write-Host '成功標準：S3 API catalog read: OK (1591 images 或更多)'
Write-Host '若仍是 AccessDenied，代表 Cloudflare Token 權限或 bucket 範圍仍不正確。'
