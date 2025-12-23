// ============================================
// API ROUTE: Single Expense Operations
// GET /api/expenses/[id] - Get expense by ID
// DELETE /api/expenses/[id] - Delete expense
// ============================================

import { NextResponse } from "next/server";
import { getExpenseById, deleteExpense } from "@/services/expenses.service";
import { serializeDoc } from "@/lib/firestore-helpers";

/**
 * GET single expense by ID
 */
export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    const expense = await getExpenseById(id);

    return NextResponse.json({
      success: true,
      expense: serializeDoc(expense),
    });
  } catch (error) {
    console.error("Error fetching expense:", error);

    if (error.message === "Expense not found") {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch expense",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE expense by ID
 */
export async function DELETE(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteExpense(id);

    return NextResponse.json({
      success: true,
      message: result.message,
      deletedExpense: serializeDoc(result.deletedExpense),
    });
  } catch (error) {
    console.error("Error deleting expense:", error);

    if (error.message === "Expense not found") {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete expense",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
