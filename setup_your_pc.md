# Setup Your PC for FAIryTale Remote AI

## Quick Setup for Your Specific Environment

Your setup paths:
- **App.py location**: `C:\Users\Admin\Downloads\Story\fast_story_gen\app.py`
- **Virtual environment**: `C:\Users\Admin\Downloads\Story\fast_story_gen\venv`

## Step 1: Install Dependencies

Open Command Prompt in your fast_story_gen directory:

```bash
cd C:\Users\Admin\Downloads\Story\fast_story_gen

# Activate your virtual environment
venv\Scripts\activate

# Install Flask for the web server
pip install flask flask-cors

# Verify your existing setup still works
python app.py --story "test story" --character "hero" --output_dir outputs/story_images
```

## Step 2: Download the Server Script

Copy the `local_ai_server.py` from your FAIryTale project to your fast_story_gen directory:

```bash
C:\Users\Admin\Downloads\Story\fast_story_gen\
├── app.py (your existing script)
├── local_ai_server.py (copy this here)
├── venv\
├── loras\
├── outputs\
└── ... (your other files)
```

## Step 3: Start Your Local AI Services

**Terminal 1: Start Ollama**
```bash
# Set environment to allow external connections
set OLLAMA_HOST=0.0.0.0:11434

# Start Ollama
ollama serve
```

**Terminal 2: Start Image Server**
```bash
cd C:\Users\Admin\Downloads\Story\fast_story_gen

# Activate virtual environment
venv\Scripts\activate

# Start the image server
python local_ai_server.py
```

You should see:
```
FAIryTale SD15+IP-Adapter Image Server
====================================
App.py path: C:\Users\Admin\Downloads\Story\fast_story_gen\app.py
Virtual env: C:\Users\Admin\Downloads\Story\fast_story_gen\venv
Working dir: C:\Users\Admin\Downloads\Story\fast_story_gen
Python exe: C:\Users\Admin\Downloads\Story\fast_story_gen\venv\Scripts\python.exe
====================================
Starting server on http://0.0.0.0:5001
```

## Step 4: Test Your Setup

**Test Image Server:**
```bash
curl http://localhost:5001/test
```

**Test Ollama:**
```bash
curl http://localhost:11434/api/tags
```

## Step 5: Expose to Internet with ngrok

**Download ngrok**: https://ngrok.com/download

**Terminal 3: Expose Ollama**
```bash
ngrok http 11434
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Terminal 4: Expose Image Server**
```bash
ngrok http 5001
```
Copy the HTTPS URL (e.g., `https://def456.ngrok.io`)

## Step 6: Configure Replit

In your Replit project secrets:

```bash
OLLAMA_HOST=https://abc123.ngrok.io
REMOTE_IMAGE_URL=https://def456.ngrok.io
```

## Step 7: Deploy and Test

1. Deploy your FAIryTale app on Replit
2. Create a character and start a story
3. Your Replit app will now use your local AI services!

## Troubleshooting

**"Virtual environment not found"**
- Check if your venv is at: `C:\Users\Admin\Downloads\Story\fast_story_gen\venv`
- If different, update the path in `local_ai_server.py`

**"App.py not found"**
- Ensure `app.py` is in the same directory as `local_ai_server.py`

**"No images generated"**
- Check if your Stable Diffusion setup is working locally first
- Verify the `outputs/story_images` directory exists

**"Connection refused"**
- Make sure Windows Firewall allows connections on ports 11434 and 5001
- Check if antivirus is blocking the connections

## Performance Tips

- Keep your GPU drivers updated
- Monitor GPU usage during image generation
- Consider lowering `--steps` in the server for faster generation
- Use SSD storage for better I/O performance

---

Your local PC will now power the AI features for your deployed FAIryTale app!