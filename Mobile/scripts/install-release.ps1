param(
  [string]$DeviceId = 'e9adcf37',
  [string]$AppId = 'com.example.mobile',
  [string]$MainActivity = '.MainActivity'
)

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$androidRoot = Join-Path $projectRoot 'android'
$apkPath = Join-Path $androidRoot 'app\build\outputs\apk\release\app-release.apk'

Write-Host '[release-install] Building release APK...'
Push-Location $androidRoot
try {
  .\gradlew.bat app:assembleRelease -x lintVitalAnalyzeRelease
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

if (-not (Test-Path $apkPath)) {
  throw "Release APK not found at: $apkPath"
}

Write-Host "[release-install] Installing APK on $DeviceId..."
adb -s $DeviceId install --no-streaming -r $apkPath
if ($LASTEXITCODE -ne 0) {
  throw "ADB install failed with exit code $LASTEXITCODE"
}

Write-Host '[release-install] Clearing USB reverse to enforce standalone mode...'
adb -s $DeviceId reverse --remove-all | Out-Null

Write-Host '[release-install] Launching app...'
adb -s $DeviceId shell am start -n "$AppId/$MainActivity" | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Could not launch $AppId"
}

Write-Host '[release-install] Done. Release app installed and started in standalone mode.'
