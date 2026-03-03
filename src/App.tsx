import { createMemo, createResource, createSignal, onMount, Show } from "solid-js";
import { HistoryList } from "./components/history-list";
import { ResultCard } from "./components/result-card";
import { SearchBar } from "./components/search-bar";
import { useDebounced } from "./hooks/use-debounce";
import { convert } from "./utils/api";
import { formatCurrency } from "./utils/format";
import { History, type HistoryEntry } from "./utils/history";
import { parseInput } from "./utils/parser";

const hist = new History({ key: "curr-history" });

export default function App() {
  let inputRef: HTMLInputElement | undefined;
  onMount(() => inputRef?.focus());

  const [input, setInput] = createSignal("");
  const [entries, setEntries] = createSignal<HistoryEntry[]>(hist.load());

  const debouncedInput = useDebounced(input);
  const parsed = createMemo(() => parseInput(debouncedInput()));

  const showCard = () => parsed() !== null;
  const convParsed = () => {
    const p = parsed();
    return p?.type === "conversion" ? p : null;
  };

  const [convertResult] = createResource(convParsed, (params) =>
    convert(params.from, params.to, params.amount),
  );

  const saveToHistory = (query: string, result: string) => {
    setEntries(hist.add({ query, result, timestamp: Date.now() }));
  };

  const fillFromEntry = (entry: HistoryEntry) => {
    setInput(entry.query);
    inputRef?.focus();
  };

  const clearInput = () => {
    setInput("");
    inputRef?.focus();
  };

  const clearHistory = () => {
    setEntries(hist.clear());
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const raw = input().trim();
    const p = parseInput(raw);

    if (p?.type === "math") {
      saveToHistory(raw, String(p.result));
    }
    if (p?.type === "conversion") {
      const conv = convParsed();
      const res = convertResult();
      if (!res || !conv) return;
      // Only save when the resource result matches this exact conversion (debounce caught up)
      if (conv.from !== p.from || conv.to !== p.to || conv.amount !== p.amount) return;

      const result = `${formatCurrency(p.amount, p.from)} = ${formatCurrency(res.result, p.to)}`;
      saveToHistory(raw, result);
    }
  };

  return (
    <div class="min-h-screen bg-base-100 text-base-content flex flex-col items-center pt-20 px-4">
      <SearchBar
        ref={(el) => (inputRef = el)}
        value={input}
        onInput={setInput}
        onSubmit={handleSubmit}
        onClear={clearInput}
      />

      <Show when={showCard()}>
        <ResultCard parsedResult={parsed()!} input={debouncedInput} convertResult={convertResult} />
      </Show>

      <Show when={entries().length > 0}>
        <HistoryList entries={entries} onSelect={fillFromEntry} onClear={clearHistory} />
      </Show>
    </div>
  );
}
