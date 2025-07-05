import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables from .env file.
// This is crucial for the server-side Admin SDK to find the correct project.
dotenv.config();

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// This robust singleton pattern prevents re-initializing the Firebase Admin App
// during hot-reloads in development.
if (!admin.apps.length) {
  // The Admin SDK needs to know which project to connect to.
  // We explicitly provide the project ID from the environment variables.
  admin.initializeApp({
    // If projectId is not found, the SDK will throw an error, which is intended.
    // In a deployed Firebase environment, this might be discovered automatically,
    // but explicitly setting it is more robust.
    projectId: projectId,
  });
}

// Export the initialized services.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
