"use client";

// ============================================
// PAID FOR SELECT COMPONENT
// Dropdown to select who benefited (Both/Kiruthika/Neha)
// ============================================

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAID_FOR_LIST } from "@/lib/constants";

function PaidForSelect({
  value,
  onValueChange,
  placeholder = "Select who benefited",
  disabled,
  className,
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {PAID_FOR_LIST.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { PaidForSelect };
