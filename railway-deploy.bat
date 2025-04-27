@echo off
echo Starting Railway deployment...
powershell -ExecutionPolicy Bypass -File "%~dp0railway-deploy.ps1"
pause 