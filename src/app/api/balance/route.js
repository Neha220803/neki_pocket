// ============================================
// API ROUTE: Balance Calculations
// GET /api/balance
// ============================================

import { NextResponse } from "next/server";
import { getAllExpenses } from "@/services/expenses.service";
import { getConfirmedSettlements } from "@/services/settlements.service";
import {
  calculateBalance,
  getBalanceSummary,
  getIndividualSummary,
  getSettlementRecommendation,
} from "@/services/balance.service";
import { serializeDocs } from "@/lib/firestore-helpers";

/**
 * Get current balance calculation
 */
export async function GET(request) {
  try {
    // Fetch all expenses and confirmed settlements
    const expenses = await getAllExpenses();
    const settlements = await getConfirmedSettlements();

    // Calculate balance
    const balance = calculateBalance(expenses, settlements);

    // Get formatted summaries
    const summary = getBalanceSummary(balance);
    const individual = getIndividualSummary(balance);
    const recommendation = getSettlementRecommendation(balance);

    return NextResponse.json({
      success: true,
      balance,
      summary,
      individual,
      recommendation,
      metadata: {
        expenseCount: expenses.length,
        settlementCount: settlements.length,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Balance calculation error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate balance",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
