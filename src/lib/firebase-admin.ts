
import admin from 'firebase-admin';

// This is a more robust singleton pattern for Next.js hot-reloading environments.
// We cache the initialized services in a global variable.
// This ensures that the Firebase Admin SDK is initialized and configured only once per server instance.

const globalForFirebase = globalThis as unknown as {
  adminDb?: admin.firestore.Firestore;
  adminAuth?: admin.auth.Auth;
};

// If the services are not already cached in the global object, initialize them.
// This block runs only once when the server first starts.
if (!globalForFirebase.adminDb || !globalForFirebase.adminAuth) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('The NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.');
    }
    
    // Initialize the app if it hasn't been initialized yet.
    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId });
    }

    // Get the Firestore instance.
    const db = admin.firestore();
    
    // IMPORTANT: Use `preferRest` to avoid gRPC issues in some local dev and serverless environments.
    // By setting this once and caching the `db` instance, we ensure it persists across hot-reloads.
    db.settings({ preferRest: true });

    // Cache the initialized and configured services in the global object.
    globalForFirebase.adminDb = db;
    globalForFirebase.adminAuth = admin.auth();
}

// Export the cached services. On hot-reloads, the code above will be skipped,
// and these cached instances will be exported directly.
export const adminDb = globalForFirebase.adminDb!;
export const adminAuth = globalForFirebase.adminAuth!;
