// ============================================
// API ROUTE: Confirm Settlement
// POST /api/settlements/[id]/confirm
// ============================================

import { NextResponse } from "next/server";
import {
  confirmSettlement,
  getSettlementById,
} from "@/services/settlements.service";
import { verifyPIN } from "@/lib/validators";
import { serializeDoc } from "@/lib/firestore-helpers";

/**
 * POST - Confirm settlement by a person
 * Body: { confirmedBy, pin, paymentMethod }
 */
export async function POST(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    const body = await request.json();
    const { confirmedBy, pin, paymentMethod } = body;

    // Validate settlement ID
    if (!id) {
      return NextResponse.json(
        { error: "Settlement ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!confirmedBy) {
      return NextResponse.json(
        { error: "confirmedBy is required (Kiruthika or Neha)" },
        { status: 400 }
      );
    }

    if (!pin) {
      return NextResponse.json(
        { error: "PIN is required to confirm settlement" },
        { status: 400 }
      );
    }

    // Verify PIN
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

    // Check if settlement exists
    const existingSettlement = await getSettlementById(id);
    if (!existingSettlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    // Confirm the settlement
    const updatedSettlement = await confirmSettlement(
      id,
      confirmedBy,
      paymentMethod
    );

    // Check if now fully confirmed
    const isFullyConfirmed = updatedSettlement.status === "confirmed";

    return NextResponse.json({
      success: true,
      message: isFullyConfirmed
        ? "Settlement fully confirmed by both parties! 🎉"
        : `Settlement confirmed by ${confirmedBy}. Waiting for other party.`,
      settlement: serializeDoc(updatedSettlement),
      isFullyConfirmed,
    });
  } catch (error) {
    console.error("Error confirming settlement:", error);

    // Handle specific errors
    if (error.message === "Settlement not found") {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    if (error.message.includes("already confirmed")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      );
    }

    if (
      error.message.includes("Invalid person") ||
      error.message.includes("must be either")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to confirm settlement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
