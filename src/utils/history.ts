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
      return parsed.slice(0, this.maxItems);
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
