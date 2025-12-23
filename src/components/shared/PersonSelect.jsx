"use client";

// ============================================
// PERSON SELECT COMPONENT
// Dropdown to select Kiruthika or Neha
// ============================================

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PEOPLE_LIST } from "@/lib/constants";

function PersonSelect({
  value,
  onValueChange,
  placeholder = "Select person",
  disabled,
  className,
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {PEOPLE_LIST.map((person) => (
          <SelectItem key={person} value={person}>
            {person}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { PersonSelect };
