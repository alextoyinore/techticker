import admin from 'firebase-admin';
import type {Auth} from 'firebase-admin/auth';
import type {Firestore} from 'firebase-admin/firestore';

// This file uses a robust singleton pattern to ensure that the Firebase Admin SDK
// is initialized only once, preventing errors during hot-reloading in a
// development environment.

// Define a unique symbol to store our cached Firebase Admin services instance.
const FBA_INSTANCE_KEY = Symbol.for('firebase.admin.instance');

// Define the structure of our cached services.
interface FirebaseAdminServices {
  auth: Auth;
  db: Firestore;
  app: admin.app.App;
}

// Extend the NodeJS.Global type to make TypeScript aware of our new global cache key.
declare global {
  var [FBA_INSTANCE_KEY]: FirebaseAdminServices | undefined;
}

/**
 * Initializes and/or retrieves the Firebase Admin services.
 * It uses a global cache to ensure that services are created only once.
 * @returns {FirebaseAdminServices} The initialized Firebase Admin services.
 */
function getFirebaseAdmin(): FirebaseAdminServices {
  // If the services are already in our global cache, return them immediately.
  if (global[FBA_INSTANCE_KEY]) {
    return global[FBA_INSTANCE_KEY];
  }

  // If not cached, proceed with initialization.
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('The NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.');
  }

  // Initialize the Firebase app if it hasn't been already.
  const app = admin.apps.length
    ? admin.apps[0]!
    : admin.initializeApp({ projectId });

  // Get the Firestore service.
  const db = admin.firestore(app);
  
  // CRITICAL: Apply settings right after getting the service instance.
  // This is a common fix for authentication issues in serverless/dev environments.
  db.settings({ preferRest: true });

  // Get the Auth service.
  const auth = admin.auth(app);

  // Cache the initialized services in our global variable for future use.
  global[FBA_INSTANCE_KEY] = { auth, db, app };

  return { auth, db, app };
}

// Retrieve the services using our function.
const {auth: adminAuth, db: adminDb} = getFirebaseAdmin();

// Export the initialized and cached services for use throughout the application.
export {adminAuth, adminDb};
