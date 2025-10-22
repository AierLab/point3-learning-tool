$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir '..')
Set-Location (Join-Path $ProjectRoot 'app')

Write-Host 'Starting Point3 Learning Tool...'
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host 'Ensuring ports 3000 and 5000 are free...'
    try {
        npx kill-port 3000 5000 | Out-Null
    } catch {
        Write-Verbose 'kill-port not available or failed; continuing anyway.'
    }
}

npm run start -- $args
