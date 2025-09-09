# Test Environment Setup Script for AI Exam Evaluator (PowerShell)
# This script prepares the environment for TestSprite testing

Write-Host "🚀 Setting up AI Exam Evaluator test environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is available: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is available: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please update .env with your Supabase credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Install script dependencies
Write-Host "📦 Installing script dependencies..." -ForegroundColor Yellow
Set-Location scripts
npm install
Set-Location ..

# Setup test admin user
Write-Host "👤 Setting up test admin user..." -ForegroundColor Yellow
node scripts/setup-test-admin.js

# Kill any existing dev server on port 5173
Write-Host "🔄 Checking for existing dev server..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Port 5173 is in use. Killing existing process..." -ForegroundColor Yellow
    $processId = (Get-Process -Id $existingProcess.OwningProcess -ErrorAction SilentlyContinue).Id
    if ($processId) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Start the development server
Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
$devServerJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm run dev 
}

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Development server is running on http://localhost:5173" -ForegroundColor Green
    Write-Host "🎉 Test environment setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Test Credentials:" -ForegroundColor Cyan
    Write-Host "   Email: admin@testsprite.com" -ForegroundColor White
    Write-Host "   Password: TestSprite123!" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Ready for TestSprite testing!" -ForegroundColor Green
    Write-Host "   Server Job ID: $($devServerJob.Id)" -ForegroundColor White
    Write-Host "   To stop server: Stop-Job -Id $($devServerJob.Id); Remove-Job -Id $($devServerJob.Id)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to start development server" -ForegroundColor Red
    Stop-Job -Id $devServerJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $devServerJob.Id -ErrorAction SilentlyContinue
    exit 1
}