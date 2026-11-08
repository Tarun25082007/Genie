@echo off
title GENIE: The 2D Literal Monkey's Paw Sandbox - Launcher
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-genie.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Launcher encountered an issue.
    pause
)
