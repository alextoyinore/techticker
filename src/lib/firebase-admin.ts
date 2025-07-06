import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a robust singleton pattern for Firebase Admin in Next.js.
// It ensures that initialization and configuration happen only once.

// We check if an app is already initialized. If not, we initialize it.
if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('The NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  // Call settings() immediately after initialization and only once.
  // This is crucial for preventing the "already initialized" error.
  admin.firestore().settings({ preferRest: true });
}

// We can now safely export the firestore instance.
// It will be the same instance across all hot reloads.
export const adminDb = admin.firestore();
