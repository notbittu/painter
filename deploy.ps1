# PowerShell deployment script for Netlify and Railway

Write-Host "🚀 One-Click Deployment: Netlify (Frontend) & Railway (Backend)" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

# Check for required CLIs
try {
    netlify --version | Out-Null
} catch {
    Write-Host "⚠️ Netlify CLI is required. Please run: npm install -g netlify-cli" -ForegroundColor Red
    exit 1
}

try {
    railway --version | Out-Null
} catch {
    Write-Host "⚠️ Railway CLI is required. Please run: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Check login status
Write-Host "🔐 Ensuring you're logged into deployment platforms..." -ForegroundColor Yellow

# Check Netlify login
try {
    $netlifyStatus = netlify status
    if ($netlifyStatus -like "*Not logged in*") {
        Write-Host "📝 Please log in to Netlify:" -ForegroundColor Yellow
        netlify login
    } else {
        Write-Host "✅ Netlify: Already logged in" -ForegroundColor Green
    }
} catch {
    Write-Host "📝 Please log in to Netlify:" -ForegroundColor Yellow
    netlify login
}

# Check Railway login
try {
    $railwayStatus = railway whoami
    if ($railwayStatus -like "*not logged in*") {
        Write-Host "📝 Please log in to Railway:" -ForegroundColor Yellow
        railway login
    } else {
        Write-Host "✅ Railway: Already logged in" -ForegroundColor Green
    }
} catch {
    Write-Host "📝 Please log in to Railway:" -ForegroundColor Yellow
    railway login
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
railway up

# Get the Railway deployed URL
$railwayInfo = railway service
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
netlify deploy --prod
$netlifyUrl = $(netlify open --url)
Pop-Location

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📱 Frontend: $netlifyUrl" -ForegroundColor Cyan
Write-Host "⚙️ Backend: $railwayUrl" -ForegroundColor Cyan
Write-Host "🎉 Your Paint Home application is now live!" -ForegroundColor Green 