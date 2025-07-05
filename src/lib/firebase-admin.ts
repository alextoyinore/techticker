import admin from 'firebase-admin';

// Initialize Firebase Admin SDK.
// It will automatically use the service account credentials provided by the hosting environment.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error: any) {
    // In development with hot-reloading, this can sometimes be called multiple times.
    // We can safely ignore the 'app/duplicate-app' error.
    if (error.code !== 'app/duplicate-app') {
      console.error('Firebase admin initialization error', error.stack);
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

// Use REST transport to avoid potential gRPC issues in some environments.
// We wrap this in a try/catch to handle hot-reloading in development.
try {
  adminDb.settings({ preferRest: true });
} catch (e) {
  // This error is expected in development with hot-reloading.
  // The settings can only be set once, so we can safely ignore the error.
}
