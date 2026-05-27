@echo off
echo Stopping old server if running...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do (
    taskkill /f /pid %%a 2>nul
)
timeout /t 1 >nul
echo Starting server...
cd /d "%~dp0backend"
node --use-system-ca server.js
