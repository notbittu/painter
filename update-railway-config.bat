@echo off
echo Updating Railway configuration in repository...
powershell -ExecutionPolicy Bypass -File "%~dp0update-railway-config.ps1"
pause 