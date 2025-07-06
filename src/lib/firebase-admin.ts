import admin from 'firebase-admin';

// Check for environment variables.
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length === 0) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
}
  
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the app and set Firestore settings ONLY if it hasn't been done before.
// This is the correct way to handle initialization in a hot-reloading environment like Next.js dev server.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
  
  // This is critical: settings must be called only once, right after initialization.
  admin.firestore().settings({ preferRest: true });
}

// adminDb is now guaranteed to be the correctly initialized and configured instance.
const adminDb = admin.firestore();

export { adminDb };
