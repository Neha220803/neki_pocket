"use client";

// ============================================
// EXPENSES PAGE
// Streamlined expense list with inline filters
// ============================================

import * as React from "react";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { PersonSelect } from "@/components/shared/PersonSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterPerson, setFilterPerson] = React.useState("");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Expenses</h1>
          <p className="text-muted-foreground">
            Manage all your shared expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter by Person */}
          <div className="flex items-center gap-2">
            <PersonSelect
              id="filter-person"
              value={filterPerson}
              onValueChange={setFilterPerson}
              placeholder="Filter: All "
              className="w-[140px]"
            />
            {filterPerson && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilter}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Add Expense Button */}
          <AddExpenseDialog onExpenseAdded={handleExpenseAdded} />
        </div>
      </div>

      {/* Expenses List */}
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
    </div>
  );
}
