// ============================================
// BALANCE CALCULATION SERVICE
// ============================================
// Core logic for calculating who owes whom

import { PEOPLE, BALANCE_THRESHOLD } from "@/lib/constants";

/**
 * Calculate net balance from expenses and settlements
 * @param {Array} expenses - All expenses
 * @param {Array} settlements - All confirmed settlements
 * @returns {Object} Balance information
 */
export function calculateBalance(expenses = [], settlements = []) {
  // Initialize totals
  let kiruthikaPaid = 0;
  let nehaPaid = 0;
  let kiruthikaOwesNeha = 0;
  let nehaOwesKiruthika = 0;

  // Process each expense based on paidBy and paidFor
  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    const paidBy = expense.paidBy;
    const paidFor = expense.paidFor || "Both"; // Default to "Both" for old expenses

    // Track who paid
    if (paidBy === PEOPLE.KIRUTHIKA) {
      kiruthikaPaid += amount;
    } else if (paidBy === PEOPLE.NEHA) {
      nehaPaid += amount;
    }

    // Calculate debt based on paidFor
    if (paidFor === "Both") {
      // Split 50-50 (existing behavior)
      const halfAmount = amount / 2;

      if (paidBy === PEOPLE.KIRUTHIKA) {
        // Kiruthika paid, Neha owes half
        nehaOwesKiruthika += halfAmount;
      } else if (paidBy === PEOPLE.NEHA) {
        // Neha paid, Kiruthika owes half
        kiruthikaOwesNeha += halfAmount;
      }
    } else if (paidFor === PEOPLE.NEHA) {
      // Paid for Neha only
      if (paidBy === PEOPLE.KIRUTHIKA) {
        // Kiruthika paid for Neha, Neha owes full amount
        nehaOwesKiruthika += amount;
      }
      // If Neha paid for herself, no debt created
    } else if (paidFor === PEOPLE.KIRUTHIKA) {
      // Paid for Kiruthika only
      if (paidBy === PEOPLE.NEHA) {
        // Neha paid for Kiruthika, Kiruthika owes full amount
        kiruthikaOwesNeha += amount;
      }
      // If Kiruthika paid for herself, no debt created
    }
  });
  const totalExpenses = kiruthikaPaid + nehaPaid;

  // Apply confirmed settlements to reduce the balance
  let totalSettled = 0;
  settlements
    .filter((s) => s.status === "confirmed")
    .forEach((settlement) => {
      const amount = Number(settlement.amount);
      totalSettled += amount;

      // Reduce the debt based on who paid whom
      if (
        settlement.from === PEOPLE.KIRUTHIKA &&
        settlement.to === PEOPLE.NEHA
      ) {
        // Kiruthika paid Neha, reduce Kiruthika's debt
        kiruthikaOwesNeha = Math.max(0, kiruthikaOwesNeha - amount);
      } else if (
        settlement.from === PEOPLE.NEHA &&
        settlement.to === PEOPLE.KIRUTHIKA
      ) {
        // Neha paid Kiruthika, reduce Neha's debt
        nehaOwesKiruthika = Math.max(0, nehaOwesKiruthika - amount);
      }
    });

  // Net balance (positive = Kiruthika owes Neha, negative = Neha owes Kiruthika)
  const netBalance = kiruthikaOwesNeha - nehaOwesKiruthika;

  // Who owes whom (final result)
  let whoOwesWhom = null;
  let owedAmount = 0;

  if (netBalance > 0) {
    whoOwesWhom = `${PEOPLE.KIRUTHIKA} owes ${PEOPLE.NEHA}`;
    owedAmount = netBalance;
  } else if (netBalance < 0) {
    whoOwesWhom = `${PEOPLE.NEHA} owes ${PEOPLE.KIRUTHIKA}`;
    owedAmount = Math.abs(netBalance);
  } else {
    whoOwesWhom = "All settled up! 🎉";
    owedAmount = 0;
  }

  // Check if balance exceeds threshold
  const exceedsThreshold = owedAmount >= BALANCE_THRESHOLD;

  // Calculate fair share for display purposes (not used in debt calculation)
  const fairShare = totalExpenses / 2;

  return {
    // Individual totals
    kiruthikaPaid: Math.round(kiruthikaPaid * 100) / 100,
    nehaPaid: Math.round(nehaPaid * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    fairShare: Math.round(fairShare * 100) / 100,

    // Current debts
    kiruthikaOwesNeha: Math.round(kiruthikaOwesNeha * 100) / 100,
    nehaOwesKiruthika: Math.round(nehaOwesKiruthika * 100) / 100,

    // Net balance
    netBalance: Math.round(netBalance * 100) / 100,
    owedAmount: Math.round(owedAmount * 100) / 100,
    whoOwesWhom,

    // Threshold alert
    exceedsThreshold,
    thresholdAmount: BALANCE_THRESHOLD,

    // Settlement info
    totalSettled: Math.round(totalSettled * 100) / 100,
  };
}

