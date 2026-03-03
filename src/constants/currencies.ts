const CURRENCY_CRYPTO: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "Binance Coin",
  XRP: "Ripple",
  ADA: "Cardano",
  AVAX: "Avalanche",
  LTC: "Litecoin",
  DOT: "Polkadot",
};

export const CURRENCY_SYMBOL: Record<string, string> = {
  $: "USD", // US Dollar
  "€": "EUR", // Euro
  "£": "GBP", // British Pound
  "¥": "JPY", // Japanese Yen
  "₹": "INR", // Indian Rupee
  "₽": "RUB", // Russian Ruble
  "₺": "TRY", // Turkish Lira
  "₮": "MNT", // Mongolian Tugrik
  "₩": "KRW", // South Korean Won
  "₸": "KZT", // Kazakhstani Tenge
  "₱": "PHP", // Philippine Peso
  "₳": "ARS", // Argentine Peso
  "₦": "NGN", // Nigerian Naira
};

const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });

export function getCurrencyName(code: string): string {
  return CURRENCY_CRYPTO[code] ?? displayNames.of(code) ?? code;
}
