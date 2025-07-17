import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let app;
let db;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Use service account key (recommended for production)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Use default credentials (for development)
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    throw new Error('Firebase configuration not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID');
  }
  
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

export { db };