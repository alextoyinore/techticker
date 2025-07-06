import admin from 'firebase-admin';

// This is a global cache for the initialized services
interface FirebaseAdminCache {
  db: admin.firestore.Firestore;
}
declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdminCache: FirebaseAdminCache | undefined;
}

/**
 * Returns an initialized Firestore instance for server-side operations.
 * It uses a global cache to avoid re-initializing the SDK in development
 * due to Next.js hot-reloading.
 */
function getAdminServices() {
  if (global.__firebaseAdminCache) {
    return global.__firebaseAdminCache;
  }
  
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The application cannot connect to Firebase services on the server.');
  }

  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  const db = admin.firestore();
  
  // This setting is crucial for the SDK to work correctly in many serverless environments.
  try {
    db.settings({ preferRest: true });
  } catch (e) {
    // This can throw an error if settings are applied multiple times,
    // which can happen with hot-reloading in dev. We can safely ignore it.
    if ((e as any).code !== 'failed-precondition') {
      console.error('Firestore settings error:', e);
    }
  }


  global.__firebaseAdminCache = { db };

  return global.__firebaseAdminCache;
}

export const { db: adminDb } = getAdminServices();
