Write-Host "Pushing updates to GitHub..." -ForegroundColor Green

Set-Location -Path "painter"

# Add all changes
git add .

# Commit changes with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto-update: $timestamp"

# Push to GitHub
git push origin master

Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to continue" 