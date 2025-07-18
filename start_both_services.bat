@echo off
echo ====================================
echo FAIryTale AI Services Startup Script
echo ====================================
echo.
echo This will start both services on separate ports:
echo - Ollama+Mistral: Port 11434
echo - SD15+IP-Adapter: Port 5001
echo.
echo Make sure you have 4 terminals ready:
echo 1. Ollama server
echo 2. Image server
echo 3. ngrok for Ollama
echo 4. ngrok for Image server
echo.
pause

echo.
echo Starting services...
echo.

REM Start Ollama in a new window
echo [1/4] Starting Ollama server on port 11434...
start "Ollama Server" cmd /k "set OLLAMA_HOST=0.0.0.0:11434 && ollama serve"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Image Server in a new window
echo [2/4] Starting Image server on port 5001...
start "Image Server" cmd /k "cd /d C:\Users\Admin\Downloads\Story\fast_story_gen && python local_ai_server.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start ngrok for Ollama
echo [3/4] Starting ngrok for Ollama (port 11434)...
start "ngrok Ollama" cmd /k "echo Copy the HTTPS URL for OLLAMA_HOST && ngrok http 11434"

REM Wait a moment  
timeout /t 2 /nobreak >nul

REM Start ngrok for Image Server
echo [4/4] Starting ngrok for Image server (port 5001)...
start "ngrok Images" cmd /k "echo Copy the HTTPS URL for REMOTE_IMAGE_URL && ngrok http 5001"

echo.
echo ====================================
echo All services started!
echo ====================================
echo.
echo Next Steps:
echo 1. Copy the HTTPS URLs from both ngrok windows
echo 2. Add them to Replit secrets:
echo    - OLLAMA_HOST=https://your-ollama.ngrok.io
echo    - REMOTE_IMAGE_URL=https://your-image.ngrok.io
echo 3. Deploy your Replit app
echo.
echo Test URLs:
echo - Ollama: http://localhost:11434/api/tags
echo - Images: http://localhost:5001/test
echo.
pause