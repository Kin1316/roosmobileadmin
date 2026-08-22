param(
  [string]$DeviceId = '',
  [string]$AppId = 'com.example.mobile',
  [string]$MainActivity = '.MainActivity',
  [int]$IntervalSeconds = 2,
  [switch]$SkipLaunch,
  [switch]$RunOnce
)

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Write-Step {
  param([string]$Message)
  Write-Host "[auto-usb] $Message"
}

function Get-ConnectedDevices {
  $lines = adb devices
  if ($LASTEXITCODE -ne 0) {
    throw 'No se pudo ejecutar adb. Verifica que Android platform-tools este instalado y en PATH.'
  }

  return $lines |
    Select-Object -Skip 1 |
    Where-Object { $_ -match '^([^\s]+)\s+device$' } |
    ForEach-Object { $matches[1] }
}

function Ensure-MetroRunning {
  try {
    $listeners = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction Stop
    if ($listeners) {
      Write-Step 'Metro ya esta escuchando en el puerto 8081.'
      return
    }
  } catch {
    # no listener on 8081
  }

  Write-Step 'Iniciando Metro en una nueva terminal...'
  Start-Process -FilePath 'npm.cmd' -ArgumentList 'start' -WorkingDirectory $projectRoot | Out-Null
}

function Configure-Device {
  param([string]$Id)

  Write-Step "Configurando dispositivo $Id"

  adb -s $Id reverse tcp:8081 tcp:8081 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo aplicar reverse 8081 en $Id"
  }

  adb -s $Id reverse tcp:8080 tcp:8080 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo aplicar reverse 8080 en $Id"
  }

  if (-not $SkipLaunch) {
    adb -s $Id shell am start -n "$AppId/$MainActivity" | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "No se pudo abrir la app $AppId en $Id"
    }
  }

  Write-Step "Listo en $Id (reverse 8081/8080 aplicado)."
}

Write-Step 'Modo automatico habilitado. Esperando dispositivos USB...'
Ensure-MetroRunning

$configured = @{}

while ($true) {
  try {
    $devices = Get-ConnectedDevices

    if ($DeviceId) {
      $devices = $devices | Where-Object { $_ -eq $DeviceId }
    }

    foreach ($id in $devices) {
      if (-not $configured.ContainsKey($id)) {
        Configure-Device -Id $id
        $configured[$id] = $true
      }
    }

    $connectedLookup = @{}
    foreach ($id in $devices) {
      $connectedLookup[$id] = $true
    }

    foreach ($knownId in @($configured.Keys)) {
      if (-not $connectedLookup.ContainsKey($knownId)) {
        Write-Step "Dispositivo desconectado: $knownId"
        $configured.Remove($knownId)
      }
    }

    if ($RunOnce) {
      break
    }
  } catch {
    Write-Step "Error: $($_.Exception.Message)"
    if ($RunOnce) {
      exit 1
    }
  }

  Start-Sleep -Seconds $IntervalSeconds
}

Write-Step 'Ejecucion finalizada.'
