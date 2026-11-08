@echo off
title Stop GENIE Sandbox Server
cd /d "%~dp0"
echo Stopping any running GENIE or Vite processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Terminating process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo GENIE server stopped successfully.
pause
