@echo off
echo Starting StoryMagic for Windows...

:: Check if dist folder exists
if not exist dist (
    echo Building application first...
    npm run build
    if %errorlevel% neq 0 (
        echo ERROR: Build failed
        pause
        exit /b 1
    )
)

:: Set environment variables for Windows
set NODE_ENV=production
set HOST=localhost

:: Start the application
echo Starting server on localhost:5000...
node dist/index.js

pause