/**
 * Get balance summary for display
 * @param {Object} balance - Balance object from calculateBalance
 * @returns {Object} Formatted balance summary
 */
export function getBalanceSummary(balance) {
  return {
    mainMessage: balance.whoOwesWhom,
    amount: balance.owedAmount,
    showAlert: balance.exceedsThreshold,
    alertMessage: `Reminder: Balance exceeds ₹${balance.thresholdAmount}!`,
  };
}

/**
 * Get individual payment summary
 * @param {Object} balance - Balance object from calculateBalance
 * @returns {Object} Individual payment details
 */
export function getIndividualSummary(balance) {
  return {
    kiruthika: {
      paid: balance.kiruthikaPaid,
      owes: balance.kiruthikaOwesNeha,
      isOwed: balance.nehaOwesKiruthika,
    },
    neha: {
      paid: balance.nehaPaid,
      owes: balance.nehaOwesKiruthika,
      isOwed: balance.kiruthikaOwesNeha,
    },
  };
}

/**
 * Calculate recommended settlement amount
 * This suggests the optimal amount to settle to clear or reduce debt
 * @param {Object} balance - Balance object from calculateBalance
 * @returns {Object} Settlement recommendation
 */
export function getSettlementRecommendation(balance) {
  const { netBalance, owedAmount } = balance;

  if (owedAmount === 0) {
    return {
      shouldSettle: false,
      message: "All settled up! No payment needed.",
      amount: 0,
      from: null,
      to: null,
    };
  }

  const from = netBalance > 0 ? PEOPLE.KIRUTHIKA : PEOPLE.NEHA;
  const to = netBalance > 0 ? PEOPLE.NEHA : PEOPLE.KIRUTHIKA;

  // Suggest partial settlement if amount is very high
  const suggestedAmount =
    owedAmount > 2000 ? Math.ceil(owedAmount / 2) : owedAmount;

  return {
    shouldSettle: true,
    message: `${from} should pay ${to}`,
    amount: Math.round(suggestedAmount * 100) / 100,
    fullAmount: Math.round(owedAmount * 100) / 100,
    from,
    to,
    isPartial: suggestedAmount < owedAmount,
  };
}

/**
 * Validate if a settlement makes sense given current balance
 * @param {Object} settlement - Settlement to validate
 * @param {Object} balance - Current balance
 * @returns {Object} Validation result
 */
export function validateSettlementLogic(settlement, balance) {
  const { from, to, amount } = settlement;
  const { netBalance } = balance;

  const errors = [];

  // Check if settlement direction matches debt direction
  if (netBalance > 0) {
    // Kiruthika owes Neha
    if (from !== PEOPLE.KIRUTHIKA || to !== PEOPLE.NEHA) {
      errors.push(
        `${PEOPLE.KIRUTHIKA} owes ${PEOPLE.NEHA}, not the other way around`
      );
    }
  } else if (netBalance < 0) {
    // Neha owes Kiruthika
    if (from !== PEOPLE.NEHA || to !== PEOPLE.KIRUTHIKA) {
      errors.push(
        `${PEOPLE.NEHA} owes ${PEOPLE.KIRUTHIKA}, not the other way around`
      );
    }
  } else {
    // Already settled
    errors.push("Already settled up! No debt exists.");
  }

  // Warn if settlement exceeds debt (but don't block it)
  const currentDebt = Math.abs(netBalance);
  if (amount > currentDebt) {
    errors.push(
      `Settlement amount (₹${amount}) exceeds current debt (₹${currentDebt})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: amount > currentDebt ? ["Amount exceeds debt"] : [],
  };
}
