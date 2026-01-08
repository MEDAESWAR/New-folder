# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "Make sure you're in the project root directory" -ForegroundColor Yellow

cd backend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with DATABASE_URL and other required variables" -ForegroundColor Yellow
}

Write-Host "`nStarting server on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

npm run dev
