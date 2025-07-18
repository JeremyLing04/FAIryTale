# StoryMagic - Simple Setup (No AI Required)

## Quick Start - Just Get It Running!

### Windows Users
1. **Download and extract** the project to your computer
2. **Open Command Prompt** in the project folder
3. **Install dependencies**: `npm install`
4. **Start the app**: `npm run dev`
5. **Open your browser** to `http://localhost:5000`

### What Works Without Installing Anything Else
- ✅ Create characters with stats and images
- ✅ Start stories and read chapters  
- ✅ Make choices that affect character stats
- ✅ View character gallery and story library
- ✅ All UI components and navigation

### What Needs Extra Setup (Optional)
- 🤖 **AI Story Generation** - Requires Ollama + Mistral
- 🎨 **AI Image Generation** - Requires Python + Stable Diffusion

## Without AI Dependencies
The app includes built-in story content, so you can:
- Create characters and see them in action
- Read pre-written adventure chapters  
- Make choices that change character stats
- Experience the full user interface

## If You Want AI Features Later
1. **For AI Stories**: Install Ollama and run `ollama pull mistral`
2. **For AI Images**: Install Python and run `pip install -r python_requirements.txt`

## Troubleshooting
**"Cannot proceed from Begin Adventure"**
- This happens when story generation fails
- The app now includes fallback stories that work without AI
- Just refresh the page and try again

**Windows Socket Errors**
- Use `npm run dev` for development mode
- For production, use the included `start_windows.bat` script

**Port 5000 Already in Use**
- Close other applications using port 5000
- Or set a different port: `PORT=3000 npm run dev`