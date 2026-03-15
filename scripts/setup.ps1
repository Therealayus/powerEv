# EV Charging App - One-time setup (dependencies, env, seed)
# Run from repo root: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "EV Charging - Setup" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

# 1. Check Node.js
$nodeVersion = $null
try {
    $nodeVersion = node -v 2>$null
} catch {}
if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js not found. Install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Cyan

# 2. Backend
Write-Host "`n[Backend] Installing dependencies..." -ForegroundColor Yellow
Set-Location "$root\backend"
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    npm install
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[Backend] Created .env from .env.example - edit backend\.env and set MONGODB_URI and JWT_SECRET" -ForegroundColor Yellow
} else {
    Write-Host "[Backend] .env already exists (unchanged)" -ForegroundColor Gray
}
Set-Location $root

# 3. Web
Write-Host "`n[Web] Installing dependencies..." -ForegroundColor Yellow
Set-Location "$root\web"
npm install
Set-Location $root

# 4. Mobile (--legacy-peer-deps for react-native-maps / React peer)
Write-Host "`n[Mobile] Installing dependencies..." -ForegroundColor Yellow
Set-Location "$root\mobile"
npm install --legacy-peer-deps
Set-Location $root

# 5. Seed (optional - requires MongoDB running)
Write-Host "`n[Seed] Seeding database (stations + chargers)..." -ForegroundColor Yellow
Set-Location "$root\backend"
$seedResult = & node src/scripts/seed.js 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[Seed] Done" -ForegroundColor Green
} else {
    Write-Host "[Seed] Skipped or failed (is MongoDB running?). Run later: cd backend; npm run seed" -ForegroundColor Yellow
}
Set-Location $root

Write-Host "`n==================" -ForegroundColor Green
Write-Host "Setup complete." -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Edit backend\.env: set MONGODB_URI and JWT_SECRET (and SMTP_* if you want emails)" -ForegroundColor White
Write-Host "  2. Start MongoDB (local or Atlas)" -ForegroundColor White
Write-Host "  3. Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "  4. Web:      cd web && npm run dev   (then open http://localhost:3000)" -ForegroundColor White
Write-Host "  5. Mobile:   cd mobile && npm start  (then in another terminal: npm run android)" -ForegroundColor White
Write-Host "`nFor mobile on Android emulator you need: Java (JAVA_HOME), Android SDK (adb), and an AVD. See docs/SETUP.md" -ForegroundColor Gray
