@echo off
echo Starting deployment script...
powershell -ExecutionPolicy Bypass -File "%~dp0deploy-win.ps1"
pause 