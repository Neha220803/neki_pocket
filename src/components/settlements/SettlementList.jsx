"use client";

// ============================================
// SETTLEMENT LIST COMPONENT - SIMPLIFIED
// Display only settlements (no confirmation buttons)
// ============================================

import * as React from "react";
import { SettlementCard } from "./SettlementCard";
import { cn } from "@/lib/utils";
import { Loader2, Coins } from "lucide-react";

function SettlementList({
  settlements = [],
  loading = false,
  emptyMessage = "No settlements yet",
  className,
}) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Coins className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {settlements.map((settlement) => (
        <SettlementCard key={settlement.id} settlement={settlement} />
      ))}
    </div>
  );
}

export { SettlementList };
