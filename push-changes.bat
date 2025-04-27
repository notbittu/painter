@echo off
echo Pushing Docker configuration to GitHub...
git add Dockerfile railway.json
git commit -m "Add Dockerfile and update Railway config"
git push
echo Done! Railway will redeploy with Docker configuration.
pause 