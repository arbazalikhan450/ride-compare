$ErrorActionPreference = "Stop"

$nodeDir = "C:\\Program Files\\nodejs"
$npmCmd = Join-Path $nodeDir "npm.cmd"
$nodeExe = Join-Path $nodeDir "node.exe"

if (-not (Test-Path $npmCmd)) { throw "npm not found at $npmCmd" }
if (-not (Test-Path $nodeExe)) { throw "node not found at $nodeExe" }

Set-Location -Path $PSScriptRoot

# Ensure Node is on PATH for any child processes spawned by tools
if (-not (($env:Path -split ';') -contains $nodeDir)) {
  $env:Path = "$nodeDir;$env:Path"
}

Write-Host "Node version: " -NoNewline; & $nodeExe -v
Write-Host "NPM version: " -NoNewline; & $npmCmd -v

if (-not (Test-Path ".env.local") -and (Test-Path ".env.local.example")) {
  Copy-Item ".env.local.example" ".env.local" -Force
  Write-Host "Created .env.local from example. Update OPENAI_API_KEY inside if you plan to use chat."
}

Write-Host "Installing dependencies..."
& $npmCmd install

Write-Host "Starting Next.js dev server at http://localhost:3000 ..." -ForegroundColor Green
Start-Process "http://localhost:3000"
# Use absolute node to start Next.js directly to avoid PATH issues
& $nodeExe ".\node_modules\next\dist\bin\next" dev --turbopack


