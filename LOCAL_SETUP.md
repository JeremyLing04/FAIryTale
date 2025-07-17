# StoryMagic - Local Setup Guide

## Quick Start (15 minutes)

### 1. Prerequisites
- Node.js (v18 or higher)
- Git

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd storymagic
npm install
```

### 3. Setup AI (Ollama + Mistral)
```bash
# Install Ollama from https://ollama.com
# Then download the Mistral model
ollama pull mistral

# Test it works
ollama run mistral "Tell me a short story"
```

### 4. Setup Database (Choose One)

#### Option A: Firebase (Recommended - 5 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "storymagic"
3. Enable Firestore Database (test mode)
4. Get your Project ID from settings
5. Create `.env` file:
```bash
FIREBASE_PROJECT_ID=your-project-id
USE_FIREBASE=true
NODE_ENV=development
PORT=5000
```

#### Option B: PostgreSQL (Advanced - 20 minutes)
1. Install PostgreSQL
2. Create database: `CREATE DATABASE storymagic;`
3. Create `.env` file:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/storymagic
NODE_ENV=development
PORT=5000
```
4. Run migration: `npm run db:push`

### 5. Start the Application
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## What You'll See

1. **Home Page**: Choose character types and start creating
2. **Character Creator**: Design custom characters with personalities
3. **Story Generation**: AI creates unique stories using your characters
4. **Interactive Reading**: Make choices that affect the story
5. **Text-to-Speech**: Listen to stories being read aloud

## Troubleshooting

### "ollama: command not found"
- Install Ollama from https://ollama.com
- Restart your terminal
- Make sure it's in your PATH

### "Error generating story"
- Check Ollama is running: `ollama ps`
- Test with: `ollama run mistral "hello"`
- Look at server logs for details

### Database Issues
- **Firebase**: Check project ID is correct
- **PostgreSQL**: Verify connection string and database exists

### Port Already in Use
Change the port in your `.env` file:
```bash
PORT=3000
```

## Optional: Image Generation

For AI-generated images, set up Python + Stable Diffusion:

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r python_requirements.txt
```

## Development Tips

- Stories are generated locally with Ollama (no API costs)
- Images are generated with Python (optional)
- Data is stored in Firebase or PostgreSQL
- Hot reload works for both frontend and backend
- Check browser console for frontend errors
- Check terminal for backend errors

## File Structure
```
storymagic/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── generated_images/ # AI-generated images
├── .env            # Environment variables
└── README.md       # This file
```

## Next Steps

1. Create your first character
2. Generate a story
3. Try the text-to-speech feature
4. Explore different story genres
5. Check out the gallery features

## Getting Help

- Check the logs in your terminal
- Look at browser console for frontend issues
- Test each component separately (Ollama, database, etc.)
- All documentation is in the project files

Have fun creating magical stories! 🎭