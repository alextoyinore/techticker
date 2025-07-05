import admin from 'firebase-admin';

// This is the recommended way to initialize the Admin SDK in a server environment like Firebase App Hosting.
// It will automatically use the service account credentials provided by the hosting environment.
if (!admin.apps.length) {
    try {
        admin.initializeApp();
    } catch (error: any) {
        // In development with hot-reloading, this can sometimes be called multiple times.
        if (error.code !== 'app/duplicate-app') {
            console.error('Firebase admin initialization error', error.stack);
        }
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
