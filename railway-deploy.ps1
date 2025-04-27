# Railway All-in-One Deployment Script for Windows

Write-Host "🚂 Railway All-in-One Deployment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Define paths
$npmPrefix = & npm config get prefix
$railwayPath = "$npmPrefix\railway.cmd"

Write-Host "Using npm global prefix: $npmPrefix" -ForegroundColor Yellow

# Check for Railway CLI
if (-not (Test-Path $railwayPath)) {
    Write-Host "⚠️ Railway CLI not found at $railwayPath" -ForegroundColor Red
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    & npm install -g @railway/cli --force
}

# Verify installation
if (-not (Test-Path $railwayPath)) {
    Write-Host "❌ Railway CLI installation failed. Please try manually: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Check login status
Write-Host "🔐 Ensuring you're logged into Railway..." -ForegroundColor Yellow
try {
    $railwayStatus = & $railwayPath whoami
    if ($railwayStatus -like "*not logged in*") {
        Write-Host "📝 Please log in to Railway:" -ForegroundColor Yellow
        & $railwayPath login
    } else {
        Write-Host "✅ Railway: Already logged in" -ForegroundColor Green
    }
} catch {
    Write-Host "📝 Please log in to Railway:" -ForegroundColor Yellow
    & $railwayPath login
}

# Create new project if needed
Write-Host "🏗️ Checking for existing Railway project..." -ForegroundColor Yellow
$projectExists = $false
try {
    $projectInfo = & $railwayPath project
    if ($projectInfo -notlike "*No active project*") {
        $projectExists = $true
        Write-Host "✅ Using existing Railway project" -ForegroundColor Green
    }
} catch {
    $projectExists = $false
}

if (-not $projectExists) {
    Write-Host "🆕 Creating new Railway project..." -ForegroundColor Yellow
    & $railwayPath project create
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "client/node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Push-Location client
    npm install
    Pop-Location
}

# Build the frontend
Write-Host "🏗️ Building the React frontend..." -ForegroundColor Yellow
Push-Location client
npm run build
Pop-Location

# Ensure build directory is copied to the right location
Write-Host "📂 Ensuring build files are in the right location..." -ForegroundColor Yellow
if (-not (Test-Path "client/build")) {
    Write-Host "❌ Build directory not found! Build process may have failed." -ForegroundColor Red
    exit 1
}

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
& $railwayPath up

# Get the deployment URL
$deploymentInfo = & $railwayPath status
$urlLine = $deploymentInfo | Select-String -Pattern "Deployment URL"
if ($urlLine) {
    $deploymentUrl = ($urlLine -split ': ')[1].Trim()
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Your application is live at: $deploymentUrl" -ForegroundColor Cyan
} else {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Check your Railway dashboard for the deployment URL" -ForegroundColor Cyan
    & $railwayPath open
}

Write-Host "🎉 Paint Home is now live on Railway!" -ForegroundColor Green
Write-Host "ℹ️ This is an all-in-one deployment - both frontend and backend are served from the same URL" -ForegroundColor Yellow
Write-Host "📋 To view your deployment details: railway status" -ForegroundColor Yellow
Write-Host "🖥️ To open the Railway dashboard: railway open" -ForegroundColor Yellow 