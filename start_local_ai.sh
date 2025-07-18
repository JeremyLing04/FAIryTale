#!/bin/bash

echo "Starting FAIryTale Local AI Server..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python not found. Please install Python first."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "Using Python: $PYTHON_CMD"

# Check if Ollama is available
if ! command -v ollama &> /dev/null; then
    echo "WARNING: Ollama not found. Story generation will use fallback mode."
    echo "Install Ollama from https://ollama.ai/ for AI story generation."
fi

# Check if Flask is installed
$PYTHON_CMD -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing Flask dependencies..."
    $PYTHON_CMD -m pip install flask flask-cors
fi

# Set optional API key (uncomment and set your own key for security)
# export AI_SERVER_API_KEY="your-secret-key-here"

echo ""
echo "Starting local AI server on http://localhost:8888"
echo "Press Ctrl+C to stop the server"
echo ""

$PYTHON_CMD local_ai_server.py