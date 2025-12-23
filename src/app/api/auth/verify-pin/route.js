// ============================================
// API ROUTE: Verify PIN
// POST /api/auth/verify-pin
// ============================================

import { NextResponse } from "next/server";
import { verifyPIN } from "@/lib/validators";

/**
 * Verify user PIN
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { pin } = body;

    // Validate PIN format
    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    // Verify PIN
    const verification = verifyPIN(pin);

    if (!verification.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: verification.errors[0] || "Invalid PIN",
        },
        { status: 401 }
      );
    }

    // PIN is correct
    return NextResponse.json({
      success: true,
      message: "PIN verified successfully",
    });
  } catch (error) {
    console.error("PIN verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
