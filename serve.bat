@echo off
title CampusPulse Prototype Server
cd /d "%~dp0"
echo ============================================================
echo   Starting CampusPulse College Project Prototype...
echo ============================================================
echo.
echo Launching local server on http://localhost:8000
echo If PowerShell execution policy is restricted, index.html will open directly.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo Opening index.html directly in your default browser...
    start "" "%~dp0index.html"
)
pause
