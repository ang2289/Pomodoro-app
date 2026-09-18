param(
  [switch]$SkipUpdate
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Write-Step($text) {
  Write-Host "[RXV] $text" -ForegroundColor Cyan
}

function Stop-Port([int]$Port) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      if ($c.OwningProcess) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {}
}

function Wait-Port([int]$Port, [int]$Seconds = 20) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($c) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  return $false
}

function Ensure-Env {
  if (-not (Test-Path (Join-Path $Root '.env.local')) -and (Test-Path 'D:\Pomodoro-app\.env.local')) {
    Copy-Item 'D:\Pomodoro-app\.env.local' (Join-Path $Root '.env.local') -Force
  }
}

function Get-NodePath {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw '找不到 Node.js，請先安裝 Node.js。'
}

function Start-NodeService {
  param(
    [string]$Node,
    [string[]]$Args,
    [string]$OutLog,
    [string]$ErrLog
  )

  if (Test-Path $OutLog) { Remove-Item $OutLog -Force -ErrorAction SilentlyContinue }
  if (Test-Path $ErrLog) { Remove-Item $ErrLog -Force -ErrorAction SilentlyContinue }

  Start-Process -FilePath $Node -ArgumentList $Args -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog -PassThru
}

Ensure-Env

if (-not $SkipUpdate) {
  Write-Step '檢查 GitHub 最新版本...'
  try {
    git fetch origin main | Out-Null
    if ($LASTEXITCODE -eq 0) {
      git reset --hard origin/main | Out-Null
      Write-Step '已同步最新版本。'
      $self = $MyInvocation.MyCommand.Path
      Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$self,'-SkipUpdate') -WorkingDirectory $Root
      exit 0
    }
  } catch {
    Write-Host '[RXV] GitHub 更新失敗，改用目前本機版本繼續。' -ForegroundColor Yellow
  }
}

Ensure-Env

$Node = Get-NodePath
$LogRoot = 'D:\RXV-AutoVideo\logs'
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
New-Item -ItemType Directory -Force -Path 'D:\RXV-AutoVideo' | Out-Null

$env:RXV_SOURCE_ROOT = 'D:\Pomodoro-app'
$env:RXV_AUTO_VIDEO_ROOT = 'D:\RXV-AutoVideo'
$env:RXV_TIKTOK_SAFE_VIDEO = '1'
$env:DOTENV_CONFIG_PATH = Join-Path $Root '.env.local'

if (Test-Path (Join-Path $Root 'node_modules')) {
  $env:NODE_PATH = Join-Path $Root 'node_modules'
} elseif (Test-Path 'D:\Pomodoro-app\node_modules') {
  $env:NODE_PATH = 'D:\Pomodoro-app\node_modules'
}

Write-Step '重新啟動 TikTok 授權服務與圖片推廣器...'
Stop-Port 3006
Stop-Port 3018
Start-Sleep -Milliseconds 700

$p3006 = Start-NodeService -Node $Node -Args @('-r','dotenv/config','server\image-to-video-server.cjs') -OutLog (Join-Path $LogRoot '3006-out.log') -ErrLog (Join-Path $LogRoot '3006-error.log')

if (-not (Wait-Port 3006 20)) {
  Write-Host '[錯誤] TikTok 3006 啟動失敗。' -ForegroundColor Red
  Start-Process notepad.exe (Join-Path $LogRoot '3006-error.log')
  Read-Host '按 Enter 結束'
  exit 1
}

Write-Step 'TikTok 3006 已啟動。'

$p3018 = Start-NodeService -Node $Node -Args @('server\rxv-image-publisher-v2.cjs') -OutLog (Join-Path $LogRoot '3018-out.log') -ErrLog (Join-Path $LogRoot '3018-error.log')

if (-not (Wait-Port 3018 20)) {
  Write-Host '[錯誤] RXV 3018 啟動失敗。' -ForegroundColor Red
  Start-Process notepad.exe (Join-Path $LogRoot '3018-error.log')
  Read-Host '按 Enter 結束'
  exit 1
}

Write-Step 'RXV 3018 已啟動。'

$needOAuth = $false
try {
  Start-Sleep -Seconds 1
  $status = Invoke-RestMethod -Uri 'http://127.0.0.1:3018/api/rxv-tiktok-account?force=1' -TimeoutSec 8
  if ($status -and $status.account) {
    $a = $status.account
    if (-not $a.authorized -or $a.needsUploadReauth) {
      $needOAuth = $true
    }
  }
} catch {}

Start-Process 'http://127.0.0.1:3018'

if ($needOAuth) {
  Start-Sleep -Milliseconds 800
  Start-Process 'http://localhost:3006/tiktok/setup'
}

Write-Host ''
Write-Host '==========================================' -ForegroundColor Green
Write-Host 'RXV 已自動啟動完成' -ForegroundColor Green
Write-Host '主工具：http://127.0.0.1:3018'
Write-Host 'TikTok：http://localhost:3006'
Write-Host '==========================================' -ForegroundColor Green
Write-Host ''
Write-Host '平常只要雙擊 RXV-一鍵啟動.bat。'
Write-Host '若 TikTok 要重新授權，瀏覽器會自動開啟授權頁。'
Start-Sleep -Seconds 3
