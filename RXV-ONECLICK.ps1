param([switch]$SkipUpdate)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Log([string]$Text) { Write-Host ("[RXV] " + $Text) -ForegroundColor Cyan }

function Stop-Port([int]$Port) {
  try {
    $items = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($item in $items) {
      if ($item.OwningProcess) { Stop-Process -Id $item.OwningProcess -Force -ErrorAction SilentlyContinue }
    }
  } catch {}
}

function Stop-RxvNodeProcesses {
  try {
    $items = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
    foreach ($item in $items) {
      $cmd = [string]$item.CommandLine
      if ($cmd -match "image-to-video-server\.cjs" -or $cmd -match "rxv-image-publisher-v2\.cjs") {
        Stop-Process -Id $item.ProcessId -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {}
}

function Wait-Port([int]$Port, [int]$TimeoutSeconds = 20) {
  $end = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $end) {
    try {
      $item = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($item) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  return $false
}

function Ensure-EnvFile {
  $target = Join-Path $Root ".env.local"
  if (-not (Test-Path $target)) {
    $source = "D:\Pomodoro-app\.env.local"
    if (Test-Path $source) { Copy-Item $source $target -Force }
  }
}

function Backup-LocalDatabases {
  $backup = "D:\RXV-AutoVideo\state-backup"
  New-Item -ItemType Directory -Force -Path $backup | Out-Null
  $dataDir = Join-Path $Root "data"
  if (Test-Path $dataDir) {
    Get-ChildItem $dataDir -File -ErrorAction SilentlyContinue | Where-Object {
      $_.Name -match "\.db($|-wal$|-shm$)"
    } | ForEach-Object {
      Copy-Item $_.FullName (Join-Path $backup $_.Name) -Force -ErrorAction SilentlyContinue
    }
  }
  return $backup
}

function Restore-LocalDatabases([string]$BackupDir) {
  if (-not (Test-Path $BackupDir)) { return }
  $dataDir = Join-Path $Root "data"
  New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
  Get-ChildItem $BackupDir -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -match "\.db($|-wal$|-shm$)"
  } | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $dataDir $_.Name) -Force -ErrorAction SilentlyContinue
  }
}

function Find-Node {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Node.js was not found." }
  return $cmd.Source
}

function Start-NodeService {
  param([string]$NodePath,[string[]]$NodeArgs,[string]$OutLog,[string]$ErrLog)
  if (Test-Path $OutLog) { Remove-Item $OutLog -Force -ErrorAction SilentlyContinue }
  if (Test-Path $ErrLog) { Remove-Item $ErrLog -Force -ErrorAction SilentlyContinue }
  return Start-Process -FilePath $NodePath -ArgumentList $NodeArgs -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog -PassThru
}

try {
  Ensure-EnvFile

  Log "Stopping old RXV services..."
  Stop-Port 3006
  Stop-Port 3018
  Stop-RxvNodeProcesses
  Start-Sleep -Milliseconds 1000

  $DbBackup = Backup-LocalDatabases

  if (-not $SkipUpdate) {
    Log "Checking GitHub updates..."
    try {
      git fetch origin main | Out-Null
      if ($LASTEXITCODE -eq 0) {
        git reset --hard origin/main | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "git reset failed" }
        Restore-LocalDatabases $DbBackup
        Log "GitHub update complete."
      }
    } catch {
      Restore-LocalDatabases $DbBackup
      Write-Host "[RXV] GitHub update failed. Continuing with local files." -ForegroundColor Yellow
    }
  } else {
    Restore-LocalDatabases $DbBackup
  }

  Ensure-EnvFile
  $Node = Find-Node
  $LogRoot = "D:\RXV-AutoVideo\logs"
  New-Item -ItemType Directory -Force -Path "D:\RXV-AutoVideo" | Out-Null
  New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

  $env:RXV_SOURCE_ROOT = "D:\Pomodoro-app"
  $env:RXV_AUTO_VIDEO_ROOT = "D:\RXV-AutoVideo"
  $env:RXV_TIKTOK_SAFE_VIDEO = "1"
  $env:DOTENV_CONFIG_PATH = Join-Path $Root ".env.local"

  if (Test-Path (Join-Path $Root "node_modules")) {
    $env:NODE_PATH = Join-Path $Root "node_modules"
  } elseif (Test-Path "D:\Pomodoro-app\node_modules") {
    $env:NODE_PATH = "D:\Pomodoro-app\node_modules"
  } else {
    throw "node_modules was not found."
  }

  Log "Starting services..."
  Stop-Port 3006
  Stop-Port 3018
  Stop-RxvNodeProcesses
  Start-Sleep -Milliseconds 800

  Start-NodeService -NodePath $Node -NodeArgs @("-r","dotenv/config","server\image-to-video-server.cjs") -OutLog (Join-Path $LogRoot "3006-out.log") -ErrLog (Join-Path $LogRoot "3006-error.log") | Out-Null
  if (-not (Wait-Port 3006 25)) { throw "TikTok service on port 3006 failed to start." }
  Log "Port 3006 is ready."

  Start-NodeService -NodePath $Node -NodeArgs @("server\rxv-image-publisher-v2.cjs") -OutLog (Join-Path $LogRoot "3018-out.log") -ErrLog (Join-Path $LogRoot "3018-error.log") | Out-Null
  if (-not (Wait-Port 3018 25)) { throw "RXV service on port 3018 failed to start." }
  Log "Port 3018 is ready."

  $NeedOAuth = $false
  try {
    Start-Sleep -Milliseconds 800
    $Status = Invoke-RestMethod -Uri "http://127.0.0.1:3018/api/rxv-tiktok-account?force=1" -TimeoutSec 10
    if ($Status -and $Status.account) {
      if (-not $Status.account.authorized -or $Status.account.needsUploadReauth) { $NeedOAuth = $true }
    }
  } catch { $NeedOAuth = $true }

  Start-Process "http://127.0.0.1:3018"
  if ($NeedOAuth) {
    Start-Sleep -Milliseconds 700
    Start-Process "http://localhost:3006/tiktok/setup"
  }

  Log "Startup complete."
  Write-Host "RXV:    http://127.0.0.1:3018"
  Write-Host "TikTok: http://localhost:3006"
  Start-Sleep -Seconds 2
  exit 0
}
catch {
  $Message = [string]$_.Exception.Message
  $LogRoot = "D:\RXV-AutoVideo\logs"
  try {
    New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
    $ErrorFile = Join-Path $LogRoot "oneclick-error.txt"
    $Text = $Message + [Environment]::NewLine + [string]$_.ScriptStackTrace
    Set-Content -Path $ErrorFile -Value $Text -Encoding UTF8
    if ($Message -like "*3006*") {
      $Detail = Join-Path $LogRoot "3006-error.log"
      if (Test-Path $Detail) { Start-Process notepad.exe $Detail }
    } elseif ($Message -like "*3018*") {
      $Detail = Join-Path $LogRoot "3018-error.log"
      if (Test-Path $Detail) { Start-Process notepad.exe $Detail }
    } else {
      Start-Process notepad.exe $ErrorFile
    }
  } catch {}
  Write-Host ""
  Write-Host "RXV startup failed:" -ForegroundColor Red
  Write-Host $Message -ForegroundColor Yellow
  Read-Host "Press Enter to close"
  exit 1
}