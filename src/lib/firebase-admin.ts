import admin from 'firebase-admin';

interface FirebaseAdminServices {
  db: admin.firestore.Firestore;
}

declare global {
  var firebaseAdminServices: FirebaseAdminServices | undefined;
}

function initializeAdmin(): FirebaseAdminServices {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length === 0) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
  }

  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  const db = admin.firestore();
  db.settings({ preferRest: true });

  return { db };
}

function getAdminServices(): FirebaseAdminServices {
  if (process.env.NODE_ENV === 'development') {
    if (!global.firebaseAdminServices) {
      global.firebaseAdminServices = initializeAdmin();
    }
    return global.firebaseAdminServices;
  }
  return initializeAdmin();
}

const { db: adminDb } = getAdminServices();

export { adminDb };
