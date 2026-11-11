@echo off
title SirkulAset AI Server (FastAPI + MobileNetV3)
cd /d "%~dp0"
echo Memulai server AI SirkulAset di http://127.0.0.1:8000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:8000/prototype/index.html"
python backend\server.py
pause

