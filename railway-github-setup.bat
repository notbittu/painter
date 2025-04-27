@echo off
echo Starting Railway GitHub Integration Setup...
powershell -ExecutionPolicy Bypass -File "%~dp0railway-github-setup.ps1"
pause 