import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in Indian currency format
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show ₹ symbol
 * @returns {string} - Formatted amount (e.g., "₹750.00" or "750.00")
 */
export function formatCurrency(amount, showSymbol = true) {
  const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `${CURRENCY.SYMBOL}${formatted}` : formatted;
}

/**
 * Format date/time in a human-readable way
 * @param {Date|Timestamp} date - Date to format
 * @param {string} format - "full" | "short" | "time" | "relative"
 * @returns {string} - Formatted date
 */
export function formatDate(date, format = "full") {
  // Handle Firebase Timestamp
  const jsDate = date?.toDate ? date.toDate() : new Date(date);

  if (format === "relative") {
    return formatRelativeTime(jsDate);
  }

  const options = {
    full: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    short: {
      month: "short",
      day: "numeric",
    },
    time: {
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return new Intl.DateTimeFormat("en-IN", options[format]).format(jsDate);
}

/**
 * Format date in relative time (e.g., "Today", "Yesterday", "2 days ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${formatDate(date, "time")}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${formatDate(date, "time")}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return formatDate(date, "short");
  }
}

/**
 * Parse amount from string input
 */
export function parseAmount(value) {
  if (typeof value === "number") return value;

  // Remove currency symbol and commas
  const cleaned = String(value).replace(/[₹,\s]/g, "");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 50) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Capitalize first letter
 */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Generate unique ID (fallback if Firebase doesn't generate one)
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if running on client side
 */
export function isClient() {
  return typeof window !== "undefined";
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
