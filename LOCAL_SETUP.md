# StoryMagic - Local Development Setup

## Prerequisites

### Required Software
1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **OpenAI API Key** - [Get from platform.openai.com](https://platform.openai.com/api-keys) *(for AI story and image generation)*

**Note:** No database or local AI setup required! The application uses:
- In-memory storage for simplified deployment
- OpenAI GPT-4o for story generation  
- DALL-E 3 for image generation

## Quick Start

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# No additional AI setup required!
# OpenAI handles both story generation and image creation
```

### 2. Environment Configuration
Create a `.env` file with your OpenAI API key:
```env
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

**Get your OpenAI API key:**
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy and paste it into your `.env` file

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

### Optional Features (Require Dependencies)
⚠️ **AI Story Generation** - Requires Ollama + Mistral model
⚠️ **Image Generation** - Requires Python + Stable Diffusion dependencies

## Troubleshooting

### Common Issues

**"Missing OpenAI API key"**
- Get your API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Add it to your `.env` file as `OPENAI_API_KEY=your_key_here`
- Restart the application after adding the key
- **Note**: You need OpenAI credits to generate stories and images

**Windows Socket Error (ENOTSUP)**
- Use `start_windows.bat` instead of `npm start` for production on Windows
- The script automatically configures the correct host settings for Windows compatibility

**Database connection errors**
- Verify your DATABASE_URL is correct
- Ensure the database server is running
- Check firewall settings for local PostgreSQL

**Image generation fails**
- Install Python dependencies: `pip install -r python_requirements.txt`
- For GPU acceleration, install CUDA-compatible PyTorch
- Virtual environment setup is recommended to avoid conflicts

### Minimal Setup (Just Database)
If you only want to test the character stats system without AI features:
```bash
npm install
# Set up DATABASE_URL in .env
npm run db:push
npm run dev
```

This will give you full access to:
- Character creation with stats system
- Story creation and management
- Character stats tracking and updates
- All UI components and navigation

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
| `OPENAI_API_KEY` | **Yes** | OpenAI API key for story and image generation |

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