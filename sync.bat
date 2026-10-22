@echo off
echo ========================================================
echo   CampusPulse - Team Git Sync (Pull & Safe Rebase)
echo ========================================================

echo [1/3] Fetching remote updates from origin...
git fetch origin

echo [2/3] Pulling latest team changes with rebase...
git pull --rebase origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Conflict detected during rebase!
    echo Please resolve conflicting files, then run:
    echo    git rebase --continue
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Checking working status...
git status -s

echo.
echo [✓] Your local repository is up-to-date with your team!
pause
