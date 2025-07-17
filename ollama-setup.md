# Ollama + Mistral Setup Guide

The StoryMagic app now uses **Ollama + Mistral** for local AI story generation instead of OpenAI. This means:

✅ **No API keys needed**  
✅ **No usage costs**  
✅ **Runs completely offline**  
✅ **Privacy-focused - your data stays local**  

## Quick Setup (10 minutes)

### 1. Install Ollama (2 minutes)

**Windows:**
- Download from [ollama.com](https://ollama.com)
- Run the installer
- Ollama will start automatically

**macOS:**
- Download from [ollama.com](https://ollama.com)
- Drag to Applications folder
- Run Ollama from Applications

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Download Mistral Model (5 minutes)
Once Ollama is installed, open a terminal and run:

```bash
ollama pull mistral
```

This downloads the Mistral model (~4GB). Wait for it to complete.

### 3. Test Ollama (1 minute)
Test that it's working:

```bash
ollama run mistral "Tell me a short story about a brave knight"
```

You should see a story generated. Press `Ctrl+D` to exit.

### 4. Run StoryMagic (2 minutes)
Now your StoryMagic app will use Ollama automatically:

```bash
npm run dev
```

That's it! Stories will be generated locally using Mistral.

## How It Works

- **Story Generation**: Uses Mistral model via Ollama
- **Image Generation**: Uses Python + Stable Diffusion (see python setup)
- **No Internet Required**: Once models are downloaded, works offline
- **Fast**: Local generation is often faster than API calls

## Troubleshooting

### "ollama: command not found"
- Make sure Ollama is installed and in your PATH
- Try restarting your terminal
- On Windows, restart your computer

### "Error: model 'mistral' not found"
- Run `ollama pull mistral` to download the model
- Make sure you have enough disk space (~4GB)

### Stories aren't generating
- Check if Ollama is running: `ollama ps`
- Test with: `ollama run mistral "hello"`
- Check the server logs for error messages

### Slow generation
- Mistral runs better on computers with more RAM
- First generation is slower (model loading)
- Subsequent generations are faster

## Advanced Options

### Use Different Models
You can try other models:

```bash
# Smaller, faster model
ollama pull mistral:7b-instruct

# Larger, more creative model  
ollama pull llama2:13b
```

Then update the model name in `server/services/ollama.ts`.

### Model Performance
- **mistral**: Good balance of speed and quality
- **mistral:7b**: Faster, lighter
- **llama2:13b**: More creative, slower

### System Requirements
- **Minimum**: 8GB RAM, 5GB disk space
- **Recommended**: 16GB RAM, 10GB disk space
- **GPU**: Optional, but speeds up generation

## Why Ollama + Mistral?

| Feature | Ollama + Mistral | OpenAI |
|---------|------------------|--------|
| **Cost** | Free | $0.002-0.03 per 1K tokens |
| **Privacy** | Complete | Data sent to OpenAI |
| **Speed** | Very fast (local) | Depends on internet |
| **Reliability** | Always available | Can have outages |
| **Customization** | Full control | Limited |

## Image Generation Setup

For images, you'll also need Python + Stable Diffusion. See the Python setup files:
- `setup_venv.sh` (Linux/Mac)
- `setup_venv.bat` (Windows)
- `python_requirements.txt`

## Getting Help

If you run into issues:
1. Check the Ollama logs: `ollama logs`
2. Verify model is downloaded: `ollama list`
3. Test basic functionality: `ollama run mistral "test"`
4. Check the StoryMagic server logs

The app will show fallback content if Ollama isn't working, so you can debug step by step.

## Next Steps

Once Ollama is working:
1. Create characters in StoryMagic
2. Generate your first story
3. Stories will be created locally using Mistral
4. Images will be generated using Python (if set up)

Enjoy your private, local AI storytelling experience! 🚀