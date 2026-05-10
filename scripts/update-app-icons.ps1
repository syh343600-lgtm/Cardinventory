param(
  [string]$SourcePath = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$publicDir = Join-Path $projectRoot "public"

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
  $SourcePath = Join-Path $publicDir "app-icon-source.png"
}

if (-not (Test-Path -LiteralPath $SourcePath)) {
  throw "找不到源图标：$SourcePath。请先把原图保存为 public/app-icon-source.png。"
}

Add-Type -AssemblyName System.Drawing

function Save-ResizedIcon {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [int]$Size
  )

  $source = [System.Drawing.Image]::FromFile($InputPath)

  try {
    $cropSize = [Math]::Min($source.Width, $source.Height)
    $cropX = [int](($source.Width - $cropSize) / 2)
    $cropY = [int](($source.Height - $cropSize) / 2)
    $cropRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropSize, $cropSize)

    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

      $targetRect = [System.Drawing.Rectangle]::new(0, 0, $Size, $Size)
      $graphics.DrawImage($source, $targetRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
      $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

Save-ResizedIcon `
  -InputPath $SourcePath `
  -OutputPath (Join-Path $publicDir "icon-192.png") `
  -Size 192

Save-ResizedIcon `
  -InputPath $SourcePath `
  -OutputPath (Join-Path $publicDir "icon-512.png") `
  -Size 512

Write-Output "已生成 public/icon-192.png 和 public/icon-512.png"
