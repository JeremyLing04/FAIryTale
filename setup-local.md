# Quick Local Setup Guide

## The Issue
The error you're seeing happens because the application needs a DATABASE_URL environment variable to connect to PostgreSQL.

## Quick Solution

### Step 1: Create Environment File
Create a `.env` file in your project root with these contents:

```bash
# For local development with a simple SQLite database (easiest option)
DATABASE_URL="sqlite://./local.db"

# OR for PostgreSQL (more complex setup)
DATABASE_URL="postgresql://username:password@localhost:5432/fairytale_ai"

# Required for AI features
OPENAI_API_KEY="your_openai_api_key_here"

# Optional settings
NODE_ENV=development
PORT=5000
```

### Step 2: Setup Database Schema
Run this command to create the database tables:
```bash
npm run db:push
```

### Step 3: Start the Application
```bash
npm run dev
```

## For Production Build
```bash
npm run build
npm start
```

## Alternative: Simple SQLite Setup
If you want to avoid PostgreSQL setup, you can modify the database connection to use SQLite:

1. Install SQLite support:
```bash
npm install better-sqlite3
```

2. Create a `.env` file with:
```
DATABASE_URL="sqlite://./storymagic.db"
OPENAI_API_KEY="your_openai_api_key_here"
```

3. Run the setup:
```bash
npm run db:push
npm run dev
```

## Common Issues

### Port Already in Use
If port 5000 is busy, change the PORT in your `.env` file:
```
PORT=3000
```

### Database Connection Failed
- Make sure PostgreSQL is running (if using PostgreSQL)
- Check the DATABASE_URL format
- Verify credentials are correct

### OpenAI API Issues
- Get your API key from https://platform.openai.com/
- Make sure you have credits in your OpenAI account
- The key should start with "sk-"

## What Each Environment Variable Does

- `DATABASE_URL`: Database connection string - tells the app where to store data
- `OPENAI_API_KEY`: Required for generating stories and images
- `NODE_ENV`: Tells the app if it's in development or production mode
- `PORT`: Which port the web server runs on (default 5000)

## Need Help?
If you're still having issues, the most common problems are:
1. Missing `.env` file
2. Wrong DATABASE_URL format
3. Database not running (if using PostgreSQL)
4. Invalid OpenAI API key