@echo off
wt new-tab --title "FastAPI" /d "%~dp0\..\backend" cmd /k "..\venv\Scripts\activate && python main.py"; ^
new-tab --title "Agent" /d "%~dp0\..\agent" cmd /k "..\venv\Scripts\activate && python main.py"; ^
new-tab --title "Vite" /d "%~dp0\..\frontend" cmd /k "npm run dev -- --host";