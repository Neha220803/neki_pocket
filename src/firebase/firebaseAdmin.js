// ============================================
// FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
// ============================================
// This is used in API routes for secure server-side operations

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (only once)
let adminApp;
let adminDb;

if (!getApps().length) {
  try {
    // Option 1: Using service account JSON (recommended for production)
    // Download from Firebase Console -> Project Settings -> Service Accounts
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    }
    // Option 2: Using individual environment variables (easier for development)
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Firebase private keys include escaped newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }
    // Option 3: Default credentials (works in Firebase Cloud Functions)
    else {
      adminApp = initializeApp();
    }

    adminDb = getFirestore(adminApp);
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw error;
  }
} else {
  adminApp = getApps()[0];
  adminDb = getFirestore(adminApp);
}

export { adminApp, adminDb };
