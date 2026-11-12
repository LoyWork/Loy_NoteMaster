param([string]$Source = (Join-Path $PSScriptRoot '..\build\icon-source.png'))

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$frameDir = Join-Path $projectRoot 'out\icon-frames'
New-Item -ItemType Directory -Path $frameDir -Force | Out-Null
$sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source).Path)

function Save-IconPng([string]$Target, [int]$Width, [int]$Height = $Width) {
    $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $side = [Math]::Min($Width, $Height)
        $rect = [System.Drawing.Rectangle]::new([int](($Width - $side) / 2), [int](($Height - $side) / 2), $side, $side)
        $graphics.DrawImage($sourceImage, $rect)
        $bitmap.Save($Target, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

try {
    foreach ($size in @(16, 20, 24, 32, 40, 44, 48, 64, 128, 150, 256, 512, 1024)) {
        Save-IconPng (Join-Path $frameDir "$size.png") $size
    }
    $pngTargets = @{
        'build/icon.png' = 512
        'build/icon@2x.png' = 1024
        'src/main/assets/icon.png' = 512
        'src/renderer/assets/icon.png' = 512
        'src/main/assets/tray.png' = 16
        'src/main/assets/tray@2x.png' = 32
        'src/main/assets/tray@3x.png' = 48
        'src/main/assets/tray@4x.png' = 64
        'build/appx/StoreLogo.png' = 512
        'build/appx/Square44x44Logo.png' = 44
        'build/appx/Square150x150Logo.png' = 150
    }
    foreach ($entry in $pngTargets.GetEnumerator()) {
        Copy-Item -LiteralPath (Join-Path $frameDir "$($entry.Value).png") -Destination (Join-Path $projectRoot $entry.Key) -Force
    }
    Save-IconPng (Join-Path $projectRoot 'build/appx/Wide310x150Logo.png') 310 150

    # ICO frames contain alpha-preserving PNGs, including high-DPI Windows sizes.
    $icoSizes = @(16, 20, 24, 32, 40, 48, 64, 128, 256)
    $icoStream = [System.IO.File]::Create((Join-Path $projectRoot 'build/icon.ico'))
    $icoWriter = [System.IO.BinaryWriter]::new($icoStream)
    try {
        $icoWriter.Write([uint16]0)
        $icoWriter.Write([uint16]1)
        $icoWriter.Write([uint16]$icoSizes.Count)
        $offset = 6 + 16 * $icoSizes.Count
        foreach ($size in $icoSizes) {
            $bytes = [System.IO.File]::ReadAllBytes((Join-Path $frameDir "$size.png"))
            $icoWriter.Write([byte]$(if ($size -eq 256) { 0 } else { $size }))
            $icoWriter.Write([byte]$(if ($size -eq 256) { 0 } else { $size }))
            $icoWriter.Write([byte]0)
            $icoWriter.Write([byte]0)
            $icoWriter.Write([uint16]1)
            $icoWriter.Write([uint16]32)
            $icoWriter.Write([uint32]$bytes.Length)
            $icoWriter.Write([uint32]$offset)
            $offset += $bytes.Length
        }
        foreach ($size in $icoSizes) {
            $icoWriter.Write([System.IO.File]::ReadAllBytes((Join-Path $frameDir "$size.png")))
        }
    } finally {
        $icoWriter.Dispose()
    }
    Copy-Item -LiteralPath (Join-Path $projectRoot 'build/icon.ico') -Destination (Join-Path $projectRoot 'src/renderer/assets/favicon.ico') -Force

    # Keep the repository's macOS asset consistent, even though CI builds Windows.
    $icnsFrames = @(@('icp4', 16), @('icp5', 32), @('icp6', 64), @('ic07', 128), @('ic08', 256), @('ic09', 512), @('ic10', 1024))
    $icnsSize = 8
    foreach ($frame in $icnsFrames) { $icnsSize += 8 + (Get-Item -LiteralPath (Join-Path $frameDir "$($frame[1]).png")).Length }
    $icnsWriter = [System.IO.BinaryWriter]::new([System.IO.File]::Create((Join-Path $projectRoot 'build/icon.icns')))
    try {
        $icnsWriter.Write([System.Text.Encoding]::ASCII.GetBytes('icns'))
        $icnsWriter.Write([System.BitConverter]::GetBytes([System.Net.IPAddress]::HostToNetworkOrder([int]$icnsSize)))
        foreach ($frame in $icnsFrames) {
            $bytes = [System.IO.File]::ReadAllBytes((Join-Path $frameDir "$($frame[1]).png"))
            $icnsWriter.Write([System.Text.Encoding]::ASCII.GetBytes($frame[0]))
            $icnsWriter.Write([System.BitConverter]::GetBytes([System.Net.IPAddress]::HostToNetworkOrder([int]($bytes.Length + 8))))
            $icnsWriter.Write($bytes)
        }
    } finally {
        $icnsWriter.Dispose()
    }
} finally {
    $sourceImage.Dispose()
}
Write-Output 'Updated app, installer, favicon and Windows tray icons from build/icon-source.png'
