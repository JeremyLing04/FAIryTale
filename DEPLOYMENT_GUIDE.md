# FAIryTale Deployment Guide - Replit + Local AI Setup

This guide explains how to deploy FAIryTale on Replit while using AI services running on your local PC.

## Architecture Overview

```
[Replit Deployment] ←→ [Your Local PC]
     FAIryTale App     ←→  Ollama + Mistral
     (Web Interface)   ←→  Stable Diffusion
```

## Part 1: Setting Up Local AI Services

### 1. Install Ollama + Mistral on Your PC

**Windows:**
```bash
# Download and install Ollama from https://ollama.ai
# After installation:
ollama pull mistral

# Start Ollama server with external access
set OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

**Linux/Mac:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Mistral model
ollama pull mistral

# Start with external access
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### 2. Set Up Stable Diffusion Image Generator

Create a simple Python HTTP server for image generation:

**Create `image_server.py` on your PC:**
```python
from flask import Flask, request, jsonify
import subprocess
import os
import tempfile

app = Flask(__name__)

@app.route('/health')
def health():
    return {'status': 'ok'}

@app.route('/generate', methods=['POST'])
def generate_image():
    description = request.form.get('description')
    genre = request.form.get('genre', 'cartoon')
    character_image = request.form.get('character_image')
    
    # Generate unique filename
    output_file = f"generated_{int(time.time())}.png"
    output_path = os.path.join('generated_images', output_file)
    
    # Run your existing app.py script
    cmd = f"python app.py --genre {genre} --description \"{description}\" --output \"{output_path}\""
    
    if character_image:
        # Handle character image if provided
        temp_image = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        # Process character_image and save to temp_image.name
        cmd += f" --input-image \"{temp_image.name}\""
    
    try:
        subprocess.run(cmd, shell=True, check=True)
        
        # Return the generated image URL
        return jsonify({
            'success': True,
            'image_url': f'http://YOUR_LOCAL_IP:5001/images/{output_file}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory('generated_images', filename)

if __name__ == '__main__':
    os.makedirs('generated_images', exist_ok=True)
    app.run(host='0.0.0.0', port=5001)
```

**Install dependencies:**
```bash
pip install flask
```

**Run the image server:**
```bash
python image_server.py
```

## Part 2: Expose Local Services (Choose One Method)

### Option A: Using ngrok (Recommended)

1. **Install ngrok:** Download from https://ngrok.com
2. **Expose Ollama:**
   ```bash
   ngrok http 11434
   # Note the HTTPS URL (e.g., https://abc123.ngrok.io)
   ```
3. **Expose Image Server (in another terminal):**
   ```bash
   ngrok http 5001
   # Note the HTTPS URL (e.g., https://def456.ngrok.io)
   ```

### Option B: Using localtunnel

```bash
npm install -g localtunnel

# Expose Ollama
lt --port 11434 --subdomain fairytale-ollama

# Expose Image Server
lt --port 5001 --subdomain fairytale-images
```

### Option C: Direct IP (if you have public IP/port forwarding)

Configure your router to forward:
- Port 11434 → Your PC (for Ollama)
- Port 5001 → Your PC (for Image Server)

## Part 3: Deploy on Replit

### 1. Fork/Import Project to Replit

1. Go to Replit.com
2. Create new Repl and import from GitHub or upload your code
3. Replit will automatically detect it's a Node.js project

### 2. Set Environment Variables in Replit

Go to your Repl's "Secrets" tab and add:

```bash
# For Ollama connection
OLLAMA_HOST=https://your-ngrok-url.ngrok.io
# OR
REMOTE_OLLAMA_URL=https://your-ngrok-url.ngrok.io

# For Image generation  
REMOTE_IMAGE_URL=https://your-image-ngrok-url.ngrok.io

# Optional: If using direct IP
OLLAMA_HOST=http://YOUR_PUBLIC_IP:11434
REMOTE_IMAGE_URL=http://YOUR_PUBLIC_IP:5001
```

### 3. Deploy the Application

1. **Install Dependencies:** Replit will do this automatically
2. **Start the App:** Click the "Run" button
3. **Your app will be available at:** `https://your-repl-name.your-username.repl.co`

## Part 4: Testing the Setup

### Test Ollama Connection:
```bash
curl -X POST https://your-ngrok-ollama-url/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","prompt":"Hello world","stream":false}'
```

### Test Image Generation:
```bash
curl -X POST https://your-ngrok-image-url/generate \
  -F "description=A magical forest" \
  -F "genre=fantasy"
```

## Troubleshooting

### Common Issues:

**"Remote Ollama not accessible"**
- Check if Ollama is running: `ollama list`
- Verify ngrok tunnel is active
- Test direct connection: `curl http://localhost:11434/api/tags`

**"Remote image service not accessible"**
- Check if Python server is running
- Verify port 5001 is open
- Test locally: `curl http://localhost:5001/health`

**"CORS errors"**
- Add CORS headers to your local Python server
- Use ngrok HTTPS URLs instead of HTTP

### Security Notes:

1. **ngrok URLs are temporary** - They change when you restart ngrok
2. **Use HTTPS URLs** when possible for better security
3. **Consider authentication** for production deployments
4. **Monitor your local resources** - AI generation can be resource-intensive

## Alternative: Using Cloud AI Services

If local setup is complex, you can switch to cloud services:

1. **OpenAI API** instead of local Ollama
2. **Replicate/Hugging Face** instead of local Stable Diffusion

Update environment variables:
```bash
OPENAI_API_KEY=your_openai_key
# Remove OLLAMA_HOST and REMOTE_IMAGE_URL
```

## Performance Tips

1. **Keep your PC running** while the Replit app is being used
2. **Use a stable internet connection** for your local PC
3. **Monitor resource usage** on your local machine
4. **Consider using a dedicated GPU** for faster image generation

---

This setup gives you the best of both worlds: easy deployment on Replit with powerful local AI processing!