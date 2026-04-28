@echo off
echo ========================================================
echo Starting Smart IDS: AI Engine, Backend, Data Generator, and Frontend
echo ========================================================

echo.
echo Starting Ollama AI Engine (Mistral)...
start "Smart IDS - Ollama AI Engine" cmd /k "ollama run mistral"

echo Waiting 5 seconds for AI Engine to initialize...
timeout /t 5 /nobreak > NUL

echo.
echo Starting Backend API (FastAPI)...
start "Smart IDS - Backend API" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --reload"

echo Waiting 5 seconds for Backend API to initialize...
timeout /t 5 /nobreak > NUL

echo.
echo Starting Data Generator (Simulation)...
start "Smart IDS - Data Generator" cmd /k "python app/generator.py"

echo.
echo Starting Frontend Dashboard (React)...
cd frontend
start "Smart IDS - Frontend Dashboard" cmd /k "npm run dev"

echo.
echo All services have been launched in separate windows!
echo Once the frontend window says "Local: http://localhost:5173/", 
echo you can open that link in your browser.
echo.
pause
