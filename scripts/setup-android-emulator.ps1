# Run this AFTER opening Android Studio once and completing the setup wizard (SDK will be installed).
# From project root: .\scripts\setup-android-emulator.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }

if (-not (Test-Path $sdk)) {
    Write-Host "ANDROID_HOME not found at $sdk" -ForegroundColor Red
    Write-Host "1. Open Android Studio from Start Menu" -ForegroundColor Yellow
    Write-Host "2. Complete the setup wizard (Next -> Standard -> Finish). This installs the SDK." -ForegroundColor Yellow
    Write-Host "3. Close Android Studio and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Android SDK at: $sdk" -ForegroundColor Cyan

# Find sdkmanager (might be in cmdline-tools or tools)
$sdkmanager = $null
$possiblePaths = @(
    "$sdk\cmdline-tools\latest\bin\sdkmanager.bat",
    "$sdk\tools\bin\sdkmanager.bat"
)
foreach ($p in $possiblePaths) {
    if (Test-Path $p) { $sdkmanager = $p; break }
}

if (-not $sdkmanager) {
    Write-Host "sdkmanager not found. Install Android Studio Command-line Tools:" -ForegroundColor Yellow
    Write-Host "  Open Android Studio -> Settings -> Appearance & Behavior -> System Settings -> Android SDK" -ForegroundColor White
    Write-Host "  -> SDK Tools tab -> check 'Android SDK Command-line Tools' -> Apply" -ForegroundColor White
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Refresh JAVA_HOME for this session (required by sdkmanager)
$env:JAVA_HOME = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = "C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1" }

Write-Host "Installing platform-tools, platform android-34, and system image..." -ForegroundColor Yellow
& $sdkmanager "--install" "platform-tools" "platforms;android-34" "system-images;android-34;google_apis;x86_64" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    & $sdkmanager "--install" "platform-tools" "platforms;android-34" "system-images;android-34;google_apis;x86_64"
}

Write-Host "If prompted, accept SDK licenses (y)." -ForegroundColor Gray

Write-Host "Creating AVD 'EV_Charging_Device' (Pixel 6, API 34)..." -ForegroundColor Yellow
$avdmanager = "$sdk\cmdline-tools\latest\bin\avdmanager.bat"
if (-not (Test-Path $avdmanager)) { $avdmanager = "$sdk\tools\bin\avdmanager.bat" }
$avdName = "EV_Charging_Device"
$listOut = & $avdmanager list avd 2>&1 | Out-String
if ($listOut -notmatch $avdName) {
    "no" | & $avdmanager create avd -n $avdName -k "system-images;android-34;google_apis;x86_64" -d "pixel_6"
}
Write-Host "Done. Start emulator: emulator -avd $avdName" -ForegroundColor Green
Write-Host "Or from Android Studio: Tools -> Device Manager -> run the device." -ForegroundColor Gray
