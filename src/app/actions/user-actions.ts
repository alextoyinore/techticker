'use server';

import { revalidatePath } from 'next/cache';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { serverTimestamp } from 'firebase/firestore';

interface CreateUserPayload {
    email: string;
    password?: string;
    displayName: string;
    role: string;
    authToken: string;
}

export async function createUser(payload: CreateUserPayload) {
    try {
        const { email, password, displayName, role, authToken } = payload;
        
        // 1. Verify the token of the user making the request
        const decodedToken = await adminAuth.verifyIdToken(authToken);
        const callerUid = decodedToken.uid;
        
        // 2. Check if the calling user is a superadmin
        const callerDoc = await adminDb.collection('users').doc(callerUid).get();
        if (!callerDoc.exists || callerDoc.data()?.role !== 'superadmin') {
            return { error: 'Unauthorized: Only superadmins can create users.' };
        }

        if (!password) {
            return { error: 'Password is required.' };
        }

        // 3. Create the new user in Firebase Authentication
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
        });

        // 4. Create the corresponding user document in Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            displayName,
            role,
            createdAt: new Date().toISOString(), // Use ISO string for consistency
        });
        
        // 5. Revalidate the path to refresh the user list on the client
        revalidatePath('/users');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        console.error('Error creating user:', error);
        
        let errorMessage = 'An unexpected error occurred while creating the user.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'The email address is already in use by another account.';
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = 'The password must be a string with at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'The email address is not valid.';
        }

        return { error: errorMessage };
    }
}
