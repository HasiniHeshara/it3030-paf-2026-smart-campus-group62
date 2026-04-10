param(
  [int]$Port = 8082,
  [string]$BackendPath = "D:\PAF-Project\it3030-paf-2026-smart-campus-group62\backend"
)

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if ($null -ne $listener) {
  $pidToStop = $listener.OwningProcess
  Write-Host "Stopping process $pidToStop on port $Port..."
  Stop-Process -Id $pidToStop -Force
}

Write-Host "Starting backend at $BackendPath on port $Port..."
Set-Location $BackendPath
mvn spring-boot:run
