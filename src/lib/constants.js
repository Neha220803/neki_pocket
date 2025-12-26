// ============================================
// NEKI POCKET - CONSTANTS
// ============================================

// People
export const PEOPLE = {
  KIRUTHIKA: "Kiruthika",
  NEHA: "Neha",
};

export const PEOPLE_LIST = ["Kiruthika", "Neha"];

export const PAID_FOR_OPTIONS = {
  BOTH: "Both",
  KIRUTHIKA: "Kiruthika",
  NEHA: "Neha",
};

export const PAID_FOR_LIST = [
  PAID_FOR_OPTIONS.BOTH,
  PAID_FOR_OPTIONS.KIRUTHIKA,
  PAID_FOR_OPTIONS.NEHA,
];

// PIN Configuration
// TODO: In production, store hashed PIN in environment variables
export const APP_PIN = "123456"; // 6-digit PIN for both users

// Balance Threshold
export const BALANCE_THRESHOLD = 500; // ₹500 warning threshold

// Currency
export const CURRENCY = {
  SYMBOL: "₹",
  CODE: "INR",
  LOCALE: "en-IN",
};

// Settlement Status
export const SETTLEMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
};

// Google Pay Configuration
export const GPAY_CONFIG = {
  KIRUTHIKA_UPI: "palanivelraj@oksbi",
  NEHA_UPI: "neeharika.srinivasan@oksbi",
};

// Date Format
export const DATE_FORMAT = {
  FULL: "MMMM dd, yyyy 'at' hh:mm a",
  SHORT: "MMM dd",
  TIME: "hh:mm a",
};

// Firestore Collection Names
export const COLLECTIONS = {
  EXPENSES: "expenses",
  SETTLEMENTS: "settlements",
};

// App Metadata
export const APP_INFO = {
  NAME: "NeKiPay",
  TAGLINE: "Neki & Kiruthika's Pocket Tracker",
  VERSION: "1.0.0",
};

// Color Theme (for programmatic use)
export const THEME_COLORS = {
  KIRUTHIKA: {
    primary: "oklch(0.82 0.12 350)", // Blush pink
    light: "oklch(0.95 0.06 350)",
  },
  NEHA: {
    primary: "oklch(0.72 0.16 295)", // Lavender purple
    light: "oklch(0.90 0.08 295)",
  },
  MINT: "oklch(0.85 0.08 180)",
  PEACH: "oklch(0.9 0.04 60)",
};

// Validation Rules
export const VALIDATION = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
  MAX_REASON_LENGTH: 100,
  PIN_LENGTH: 6,
};
