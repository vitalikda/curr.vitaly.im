const PRIMARY = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1";
const FALLBACK = "https://latest.currency-api.pages.dev/v1";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface LatestResponse {
  date: string;
  [currency: string]: unknown;
}

interface CachedRate {
  rate: number;
  date: string;
}

const lastFetchedAt = new Map<string, number>();
const rateCache = new Map<string, CachedRate>();

const cacheKey = (from: string, to: string) => `${from}:${to}`;

const isStale = (lastFetch: number | undefined) =>
  lastFetch === undefined || Date.now() - lastFetch > CACHE_TTL_MS;

export interface ConvertResult {
  date: string;
  rate: number;
  result: number;
}

async function fetchRates(base: string): Promise<{ date: string; rates: Record<string, number> }> {
  const lowerBase = base.toLowerCase();
  const path = `/currencies/${encodeURIComponent(lowerBase)}.json`;

  const tryFetch = async (baseUrl: string): Promise<LatestResponse> => {
    const res = await fetch(baseUrl + path);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<LatestResponse>;
  };

  let data: LatestResponse;
  try {
    data = await tryFetch(PRIMARY);
  } catch {
    data = await tryFetch(FALLBACK);
  }

  const rates = data[lowerBase] as Record<string, number> | undefined;
  if (!rates) throw new Error(`No rates returned for: ${base}`);
  return { date: data.date, rates };
}

export async function convert(from: string, to: string, amount: number): Promise<ConvertResult> {
  const key = cacheKey(from, to);
  const lastFetch = lastFetchedAt.get(from);

  if (!rateCache.has(key) || isStale(lastFetch)) {
    const { date, rates } = await fetchRates(from);
    lastFetchedAt.set(from, Date.now());

    for (const [code, rate] of Object.entries(rates)) {
      const upper = code.toUpperCase();
      rateCache.set(cacheKey(from, upper), { rate, date });

      if (!rateCache.has(cacheKey(upper, from))) {
        rateCache.set(cacheKey(upper, from), { rate: 1 / rate, date });
      }
    }
  }

  const cached = rateCache.get(key);
  if (!cached) throw new Error(`Currency not supported: ${to}`);
  return { date: cached.date, rate: cached.rate, result: amount * cached.rate };
}
