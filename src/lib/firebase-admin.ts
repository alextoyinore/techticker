
import admin from 'firebase-admin';

// This file is executed on the server.

interface FirebaseAdminServices {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  app: admin.app.App;
}

// Use a global variable to cache the initialized services.
// This prevents re-initialization during hot-reloading in development.
let services: FirebaseAdminServices | undefined = undefined;

function getFirebaseAdmin(): FirebaseAdminServices {
  if (services) {
    return services;
  }

  if (admin.apps.length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error('The NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set. Please check your .env file.');
    }
    
    admin.initializeApp({
      projectId: projectId,
    });
  }

  services = {
    db: admin.firestore(),
    auth: admin.auth(),
    app: admin.app(),
  };

  return services;
}

const { db: adminDb, auth: adminAuth } = getFirebaseAdmin();

export { adminDb, adminAuth };
