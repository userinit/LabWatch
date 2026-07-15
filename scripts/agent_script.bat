@echo off
wt new-tab --title "Agent" /d "%~dp0\..\agent" cmd /k "..\venv\Scripts\activate && python main.py";