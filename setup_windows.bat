@echo off
echo Setting up StoryMagic for Windows...
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install Node.js dependencies
echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist .env (
    echo Creating .env file...
    echo DATABASE_URL=postgresql://username:password@host:port/database > .env
    echo NODE_ENV=development >> .env
    echo # Add your custom Python virtual environment path if needed >> .env
    echo # PYTHON_VENV_PATH=C:\Users\Admin\Downloads\Story\fast_story_gen\venv >> .env
    echo.
    echo Please edit the .env file with your database URL and other settings.
)

:: Check if Ollama is installed
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama is not installed or not in PATH
    echo Story generation will not work without Ollama and the Mistral model
    echo Install from: https://ollama.com/download
    echo Then run: ollama pull mistral
    echo.
) else (
    echo Ollama found, checking for Mistral model...
    ollama list | findstr mistral >nul 2>&1
    if %errorlevel% neq 0 (
        echo Downloading Mistral model...
        ollama pull mistral
    )
)

:: Check if Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Python is not installed or not in PATH
    echo Image generation will not work without Python
    echo Install from: https://www.python.org/downloads/
    echo.
) else (
    echo Python found, checking for dependencies...
    python -c "import torch, diffusers, PIL" 2>nul
    if %errorlevel% neq 0 (
        echo Installing Python dependencies...
        pip install -r python_requirements.txt
    )
)

:: Check for database setup
echo.
echo Setup complete! Next steps:
echo 1. Edit .env file with your database URL
echo 2. Run: npm run db:push (to setup database)
echo 3. Run: npm run dev (to start the application)
echo.
echo For your specific setup:
echo - Virtual environment: C:\Users\Admin\Downloads\Story\fast_story_gen\venv
echo - Add PYTHON_VENV_PATH to .env if using custom virtual environment
echo.
pause