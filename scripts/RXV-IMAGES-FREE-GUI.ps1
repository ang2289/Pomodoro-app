# RxV local-only batch free manager. Powershell 5.1 compatible.
# UI buttons never change R2 without a second explicit text confirmation.
param(
  [string]$ProjectPath = ""
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName Microsoft.VisualBasic
[System.Windows.Forms.Application]::EnableVisualStyles()

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
  $ProjectPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
$runner = Join-Path $ProjectPath "scripts\rxv-images-batch-free.mjs"
if (!(Test-Path -LiteralPath $runner)) {
  [System.Windows.Forms.MessageBox]::Show("Cannot find scripts\rxv-images-batch-free.mjs", "RxV Manager") | Out-Null
  exit 1
}
$node = Get-Command node -ErrorAction SilentlyContinue
if (!$node) {
  [System.Windows.Forms.MessageBox]::Show("Node.js is missing. Install Node LTS first.", "RxV Manager") | Out-Null
  exit 1
}
if (!(Test-Path (Join-Path $ProjectPath "node_modules\@aws-sdk\client-s3"))) {
  [System.Windows.Forms.MessageBox]::Show("Run npm ci in the test worktree first. No images changed.", "RxV Manager") | Out-Null
  exit 1
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "RXV Image Free Download Manager - LOCAL QA"
$form.Width = 650
$form.Height = 435
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(248,250,255)
$form.Font = New-Object System.Drawing.Font("Microsoft JhengHei",10)
$form.MaximizeBox = $false

$heading = New-Object System.Windows.Forms.Label
$heading.Text = "RXV - Image Free Download Manager"
$heading.Font = New-Object System.Drawing.Font("Microsoft JhengHei",16,[System.Drawing.FontStyle]::Bold)
$heading.Location = New-Object System.Drawing.Point(26,20)
$heading.AutoSize = $true
$form.Controls.Add($heading)

$note = New-Object System.Windows.Forms.Label
$note.Text = "Local test branch only. Preview changes nothing. Other actions modify LIVE R2 only after explicit confirmation. No Vercel deployment."
$note.Location = New-Object System.Drawing.Point(28,62)
$note.Size = New-Object System.Drawing.Size(575,50)
$note.ForeColor = [System.Drawing.Color]::FromArgb(93,105,123)
$form.Controls.Add($note)

$items = @(
  @{ Text = "1. Preview (read only)"; Mode = "preview"; X=28; Y=129 },
  @{ Text = "2. Test 10 images"; Mode = "test"; X=327; Y=129 },
  @{ Text = "3. Release all locked images"; Mode = "all"; X=28; Y=192 },
  @{ Text = "4. Restore original settings"; Mode = "restore"; X=327; Y=192 }
)
foreach ($item in $items) {
  $button = New-Object System.Windows.Forms.Button
  $button.Text = $item.Text
  $button.Tag = $item.Mode
  $button.Location = New-Object System.Drawing.Point($item.X, $item.Y)
  $button.Size = New-Object System.Drawing.Size(272,48)
  $button.BackColor = [System.Drawing.Color]::FromArgb(229,237,255)
  $button.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
  $button.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(170,193,236)
  $button.Add_Click({
    param($sender,$eventArgs)
    $mode = [string]$sender.Tag
    $phrases = @{ test="TEST 10"; all="FREE ALL"; restore="RESTORE" }
    if ($mode -ne "preview") {
      $phrase = $phrases[$mode]
      $answer = [Microsoft.VisualBasic.Interaction]::InputBox(
        "This modifies LIVE R2. To continue, type: " + $phrase,
        "Confirm RXV operation", "")
      if ($answer -cne $phrase) { return }
    }
    # Run in an ordinary console so the user can watch progress and errors.
    # Only use the --yes option after exact confirmation above.
    $root = $ProjectPath.Replace('"','')
    $yes = if ($mode -eq "preview") { "" } else { " --yes=true" }
    $command = 'cd /d "' + $root + '" && node scripts\rxv-images-batch-free.mjs --mode=' + $mode + $yes
    $process = New-Object System.Diagnostics.ProcessStartInfo
    $process.FileName = "cmd.exe"
    $process.Arguments = '/k ' + $command
    $process.WorkingDirectory = $ProjectPath
    $process.UseShellExecute = $true
    [System.Diagnostics.Process]::Start($process) | Out-Null
  })
  $form.Controls.Add($button)
}

$footer = New-Object System.Windows.Forms.Label
$footer.Text = "Safeguards: private R2 + local backup, 10-image batches, no original deletion, resumable rollback. Close the action console only after it finishes."
$footer.Location = New-Object System.Drawing.Point(28,278)
$footer.Size = New-Object System.Drawing.Size(570,67)
$footer.ForeColor = [System.Drawing.Color]::FromArgb(93,105,123)
$form.Controls.Add($footer)
[void]$form.ShowDialog()
