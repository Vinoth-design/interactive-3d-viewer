@echo off
cd /d "%~dp0everdale-configurator"
echo Starting Everdale 31-Inch Interactive 3D Configurator...
start "" "http://localhost:5173"
npm run dev
