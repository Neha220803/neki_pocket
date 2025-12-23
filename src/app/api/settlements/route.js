// ============================================
// API ROUTE: Settlements
// GET /api/settlements - Get all settlements
// POST /api/settlements - Create new settlement
// ============================================

import { NextResponse } from "next/server";
import {
  getAllSettlements,
  createSettlement,
  getPendingSettlements,
  getConfirmedSettlements,
  getSettlementStats,
  getRecentSettlements,
  getSettlementsByPerson,
} from "@/services/settlements.service";

/**
 * GET all settlements with optional filters
 * Query params: ?status=pending&limit=10&person=Kiruthika&stats=true
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const person = searchParams.get("person");
    const recent = searchParams.get("recent");
    const stats = searchParams.get("stats");

    // If stats requested
    if (stats === "true") {
      const statistics = await getSettlementStats();
      return NextResponse.json({
        success: true,
        stats: statistics,
      });
    }

    // If filtered by person
    if (person) {
      const settlements = await getSettlementsByPerson(person);
      return NextResponse.json({
        success: true,
        settlements: settlements.all,
        sent: settlements.sent,
        received: settlements.received,
        person,
      });
    }

    // If recent requested
    if (recent === "true") {
      const count = limit ? parseInt(limit) : 5;
      const settlements = await getRecentSettlements(count);
      return NextResponse.json({
        success: true,
        settlements,
        count: settlements.length,
      });
    }

    // If filtered by status
    if (status === "pending") {
      const settlements = await getPendingSettlements();
      return NextResponse.json({
        success: true,
        settlements,
        count: settlements.length,
        status: "pending",
      });
    }

    if (status === "confirmed") {
      const settlements = await getConfirmedSettlements();
      return NextResponse.json({
        success: true,
        settlements,
        count: settlements.length,
        status: "confirmed",
      });
    }

    // Default: Get all settlements
    const options = {};
    if (limit) options.limit = parseInt(limit);
    if (status) options.status = status;

    const settlements = await getAllSettlements(options);

    // Separate into pending and confirmed
    const pending = settlements.filter((s) => s.status === "pending");
    const confirmed = settlements.filter((s) => s.status === "confirmed");

    return NextResponse.json({
      success: true,
      settlements,
      pending,
      confirmed,
      count: settlements.length,
    });
  } catch (error) {
    console.error("Error fetching settlements:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch settlements",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new settlement
 * Body: { from, to, amount, paymentMethod }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { from, to, amount, paymentMethod } = body;

    // Validate required fields
    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: from, to, amount" },
        { status: 400 }
      );
    }

    // Create settlement
    const settlement = await createSettlement({
      from,
      to,
      amount: Number(amount),
      paymentMethod: paymentMethod || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Settlement created successfully",
        settlement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating settlement:", error);

    // Handle validation errors
    if (
      error.message.includes("required") ||
      error.message.includes("must be") ||
      error.message.includes("Invalid") ||
      error.message.includes("Cannot settle with yourself")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to create settlement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
