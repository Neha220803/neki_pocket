"use client";

// ============================================
// THRESHOLD ALERT COMPONENT
// Warning banner when balance exceeds ₹500
// ============================================

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle } from "lucide-react";
import { BALANCE_THRESHOLD } from "@/lib/constants";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { cn } from "@/lib/utils";

function ThresholdAlert({ balance, className }) {
  if (!balance || !balance.exceedsThreshold) {
    return null;
  }

  const { owedAmount } = balance;

  return (
    <Alert
      className={cn(
        "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800",
        className
      )}
    >
      <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="text-orange-800 dark:text-orange-300">
        Balance Alert
      </AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-400">
        Reminder: Balance of{" "}
        <MoneyDisplay
          amount={owedAmount}
          className="font-semibold text-orange-800 dark:text-orange-300"
        />{" "}
        exceeds the ₹{BALANCE_THRESHOLD} threshold. Consider settling up soon!
      </AlertDescription>
    </Alert>
  );
}

export { ThresholdAlert };
