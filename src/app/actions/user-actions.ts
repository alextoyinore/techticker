'use server';

// This file is no longer used.
// The firebase-admin SDK, which is required for server-side user creation,
// was removed due to persistent errors in the development environment.
// The "Add User" feature has been disabled in the UI.

export async function createUser(payload: any) {
    return { error: 'This feature is disabled.' };
}
