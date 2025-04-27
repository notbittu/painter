# Railway GitHub Integration Setup Script for Windows

Write-Host "🔗 Setting up Railway + GitHub Integration" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

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

# Check if git is installed
Write-Host "🔍 Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git from https://git-scm.com/downloads" -ForegroundColor Red
    exit 1
}

# Check if the repo is a git repository
Write-Host "🔍 Checking if this is a Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "❌ This directory is not a Git repository." -ForegroundColor Red
    
    $initRepo = Read-Host "Would you like to initialize a Git repository? (y/n)"
    if ($initRepo -eq "y") {
        git init
        Write-Host "✅ Git repository initialized" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot continue without a Git repository. Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Check for remote origin
$remoteOrigin = git remote get-url origin 2>$null
if (-not $remoteOrigin) {
    Write-Host "⚠️ No GitHub remote found." -ForegroundColor Yellow
    $githubRepo = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
    
    if ($githubRepo) {
        git remote add origin $githubRepo
        Write-Host "✅ Added GitHub remote: $githubRepo" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot continue without a GitHub remote. Exiting..." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ GitHub remote found: $remoteOrigin" -ForegroundColor Green
}

# Create a new Railway project or use existing one
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

# Link GitHub repository with Railway project
Write-Host "🔗 Linking GitHub repository with Railway project..." -ForegroundColor Yellow
Write-Host "Opening Railway dashboard to complete GitHub integration..." -ForegroundColor Yellow
& $railwayPath open

Write-Host "`n📋 Follow these steps:" -ForegroundColor Cyan
Write-Host "1. In the Railway dashboard, click on your project" -ForegroundColor White
Write-Host "2. Go to 'Settings' tab" -ForegroundColor White
Write-Host "3. Under 'Source', click 'Connect Git Repository'" -ForegroundColor White
Write-Host "4. Select your GitHub repository" -ForegroundColor White
Write-Host "5. Configure deployment settings" -ForegroundColor White
Write-Host "   - Branch to deploy: main" -ForegroundColor White
Write-Host "   - Root Directory: /" -ForegroundColor White
Write-Host "   - Check 'Enable automatic deployments'" -ForegroundColor White
Write-Host "6. Click 'Connect'" -ForegroundColor White

Write-Host "`n✅ After completing these steps, your GitHub repository will be linked to Railway!" -ForegroundColor Green
Write-Host "🚀 Any changes pushed to your GitHub repository will automatically trigger a new deployment" -ForegroundColor Green

# Offer to push code to GitHub
$pushToGithub = Read-Host "`nWould you like to push your code to GitHub now? (y/n)"
if ($pushToGithub -eq "y") {
    # Check if there are files to commit
    $status = git status --porcelain
    if ($status) {
        # Files need to be committed
        Write-Host "📦 Committing your changes..." -ForegroundColor Yellow
        $commitMessage = Read-Host "Enter commit message (default: 'Setup for Railway deployment')"
        if (-not $commitMessage) {
            $commitMessage = "Setup for Railway deployment"
        }
        
        git add .
        git commit -m $commitMessage
    }
    
    # Push to GitHub
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host "✅ Code pushed to GitHub. Railway will automatically start the deployment!" -ForegroundColor Green
} else {
    Write-Host "📝 You can push your code to GitHub later by running:" -ForegroundColor Yellow
    Write-Host "git add ." -ForegroundColor White
    Write-Host "git commit -m 'Your commit message'" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host "`n🎉 Setup complete! Your project is now configured for continuous deployment from GitHub to Railway." -ForegroundColor Cyan 