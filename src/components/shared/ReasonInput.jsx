"use client";

// ============================================
// REASON INPUT COMPONENT
// Input field for expense reason with character counter
// ============================================

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { VALIDATION } from "@/lib/constants";

function ReasonInput({
  value,
  onChange,
  placeholder = "e.g., Dinner at Sangeetha",
  multiline = false,
  showCounter = true,
  required = false,
  disabled,
  className,
  label,
  error,
}) {
  const maxLength = VALIDATION.MAX_REASON_LENGTH;
  const remaining = maxLength - (value?.length || 0);
  const isNearLimit = remaining <= 20;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange?.(newValue);
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <InputComponent
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive/20"
        )}
      />

      <div className="flex justify-between items-center text-xs">
        {error && <span className="text-destructive">{error}</span>}
        {!error && showCounter && (
          <span
            className={cn(
              "text-muted-foreground ml-auto",
              isNearLimit && "text-orange-500 dark:text-orange-400 font-medium"
            )}
          >
            {remaining} characters remaining
          </span>
        )}
      </div>
    </div>
  );
}

export { ReasonInput };
