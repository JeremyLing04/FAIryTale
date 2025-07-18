@echo off
echo Starting FAIryTale Local AI Server...

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python first.
    pause
    exit /b 1
)

:: Check if Ollama is available
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama not found. Story generation will use fallback mode.
    echo Install Ollama from https://ollama.ai/ for AI story generation.
)

:: Check if Flask is installed
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Flask dependencies...
    pip install flask flask-cors
)

:: Set optional API key (uncomment and set your own key for security)
:: set AI_SERVER_API_KEY=your-secret-key-here

echo.
echo Starting local AI server on http://localhost:8888
echo Press Ctrl+C to stop the server
echo.

python local_ai_server.py

pause