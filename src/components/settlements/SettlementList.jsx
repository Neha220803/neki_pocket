"use client";

// ============================================
// SETTLEMENT LIST COMPONENT
// List of settlements with pending/confirmed sections
// ============================================

import * as React from "react";
import { SettlementCard } from "./SettlementCard";
import { cn } from "@/lib/utils";
import { Loader2, HandCoins, Coins } from "lucide-react";

function SettlementList({
  settlements = [],
  pending = [],
  confirmed = [],
  loading = false,
  onConfirm,
  currentUser,
  showConfirmButton = true,
  separateSections = true,
  emptyMessage = "No settlements yet",
  className,
}) {
  // Use provided pending/confirmed or separate from settlements
  const pendingSettlements =
    pending.length > 0
      ? pending
      : settlements.filter((s) => s.status === "pending");

  const confirmedSettlements =
    confirmed.length > 0
      ? confirmed
      : settlements.filter((s) => s.status === "confirmed");

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (
    settlements.length === 0 &&
    pending.length === 0 &&
    confirmed.length === 0
  ) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <HandCoins className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (!separateSections) {
    // Show all settlements in one list
    const allSettlements =
      settlements.length > 0
        ? settlements
        : [...pendingSettlements, ...confirmedSettlements];

    return (
      <div className={cn("space-y-3", className)}>
        {allSettlements.map((settlement) => (
          <SettlementCard
            key={settlement.id}
            settlement={settlement}
            onConfirm={onConfirm}
            currentUser={currentUser}
            showConfirmButton={showConfirmButton}
          />
        ))}
      </div>
    );
  }

  // Show pending and confirmed sections separately
  return (
    <div className={cn("space-y-6", className)}>
      {/* Pending Settlements */}
      {pendingSettlements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <HandCoins className="h-4 w-4" />
            <span>Pending Settlements</span>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
              {pendingSettlements.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingSettlements.map((settlement) => (
              <SettlementCard
                key={settlement.id}
                settlement={settlement}
                onConfirm={onConfirm}
                currentUser={currentUser}
                showConfirmButton={showConfirmButton}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Settlements */}
      {confirmedSettlements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>Settlement History</span>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              {confirmedSettlements.length}
            </span>
          </div>
          <div className="space-y-3">
            {confirmedSettlements.map((settlement) => (
              <SettlementCard
                key={settlement.id}
                settlement={settlement}
                onConfirm={onConfirm}
                currentUser={currentUser}
                showConfirmButton={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { SettlementList };
