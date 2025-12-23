import { NextResponse } from "next/server";
import { getExpenseById, deleteExpense } from "@/services/expenses.service";
import { serializeDoc } from "@/lib/firestore-helpers"; // ← Add this

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    const expense = await getExpenseById(id);

    return NextResponse.json({
      success: true,
      expense: serializeDoc(expense), // ← Serialize here
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

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

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
      deletedExpense: serializeDoc(result.deletedExpense), // ← Serialize here
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
