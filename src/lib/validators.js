// ============================================
// INPUT VALIDATORS
// ============================================

import { VALIDATION, PEOPLE_LIST, PAID_FOR_LIST, APP_PIN } from "./constants";

/**
 * Validate expense amount
 */
export const validateAmount = (amount) => {
  const errors = [];

  if (amount === null || amount === undefined || amount === "") {
    errors.push("Amount is required");
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    errors.push("Amount must be a valid number");
  }

  if (numAmount < VALIDATION.MIN_AMOUNT) {
    errors.push(`Amount must be at least ₹${VALIDATION.MIN_AMOUNT}`);
  }

  if (numAmount > VALIDATION.MAX_AMOUNT) {
    errors.push(`Amount cannot exceed ₹${VALIDATION.MAX_AMOUNT}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate person name
 */
export const validatePerson = (person) => {
  const errors = [];

  if (!person) {
    errors.push("Person is required");
  }

  if (!PEOPLE_LIST.includes(person)) {
    errors.push("Invalid person selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate paidFor field
 */
export const validatePaidFor = (paidFor) => {
  const errors = [];

  if (!paidFor) {
    errors.push("Paid for is required");
  }

  if (!PAID_FOR_LIST.includes(paidFor)) {
    errors.push("Invalid paid for option selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate expense reason
 */
export const validateReason = (reason) => {
  const errors = [];

  if (!reason || reason.trim() === "") {
    errors.push("Reason is required");
  }

  if (reason.length > VALIDATION.MAX_REASON_LENGTH) {
    errors.push(
      `Reason cannot exceed ${VALIDATION.MAX_REASON_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate PIN
 */
export const validatePIN = (pin) => {
  const errors = [];

  if (!pin) {
    errors.push("PIN is required");
  }

  if (pin.length !== VALIDATION.PIN_LENGTH) {
    errors.push(`PIN must be ${VALIDATION.PIN_LENGTH} digits`);
  }

  if (!/^\d+$/.test(pin)) {
    errors.push("PIN must contain only numbers");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Verify PIN correctness
 */
export const verifyPIN = (pin) => {
  const validation = validatePIN(pin);
  if (!validation.isValid) {
    return validation;
  }

  // TODO: In production, compare with hashed PIN from secure storage
  const isCorrect = pin === APP_PIN;

  return {
    isValid: isCorrect,
    errors: isCorrect ? [] : ["Incorrect PIN"],
  };
};

/**
 * Validate complete expense object
 */
export const validateExpense = (expense) => {
  const errors = [];

  const amountValidation = validateAmount(expense.amount);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }

  const personValidation = validatePerson(expense.paidBy);
  if (!personValidation.isValid) {
    errors.push(...personValidation.errors);
  }

  const paidForValidation = validatePaidFor(expense.paidFor);
  if (!paidForValidation.isValid) {
    errors.push(...paidForValidation.errors);
  }

  const reasonValidation = validateReason(expense.reason);
  if (!reasonValidation.isValid) {
    errors.push(...reasonValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate settlement object
 */
export const validateSettlement = (settlement) => {
  const errors = [];

  const amountValidation = validateAmount(settlement.amount);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }

  const fromValidation = validatePerson(settlement.from);
  if (!fromValidation.isValid) {
    errors.push(...fromValidation.errors.map((e) => `From: ${e}`));
  }

  const toValidation = validatePerson(settlement.to);
  if (!toValidation.isValid) {
    errors.push(...toValidation.errors.map((e) => `To: ${e}`));
  }

  if (settlement.from === settlement.to) {
    errors.push("Cannot settle with yourself");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
