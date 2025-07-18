# StoryMagic - Local Development Setup

## Prerequisites

### Required Software
1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **Ollama** - [Download from ollama.com](https://ollama.com/download) *(for story generation)*
3. **Python 3.8+** - [Download from python.org](https://www.python.org/downloads/) *(for image generation)*

**Note:** Database setup is not required! The application uses in-memory storage for simplified deployment.

## Quick Start

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Ollama and pull Mistral model
ollama pull mistral

# Install Python dependencies (choose one option)
# Option A: System Python
pip install -r python_requirements.txt

# Option B: Virtual Environment (Recommended)
# Linux/Mac:
bash setup_venv.sh
# Windows:
setup_venv.bat
```

### 2. Environment Configuration (Optional)
Create a `.env` file only if you need custom settings:
```env
NODE_ENV=development
# Optional: Custom Python virtual environment path
PYTHON_VENV_PATH=C:\Users\Admin\Downloads\Story\fast_story_gen\venv
```

**Example Windows setup:**
- Virtual environment: `C:\Users\Admin\Downloads\Story\fast_story_gen\venv`
- Project path: `C:\Users\Admin\Downloads\Story\StorySparkAI\`

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   └── lib/          # Utilities
├── server/               # Express backend
│   ├── services/         # AI and image generation
│   ├── routes.ts         # API endpoints
│   └── storage.ts        # Database operations
├── shared/               # Shared types and schemas
└── generated_images/     # AI-generated story images
```

## Features

### Character Stats System
- 6 attributes: courage, kindness, wisdom, creativity, strength, friendship
- Interactive sliders for character creation
- Real-time stats display in story reader
- Choice-based stat modifications

### AI Story Generation
- Uses Ollama + Mistral for narrative generation
- Character stats influence story content
- Dynamic branching based on choices
- Age-appropriate content for children 6-12

### Image Generation
- Python-based Stable Diffusion integration
- Character-consistent artwork using IP-Adapter
- Automatic image generation for story chapters

## System Status

The StoryMagic application includes several components that may not be available in all environments:

### Core Features (Always Available)
✓ **Character Creation** - Create characters with stats, personality, and powers
✓ **Story Management** - Create, save, and organize stories
✓ **Database Integration** - PostgreSQL with persistent storage
✓ **Character Stats System** - 6 attributes that track and influence stories

### Optional Features (Enhanced with Dependencies)
✓ **AI Story Generation** - Enhanced with Ollama + Mistral, includes comprehensive fallback
✓ **Image Generation** - Enhanced with Python + Stable Diffusion, works without dependencies

## Troubleshooting

### Common Issues

**"ollama: not found"** ✅ FIXED
- ~~Install Ollama from ollama.com~~
- ~~Run `ollama pull mistral` to download the model~~
- The application now includes comprehensive fallback story generation
- **Stories work perfectly without Ollama** - enhanced templates create engaging content

**"python: not found"**
- Install Python 3.8+ from python.org
- On Windows, ensure Python is added to PATH during installation
- Try `python3` instead of `python` on Linux/Mac
- **Custom venv path**: If using a custom virtual environment (e.g., `C:\Users\Admin\Downloads\Story\fast_story_gen\venv`), the system will automatically detect and use it
- **Workaround**: Stories work without images, manually add images later

**Windows Socket Error (ENOTSUP)** ✅ FIXED
- ~~Use `start_windows.bat` instead of `npm start` for production on Windows~~
- The application now automatically detects Windows and uses localhost configuration
- Both `npm start` and `start_windows.bat` work correctly on Windows

**Database connection errors** ✅ FIXED
- ~~Verify your DATABASE_URL is correct~~
- ~~Ensure the database server is running~~
- The application now uses in-memory storage - no database required

**Image generation fails**
- Install Python dependencies: `pip install -r python_requirements.txt`
- For GPU acceleration, install CUDA-compatible PyTorch
- Virtual environment setup is recommended to avoid conflicts

### Minimal Setup (No Dependencies Required)
The application now works completely without external dependencies:
```bash
npm install
npm run dev
```

This gives you full access to:
- Character creation with stats system
- Story creation and management with fallback content
- Character stats tracking and updates
- All UI components and navigation
- Enhanced story generation with genre-specific templates

### Development Commands

```bash
# Start development server
npm run dev

# No database operations needed!

# Build for production
npm run build

# Start production server (Linux/Mac)
npm start

# Type checking
npm run type-check

# Windows-specific commands
setup_windows.bat        # Automated Windows setup script
start_windows.bat        # Start production server on Windows
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | Environment (development/production) |
| `PYTHON_VENV_PATH` | No | Custom Python virtual environment path |
| `OPENAI_API_KEY` | No | Optional for fallback AI generation |

## Dependencies Overview

### Frontend
- React 18 with TypeScript
- Vite for development and building
- TailwindCSS + shadcn/ui components
- TanStack React Query for state management

### Backend
- Express.js with TypeScript
- Drizzle ORM for database operations
- Neon Database (serverless PostgreSQL)
- Zod for validation

### AI & Image Generation
- Ollama + Mistral for story generation
- Python + Stable Diffusion for images
- IP-Adapter for character consistency

## Contributing

1. Follow the existing code style
2. Update replit.md when making architectural changes
3. Test character creation and story generation flows
4. Ensure all TypeScript types are properly defined

## Support

For setup issues or questions, check the troubleshooting section above or refer to the main documentation in `replit.md`.