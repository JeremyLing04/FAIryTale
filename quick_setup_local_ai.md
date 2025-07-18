# Quick Setup: Local AI for Replit Deployment

## 🚀 Quick Steps to Connect Your Local AI to Replit

### Step 1: Start Ollama on Your PC

```bash
# Windows (Command Prompt)
set OLLAMA_HOST=0.0.0.0:11434
ollama serve

# Linux/Mac (Terminal)
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### Step 2: Start Image Server on Your PC

```bash
# Install dependencies
pip install flask flask-cors

# Start the image server
python image_server.py
```

### Step 3: Expose Services to Internet

**Option A: Using ngrok (Recommended)**
```bash
# Terminal 1: Expose Ollama
ngrok http 11434

# Terminal 2: Expose Image Server  
ngrok http 5001
```

**Copy the HTTPS URLs from ngrok (e.g., https://abc123.ngrok.io)**

### Step 4: Configure Replit Environment

In your Replit project, go to "Secrets" and add:

```bash
OLLAMA_HOST=https://your-ollama-ngrok-url.ngrok.io
REMOTE_IMAGE_URL=https://your-image-ngrok-url.ngrok.io
```

### Step 5: Deploy on Replit

1. Click "Deploy" button in Replit
2. Your app will use your local AI services!

## 🧪 Test Your Setup

**Test Ollama:**
```bash
curl -X POST https://your-ollama-ngrok-url.ngrok.io/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","prompt":"Hello!","stream":false}'
```

**Test Image Server:**
```bash
curl https://your-image-ngrok-url.ngrok.io/health
```

## 💡 Tips

- Keep your PC running while people use your Replit app
- ngrok URLs change when you restart - update Replit secrets if needed
- Use the free ngrok plan for testing, upgrade for production
- Monitor your PC's resources during heavy usage

## 🔧 Troubleshooting

**Can't connect to Ollama?**
- Check if Ollama is running: `ollama list`
- Verify the ngrok tunnel is active
- Make sure you're using HTTPS ngrok URLs

**Image generation fails?**
- Check if `app.py` and Stable Diffusion are working locally
- Verify Python dependencies are installed
- Test the image server locally first: `curl http://localhost:5001/health`

**Replit can't reach your services?**
- Double-check the ngrok URLs in Replit secrets
- Make sure ngrok tunnels are still active
- Try refreshing the Replit deployment

---

This setup gives you production-quality AI on Replit using your local GPU power! 🎨🤖