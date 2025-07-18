# FAIryTale - Hybrid Deployment Guide

## Overview

This guide shows how to deploy FAIryTale on Replit while using AI models (Ollama + Mistral and Stable Diffusion) running on your local computer.

## Architecture

```
[Replit Cloud] ←→ [Your Local Computer]
    FAIryTale App     Ollama + Python/SD
    (Web Interface)   (AI Processing)
```

## Setup Steps

### Part 1: Prepare Your Local Computer as AI Server

#### 1. Install Required Software

**Install Ollama:**
```bash
# Download from https://ollama.ai/
ollama pull mistral
```

**Install Python Dependencies:**
```bash
pip install -r python_requirements.txt
```

#### 2. Create Local AI Service Script

Create `local_ai_server.py`:

```python
from flask import Flask, request, jsonify
import subprocess
import json
import os
from PIL import Image
import base64
import io

app = Flask(__name__)

@app.route('/generate-story', methods=['POST'])
def generate_story():
    data = request.json
    
    # Build Ollama prompt
    prompt = f"""You are a children's story writer creating engaging, age-appropriate stories for kids aged 6-12.
Create chapter {data['chapterNumber']} of a {data['genre']} story featuring {data['characterName']}, 
a {data['characterType']} with the personality: {data['personality']}.

Keep the language simple and positive. Each chapter should be around 150-200 words.
Format your response as JSON with this structure:
{{
  "content": "story content here",
  "choices": {{
    "optionA": {{"text": "choice A", "description": "what happens", "statChanges": {{"courage": 5}}}},
    "optionB": {{"text": "choice B", "description": "what happens", "statChanges": {{"kindness": 5}}}}
  }}
}}"""

    try:
        # Call Ollama
        result = subprocess.run(['ollama', 'run', 'mistral', prompt], 
                              capture_output=True, text=True, timeout=60)
        
        # Parse JSON response
        json_match = result.stdout
        if '{' in json_match:
            story_data = json.loads(json_match[json_match.index('{'):json_match.rindex('}')+1])
            return jsonify(story_data)
    except Exception as e:
        print(f"Error: {e}")
    
    # Fallback response
    return jsonify({
        "content": f"Chapter {data['chapterNumber']}: {data['characterName']} continues their adventure...",
        "choices": {
            "optionA": {"text": "Explore ahead", "description": "Continue the journey"},
            "optionB": {"text": "Rest and plan", "description": "Take time to think"}
        }
    })

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    
    try:
        # Run your existing Python image generation
        cmd = [
            'python', 'app.py',
            '--genre', data.get('genre', 'fantasy'),
            '--description', data['description'],
            '--output', f'temp_image_{data["timestamp"]}.png'
        ]
        
        if data.get('characterImage'):
            # Save character image temporarily
            char_img_path = f'temp_char_{data["timestamp"]}.png'
            img_data = base64.b64decode(data['characterImage'].split(',')[1])
            with open(char_img_path, 'wb') as f:
                f.write(img_data)
            cmd.extend(['--input-image', char_img_path])
        
        subprocess.run(cmd, timeout=120)
        
        # Read generated image and return as base64
        img_path = f'temp_image_{data["timestamp"]}.png'
        if os.path.exists(img_path):
            with open(img_path, 'rb') as f:
                img_b64 = base64.b64encode(f.read()).decode()
            
            # Cleanup
            os.remove(img_path)
            if data.get('characterImage'):
                os.remove(char_img_path)
            
            return jsonify({"image": f"data:image/png;base64,{img_b64}"})
    
    except Exception as e:
        print(f"Image generation error: {e}")
    
    return jsonify({"image": ""})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "ollama": True, "python": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888, debug=True)
```

#### 3. Start Local AI Server

```bash
python local_ai_server.py
```

This starts your AI server on `http://localhost:8888`

### Part 2: Expose Local Server to Internet

#### Option A: Using ngrok (Recommended)

```bash
# Install ngrok from https://ngrok.com/
ngrok http 8888
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

#### Option B: Using Cloudflare Tunnel

```bash
# Install cloudflared
cloudflared tunnel --url http://localhost:8888
```

#### Option C: Port Forwarding (Advanced)

Configure your router to forward external port to `localhost:8888`

### Part 3: Configure Replit Deployment

#### 1. Set Environment Variables in Replit

Go to your Replit project → Secrets tab and add:

```
LOCAL_AI_SERVER_URL=https://your-ngrok-url.ngrok.io
AI_MODE=remote
```

#### 2. Update Server Code for Remote AI

Modify `server/services/ollama.ts`:

```typescript
// At the top of the file
const AI_SERVER_URL = process.env.LOCAL_AI_SERVER_URL;
const AI_MODE = process.env.AI_MODE || 'local';

export async function generateStoryChapter(request: StoryGenerationRequest): Promise<StoryChapterResponse> {
  if (AI_MODE === 'remote' && AI_SERVER_URL) {
    try {
      const response = await fetch(`${AI_SERVER_URL}/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Remote AI server error:', error);
    }
  }
  
  // Fall back to existing local/fallback logic
  return generateFallbackStory(request);
}

export async function generateStoryImage(description: string, characterImageUrl?: string, genre: string = "cartoon"): Promise<string> {
  if (AI_MODE === 'remote' && AI_SERVER_URL) {
    try {
      const response = await fetch(`${AI_SERVER_URL}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          characterImage: characterImageUrl,
          genre,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.image || characterImageUrl || "";
      }
    } catch (error) {
      console.error('Remote image generation error:', error);
    }
  }
  
  // Fall back to existing logic
  return characterImageUrl || "";
}
```

### Part 4: Deploy and Test

#### 1. Deploy to Replit

Click the "Deploy" button in your Replit project.

#### 2. Test the Connection

Your deployed app will now:
- Serve the web interface from Replit's cloud
- Send AI requests to your local computer
- Generate stories and images using your local resources

#### 3. Monitor Performance

Check the health endpoint:
```
GET https://your-replit-app.replit.app/api/health
```

## Security Considerations

### 1. API Authentication (Optional)

Add API key authentication to your local server:

```python
API_KEY = "your-secret-key"

@app.before_request
def check_auth():
    if request.endpoint != 'health':
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != f"Bearer {API_KEY}":
            return jsonify({"error": "Unauthorized"}), 401
```

### 2. CORS Configuration

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://your-replit-app.replit.app"])
```

### 3. Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)
```

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check if local AI server is running
2. **Tunnel Expired**: Restart ngrok and update environment variable
3. **Slow Performance**: Check your internet upload speed
4. **Model Errors**: Verify Ollama and Python dependencies are installed

### Debugging:

```bash
# Check local server logs
tail -f local_ai_server.log

# Test local endpoints directly
curl http://localhost:8888/health

# Check Replit deployment logs
```

## Production Considerations

For production use, consider:
- Using a VPS instead of ngrok for stability
- Setting up proper SSL certificates
- Implementing request caching
- Adding monitoring and alerting
- Using a queue system for long-running tasks

This setup gives you the best of both worlds: cloud hosting for reliability and accessibility, with local AI processing for cost control and customization.