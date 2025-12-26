"use client";

// ============================================
// SETTLEMENTS PAGE
// View and manage settlements with Google Pay integration
// ============================================

import * as React from "react";
import { SettlementList } from "@/components/settlements/SettlementList";
import { ConfirmSettlementDialog } from "@/components/settlements/ConfirmSettlementDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonSelect } from "@/components/shared/PersonSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { openGPay } from "@/lib/gpay";
import { CURRENCY } from "@/lib/constants";

export default function SettlementsPage() {
  const [settlements, setSettlements] = React.useState([]);
  const [balance, setBalance] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedSettlement, setSelectedSettlement] = React.useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  // Create settlement form state
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState("");

  // Current user (in production, get from auth context)
  const [currentUser, setCurrentUser] = React.useState("Kiruthika");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settlementsRes, balanceRes] = await Promise.all([
        fetch("/api/settlements"),
        fetch("/api/balance"),
      ]);

      const settlementsData = await settlementsRes.json();
      const balanceData = await balanceRes.json();

      if (settlementsData.success) {
        setSettlements(settlementsData.settlements);
      }

      if (balanceData.success) {
        setBalance(balanceData.balance);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleConfirm = (settlementId, user) => {
    const settlement = settlements.find((s) => s.id === settlementId);
    setSelectedSettlement(settlement);
    setCurrentUser(user);
    setShowConfirmDialog(true);
  };

  const handleConfirmed = (updatedSettlement, isFullyConfirmed) => {
    if (isFullyConfirmed) {
      alert("Settlement fully confirmed by both parties! 🎉");
    } else {
      alert("Settlement confirmed. Waiting for other party.");
    }
    fetchData();
  };

  const handleCreateSettlement = async () => {
    setCreateError("");

    if (!from || !to || !amount) {
      setCreateError("Please fill in all fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setCreateError("Please enter a valid amount");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          amount: numAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateDialog(false);
        setFrom("");
        setTo("");
        setAmount("");
        fetchData();
        alert("Settlement created successfully!");
      } else {
        setCreateError(data.error || "Failed to create settlement");
      }
    } catch (error) {
      console.error("Error creating settlement:", error);
      setCreateError("Failed to create settlement. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSettleWithGPay = () => {
    if (!balance || balance.owedAmount === 0) {
      alert("No balance to settle!");
      return;
    }

    const { netBalance, owedAmount } = balance;
    const from = netBalance > 0 ? "Kiruthika" : "Neha";
    const to = netBalance > 0 ? "Neha" : "Kiruthika";

    openGPay(to, owedAmount, `NeKi-Pocket Settlement - ${from} to ${to}`);
  };

  const pending = settlements.filter((s) => s.status === "pending");
  const confirmed = settlements.filter((s) => s.status === "confirmed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settlements</h1>
          <p className="text-muted-foreground">
            Manage and confirm your settlements
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild className="ml-auto">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Settlement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Settlement</DialogTitle>
              <DialogDescription>
                Record a new settlement between you and your partner
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  From <span className="text-destructive">*</span>
                </Label>
                <PersonSelect
                  value={from}
                  onValueChange={setFrom}
                  placeholder="Who paid?"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  To <span className="text-destructive">*</span>
                </Label>
                <PersonSelect
                  value={to}
                  onValueChange={setTo}
                  placeholder="Who received?"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {CURRENCY.SYMBOL}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="750"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {createError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {createError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSettlement} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Settlement"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Settle with Google Pay */}
      {balance && balance.owedAmount > 0 && (
        <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Quick Settle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current balance:{" "}
              <span className="font-semibold">{balance.whoOwesWhom}</span>
            </p>
            <Button
              onClick={handleSettleWithGPay}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Settle ₹{balance.owedAmount.toFixed(2)} with Google Pay
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settlements List */}
      <SettlementList
        pending={pending}
        confirmed={confirmed}
        loading={loading}
        onConfirm={handleConfirm}
        currentUser={currentUser}
        separateSections={true}
        emptyMessage="No settlements yet. Create your first settlement!"
      />

      {/* Confirm Settlement Dialog */}
      <ConfirmSettlementDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        settlement={selectedSettlement}
        currentUser={currentUser}
        onConfirmed={handleConfirmed}
      />
    </div>
  );
}
