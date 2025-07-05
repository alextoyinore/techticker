
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

// This file is executed on the server.

interface FirebaseAdminServices {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  app: App;
}

// We augment the NodeJS global type to contain our cached services.
// This allows us to persist the connection across hot reloads in development.
declare global {
  var __firebaseAdminServices: FirebaseAdminServices | undefined;
}

function getFirebaseAdmin(): FirebaseAdminServices {
  // If we've already initialized the services, use the cached version.
  if (global.__firebaseAdminServices) {
    return global.__firebaseAdminServices;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('The NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set. Please check your .env file.');
  }

  // Initialize the app if it hasn't been initialized yet.
  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: projectId,
    });
  }

  const db = admin.firestore();
  
  // This is the crucial part: settings can only be called once.
  // By placing it inside this initialization block, we ensure it runs exactly once.
  db.settings({ preferRest: true });

  const services: FirebaseAdminServices = {
    db,
    auth: admin.auth(),
    app: admin.app(),
  };

  // Cache the initialized services in the global scope.
  global.__firebaseAdminServices = services;

  return services;
}

const { db: adminDb, auth: adminAuth } = getFirebaseAdmin();

export { adminDb, adminAuth };
