// ============================================
// API ROUTE: Expenses
// GET /api/expenses - Get all expenses
// POST /api/expenses - Create new expense
// ============================================

import { NextResponse } from "next/server";
import {
  getAllExpenses,
  createExpense,
  getExpenseStats,
  getRecentExpenses,
  getExpensesByPerson,
} from "@/services/expenses.service";

/**
 * GET all expenses with optional filters
 * Query params: ?limit=10&paidBy=Kiruthika&recent=true
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = searchParams.get("limit");
    const paidBy = searchParams.get("paidBy");
    const recent = searchParams.get("recent");
    const stats = searchParams.get("stats");

    // If stats requested
    if (stats === "true") {
      const statistics = await getExpenseStats();
      return NextResponse.json({
        success: true,
        stats: statistics,
      });
    }

    // If recent requested
    if (recent === "true") {
      const count = limit ? parseInt(limit) : 5;
      const expenses = await getRecentExpenses(count);
      return NextResponse.json({
        success: true,
        expenses,
        count: expenses.length,
      });
    }

    // If filtered by person
    if (paidBy) {
      const expenses = await getExpensesByPerson(paidBy);
      return NextResponse.json({
        success: true,
        expenses,
        count: expenses.length,
        paidBy,
      });
    }

    // Default: Get all expenses
    const options = {};
    if (limit) options.limit = parseInt(limit);

    const expenses = await getAllExpenses(options);

    return NextResponse.json({
      success: true,
      expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch expenses",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new expense
 * Body: { paidBy, amount, reason }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { paidBy, amount, reason } = body;

    // Validate required fields
    if (!paidBy || !amount || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: paidBy, amount, reason" },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await createExpense({
      paidBy,
      amount: Number(amount),
      reason: reason.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);

    // Handle validation errors
    if (
      error.message.includes("required") ||
      error.message.includes("must be") ||
      error.message.includes("Invalid")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to create expense",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
