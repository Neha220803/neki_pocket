// ============================================
// API ROUTE: Single Settlement Operations
// GET /api/settlements/[id] - Get settlement by ID
// DELETE /api/settlements/[id] - Delete settlement
// ============================================

import { NextResponse } from "next/server";
import {
  getSettlementById,
  deleteSettlement,
  getConfirmationStatus,
} from "@/services/settlements.service";

/**
 * GET single settlement by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Settlement ID is required" },
        { status: 400 }
      );
    }

    const settlement = await getSettlementById(id);
    const confirmationStatus = getConfirmationStatus(settlement);

    return NextResponse.json({
      success: true,
      settlement,
      confirmationStatus,
    });
  } catch (error) {
    console.error("Error fetching settlement:", error);

    if (error.message === "Settlement not found") {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch settlement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE settlement by ID (only if not confirmed)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Settlement ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteSettlement(id);

    return NextResponse.json({
      success: true,
      message: result.message,
      deletedSettlement: result.deletedSettlement,
    });
  } catch (error) {
    console.error("Error deleting settlement:", error);

    if (error.message === "Settlement not found") {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    if (error.message === "Cannot delete confirmed settlements") {
      return NextResponse.json(
        { error: "Cannot delete confirmed settlements" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete settlement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
