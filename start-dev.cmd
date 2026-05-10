@echo off
title Card Inventory Dev Server
cd /d "%~dp0"

echo Starting Card Inventory...
echo.
echo Keep this window open while using the app.
echo Open: http://127.0.0.1:3000
echo.

call npm.cmd run dev -- --hostname 127.0.0.1 --port 3000

echo.
echo The dev server stopped or failed to start.
echo Press any key to close this window.
pause >nul
