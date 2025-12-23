"use client";

// ============================================
// EXPENSES PAGE
// Full expense list with filters and management
// ============================================

import * as React from "react";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { PersonSelect } from "@/components/shared/PersonSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, X } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterPerson, setFilterPerson] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let url = "/api/expenses";

      if (filterPerson) {
        url += `?paidBy=${filterPerson}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchExpenses();
  }, [filterPerson]);

  const handleExpenseAdded = () => {
    fetchExpenses();
  };

  const handleExpenseDeleted = async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const clearFilter = () => {
    setFilterPerson("");
  };

  // Filter expenses by person for tabs
  const kiruthikaExpenses = expenses.filter((e) => e.paidBy === "Kiruthika");
  const nehaExpenses = expenses.filter((e) => e.paidBy === "Neha");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage all your shared expenses
          </p>
        </div>
        <AddExpenseDialog onExpenseAdded={handleExpenseAdded} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs space-y-2">
              <Label htmlFor="filter-person">Filter by Person</Label>
              <PersonSelect
                id="filter-person"
                value={filterPerson}
                onValueChange={setFilterPerson}
                placeholder="All"
              />
            </div>
            {filterPerson && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({expenses.length})</TabsTrigger>
          <TabsTrigger value="kiruthika">
            Kiruthika ({kiruthikaExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="neha">Neha ({nehaExpenses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ExpenseList
            expenses={expenses}
            loading={loading}
            onDelete={handleExpenseDeleted}
            emptyMessage={
              filterPerson
                ? `No expenses by ${filterPerson}`
                : "No expenses yet. Add your first expense!"
            }
          />
        </TabsContent>

        <TabsContent value="kiruthika" className="mt-6">
          <ExpenseList
            expenses={kiruthikaExpenses}
            loading={loading}
            onDelete={handleExpenseDeleted}
            emptyMessage="No expenses by Kiruthika"
          />
        </TabsContent>

        <TabsContent value="neha" className="mt-6">
          <ExpenseList
            expenses={nehaExpenses}
            loading={loading}
            onDelete={handleExpenseDeleted}
            emptyMessage="No expenses by Neha"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
