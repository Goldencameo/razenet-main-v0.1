# Upload RazePlayer binaries to Supabase Storage (clients bucket).
# Requires: supabase CLI logged in, migration applied, admin role on your account.
#
# Usage (from repo root):
#   .\razeplayer\scripts\upload-client.ps1

$ErrorActionPreference = "Stop"

$exe = "razeplayer\RazePlayer.exe"
$pck = "razeplayer\RazePlayer.pck"

if (-not (Test-Path $exe)) { throw "Missing $exe — export Godot first." }
if (-not (Test-Path $pck)) { throw "Missing $pck — export Godot first." }

Write-Host "Uploading RazePlayer.exe..."
supabase storage cp $exe supabase://clients/windows/RazePlayer.exe --content-type "application/x-msdownload"

Write-Host "Uploading RazePlayer.pck..."
supabase storage cp $pck supabase://clients/windows/RazePlayer.pck --content-type "application/octet-stream"

Write-Host "Done. Public URLs:"
Write-Host "  .../storage/v1/object/public/clients/windows/RazePlayer.exe"
Write-Host "  .../storage/v1/object/public/clients/windows/RazePlayer.pck"
