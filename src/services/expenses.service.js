// ============================================
// EXPENSES SERVICE
// ============================================
// CRUD operations for expenses in Firestore

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  // Timestamp,
} from "firebase/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/lib/constants";
import { validateExpense } from "@/lib/validators";

/**
 * Create a new expense
 * @param {Object} expenseData - { paidBy, amount, reason }
 * @returns {Promise<Object>} Created expense with ID
 */
export async function createExpense(expenseData) {
  // Validate expense data
  const validation = validateExpense(expenseData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const expense = {
    paidBy: expenseData.paidBy,
    paidFor: expenseData.paidFor || "Both",
    amount: Number(expenseData.amount),
    reason: expenseData.reason.trim(),
    createdAt: Timestamp.now(),
  };

  try {
    const docRef = await adminDb.collection(COLLECTIONS.EXPENSES).add(expense);
    return {
      id: docRef.id,
      ...expense,
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    throw new Error("Failed to create expense");
  }
}

/**
 * Get all expenses
 * @param {Object} options - { orderBy, limit, paidBy }
 * @returns {Promise<Array>} List of expenses
 */
export async function getAllExpenses(options = {}) {
  try {
    let q = adminDb.collection(COLLECTIONS.EXPENSES);

    // Filter by paidBy if specified
    if (options.paidBy) {
      q = q.where("paidBy", "==", options.paidBy);
    }

    // Order by creation date (newest first by default)
    const sortOrder = options.orderBy || "desc";
    q = q.orderBy("createdAt", sortOrder);

    // Apply limit if specified
    if (options.limit) {
      q = q.limit(options.limit);
    }

    const snapshot = await q.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw new Error("Failed to fetch expenses");
  }
}

/**
 * Get recent expenses (last N expenses)
 * @param {number} count - Number of recent expenses to fetch
 * @returns {Promise<Array>} Recent expenses
 */
export async function getRecentExpenses(count = 5) {
  return getAllExpenses({ limit: count, orderBy: "desc" });
}

/**
 * Get expenses by person
 * @param {string} person - "Kiruthika" | "Neha"
 * @returns {Promise<Array>} Expenses paid by person
 */
export async function getExpensesByPerson(person) {
  return getAllExpenses({ paidBy: person });
}

/**
 * Get single expense by ID
 * @param {string} expenseId - Expense document ID
 * @returns {Promise<Object>} Expense data
 */
export async function getExpenseById(expenseId) {
  try {
    const docRef = adminDb.collection(COLLECTIONS.EXPENSES).doc(expenseId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error("Expense not found");
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw new Error("Failed to fetch expense");
  }
}

/**
 * Delete an expense
 * @param {string} expenseId - Expense document ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteExpense(expenseId) {
  try {
    // Check if expense exists
    const expense = await getExpenseById(expenseId);

    // Delete the expense
    await adminDb.collection(COLLECTIONS.EXPENSES).doc(expenseId).delete();

    return {
      success: true,
      message: "Expense deleted successfully",
      deletedExpense: expense,
    };
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw new Error("Failed to delete expense");
  }
}

/**
 * Get expense statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getExpenseStats() {
  try {
    const expenses = await getAllExpenses();

    let kiruthikaTotal = 0;
    let nehaTotal = 0;
    let totalExpenses = 0;

    expenses.forEach((expense) => {
      const amount = Number(expense.amount);
      totalExpenses += amount;

      if (expense.paidBy === "Kiruthika") {
        kiruthikaTotal += amount;
      } else if (expense.paidBy === "Neha") {
        nehaTotal += amount;
      }
    });

    return {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      kiruthikaTotal: Math.round(kiruthikaTotal * 100) / 100,
      nehaTotal: Math.round(nehaTotal * 100) / 100,
      expenseCount: expenses.length,
      averageExpense:
        expenses.length > 0
          ? Math.round((totalExpenses / expenses.length) * 100) / 100
          : 0,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    throw new Error("Failed to calculate expense statistics");
  }
}

/**
 * Get expenses within date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Expenses in range
 */
export async function getExpensesByDateRange(startDate, endDate) {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = adminDb
      .collection(COLLECTIONS.EXPENSES)
      .where("createdAt", ">=", startTimestamp)
      .where("createdAt", "<=", endTimestamp)
      .orderBy("createdAt", "desc");

    const snapshot = await q.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching expenses by date range:", error);
    throw new Error("Failed to fetch expenses by date range");
  }
}

/**
 * Search expenses by reason (keyword search)
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} Matching expenses
 */
export async function searchExpenses(keyword) {
  try {
    // Note: Firestore doesn't support full-text search
    // This is a client-side filter after fetching all expenses
    const allExpenses = await getAllExpenses();

    const searchTerm = keyword.toLowerCase();
    return allExpenses.filter((expense) =>
      expense.reason.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error("Error searching expenses:", error);
    throw new Error("Failed to search expenses");
  }
}

/**
 * Get total amount for a specific reason/category
 * @param {string} reason - Reason to sum up
 * @returns {Promise<number>} Total amount
 */
export async function getTotalByReason(reason) {
  try {
    const expenses = await searchExpenses(reason);
    const total = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );
    return Math.round(total * 100) / 100;
  } catch (error) {
    console.error("Error calculating total by reason:", error);
    throw new Error("Failed to calculate total by reason");
  }
}
