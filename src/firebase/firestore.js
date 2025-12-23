// ============================================
// FIRESTORE COLLECTIONS & REFERENCES
// ============================================
// Centralized collection references for type safety

import { collection } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { COLLECTIONS } from "@/lib/constants";

// Collection References (Client-side)
export const expensesCollection = collection(db, COLLECTIONS.EXPENSES);
export const settlementsCollection = collection(db, COLLECTIONS.SETTLEMENTS);

// Helper function to get collection reference
export const getCollection = (collectionName) => {
  return collection(db, collectionName);
};

// Firestore Data Models (for reference)

/**
 * Expense Document Structure
 * @typedef {Object} Expense
 * @property {string} id - Auto-generated document ID
 * @property {string} paidBy - "Kiruthika" | "Neha"
 * @property {number} amount - Amount in INR
 * @property {string} reason - Expense description
 * @property {Timestamp} createdAt - Firebase Timestamp
 */

/**
 * Settlement Document Structure
 * @typedef {Object} Settlement
 * @property {string} id - Auto-generated document ID
 * @property {string} from - Person who paid (Kiruthika/Neha)
 * @property {string} to - Person who received (Kiruthika/Neha)
 * @property {number} amount - Settlement amount in INR
 * @property {string} status - "pending" | "confirmed"
 * @property {boolean} confirmedByFrom - Payer confirmation status
 * @property {boolean} confirmedByTo - Receiver confirmation status
 * @property {Timestamp} createdAt - When settlement was created
 * @property {Timestamp|null} confirmedAt - When both confirmed
 * @property {string|null} paymentMethod - "gpay" | "cash" | null
 */

export default db;
