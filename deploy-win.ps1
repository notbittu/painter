# PowerShell deployment script for Netlify and Railway - Windows Version

Write-Host "🚀 One-Click Deployment: Netlify (Frontend) & Railway (Backend)" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

# Define paths to executables
$npmPrefix = & npm config get prefix
$netlifyPath = "$npmPrefix\netlify.cmd"
$railwayPath = "$npmPrefix\railway.cmd"

Write-Host "Using npm global prefix: $npmPrefix" -ForegroundColor Yellow

# Check for required CLIs
if (-not (Test-Path $netlifyPath)) {
    Write-Host "⚠️ Netlify CLI not found at $netlifyPath" -ForegroundColor Red
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    & npm install -g netlify-cli --force
}

if (-not (Test-Path $railwayPath)) {
    Write-Host "⚠️ Railway CLI not found at $railwayPath" -ForegroundColor Red
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    & npm install -g @railway/cli --force
}

# Verify the installations again after potential reinstall
if (-not (Test-Path $netlifyPath)) {
    Write-Host "❌ Netlify CLI installation failed. Please try manually: npm install -g netlify-cli" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $railwayPath)) {
    Write-Host "❌ Railway CLI installation failed. Please try manually: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

Write-Host "✅ CLIs found successfully!" -ForegroundColor Green

# Check login status
Write-Host "🔐 Ensuring you're logged into deployment platforms..." -ForegroundColor Yellow

# Check Netlify login
try {
    $netlifyStatus = & $netlifyPath status
    if ($netlifyStatus -like "*Not logged in*") {
        Write-Host "📝 Please log in to Netlify:" -ForegroundColor Yellow
        & $netlifyPath login
    } else {
        Write-Host "✅ Netlify: Already logged in" -ForegroundColor Green
    }
} catch {
    Write-Host "📝 Please log in to Netlify:" -ForegroundColor Yellow
    & $netlifyPath login
}

# Check Railway login
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

# Prepare the project
Write-Host "🔨 Preparing project for deployment..." -ForegroundColor Yellow

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "client/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location client
    npm install
    Pop-Location
}

# Build the frontend
Write-Host "🏗️ Building the React frontend..." -ForegroundColor Yellow
Push-Location client
npm run build
Pop-Location

# Deploy backend to Railway
Write-Host "🚂 Deploying backend to Railway..." -ForegroundColor Yellow
& $railwayPath up

# Get the Railway deployed URL
$railwayInfo = & $railwayPath service
$railwayUrlLine = $railwayInfo | Select-String -Pattern "Public URL"
if ($railwayUrlLine) {
    $railwayUrl = ($railwayUrlLine -split ': ')[1].Trim()
    Write-Host "🌐 Railway backend URL: $railwayUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️ Could not find Railway URL. Using placeholder for now." -ForegroundColor Yellow
    $railwayUrl = "https://your-railway-app.railway.app"
}

# Update the frontend environment with the backend URL
Write-Host "⚙️ Configuring frontend environment..." -ForegroundColor Yellow
"REACT_APP_API_URL=$railwayUrl" | Out-File -FilePath "client/.env.production" -Encoding utf8

# Rebuild frontend with backend URL
Write-Host "🏗️ Rebuilding frontend with backend configuration..." -ForegroundColor Yellow
Push-Location client
npm run build
Pop-Location

# Deploy frontend to Netlify
Write-Host "🌐 Deploying frontend to Netlify..." -ForegroundColor Yellow
Push-Location client
& $netlifyPath deploy --prod
Pop-Location

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📱 Frontend URL should be available in the Netlify output above" -ForegroundColor Cyan
Write-Host "⚙️ Backend: $railwayUrl" -ForegroundColor Cyan
Write-Host "🎉 Your Paint Home application is now live!" -ForegroundColor Green 