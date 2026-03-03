export interface HistoryEntry {
  query: string;
  result: string;
  timestamp: number;
}

interface HistoryOptions {
  key: string;
  maxItems?: number;
}

export class History {
  private readonly key: string;
  private readonly maxItems: number;

  constructor({ key, maxItems }: HistoryOptions) {
    this.key = key;
    this.maxItems = maxItems ?? 25;
  }

  load(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      const fallbackTs = Date.now();
      return parsed
        .filter(
          (e): e is HistoryEntry =>
            e != null &&
            typeof e === "object" &&
            typeof (e as HistoryEntry).query === "string" &&
            (e as HistoryEntry).query.length > 0 &&
            typeof (e as HistoryEntry).result === "string" &&
            (e as HistoryEntry).result.length > 0,
        )
        .map((e) => {
          const entry = e as HistoryEntry & { timestamp?: unknown };
          const ts =
            typeof entry.timestamp === "number" && Number.isFinite(entry.timestamp)
              ? entry.timestamp
              : fallbackTs;
          return { query: entry.query, result: entry.result, timestamp: ts };
        })
        .slice(0, this.maxItems);
    } catch {
      return [];
    }
  }

  add(entry: HistoryEntry): HistoryEntry[] {
    const next = [
      entry,
      ...this.load().filter((e) => e.query !== entry.query || e.result !== entry.result),
    ].slice(0, this.maxItems);
    try {
      localStorage.setItem(this.key, JSON.stringify(next));
    } catch {
      // ignore
    }
    return next;
  }

  clear(): HistoryEntry[] {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // ignore
    }
    return [];
  }
}
