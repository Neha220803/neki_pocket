"use client";

// ============================================
// SETTLEMENT CARD COMPONENT - SIMPLIFIED
// Display only (no confirmation needed)
// ============================================

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CheckCheck, ArrowRight } from "lucide-react";

function SettlementCard({ settlement, className }) {
  return (
    <Card
      className={cn("bg-accent/30 border-accent transition-all", className)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-accent text-accent-foreground">
                <CheckCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-accent-foreground">
                Confirmed
              </span>
            </div>

            <span className="text-xs text-muted-foreground">
              {formatDate(settlement.createdAt, "relative")}
            </span>
          </div>

          {/* Payment details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "font-medium text-sm px-2 py-1 rounded-md",
                  settlement.from === "Kiruthika"
                    ? "bg-secondary/20 text-secondary-foreground"
                    : "bg-primary/20 text-primary"
                )}
              >
                {settlement.from}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "font-medium text-sm px-2 py-1 rounded-md",
                  settlement.to === "Kiruthika"
                    ? "bg-secondary/20 text-secondary-foreground"
                    : "bg-primary/20 text-primary"
                )}
              >
                {settlement.to}
              </span>
            </div>

            <MoneyDisplay
              amount={settlement.amount}
              size="lg"
              variant="success"
              className="font-semibold"
            />
          </div>

          {/* Payment method */}
          {settlement.paymentMethod && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              via{" "}
              {settlement.paymentMethod === "gpay"
                ? "Google Pay"
                : settlement.paymentMethod === "cash"
                ? "Cash"
                : settlement.paymentMethod}{" "}
              ✓
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { SettlementCard };
