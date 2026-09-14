$ErrorActionPreference = 'Stop'

$repo = 'D:\Pomodoro-app'
$source = 'D:\0--AI\備份APP\Pomodoro-app\.env.local'
$target = Join-Path $repo '.env.local'

if (!(Test-Path $source)) { throw "找不到可用憑證來源：$source" }
if (!(Test-Path $target)) { throw "找不到目前環境檔：$target" }

function Read-EnvMap([string]$path) {
    $map = @{}
    foreach ($line in [System.IO.File]::ReadAllLines($path)) {
        if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
        $idx = $line.IndexOf('=')
        if ($idx -lt 1) { continue }
        $name = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1).Trim()
        if ($name) { $map[$name] = $value }
    }
    return $map
}

function Set-EnvValue([string]$text, [string]$name, [string]$value) {
    $pattern = '(?m)^\s*' + [regex]::Escape($name) + '\s*=.*$'
    $replacement = $name + '=' + $value
    if ([regex]::IsMatch($text, $pattern)) {
        return [regex]::Replace($text, $pattern, $replacement, 1)
    }
    return $text.TrimEnd() + "`r`n" + $replacement + "`r`n"
}

$src = Read-EnvMap $source
$required = @('R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY')
foreach ($name in $required) {
    if (-not $src.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($src[$name])) {
        throw "來源環境檔缺少：$name"
    }
}

$backupDir = Join-Path $repo 'backup\r2-credentials-restore'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $backupDir ".env.local.$stamp.bak"
Copy-Item $target $backup -Force

$text = [System.IO.File]::ReadAllText($target)
foreach ($name in $required) {
    $text = Set-EnvValue $text $name $src[$name]
}

[System.IO.File]::WriteAllText($target, $text, (New-Object System.Text.UTF8Encoding($false)))

Write-Host '已把「已驗證可讀取 1591 張 catalog」的 R2 憑證同步回目前 .env.local。' -ForegroundColor Green
Write-Host '只更新：R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY'
Write-Host '沒有修改：RXV_IMAGE_ADMIN_KEY / bucket 名稱 / Public URL / APP / catalog'
Write-Host "備份：$backup"
Write-Host ''
Write-Host '下一步：node scripts/diagnose-r2-image-admin.mjs'
