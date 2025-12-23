"use client";

// ============================================
// DASHBOARD PAGE
// Main page showing balance, recent expenses, and quick actions
// ============================================

import * as React from "react";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import { ThresholdAlert } from "@/components/balance/ThresholdAlert";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [balance, setBalance] = React.useState(null);
  const [recentExpenses, setRecentExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [balanceRes, expensesRes] = await Promise.all([
        fetch("/api/balance"),
        fetch("/api/expenses?recent=true&limit=5"),
      ]);

      const balanceData = await balanceRes.json();
      const expensesData = await expensesRes.json();

      if (balanceData.success) {
        setBalance(balanceData.balance);
      }

      if (expensesData.success) {
        setRecentExpenses(expensesData.expenses);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExpenseAdded = () => {
    fetchDashboardData();
  };

  const handleExpenseDeleted = async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your shared expenses and balance
        </p>
      </div>

      {/* Threshold Alert */}
      <ThresholdAlert balance={balance} />

      {/* Balance Summary */}
      <BalanceSummary balance={balance} />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AddExpenseDialog
              onExpenseAdded={handleExpenseAdded}
              trigger={
                <Button className="w-full" size="lg">
                  Add Expense
                </Button>
              }
            />
            <Link href="/settlements">
              <Button variant="outline" className="w-full" size="lg">
                View Settlements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-semibold">
                ₹{balance?.totalExpenses?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kiruthika Paid</span>
              <span className="font-semibold text-secondary">
                ₹{balance?.kiruthikaPaid?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Neha Paid</span>
              <span className="font-semibold text-primary">
                ₹{balance?.nehaPaid?.toFixed(2) || "0.00"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <Link href="/expenses">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ExpenseList
            expenses={recentExpenses}
            loading={loading}
            onDelete={handleExpenseDeleted}
            emptyMessage="No expenses yet. Add your first expense!"
          />
        </CardContent>
      </Card>
    </div>
  );
}
