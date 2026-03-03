const CRYPTO_NAMES: Record<string, string> = {
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

const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });

export function getCurrencyName(code: string): string {
  return CRYPTO_NAMES[code] ?? displayNames.of(code) ?? code;
}
