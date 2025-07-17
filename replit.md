# StoryMagic - AI-Powered Children's Story Application

## Overview

StoryMagic is a full-stack application that creates personalized, interactive stories for children aged 6-12. The application uses AI to generate unique story content and images based on custom characters that users can create. It features a modern React frontend with a child-friendly design and an Express.js backend with OpenAI integration.

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
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **AI Integration**: OpenAI API for story generation and image creation
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
The application uses a PostgreSQL database with three main entities:
- **Characters**: Store character details including appearance, personality, and special powers
- **Stories**: Track story metadata, progress, and completion status
- **Story Chapters**: Individual story segments with content, images, and interactive choices

## Key Components

### Character Creation System
- Interactive character builder with predefined types (explorer, princess, superhero, etc.)
- Customizable appearance attributes (hair color, eye color, skin tone, outfit)
- Personality traits and special powers
- Visual character cards with themed color gradients

### AI Story Generation
- OpenAI GPT-4o integration for generating age-appropriate story content
- Dynamic story branching based on user choices
- Automatic image generation for story chapters
- Content safety measures ensuring child-appropriate material

### Interactive Story Reader
- Chapter-based story progression with visual progress tracking
- Multiple choice selections that influence story direction
- Image display for each chapter
- Responsive design for various screen sizes

### Story Management
- Gallery view for browsing created stories
- Story completion tracking
- Character library for reusing created characters

## Data Flow

1. **Character Creation**: User creates a character → Data validated with Zod → Stored in PostgreSQL via Drizzle ORM
2. **Story Initialization**: User selects character and story genre → Story record created → First chapter generated via OpenAI API
3. **Story Progression**: User makes choices → New chapter generated based on previous content and choice → Chapter stored and displayed
4. **Story Completion**: Final chapter reached → Story marked as complete → Available in gallery

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **zod**: Runtime type validation and schema definition

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
- **drizzle-kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server with TypeScript compilation via tsx
- Database migrations handled through Drizzle Kit
- Environment variables for API keys and database connections

### Production Build
- Frontend: Vite builds React app to static files served by Express
- Backend: ESBuild bundles Express server to single JavaScript file
- Database: PostgreSQL hosted on Neon (serverless)
- Static assets served directly by Express

### Environment Configuration
- `NODE_ENV` determines development vs production behavior
- `DATABASE_URL` for PostgreSQL connection with Neon database
- Ollama installation required for local AI story generation
- Python with Stable Diffusion dependencies for image generation
- Optional Python virtual environment support (automatically detected)
- Replit-specific configurations for cloud deployment

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
- **January 17, 2025**: Fixed navigation routing issues - created dedicated /my-stories and /my-characters pages
- **January 17, 2025**: Fixed character selection from gallery - now properly navigates to story creation
- **January 17, 2025**: Implemented character type selection from home page with URL parameter passing
- **January 17, 2025**: Added text-to-speech functionality with Web Speech API integration
- **January 17, 2025**: Created local setup documentation with .env.example and README.md
- **January 16, 2025**: Replaced OpenAI with Ollama+Mistral for story generation
- **January 16, 2025**: Integrated Python-based Stable Diffusion image generator with IP-Adapter support
- **January 16, 2025**: Modified choice system to only appear every 2-3 chapters instead of every chapter
- **January 16, 2025**: Added custom character types and adventure types with user input fields
- **January 16, 2025**: Implemented character and story artwork image upload (5MB limit)
- **January 16, 2025**: Increased Express body parser limit to 10MB to handle image uploads
- **January 16, 2025**: Added continue button for chapters without choices
- **January 16, 2025**: Created PostgreSQL database and migrated from in-memory storage
- **January 16, 2025**: Implemented fully dynamic chapter generation system with database persistence
- **January 16, 2025**: Updated story progression to generate chapters on-demand instead of pre-generating

The application is designed to be easily deployable on platforms like Replit, with automatic environment detection and appropriate build/serve strategies for each environment.