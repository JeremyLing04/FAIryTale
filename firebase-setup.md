# Firebase Setup for StoryMagic

## Quick Setup for Local Development

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name (e.g., "storymagic-dev")
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to you)

### 3. Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. In the "General" tab, scroll down to "Your apps"
3. Click "Add app" and select Web (</> icon)
4. Enter app name (e.g., "StoryMagic Web")
5. Copy the configuration values

### 4. Update .env File
Add your Firebase configuration to `.env`:
```env
USE_FIREBASE=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 5. Start Development Server
```bash
npm run dev
```

## Firebase Security Rules (Development)
Your Firestore rules should be set to allow read/write for development:
```javascript
// Firestore Security Rules
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Data Structure
Firebase will automatically create these collections:
- `characters` - Character data with stats
- `stories` - Story metadata and progress
- `story_chapters` - Individual story chapters with choices

## Switching Between Firebase and PostgreSQL
- Set `USE_FIREBASE=true` in .env to use Firebase
- Comment out `USE_FIREBASE` or set to `false` to use PostgreSQL
- The app will automatically detect and use the appropriate database

## Firebase Emulator (Optional)
For completely offline development:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase login`
3. Run: `firebase emulators:start --only firestore`
4. Add `USE_FIREBASE_EMULATOR=true` to .env

## Benefits of Firebase for Local Development
- No local database setup required
- Real-time data synchronization
- Easy data viewing in Firebase Console
- Automatic backups and scaling
- Works seamlessly with the existing app architecture