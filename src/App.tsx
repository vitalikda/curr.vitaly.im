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

  const mathParsed = createMemo(() => {
    const p = parseInput(debouncedInput());
    return p?.type === "math" ? p : null;
  });

  const convParsed = createMemo(() => {
    const p = parseInput(debouncedInput());
    return p?.type === "conversion" ? p : null;
  });

  const [convertResult] = createResource(convParsed, (params) =>
    convert(params.from, params.to, params.amount),
  );

  const saveToHistory = (query: string, result: string) => {
    hist.add({ query, result, timestamp: Date.now() });
    setEntries(hist.load());
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const raw = input().trim();
    const math = mathParsed();
    const conv = convParsed();
    const res = convertResult();
    if (math) {
      saveToHistory(raw, String(math.result));
    } else if (conv && res) {
      saveToHistory(
        raw,
        `${formatCurrency(conv.amount, conv.from)} = ${formatCurrency(res.result, conv.to)}`,
      );
    }
  };

  const fillFromEntry = (entry: HistoryEntry) => {
    setInput(entry.query);
    inputRef?.focus();
  };

  const clearInput = () => {
    setInput("");
    inputRef?.focus();
  };

  const hasCard = createMemo(() => mathParsed() !== null || convParsed() !== null);

  return (
    <div class="min-h-screen bg-base-100 text-base-content flex flex-col items-center pt-20 px-4">
      <SearchBar
        ref={(el) => (inputRef = el)}
        value={input}
        onInput={setInput}
        onSubmit={handleSubmit}
        onClear={clearInput}
      />

      <Show when={hasCard()}>
        <ResultCard math={mathParsed} conv={convParsed} convertResult={convertResult} />
      </Show>

      <Show when={entries().length > 0}>
        <HistoryList entries={entries} onSelect={fillFromEntry} />
      </Show>
    </div>
  );
}
