# =========================================================
# GENIE: The 2D Literal Monkey's Paw Sandbox - 1-Click Startup
# =========================================================

$ErrorActionPreference = "Continue"

Clear-Host
Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host "       GENIE: THE 2D LITERAL MONKEY'S PAW SANDBOX               " -ForegroundColor Yellow
Write-Host "         Matter.js Ragdoll Physics + Falling Sand                " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host ""

# 1. Verify Node.js is installed
Write-Host "[1/3] Checking Node.js runtime..." -ForegroundColor Yellow
try {
    $nodeVer = node -v 2>$null
    if ($nodeVer) {
        Write-Host "  -> Node.js detected: $nodeVer" -ForegroundColor Green
    } else {
        Write-Host "  -> [ERROR] Node.js is not found on your system PATH." -ForegroundColor Red
        Write-Host "     Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        pause
        exit 1
    }
} catch {
    Write-Host "  -> [ERROR] Failed to query Node.js." -ForegroundColor Red
    pause
    exit 1
}

# 2. Check if dependencies are installed
Write-Host "`n[2/3] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "$PSScriptRoot\node_modules")) {
    Write-Host "  -> node_modules missing. Installing npm packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  -> [ERROR] npm install failed." -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "  -> Dependencies are ready!" -ForegroundColor Green
}

# 3. Launch Vite Development Server & Open Browser
Write-Host "`n[3/3] Launching Game Sandbox Server..." -ForegroundColor Yellow
Write-Host "  -> Game URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  -> Press Ctrl+C in this terminal window anytime to stop the server.`n" -ForegroundColor DarkGray

# Open default browser
Start-Process "http://localhost:3000"

# Start Vite dev server
npm run dev -- --port 3000
