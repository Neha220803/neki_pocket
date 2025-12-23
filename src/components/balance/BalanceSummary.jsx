"use client";

// ============================================
// BALANCE SUMMARY COMPONENT
// Shows who owes whom and payment breakdown
// ============================================

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

function BalanceSummary({ balance, individual, className }) {
  if (!balance) return null;

  const { whoOwesWhom, owedAmount, kiruthikaPaid, nehaPaid } = balance;
  const isSettled = owedAmount === 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Balance Card */}
      <Card
        className={cn(
          "border-2",
          isSettled
            ? "bg-accent/50 border-accent"
            : owedAmount >= 500
            ? "bg-secondary/10 border-secondary"
            : "bg-primary/10 border-primary/30"
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg">{whoOwesWhom}</CardTitle>
        </CardHeader>
        <CardContent>
          {!isSettled && (
            <MoneyDisplay
              amount={owedAmount}
              size="xl"
              variant="primary"
              className="font-bold"
            />
          )}
          {isSettled && (
            <div className="text-2xl font-semibold text-accent-foreground">
              All settled up! 🎉
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Payment Summary */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Kiruthika's payments */}
          <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div>
              <div className="font-medium text-sm">Kiruthika Paid</div>
              <div className="text-xs text-muted-foreground">
                Total contributions
              </div>
            </div>
            <MoneyDisplay
              amount={kiruthikaPaid || 0}
              size="lg"
              className="text-secondary"
            />
          </div>

          {/* Neha's payments */}
          <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div>
              <div className="font-medium text-sm">Neha Paid</div>
              <div className="text-xs text-muted-foreground">
                Total contributions
              </div>
            </div>
            <MoneyDisplay
              amount={nehaPaid || 0}
              size="lg"
              className="text-primary"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { BalanceSummary };
