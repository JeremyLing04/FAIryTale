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
    echo NODE_ENV=development > .env
    echo OPENAI_API_KEY=your_openai_api_key_here >> .env
    echo.
    echo IMPORTANT: Edit the .env file and add your OpenAI API key!
    echo Get your key from: https://platform.openai.com/api-keys
)

:: Check for OpenAI API key
if exist .env (
    findstr "OPENAI_API_KEY=your_openai_api_key_here" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo WARNING: Please add your OpenAI API key to the .env file
        echo Get your key from: https://platform.openai.com/api-keys
        echo.
    ) else (
        echo OpenAI API key configured!
    )
) else (
    echo No .env file found, will be created shortly...
)

:: Setup complete
echo.
echo Setup complete! Next steps:
echo.
echo Development mode:
echo 1. Run: npm run dev
echo 2. Open http://localhost:5000 in your browser
echo.
echo Production mode:
echo 1. Run: start_windows.bat
echo 2. Open http://localhost:5000 in your browser
echo.
echo For OpenAI setup:
echo - Get API key from: https://platform.openai.com/api-keys
echo - Add it to .env file: OPENAI_API_KEY=your_key_here
echo - Restart the application after adding the key
echo.
pause