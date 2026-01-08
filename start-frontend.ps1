# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host "Make sure backend is running on port 5000 first!" -ForegroundColor Yellow

cd frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nStarting frontend on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

npm run dev
