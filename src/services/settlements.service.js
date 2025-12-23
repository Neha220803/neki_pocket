// ============================================
// SETTLEMENTS SERVICE
// ============================================
// Operations for managing settlements between Kiruthika and Neha

// import { Timestamp } from "firebase/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS, SETTLEMENT_STATUS, PEOPLE } from "@/lib/constants";
import { validateSettlement } from "@/lib/validators";

/**
 * Create a new settlement (pending confirmation)
 * @param {Object} settlementData - { from, to, amount, paymentMethod }
 * @returns {Promise<Object>} Created settlement with ID
 */
export async function createSettlement(settlementData) {
  // Validate settlement data
  const validation = validateSettlement(settlementData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const settlement = {
    from: settlementData.from,
    to: settlementData.to,
    amount: Number(settlementData.amount),
    status: SETTLEMENT_STATUS.PENDING,
    confirmedByFrom: false,
    confirmedByTo: false,
    paymentMethod: settlementData.paymentMethod || null,
    createdAt: Timestamp.now(),
    confirmedAt: null,
  };

  try {
    const docRef = await adminDb
      .collection(COLLECTIONS.SETTLEMENTS)
      .add(settlement);
    return {
      id: docRef.id,
      ...settlement,
    };
  } catch (error) {
    console.error("Error creating settlement:", error);
    throw new Error("Failed to create settlement");
  }
}

/**
 * Get all settlements
 * @param {Object} options - { status, orderBy, limit }
 * @returns {Promise<Array>} List of settlements
 */
export async function getAllSettlements(options = {}) {
  try {
    let q = adminDb.collection(COLLECTIONS.SETTLEMENTS);

    // Filter by status if specified
    if (options.status) {
      q = q.where("status", "==", options.status);
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
    console.error("Error fetching settlements:", error);
    throw new Error("Failed to fetch settlements");
  }
}

/**
 * Get pending settlements
 * @returns {Promise<Array>} Pending settlements
 */
export async function getPendingSettlements() {
  return getAllSettlements({ status: SETTLEMENT_STATUS.PENDING });
}

/**
 * Get confirmed settlements
 * @returns {Promise<Array>} Confirmed settlements
 */
export async function getConfirmedSettlements() {
  return getAllSettlements({ status: SETTLEMENT_STATUS.CONFIRMED });
}

/**
 * Get single settlement by ID
 * @param {string} settlementId - Settlement document ID
 * @returns {Promise<Object>} Settlement data
 */
export async function getSettlementById(settlementId) {
  try {
    const docRef = adminDb
      .collection(COLLECTIONS.SETTLEMENTS)
      .doc(settlementId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error("Settlement not found");
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching settlement:", error);
    throw new Error("Failed to fetch settlement");
  }
}

/**
 * Confirm settlement by a person
 * @param {string} settlementId - Settlement document ID
 * @param {string} confirmedBy - "Kiruthika" | "Neha"
 * @param {string} paymentMethod - "gpay" | "cash" (optional)
 * @returns {Promise<Object>} Updated settlement
 */
export async function confirmSettlement(
  settlementId,
  confirmedBy,
  paymentMethod = null
) {
  try {
    // Get the settlement
    const settlement = await getSettlementById(settlementId);

    // Check if already confirmed
    if (settlement.status === SETTLEMENT_STATUS.CONFIRMED) {
      throw new Error("Settlement is already confirmed by both parties");
    }

    // Validate confirmedBy
    if (confirmedBy !== PEOPLE.KIRUTHIKA && confirmedBy !== PEOPLE.NEHA) {
      throw new Error("Invalid person confirming settlement");
    }

    // Update confirmation status
    const updates = {};

    if (confirmedBy === settlement.from) {
      if (settlement.confirmedByFrom) {
        throw new Error(`${confirmedBy} has already confirmed this settlement`);
      }
      updates.confirmedByFrom = true;
    } else if (confirmedBy === settlement.to) {
      if (settlement.confirmedByTo) {
        throw new Error(`${confirmedBy} has already confirmed this settlement`);
      }
      updates.confirmedByTo = true;
    } else {
      throw new Error("Confirmer must be either sender or receiver");
    }

    // If payment method is provided, update it
    if (paymentMethod) {
      updates.paymentMethod = paymentMethod;
    }

    // Check if both have confirmed now
    const bothConfirmed =
      (updates.confirmedByFrom || settlement.confirmedByFrom) &&
      (updates.confirmedByTo || settlement.confirmedByTo);

    if (bothConfirmed) {
      updates.status = SETTLEMENT_STATUS.CONFIRMED;
      updates.confirmedAt = Timestamp.now();
    }

    // Update the settlement
    const docRef = adminDb
      .collection(COLLECTIONS.SETTLEMENTS)
      .doc(settlementId);
    await docRef.update(updates);

    // Return updated settlement
    return await getSettlementById(settlementId);
  } catch (error) {
    console.error("Error confirming settlement:", error);
    throw error;
  }
}

/**
 * Delete a settlement (only if not confirmed)
 * @param {string} settlementId - Settlement document ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteSettlement(settlementId) {
  try {
    // Get the settlement
    const settlement = await getSettlementById(settlementId);

    // Don't allow deleting confirmed settlements
    if (settlement.status === SETTLEMENT_STATUS.CONFIRMED) {
      throw new Error("Cannot delete confirmed settlements");
    }

    // Delete the settlement
    await adminDb
      .collection(COLLECTIONS.SETTLEMENTS)
      .doc(settlementId)
      .delete();

    return {
      success: true,
      message: "Settlement deleted successfully",
      deletedSettlement: settlement,
    };
  } catch (error) {
    console.error("Error deleting settlement:", error);
    throw error;
  }
}

/**
 * Get settlement statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getSettlementStats() {
  try {
    const allSettlements = await getAllSettlements();
    const confirmed = allSettlements.filter(
      (s) => s.status === SETTLEMENT_STATUS.CONFIRMED
    );
    const pending = allSettlements.filter(
      (s) => s.status === SETTLEMENT_STATUS.PENDING
    );

    let totalSettled = 0;
    let kiruthikaPaidNeha = 0;
    let nehaPaidKiruthika = 0;

    confirmed.forEach((settlement) => {
      const amount = Number(settlement.amount);
      totalSettled += amount;

      if (settlement.from === PEOPLE.KIRUTHIKA) {
        kiruthikaPaidNeha += amount;
      } else if (settlement.from === PEOPLE.NEHA) {
        nehaPaidKiruthika += amount;
      }
    });

    return {
      totalSettled: Math.round(totalSettled * 100) / 100,
      kiruthikaPaidNeha: Math.round(kiruthikaPaidNeha * 100) / 100,
      nehaPaidKiruthika: Math.round(nehaPaidKiruthika * 100) / 100,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      totalCount: allSettlements.length,
    };
  } catch (error) {
    console.error("Error calculating settlement stats:", error);
    throw new Error("Failed to calculate settlement statistics");
  }
}

/**
 * Get recent settlements (last N settlements)
 * @param {number} count - Number of settlements to fetch
 * @returns {Promise<Array>} Recent settlements
 */
export async function getRecentSettlements(count = 5) {
  return getAllSettlements({ limit: count, orderBy: "desc" });
}

/**
 * Get settlements by person (either as sender or receiver)
 * @param {string} person - "Kiruthika" | "Neha"
 * @returns {Promise<Object>} Settlements sent and received
 */
export async function getSettlementsByPerson(person) {
  try {
    const allSettlements = await getAllSettlements();

    const sent = allSettlements.filter((s) => s.from === person);
    const received = allSettlements.filter((s) => s.to === person);

    return {
      sent,
      received,
      all: [...sent, ...received].sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      ),
    };
  } catch (error) {
    console.error("Error fetching settlements by person:", error);
    throw new Error("Failed to fetch settlements by person");
  }
}

/**
 * Check if settlement needs confirmation from a person
 * @param {Object} settlement - Settlement object
 * @param {string} person - "Kiruthika" | "Neha"
 * @returns {boolean} True if person needs to confirm
 */
export function needsConfirmation(settlement, person) {
  if (settlement.status === SETTLEMENT_STATUS.CONFIRMED) {
    return false;
  }

  if (person === settlement.from) {
    return !settlement.confirmedByFrom;
  }

  if (person === settlement.to) {
    return !settlement.confirmedByTo;
  }

  return false;
}

/**
 * Get confirmation status for a settlement
 * @param {Object} settlement - Settlement object
 * @returns {Object} Confirmation status details
 */
export function getConfirmationStatus(settlement) {
  return {
    isFullyConfirmed: settlement.status === SETTLEMENT_STATUS.CONFIRMED,
    fromConfirmed: settlement.confirmedByFrom,
    toConfirmed: settlement.confirmedByTo,
    needsConfirmationFrom: !settlement.confirmedByFrom ? settlement.from : null,
    needsConfirmationTo: !settlement.confirmedByTo ? settlement.to : null,
  };
}
