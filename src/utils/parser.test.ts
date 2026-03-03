import { describe, expect, it } from "vitest";
import { evalMath, parseInput, tokenize } from "./parser";
import { Err, isOk } from "./result";

describe("tokenize", () => {
  it("tokenizes numbers", () => {
    expect(tokenize("100")).toEqual([{ type: "number", value: 100 }]);
    expect(tokenize("1,000")).toEqual([{ type: "number", value: 1000 }]);
    expect(tokenize("1.5")).toEqual([{ type: "number", value: 1.5 }]);
    expect(tokenize("1,000.50")).toEqual([{ type: "number", value: 1000.5 }]);
  });

  it("tokenizes operators and parens", () => {
    expect(tokenize("1+2")).toEqual([
      { type: "number", value: 1 },
      { type: "op", value: "+" },
      { type: "number", value: 2 },
    ]);
    expect(tokenize("(3*4)")).toEqual([
      { type: "lparen" },
      { type: "number", value: 3 },
      { type: "op", value: "*" },
      { type: "number", value: 4 },
      { type: "rparen" },
    ]);
  });

  it("tokenizes currencies (uppercased)", () => {
    expect(tokenize("usd")).toEqual([{ type: "currency", value: "USD" }]);
    expect(tokenize("EUR")).toEqual([{ type: "currency", value: "EUR" }]);
  });

  it("tokenizes currency symbols $ £ €", () => {
    expect(tokenize("$")).toEqual([{ type: "currencySymbol", value: "$" }]);
    expect(tokenize("£")).toEqual([{ type: "currencySymbol", value: "£" }]);
    expect(tokenize("€")).toEqual([{ type: "currencySymbol", value: "€" }]);
  });

  it("tokenizes keywords to/in/as", () => {
    expect(tokenize("to")).toEqual([{ type: "keyword" }]);
    expect(tokenize("in")).toEqual([{ type: "keyword" }]);
    expect(tokenize("as")).toEqual([{ type: "keyword" }]);
  });

  it("throws on invalid chars", () => {
    expect(() => tokenize("abcd")).toThrow(); // 4+ letter word
    expect(() => tokenize("#")).toThrow();
  });
});

describe("evalMath", () => {
  it("respects operator precedence", () => {
    const r = evalMath(tokenize("2+3*4"));
    expect(isOk(r) && r.value).toBe(2 + 3 * 4);
  });

  it("handles parentheses", () => {
    const r = evalMath(tokenize("(2+3)*4"));
    expect(isOk(r) && r.value).toBe((2 + 3) * 4);
  });

  it("handles division", () => {
    const r = evalMath(tokenize("10/4"));
    expect(isOk(r) && r.value).toBe(10 / 4);
  });

  it("returns Err on division by zero", () => {
    expect(evalMath(tokenize("1/0"))).toEqual(Err("Division by zero"));
  });

  it("handles unary minus", () => {
    const r = evalMath(tokenize("-5+10"));
    expect(isOk(r) && r.value).toBe(-5 + 10);
  });

  it("returns Err on empty tokens", () => {
    expect(evalMath([])).toEqual(Err("Empty expression"));
  });
});

describe("parseInput", () => {
  it("returns null for empty input", () => {
    expect(parseInput("")).toBeNull();
  });

  it("parses pure math", () => {
    expect(parseInput("1+2*3")).toEqual({ type: "math", expression: "1+2*3", result: 7 });
    expect(parseInput("1,000")).toEqual({ type: "math", expression: "1,000", result: 1000 });
  });

  it("parses conversion with case-insensitive currencies", () => {
    expect(parseInput("usd eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 1,
    });
    expect(parseInput("USD EUR")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 1,
    });
  });

  it("parses conversion with optional to/in/as", () => {
    expect(parseInput("usd to eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 1,
    });
    expect(parseInput("usd in eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 1,
    });
  });

  it("parses conversion with amount and as", () => {
    expect(parseInput("100 usd as eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 100,
    });
  });

  it("parses conversion with optional currency symbols $ £ €", () => {
    expect(parseInput("$100 usd eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 100,
    });
    expect(parseInput("100€ usd eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 100,
    });
  });

  it("parses conversion with math expression as amount", () => {
    expect(parseInput("1+2 usd eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 3,
    });
    expect(parseInput("(10+5)*2 usd to eur")).toEqual({
      type: "conversion",
      from: "USD",
      to: "EUR",
      amount: 30,
    });
  });

  it("returns null for same currency", () => {
    expect(parseInput("usd to usd")).toBeNull();
  });

  it("parses partial (math + one currency) as math result", () => {
    expect(parseInput("100 usd")).toEqual({ type: "math", expression: "100", result: 100 });
    expect(parseInput("100 usd to")).toEqual({ type: "math", expression: "100", result: 100 });
  });

  it("returns error result for invalid input", () => {
    expect(parseInput("abcd")).toEqual({ type: "error", message: "Invalid word 'abcd'" });
  });

  it("returns error result for division by zero", () => {
    expect(parseInput("1/0")).toEqual({ type: "error", message: "Division by zero" });
    expect(parseInput("1 / 0")).toEqual({ type: "error", message: "Division by zero" });
  });
});
