<#
.SYNOPSIS
    Zero-dependency local HTTP web server for CampusPulse prototype using built-in Windows PowerShell.
#>
param(
    [int]$Port = 8000
)

$Folder = $PSScriptRoot
if (-not $Folder) { $Folder = Get-Location }

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "[!] Could not start HTTP server on port $Port. Opening index.html directly..." -ForegroundColor Yellow
    Start-Process "$Folder\index.html"
    exit
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CampusPulse - College Project Prototype Web Server     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Server running at: $prefix" -ForegroundColor Yellow
Write-Host "Serving directory: $Folder" -ForegroundColor Gray
Write-Host "Press Ctrl + C in this terminal to stop the server." -ForegroundColor Gray
Write-Host "Opening your default web browser..." -ForegroundColor Green

Start-Process $prefix

# MIME type mapping
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($path)) { $path = "index.html" }
        $path = $path.Replace('/', '\')
        $filePath = Join-Path $Folder $path

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    } catch {
        # Listener stopped or cancelled
        break
    }
}
