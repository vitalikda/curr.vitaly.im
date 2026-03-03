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

  add(entry: HistoryEntry): void {
    const list = this.load();
    const next = [
      entry,
      ...list.filter((e) => e.query !== entry.query || e.result !== entry.result),
    ];
    try {
      localStorage.setItem(this.key, JSON.stringify(next.slice(0, this.maxItems)));
    } catch {
      // ignore
    }
  }
}
