# FAIryTale - AI-Powered Children's Story Application

## Overview

FAIryTale is a full-stack application that creates personalized, interactive stories for children aged 6-12. The application uses AI to generate unique story content and images based on custom characters that users can create. It features a modern React frontend with a child-friendly design and an Express.js backend with OpenAI integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for client-side rendering
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom child-friendly color palette
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Storage**: In-memory storage for simplified deployment (no database required)
- **AI Integration**: Ollama+Mistral for story generation, Python+Stable Diffusion for image creation
- **Session Management**: Express sessions with in-memory storage

### Data Storage Design
The application uses in-memory storage with three main entities:
- **Characters**: Store character details including appearance, personality, special powers, and stats
- **Stories**: Track story metadata, progress, and completion status
- **Story Chapters**: Individual story segments with content, images, and interactive choices

## Key Components

### Character Creation System
- Interactive character builder with predefined types (explorer, princess, superhero, etc.)
- Customizable appearance attributes (hair color, eye color, skin tone, outfit)
- Personality traits and special powers
- Character stats system with 6 attributes: courage, kindness, wisdom, creativity, strength, friendship
- Visual character cards with themed color gradients and mini stats display
- Character stats editor with sliders for setting initial values (0-100 scale)

### AI Story Generation
- OpenAI GPT-4o integration for generating age-appropriate story content
- Dynamic story branching based on user choices
- Automatic image generation for story chapters
- Content safety measures ensuring child-appropriate material

### Interactive Story Reader
- Chapter-based story progression with visual progress tracking
- Multiple choice selections that influence story direction and character stats
- Character stats sidebar showing real-time attribute values
- Image display for each chapter
- Choice system with stat change indicators (+/- courage, kindness, etc.)
- Responsive design for various screen sizes

### Story Management
- Gallery view for browsing created stories
- Story completion tracking
- Character library for reusing created characters

## Data Flow

1. **Character Creation**: User creates a character → Data validated with Zod → Stored in memory via storage interface
2. **Story Initialization**: User selects character and story genre → Story record created → First chapter generated via OpenAI API
3. **Story Progression**: User makes choices → New chapter generated based on previous content and choice → Chapter stored and displayed
4. **Story Completion**: Final chapter reached → Story marked as complete → Available in gallery

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **zod**: Runtime type validation and schema definition
- **express**: Backend web framework
- **tsx**: TypeScript execution and build tool

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class composition
- **lucide-react**: Icon library

### AI Integration
- **ollama**: Local AI model runtime for Mistral-based story generation
- **python**: Stable Diffusion image generation with IP-Adapter support

### Development Tools
- **typescript**: Static type checking
- **vite**: Fast build tool and development server
- **tsx**: TypeScript compilation and execution

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server with TypeScript compilation via tsx
- Database migrations handled through Drizzle Kit
- Environment variables for API keys and database connections

### Production Build
- Frontend: Vite builds React app to static files served by Express
- Backend: ESBuild bundles Express server to single JavaScript file
- Storage: In-memory storage (no database required)
- Static assets served directly by Express

### Environment Configuration
- `NODE_ENV` determines development vs production behavior
- `OLLAMA_HOST` for remote Ollama+Mistral service (via ngrok)
- `REMOTE_IMAGE_URL` for remote SD15+IP-Adapter service (via ngrok)
- `PYTHON_VENV_PATH` for custom Python virtual environment paths (optional)
- Dotenv support for loading environment variables from .env file
- Hybrid deployment: Replit hosting + Windows PC AI services via ngrok tunnels
- Optional local AI fallback when remote services unavailable

### Python Virtual Environment Setup
The image generator supports both system Python and virtual environments:

**Option 1: Use System Python**
- Install dependencies: `pip install -r python_requirements.txt`
- The system will use `python app.py` directly

**Option 2: Use Virtual Environment (Recommended)**
- Linux/Mac: Run `bash setup_venv.sh`
- Windows: Run `setup_venv.bat`
- The system automatically detects and uses the venv when available

### Recent Changes
- **July 18, 2025**: ✅ Successfully integrated remote AI services via ngrok tunnels
- **July 18, 2025**: ✅ Remote Ollama+Mistral working perfectly for story generation
- **July 18, 2025**: ✅ Remote SD15+IP-Adapter service working perfectly with Unicode fix applied
- **July 18, 2025**: ✅ Fixed "413 Request Entity Too Large" error by optimizing payload size
- **July 18, 2025**: ✅ Scene description generation perfected - generates action/scene only (character name added by app.py)
- **July 18, 2025**: ✅ Fixed 500 Internal Server Error by limiting description length to 200 characters
- **July 18, 2025**: ✅ Updated ngrok tunnel endpoints (Ollama: eb5765ddb783, Image: 8260643e59cb)
- **July 18, 2025**: ✅ Added character reference image support for IP-Adapter (uploaded images used as reference)
- **July 18, 2025**: ✅ Fixed TypeScript compilation errors in ollama.ts
- **July 18, 2025**: ✅ Added dotenv support for environment variable loading
- **January 18, 2025**: Added remote AI endpoints support - Replit deployment can use local PC's Ollama+Mistral and Stable Diffusion
- **January 18, 2025**: Created comprehensive deployment guide for hybrid Replit+local AI setup
- **January 18, 2025**: Added fallback story generation - app works without Ollama/AI dependencies
- **January 18, 2025**: Added fallback image handling - app works without Python/Stable Diffusion
- **January 18, 2025**: Fixed Windows compatibility issues with socket binding and production builds
- **January 18, 2025**: Created simple setup guide for users who don't need AI features
- **January 18, 2025**: Removed database dependency - migrated back to in-memory storage for simplified deployment
- **January 18, 2025**: Updated schema to use TypeScript interfaces instead of Drizzle ORM tables
- **January 18, 2025**: Enhanced Windows setup automation with custom virtual environment path support
- **January 18, 2025**: Simplified environment configuration - removed DATABASE_URL requirement
- **January 17, 2025**: Added comprehensive character stats system with 6 attributes (courage, kindness, wisdom, creativity, strength, friendship)
- **January 17, 2025**: Implemented character stats editor with sliders in character creator
- **January 17, 2025**: Added character stats display on character cards and story reader sidebar
- **January 17, 2025**: Updated AI story generation to include character stats in prompts
- **January 17, 2025**: Created choice system that affects character stats with dynamic +/- changes
- **January 17, 2025**: Added API route for updating character stats when story choices are made
- **January 16, 2025**: Replaced OpenAI with Ollama+Mistral for story generation
- **January 16, 2025**: Integrated Python-based Stable Diffusion image generator with IP-Adapter support
- **January 16, 2025**: Modified choice system to only appear every 2-3 chapters instead of every chapter
- **January 16, 2025**: Added custom character types and adventure types with user input fields
- **January 16, 2025**: Implemented character and story artwork image upload (5MB limit)
- **January 16, 2025**: Increased Express body parser limit to 10MB to handle image uploads
- **January 16, 2025**: Added continue button for chapters without choices

The application is designed to be easily deployable on platforms like Replit, with automatic environment detection and appropriate build/serve strategies for each environment.