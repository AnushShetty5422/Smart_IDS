@echo off
echo ========================================================
echo Stopping Smart IDS Services...
echo ========================================================

echo.
echo Stopping all Smart IDS windows and their processes...
taskkill /F /FI "WINDOWTITLE eq Smart IDS - *" /T > NUL 2>&1

echo.
echo All Smart IDS services have been successfully stopped!
echo.
pause
