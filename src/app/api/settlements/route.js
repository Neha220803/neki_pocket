// ============================================
// API ROUTE: Settlements - SIMPLIFIED
// GET /api/settlements - Get all settlements
// POST /api/settlements - Create new settlement (with PIN verification)
// ============================================

import { NextResponse } from "next/server";
import { verifyPIN } from "@/lib/validators";
import { serializeDocs, serializeDoc } from "@/lib/firestore-helpers";
import {
  createSettlement,
  getAllSettlements,
  getRecentSettlements,
  getSettlementsByPerson,
  getSettlementStats,
} from "@/services/settlements.service";

/**
 * GET all settlements with optional filters
 * Query params: ?limit=10&person=Kiruthika&stats=true
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
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
        settlements: serializeDocs(settlements.all),
        sent: serializeDocs(settlements.sent),
        received: serializeDocs(settlements.received),
        person,
      });
    }

    // If recent requested
    if (recent === "true") {
      const count = limit ? parseInt(limit) : 5;
      const settlements = await getRecentSettlements(count);
      return NextResponse.json({
        success: true,
        settlements: serializeDocs(settlements),
        count: settlements.length,
      });
    }

    // Default: Get all settlements
    const options = {};
    if (limit) options.limit = parseInt(limit);

    const settlements = await getAllSettlements(options);

    return NextResponse.json({
      success: true,
      settlements: serializeDocs(settlements),
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
 * POST - Create new settlement (with PIN verification)
 * Body: { from, to, amount, paymentMethod, pin }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { from, to, amount, paymentMethod, pin } = body;

    // Validate required fields
    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: from, to, amount" },
        { status: 400 }
      );
    }

    // Validate PIN
    if (!pin) {
      return NextResponse.json(
        { error: "PIN is required to create settlement" },
        { status: 400 }
      );
    }

    const pinVerification = verifyPIN(pin);
    if (!pinVerification.isValid) {
      return NextResponse.json(
        {
          error: "Invalid PIN",
          details: pinVerification.errors[0],
        },
        { status: 401 }
      );
    }

    // Create settlement (immediately confirmed)
    const settlement = await createSettlement({
      from,
      to,
      amount: Number(amount),
      paymentMethod: paymentMethod || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Settlement created and confirmed successfully! 🎉",
        settlement: serializeDoc(settlement),
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
