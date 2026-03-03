import { Accessor, Show } from "solid-js";

interface SearchBarProps {
  ref: (el: HTMLInputElement) => void;
  value: Accessor<string>;
  onInput: (value: string) => void;
  onSubmit: (e: Event) => void;
  onClear: () => void;
}

export function SearchBar(props: SearchBarProps) {
  return (
    <form onSubmit={props.onSubmit} class="w-full max-w-2xl">
      <label class="input input-primary input-lg w-full flex items-center gap-2">
        <input
          ref={props.ref}
          type="text"
          autocomplete="off"
          placeholder="10 usd eur · eur to usd · 1+2*3"
          value={props.value()}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          class="grow"
        />
        <Show when={props.value()}>
          <button
            type="button"
            onClick={props.onClear}
            aria-label="Clear"
            class="btn btn-ghost btn-xs btn-circle shrink-0"
          >
            ✕
          </button>
          <button type="submit" aria-label="Save to history" class="btn btn-square btn-xs shrink-0">
            <kbd class="kbd">↵</kbd>
          </button>
        </Show>
      </label>
    </form>
  );
}
