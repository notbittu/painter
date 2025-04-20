@echo off
echo Pushing updates to GitHub...

cd painter

:: Add all changes
git add .

:: Commit changes with timestamp
git commit -m "Auto-update: %date% %time%"

:: Push to GitHub
git push origin master

echo Done!
pause 