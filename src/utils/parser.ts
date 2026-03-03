import type { Result } from "./result";
import { Err, Ok, isErr } from "./result";

export type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "currency"; value: string }
  | { type: "currencySymbol"; value: string }
  | { type: "keyword" };

const RE_WHITESPACE = /^\s+/;
const RE_NUMBER = /^\d[\d,]*(\.\d+)?|^\.\d+/;
const RE_CURRENCY_SYMBOL = /^[$£€]/;
const RE_WORD = /^[A-Za-z]+/;
const RE_KEYWORD = /^(to|in|as)$/i;

type TokenMatcher = {
  pattern: RegExp;
  token: (match: string) => Token;
};

/** Order matters: longer/more specific matches first (e.g. NUMBER before single-char ops) */
const TOKEN_TABLE: TokenMatcher[] = [
  {
    pattern: RE_NUMBER,
    token: (m) => {
      const value = parseFloat(m.replace(/,/g, ""));
      if (!Number.isFinite(value)) throw new Error("Invalid number");
      return { type: "number", value };
    },
  },
  { pattern: RE_CURRENCY_SYMBOL, token: (m) => ({ type: "currencySymbol", value: m }) },
  { pattern: /^\+/, token: () => ({ type: "op", value: "+" }) },
  { pattern: /^-/, token: () => ({ type: "op", value: "-" }) },
  { pattern: /^\*/, token: () => ({ type: "op", value: "*" }) },
  { pattern: /^\//, token: () => ({ type: "op", value: "/" }) },
  { pattern: /^\(/, token: () => ({ type: "lparen" }) },
  { pattern: /^\)/, token: () => ({ type: "rparen" }) },
  {
    pattern: RE_WORD,
    token: (m) => {
      if (m.length === 2 && RE_KEYWORD.test(m)) return { type: "keyword" };
      if (m.length === 3) return { type: "currency", value: m.toUpperCase() };
      throw new Error(`Invalid word '${m}'`);
    },
  },
];

/**
 * Tokenize input string into a list of typed tokens
 * Throws on invalid characters (e.g. unknown symbols, words not 2 or 3 letters)
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;
  const s = input.trim();

  while (position < s.length) {
    const rest = s.slice(position);
    const ws = rest.match(RE_WHITESPACE);
    if (ws) {
      position += ws[0].length;
      continue;
    }
    if (position >= s.length) break;

    let matched = false;
    for (const { pattern, token } of TOKEN_TABLE) {
      const m = rest.match(pattern);
      if (m) {
        tokens.push(token(m[0]));
        position += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const unexpected = s[position];
      throw new Error(`Unexpected character '${unexpected}' at position ${position}`);
    }
  }
  return tokens;
}

const MATH_TOKEN_TYPES = ["number", "op", "lparen", "rparen"] as const;

function isMathToken(t: Token): t is Token & { type: "number" | "op" | "lparen" | "rparen" } {
  return MATH_TOKEN_TYPES.includes(t.type as (typeof MATH_TOKEN_TYPES)[number]);
}

function parseExpr(tokens: Token[], pos: { i: number }): number {
  let left = parseTerm(tokens, pos);
  for (;;) {
    const t = tokens[pos.i];
    if (t?.type !== "op" || (t.value !== "+" && t.value !== "-")) break;
    pos.i++;
    const right = parseTerm(tokens, pos);
    left = t.value === "+" ? left + right : left - right;
  }
  return left;
}

function parseTerm(tokens: Token[], pos: { i: number }): number {
  let left = parseFactor(tokens, pos);
  let curr = tokens[pos.i];
  while (curr && curr.type === "op" && (curr.value === "*" || curr.value === "/")) {
    const op = curr.value;
    pos.i++;
    const right = parseFactor(tokens, pos);
    if (op === "/" && right === 0) throw new Error("Division by zero");
    left = op === "*" ? left * right : left / right;
    curr = tokens[pos.i];
  }
  return left;
}

function parseFactor(tokens: Token[], pos: { i: number }): number {
  const t = tokens[pos.i];
  if (t?.type === "number") {
    pos.i++;
    return t.value;
  }
  if (t?.type === "op" && t.value === "-") {
    pos.i++;
    return -parseFactor(tokens, pos);
  }
  if (t?.type === "lparen") {
    pos.i++;
    const val = parseExpr(tokens, pos);
    if (tokens[pos.i]?.type !== "rparen") throw new Error("Unmatched parenthesis");
    pos.i++;
    return val;
  }
  throw new Error("Unexpected token");
}

/**
 * Evaluate a sequence of math tokens (numbers, operators, parens)
 * Returns Ok(value) or Err(message) for division by zero / malformed expression
 */
export function evalMath(tokens: Token[]): Result<number> {
  if (tokens.length === 0) return Err("Empty expression");
  if (!tokens.every(isMathToken)) return Err("Invalid expression");
  try {
    const pos = { i: 0 };
    const result = parseExpr(tokens, pos);
    if (pos.i !== tokens.length) return Err("Invalid expression");
    if (!Number.isFinite(result)) return Err("Invalid result");
    return Ok(result);
  } catch (e) {
    return Err(e instanceof Error ? e.message : "Invalid expression");
  }
}

export type ParseResult =
  | { type: "conversion"; amount: number; from: string; to: string }
  | { type: "math"; expression: string; result: number }
  | { type: "error"; message: string }
  | null;

/**
 * Parse free-form input:
 * - `10 usd eur`, `usd to eur`, `10 USD in EUR`, `usd as eur`
 * - `$100 usd eur`, `100€ eur`  - optional currency symbols $, £, €
 * - `12*24*100 usd to eur`  - math expression as amount
 * - `1+2/3*4`               - pure math
 *
 * Currencies are case-insensitive; `to`, `in`, `as` between currencies are optional
 */
export function parseInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let tokens: Token[];
  try {
    tokens = tokenize(trimmed);
  } catch (e) {
    return { type: "error", message: e instanceof Error ? e.message : String(e) };
  }
  if (tokens.length === 0) return null;

  const firstCurrencyIdx = tokens.findIndex((t) => t.type === "currency");
  const onlyMath = (ts: Token[]) => ts.filter(isMathToken);
  if (firstCurrencyIdx === -1) {
    const result = evalMath(onlyMath(tokens));
    if (isErr(result)) return { type: "error", message: result.error };
    return { type: "math", expression: trimmed, result: result.value };
  }

  const mathTokens = tokens.slice(0, firstCurrencyIdx);
  const rest = tokens.slice(firstCurrencyIdx).filter((t) => t.type !== "keyword");
  const currencies = rest.filter((t): t is Token & { type: "currency" } => t.type === "currency");

  if (currencies.length === 2) {
    if (currencies[0].value === currencies[1].value) return null;
    const amountResult = mathTokens.length ? evalMath(onlyMath(mathTokens)) : Ok(1);
    if (isErr(amountResult)) return { type: "error", message: amountResult.error };
    const amount = amountResult.value;
    return {
      type: "conversion",
      amount,
      from: currencies[0].value,
      to: currencies[1].value,
    };
  }

  if (currencies.length === 1 && mathTokens.length > 0) {
    const result = evalMath(onlyMath(mathTokens));
    if (isErr(result)) return { type: "error", message: result.error };
    const expression = onlyMath(mathTokens)
      .map((t) =>
        t.type === "number"
          ? String(t.value)
          : t.type === "op"
            ? t.value
            : t.type === "lparen"
              ? "("
              : ")",
      )
      .join("");
    return { type: "math", expression, result: result.value };
  }

  return null;
}
