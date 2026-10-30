@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Opening the site directly instead...
  start "" "%~dp0index.html"
  exit /b 0
)

echo Starting Turnview at http://127.0.0.1:8765/
echo Keep this window open while using the site. Press Ctrl+C to stop.
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 800; Start-Process 'http://127.0.0.1:8765/'"
python -m http.server 8765 --bind 127.0.0.1
