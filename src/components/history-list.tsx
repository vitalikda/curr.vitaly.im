import { Accessor, For } from "solid-js";
import { formatDate } from "../utils/format";
import { HistoryEntry } from "../utils/history";

interface HistoryListProps {
  entries: Accessor<HistoryEntry[]>;
  onSelect: (entry: HistoryEntry) => void;
}

interface HistoryItemProps {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
}

function HistoryItem({ entry, onSelect }: HistoryItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry)}
        class="btn btn-ghost w-full justify-start font-normal gap-1 md:gap-2"
      >
        <span class="whitespace-nowrap">{entry.query}</span>
        <span class="text-base-content/40">→</span>
        <span class="text-success/90 whitespace-nowrap">{entry.result}</span>
        <span class="ml-auto text-xs text-base-content/30 truncate">
          {formatDate(new Date(entry.timestamp).toISOString())}
        </span>
      </button>
    </li>
  );
}

export function HistoryList(props: HistoryListProps) {
  return (
    <div class="mt-8 w-full max-w-2xl">
      <h2 class="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-2">
        History
      </h2>
      <ul class="space-y-1">
        <For each={props.entries()}>
          {(entry) => <HistoryItem entry={entry} onSelect={props.onSelect} />}
        </For>
      </ul>
    </div>
  );
}
