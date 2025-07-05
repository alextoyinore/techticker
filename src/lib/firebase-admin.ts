import admin from 'firebase-admin';

// This is a robust singleton pattern to ensure Firebase Admin is initialized only once,
// which is crucial in a development environment with hot-reloading.

const getFirebaseAdmin = () => {
  // If the app is already initialized, return the existing app.
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  // If not initialized, initialize it and configure its settings.
  const app = admin.initializeApp();
  
  // Use REST transport to avoid potential gRPC issues in some environments.
  // This is set only once during the initial setup.
  admin.firestore(app).settings({ preferRest: true });
  
  return app;
};

// Get the singleton instance of the Firebase Admin app.
const app = getFirebaseAdmin();

// Export the initialized services.
export const adminDb = admin.firestore(app);
export const adminAuth = admin.auth(app);
