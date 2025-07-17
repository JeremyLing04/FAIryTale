# StoryMagic - Local Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Database**: PostgreSQL (v12 or higher) OR Firebase
3. **Ollama + Mistral** (for local AI story generation)
4. **Python** (optional, for image generation)

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

#### Option A: Use Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE storymagic;
   ```
3. Create a user (optional):
   ```sql
   CREATE USER storymagic_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE storymagic TO storymagic_user;
   ```

#### Option B: Use Docker PostgreSQL
```bash
docker run --name storymagic-db -e POSTGRES_DB=storymagic -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:13
```

### 3. AI Setup - Ollama + Mistral

#### Install Ollama
1. Download and install Ollama from [ollama.com](https://ollama.com)
2. Pull the Mistral model:
   ```bash
   ollama pull mistral
   ```
3. Test it works:
   ```bash
   ollama run mistral "Tell me a story"
   ```

### 4. Environment Configuration

#### Option A: Firebase (Recommended - Easy Setup)
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create `.env` file:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   USE_FIREBASE=true
   ```

#### Option B: PostgreSQL (Advanced)
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and fill in your values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - Other database connection details

### 5. Database Schema Setup (PostgreSQL only)
If using PostgreSQL, run the database migration:
```bash
npm run db:push
```

### 6. Start the Application

#### Development Mode (Recommended)
```bash
npm run dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:5000`

**Note:** For local development, use `npm run dev` as it provides hot reload and better debugging. Use production mode only for deployment.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (if using PostgreSQL) | `postgresql://user:pass@localhost:5432/storymagic` |
| `FIREBASE_PROJECT_ID` | Firebase project ID (if using Firebase) | `storymagic-123abc` |
| `USE_FIREBASE` | Use Firebase instead of PostgreSQL | `true` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check that the database exists
- Verify connection string format
- Test connection with a PostgreSQL client

### Ollama/AI Issues
- Ensure Ollama is installed and running
- Check Mistral model is downloaded: `ollama list`
- Test generation: `ollama run mistral "hello"`
- Check server logs for error messages

### Port Already in Use
If port 5000 is already in use, change the PORT in your `.env` file:
```
PORT=3000
```

## Features

- **Character Creation**: Design custom characters with personalities and powers
- **AI Story Generation**: Generate unique stories using Ollama + Mistral (local AI)
- **Interactive Stories**: Make choices that affect the story outcome
- **Text-to-Speech**: Listen to stories with built-in speech synthesis
- **Image Generation**: AI-generated images for characters and story chapters
- **Progress Tracking**: Save and continue stories across sessions

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Ollama + Mistral for stories, Python + Stable Diffusion for images
- **Build**: Vite for frontend, ESBuild for backend