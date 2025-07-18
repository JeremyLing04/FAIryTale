@echo off
echo ============================================
echo FAIryTale Unified AI Server Startup Script
echo ============================================
echo.

cd /d "C:\Users\Admin\Downloads\Story\fast_story_gen"

echo Checking virtual environment...
if not exist "venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found at venv\Scripts\python.exe
    echo Please create it first by running setup_venv.bat
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Checking Python dependencies...
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Installing Flask...
    pip install flask flask-cors requests
)

echo.
echo Starting Unified AI Server...
echo Both Ollama and Image Generation will be available on port 5001
echo.

:: Start the unified server
python "%~dp0unified_ai_server.py"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start unified server
    echo Check the error messages above
    pause
)