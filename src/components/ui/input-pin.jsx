"use client";

// ============================================
// PIN INPUT COMPONENT
// 6-digit PIN input with auto-focus
// ============================================

import * as React from "react";
import { cn } from "@/lib/utils";

function InputPin({ value = "", onChange, onComplete, disabled, className }) {
  const [pins, setPins] = React.useState(Array(6).fill(""));
  const inputRefs = React.useRef([]);

  // Sync external value with internal state
  React.useEffect(() => {
    if (value) {
      const digits = value.split("").slice(0, 6);
      setPins([...digits, ...Array(6 - digits.length).fill("")]);
    }
  }, [value]);

  const handleChange = (index, val) => {
    // Only allow digits
    if (val && !/^\d$/.test(val)) return;

    const newPins = [...pins];
    newPins[index] = val;
    setPins(newPins);

    // Call onChange with full PIN string
    const pinString = newPins.join("");
    onChange?.(pinString);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all 6 digits entered
    if (pinString.length === 6 && onComplete) {
      onComplete(pinString);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      const newPins = [...pins];

      if (pins[index]) {
        // Clear current box
        newPins[index] = "";
        setPins(newPins);
        onChange?.(newPins.join(""));
      } else if (index > 0) {
        // Move to previous box and clear it
        newPins[index - 1] = "";
        setPins(newPins);
        onChange?.(newPins.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData) {
      const digits = pastedData.split("");
      const newPins = [...digits, ...Array(6 - digits.length).fill("")];
      setPins(newPins);
      onChange?.(pastedData);

      // Focus last filled box or next empty box
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();

      // Call onComplete if 6 digits pasted
      if (pastedData.length === 6 && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  const handleFocus = (index) => {
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold rounded-md border-2 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            pin ? "border-primary" : "border-input",
            className
          )}
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

export { InputPin };
