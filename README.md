# FAIryTale AI - Local Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **OpenAI API Key** (for story and image generation)

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
   CREATE DATABASE fairytale_ai;
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

### 3. Environment Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and fill in your values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - Other database connection details

### 4. Database Schema Setup
Run the database migration to set up the schema:
```bash
npm run db:push
```

### 5. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/storymagic` |
| `OPENAI_API_KEY` | OpenAI API key for story generation | `sk-...` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check that the database exists
- Verify connection string format
- Test connection with a PostgreSQL client

### OpenAI API Issues
- Verify your API key is valid
- Check your OpenAI account has credits
- Ensure the API key has the required permissions

### Port Already in Use
If port 5000 is already in use, change the PORT in your `.env` file:
```
PORT=3000
```

## Features

- **Character Creation**: Design custom characters with personalities and powers
- **AI Story Generation**: Generate unique stories using OpenAI GPT-4
- **Interactive Stories**: Make choices that affect the story outcome
- **Text-to-Speech**: Listen to stories with built-in speech synthesis
- **Image Generation**: AI-generated images for characters and story chapters
- **Progress Tracking**: Save and continue stories across sessions

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4 for stories, DALL-E for images
- **Build**: Vite for frontend, ESBuild for backend