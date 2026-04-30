@echo off
setlocal

set "ROOT=%~dp0.."

start "Backend Dev Server" cmd /k "cd /d "%ROOT%\backend" && npm run dev"
start "Frontend Dev Server" cmd /k "cd /d "%ROOT%\front" && npm run dev"

echo Started backend and frontend in separate windows.
