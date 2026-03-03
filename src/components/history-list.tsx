import type { Accessor } from "solid-js";
import { For } from "solid-js";
import { formatDate } from "../utils/format";
import type { HistoryEntry } from "../utils/history";

type HistoryItemProps = {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
};

function HistoryItem(props: HistoryItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => props.onSelect(props.entry)}
        class="btn btn-ghost w-full justify-start font-normal gap-1 md:gap-2"
      >
        <span class="whitespace-nowrap">{props.entry.query}</span>
        <span class="text-base-content/40">→</span>
        <span class="text-success/90 whitespace-nowrap">{props.entry.result}</span>
        <span class="ml-auto text-xs text-base-content/30 truncate">
          {formatDate(new Date(props.entry.timestamp).toISOString())}
        </span>
      </button>
    </li>
  );
}

type HistoryListProps = {
  entries: Accessor<HistoryEntry[]>;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
};

export function HistoryList(props: HistoryListProps) {
  return (
    <div class="mt-8 w-full max-w-2xl">
      <div class="flex items-center justify-between mb-2 gap-2">
        <h2 class="text-xs font-medium text-base-content/50 uppercase tracking-wider">History</h2>
        <button type="button" onClick={props.onClear} class="btn btn-xs text-base-content/40">
          Clear
        </button>
      </div>

      <ul class="space-y-1">
        <For each={props.entries()}>
          {(entry) => <HistoryItem entry={entry} onSelect={props.onSelect} />}
        </For>
      </ul>
    </div>
  );
}
