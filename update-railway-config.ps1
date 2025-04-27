# Script to update Railway configuration in the repository

Write-Host "Committing and pushing Railway configuration changes to GitHub..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git from https://git-scm.com/downloads" -ForegroundColor Red
    exit 1
}

# Check if the current directory is a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ This directory is not a Git repository." -ForegroundColor Red
    exit 1
}

# Check if railway.json exists
if (-not (Test-Path "railway.json")) {
    Write-Host "❌ railway.json not found in the current directory." -ForegroundColor Red
    Write-Host "Make sure you're running this script from the root of your project." -ForegroundColor Yellow
    exit 1
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

# Stage the changes
Write-Host "📝 Staging railway.json and other configuration files..." -ForegroundColor Yellow
git add railway.json
git add railway-github-setup.ps1
git add railway-github-setup.bat

# Check status
$status = git status --porcelain
if (-not $status) {
    Write-Host "⚠️ No changes to commit. Files may already be up to date." -ForegroundColor Yellow
    $forcePush = Read-Host "Would you like to push anyway? (y/n)"
    if ($forcePush -ne "y") {
        exit 0
    }
} else {
    # Commit the changes
    Write-Host "📦 Committing changes..." -ForegroundColor Yellow
    $commitMessage = Read-Host "Enter commit message (default: 'Update Railway configuration')"
    if (-not $commitMessage) {
        $commitMessage = "Update Railway configuration"
    }
    
    git commit -m $commitMessage
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
$branch = git symbolic-ref --short HEAD 2>$null
if (-not $branch) {
    $branch = "main"
}

git push -u origin $branch

Write-Host "`n✅ Changes pushed to GitHub. Railway will automatically redeploy your application." -ForegroundColor Green
Write-Host "🌐 Once deployment is complete, you can access your app at the URL provided in the Railway dashboard under the 'Domains' tab." -ForegroundColor Cyan 