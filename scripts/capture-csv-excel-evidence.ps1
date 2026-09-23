param(
  [string]$OutputDirectory = "reports\phase2"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class WindowCapture {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int command);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr hWnd, int x, int y, int width, int height, bool repaint);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hWnd, IntPtr targetDeviceContext, uint flags);
}
"@

$root = (Resolve-Path ".").Path
$output = Join-Path $root $OutputDirectory
New-Item -ItemType Directory -Path $output -Force | Out-Null
$items = @(
  @{ Input = "public\downloads\familyboard-home-inventory-template.csv"; Output = "home-inventory-csv-excel.png" },
  @{ Input = "public\downloads\familyboard-moving-checklist.csv"; Output = "moving-checklist-csv-excel.png" }
)

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $true
$excel.DisplayAlerts = $false
try {
  [WindowCapture]::ShowWindow([IntPtr]$excel.Hwnd, 9) | Out-Null
  [WindowCapture]::MoveWindow([IntPtr]$excel.Hwnd, 40, 40, 1400, 820, $true) | Out-Null
  foreach ($item in $items) {
    $inputPath = (Resolve-Path (Join-Path $root $item.Input)).Path
    $workbook = $excel.Workbooks.Open($inputPath)
    try {
      $sheet = $workbook.Worksheets.Item(1)
      $sheet.Columns.AutoFit() | Out-Null
      $sheet.Rows.Item(1).Font.Bold = $true
      $sheet.Rows.Item(1).Interior.ColorIndex = 36
      $excel.ActiveWindow.Zoom = 75
      [WindowCapture]::SetForegroundWindow([IntPtr]$excel.Hwnd) | Out-Null
      Start-Sleep -Milliseconds 1200
      $rect = New-Object WindowCapture+RECT
      if (-not [WindowCapture]::GetWindowRect([IntPtr]$excel.Hwnd, [ref]$rect)) {
        throw "Could not read the Excel window bounds."
      }
      $width = $rect.Right - $rect.Left
      $height = $rect.Bottom - $rect.Top
      $bitmap = New-Object System.Drawing.Bitmap($width, $height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $deviceContext = $graphics.GetHdc()
        try {
          if (-not [WindowCapture]::PrintWindow([IntPtr]$excel.Hwnd, $deviceContext, 2)) {
            throw "Excel window rendering failed."
          }
        } finally {
          $graphics.ReleaseHdc($deviceContext)
        }
        $bitmap.Save((Join-Path $output $item.Output), [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
      }
    } finally {
      $workbook.Close($false)
      [void][Runtime.InteropServices.Marshal]::ReleaseComObject($workbook)
    }
  }
} finally {
  $excel.Quit()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output "Excel CSV evidence written to $output"
