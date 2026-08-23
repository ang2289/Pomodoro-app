$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root 'output'
$workDir = Join-Path $outputDir 'yannick-video-work'
$finalPath = Join-Path $outputDir 'yannick-first-group-buy-promo-vertical.mp4'

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
New-Item -ItemType Directory -Path $workDir -Force | Out-Null

$slides = @(
    @{ Path = 'D:\0-亞尼克\OK-可發社團\ChatGPT Image 2026年7月21日 下午11_08_16.png'; Duration = 4.0; Kind = 'poster' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_11 (1).png'; Duration = 2.5; Kind = 'product'; Title = '原味生乳捲'; Price = '團購價 NT$298' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_12 (2).png'; Duration = 2.5; Kind = 'product'; Title = '特黑巧克力生乳捲'; Price = '團購價 NT$319' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_13 (3).png'; Duration = 2.5; Kind = 'product'; Title = '茶拿鐵布丁生乳捲'; Price = '團購價 NT$319' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_14 (4).png'; Duration = 2.5; Kind = 'product'; Title = '北海道黑酷曲'; Price = '團購價 NT$342' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_14 (5).png'; Duration = 2.5; Kind = 'product'; Title = '宇治抹茶生乳捲'; Price = '團購價 NT$531' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_14 (6).png'; Duration = 2.5; Kind = 'product'; Title = '香草布丁生乳捲'; Price = '團購價 NT$319' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_15 (7).png'; Duration = 2.5; Kind = 'product'; Title = '期間限定－三顆布丁生乳捲'; Price = '團購價 NT$353' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_15 (8).png'; Duration = 2.5; Kind = 'product'; Title = '期間限定－特濃薄荷巧克力脆片生乳捲'; Price = '團購價 NT$429' },
    @{ Path = 'D:\0-亞尼克\ChatGPT Image 2026年7月20日 下午05_51_15 (9).png'; Duration = 2.5; Kind = 'product'; Title = '期間限定－薄荷巧克力北海道黑酷曲'; Price = '團購價 NT$407' },
    @{ Path = 'D:\0-亞尼克\OK-可發社團\ChatGPT Image 2026年7月22日 上午01_18_13.png'; Duration = 5.0; Kind = 'poster' },
    @{ Path = 'D:\0-亞尼克\OK-可發社團\ChatGPT Image 2026年7月22日 下午04_18_38.png'; Duration = 4.0; Kind = 'poster' },
    @{ Path = 'D:\0-亞尼克\OK-可發社團\ChatGPT Image 2026年7月21日 下午11_08_16.png'; Duration = 4.0; Kind = 'poster' }
)

foreach ($slide in $slides) {
    if (-not (Test-Path -LiteralPath $slide.Path)) {
        throw "找不到素材：$($slide.Path)"
    }
}

function Convert-ToAssTime([double]$seconds) {
    $hours = [math]::Floor($seconds / 3600)
    $minutes = [math]::Floor(($seconds % 3600) / 60)
    $secs = [math]::Floor($seconds % 60)
    $centis = [math]::Round(($seconds - [math]::Floor($seconds)) * 100)
    return ('{0}:{1:00}:{2:00}.{3:00}' -f $hours, $minutes, $secs, $centis)
}

$segmentPaths = @()
$timeline = 0.0
$events = New-Object System.Collections.Generic.List[string]

for ($index = 0; $index -lt $slides.Count; $index++) {
    $slide = $slides[$index]
    $segmentPath = Join-Path $workDir ('segment-{0:00}.mp4' -f $index)
    $segmentPaths += $segmentPath
    $fadeOutStart = [math]::Max(0, $slide.Duration - 0.25)

    $filter = "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=32[bg];" +
              "[0:v]scale=1030:1840:force_original_aspect_ratio=decrease[fg];" +
              "[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p," +
              "fade=t=in:st=0:d=0.25,fade=t=out:st=${fadeOutStart}:d=0.25[v]"

    if (-not (Test-Path -LiteralPath $segmentPath) -or (Get-Item -LiteralPath $segmentPath).Length -lt 10000) {
        & ffmpeg -hide_banner -loglevel error -y -loop 1 -t $slide.Duration -i $slide.Path `
            -filter_complex $filter -map '[v]' -an -r 30 -c:v libx264 -preset fast -crf 20 `
            -pix_fmt yuv420p -movflags +faststart $segmentPath

        if ($LASTEXITCODE -ne 0) {
            throw "影片片段產生失敗：$($slide.Path)"
        }
    }

    if ($slide.Kind -eq 'product') {
        $start = Convert-ToAssTime($timeline + 0.25)
        $end = Convert-ToAssTime($timeline + $slide.Duration - 0.25)
        $events.Add("Dialogue: 0,$start,$end,ProductTitle,,0,0,0,,$($slide.Title)\N{$($slide.Price)}")
        $events.Add("Dialogue: 0,$start,$end,ProductFooter,,0,0,0,,官網定價76折｜先登記・成團後付款\N冷凍宅配，滿10條免運｜門市自取，買1條即可免運\N商品圖片僅供參考")
    }

    $timeline += $slide.Duration
}

$concatPath = Join-Path $workDir 'segments.txt'
$concatLines = $segmentPaths | ForEach-Object { "file '$($_.Replace("'", "''"))'" }
[System.IO.File]::WriteAllLines($concatPath, $concatLines, [System.Text.UTF8Encoding]::new($false))

$joinedPath = Join-Path $workDir 'joined.mp4'
& ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i $concatPath -c copy $joinedPath
if ($LASTEXITCODE -ne 0) {
    throw '影片片段串接失敗。'
}

$assPath = Join-Path $workDir 'captions.ass'
$assHeader = @"
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ProductTitle,Microsoft JhengHei,62,&H00FFFFFF,&H000000FF,&H00432616,&H9A3A190A,-1,0,0,0,100,100,1,0,3,2,0,8,55,55,125,1
Style: ProductFooter,Microsoft JhengHei,37,&H00FFFFFF,&H000000FF,&H00432616,&H9A3A190A,-1,0,0,0,100,100,0,0,3,2,0,2,55,55,125,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"@
$assContent = $assHeader + "`r`n" + ($events -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText($assPath, $assContent, [System.Text.UTF8Encoding]::new($true))

Push-Location $workDir
try {
    & ffmpeg -hide_banner -loglevel error -y -i 'joined.mp4' -f lavfi -i 'anullsrc=r=48000:cl=stereo' `
        -vf 'ass=captions.ass' -map '0:v:0' -map '1:a:0' -c:v libx264 -preset medium -crf 20 `
        -c:a aac -b:a 128k -shortest -movflags +faststart $finalPath
    if ($LASTEXITCODE -ne 0) {
        throw '字幕合成或最終影片輸出失敗。'
    }
}
finally {
    Pop-Location
}

Write-Output $finalPath
