// ============================================
// GOOGLE PAY UTILITY
// Generate UPI deep links for payments
// ============================================

import { GPAY_CONFIG, PEOPLE, CURRENCY } from "./constants";

/**
 * Generate Google Pay UPI deep link
 * @param {string} to - Recipient name (Kiruthika or Neha)
 * @param {number} amount - Amount in INR
 * @param {string} note - Transaction note
 * @returns {string} UPI deep link
 */
export function generateGPayLink(to, amount, note = "") {
  // Get UPI ID based on recipient
  const upiId =
    to === PEOPLE.KIRUTHIKA ? GPAY_CONFIG.KIRUTHIKA_UPI : GPAY_CONFIG.NEHA_UPI;

  // Format amount (remove decimals for UPI)
  const formattedAmount = Math.round(amount);

  // Build UPI parameters
  const params = new URLSearchParams({
    pa: upiId, // Payee address (UPI ID)
    pn: to, // Payee name
    am: formattedAmount.toString(), // Amount
    cu: CURRENCY.CODE, // Currency (INR)
    tn: note || `Payment to ${to}`, // Transaction note
  });

  // UPI deep link format
  return `upi://pay?${params.toString()}`;
}

/**
 * Generate Google Pay web URL (fallback for desktop)
 * @param {string} to - Recipient name
 * @param {number} amount - Amount in INR
 * @param {string} note - Transaction note
 * @returns {string} Google Pay web URL
 */
export function generateGPayWebLink(to, amount, note = "") {
  const upiId =
    to === PEOPLE.KIRUTHIKA ? GPAY_CONFIG.KIRUTHIKA_UPI : GPAY_CONFIG.NEHA_UPI;

  const formattedAmount = Math.round(amount);

  // Google Pay web format
  const params = new URLSearchParams({
    pa: upiId,
    pn: to,
    am: formattedAmount.toString(),
    cu: CURRENCY.CODE,
    tn: note || `Payment to ${to}`,
  });

  return `https://gpay.app.goo.gl/?${params.toString()}`;
}

/**
 * Open Google Pay payment
 * Opens app on mobile, web on desktop
 * @param {string} to - Recipient name
 * @param {number} amount - Amount in INR
 * @param {string} note - Transaction note
 */
export function openGPay(to, amount, note = "") {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // Open GPay app on mobile
    const deepLink = generateGPayLink(to, amount, note);
    window.location.href = deepLink;
  } else {
    // Open GPay web on desktop
    const webLink = generateGPayWebLink(to, amount, note);
    window.open(webLink, "_blank");
  }
}

/**
 * Check if Google Pay is supported
 * @returns {boolean} True if GPay is likely supported
 */
export function isGPaySupported() {
  // Basic check - GPay works on most modern browsers
  return typeof window !== "undefined" && !!window.location;
}

/**
 * Generate settlement payment link
 * @param {Object} settlement - Settlement object
 * @returns {string} UPI deep link
 */
export function generateSettlementPaymentLink(settlement) {
  const note = `NeKiPay Settlement - ₹${settlement.amount}`;
  return generateGPayLink(settlement.to, settlement.amount, note);
}
