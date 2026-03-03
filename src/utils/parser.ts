// Math expression: digits + operators + parens + whitespace + commas (for 1,000 style).
const MATH_CHARS = /^[\d\s+\-*/().,]+$/;

function safeEvalMath(expr: string): number | null {
  // Strip commas (thousand separators) then validate before eval.
  const cleaned = expr.trim().replace(/,/g, "");
  if (!cleaned || !/^[\d\s+\-*/().]+$/.test(cleaned)) return null;
  try {
    const result = new Function("return " + cleaned)();
    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * Try to extract a numeric amount from a math expression string.
 * Returns null if the string is not a valid expression.
 */
function evalAmount(expr: string): number | null {
  if (!expr) return null;
  const math = safeEvalMath(expr);
  if (math !== null) return math;
  // Fallback: plain number with optional commas.
  const n = parseFloat(expr.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function findCurrencyConversion(
  text: string,
): { from: string; to: string; amount: number } | null {
  const trimmed = text.trim();

  // Pattern: [MATH_EXPR] CODE to/in CODE
  const toInMatch = trimmed.match(
    /^([\d+\-*/().\s,]*)([A-Za-z]{3})\s+(?:to|in)\s+([A-Za-z]{3})$/i,
  );
  if (toInMatch) {
    const from = toInMatch[2].toUpperCase();
    const to = toInMatch[3].toUpperCase();
    if (from !== to) {
      const amt = evalAmount(toInMatch[1]) ?? 1;
      return { amount: amt, from, to };
    }
  }

  // Pattern: MATH_EXPR CODE CODE (require a numeric/math expression as amount)
  const exprCodesMatch = trimmed.match(
    /^([\d+\-*/().\s,]+)\s+([A-Za-z]{3})\s+([A-Za-z]{3})$/,
  );
  if (exprCodesMatch) {
    const from = exprCodesMatch[2].toUpperCase();
    const to = exprCodesMatch[3].toUpperCase();
    if (from !== to) {
      const amt = evalAmount(exprCodesMatch[1]);
      if (amt !== null) return { amount: amt, from, to };
    }
  }

  // Pattern: CODE CODE with no amount — require both to be uppercase to reduce false positives
  const twoCodeMatch = trimmed.match(/^([A-Z]{3})\s+([A-Z]{3})$/);
  if (twoCodeMatch) {
    const from = twoCodeMatch[1];
    const to = twoCodeMatch[2];
    if (from !== to) return { amount: 1, from, to };
  }

  return null;
}

export type ParseResult =
  | { type: "conversion"; amount: number; from: string; to: string }
  | { type: "math"; expression: string; result: number }
  | { type: "plain"; value: number }
  | null;

/**
 * Parse free-form input:
 *   "10 usd eur", "usd to eur", "10 USD in EUR"
 *   "12*24*100 usd to eur"  ← math expression as amount
 *   "1+2/3*4"               ← pure math
 */
export function parseInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1) Pure math expression (no letters)
  if (MATH_CHARS.test(trimmed) && /\d/.test(trimmed) && !/[A-Za-z]/.test(trimmed)) {
    const result = safeEvalMath(trimmed);
    if (result !== null) return { type: "math", expression: trimmed, result };
  }

  // 2) Currency conversion (with optional math expression as amount)
  const conversion = findCurrencyConversion(trimmed);
  if (conversion) {
    return { type: "conversion", amount: conversion.amount, from: conversion.from, to: conversion.to };
  }

  // 3) Input starts with a math expression but conversion is incomplete
  // e.g. "12*24 usd" or "100 usd to" — show the math result while user keeps typing.
  const partialMatch = trimmed.match(/^([\d+\-*/().,\s]+)\s+[A-Za-z]/);
  if (partialMatch) {
    const result = safeEvalMath(partialMatch[1]);
    if (result !== null) return { type: "math", expression: partialMatch[1].trim(), result };
  }

  // 4) Plain number
  const num = parseFloat(trimmed.replace(/,/g, ""));
  if (Number.isFinite(num) && /^[\d.,]+$/.test(trimmed)) {
    return { type: "plain", value: num };
  }

  return null;
}
