@echo off
echo ========================================================
echo   CampusPulse - Starting Node.js Express REST API
echo ========================================================
echo.

cd /d "%~dp0server"

if not exist "node_modules\" (
    echo [!] Installing required dependencies...
    call npm install
)

echo [*] Launching Server on http://localhost:5000 ...
start http://localhost:5000
npm start
