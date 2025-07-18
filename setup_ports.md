# Port Configuration for FAIryTale AI Services

## Problem: Port Conflicts
Ollama+Mistral and SD15+IP-Adapter cannot use the same port simultaneously.

## Solution: Separate Ports

### **Port Assignments:**
- **Ollama+Mistral**: Port 11434 (default)
- **SD15+IP-Adapter**: Port 5001 (custom)

## **Setup Commands (Run in separate terminals):**

### **Terminal 1: Start Ollama**
```bash
# Set Ollama to bind to all interfaces
set OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

### **Terminal 2: Start Image Server**
```bash
cd C:\Users\Admin\Downloads\Story\fast_story_gen
python local_ai_server.py
```

### **Terminal 3: Expose Ollama with ngrok**
```bash
ngrok http 11434
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### **Terminal 4: Expose Image Server with ngrok**
```bash
ngrok http 5001
# Copy the HTTPS URL (e.g., https://def456.ngrok.io)
```

## **Replit Configuration:**

Add these to your Replit secrets:
```
OLLAMA_HOST=https://abc123.ngrok.io
REMOTE_IMAGE_URL=https://def456.ngrok.io
```

## **Verification:**

Test each service independently:

**Test Ollama:**
```bash
curl http://localhost:11434/api/tags
```

**Test Image Server:**
```bash
curl http://localhost:5001/test
```

**Test Remote Access:**
```bash
curl https://abc123.ngrok.io/api/tags
curl https://def456.ngrok.io/test
```

## **Common Issues:**

### **Port Already in Use**
If you get "port already in use" errors:
```bash
# Windows: Find what's using the port
netstat -ano | findstr :11434
netstat -ano | findstr :5001

# Kill the process if needed
taskkill /PID <process_id> /F
```

### **Ollama Not Binding to 0.0.0.0**
Make sure to set the environment variable:
```bash
set OLLAMA_HOST=0.0.0.0:11434
```

### **ngrok Session Limits**
Free ngrok accounts have limits. If you hit them:
1. Sign up for a free account at ngrok.com
2. Run: `ngrok authtoken <your-token>`

## **Success Indicators:**

You'll know it's working when:
1. Ollama responds on port 11434
2. Image server responds on port 5001
3. Both ngrok tunnels are active
4. Replit app can reach both services
5. Stories generate with your custom images