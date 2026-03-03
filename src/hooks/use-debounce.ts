import { createEffect, createSignal } from "solid-js";

export function useDebounced(source: () => string, ms = 300): () => string {
  const [debounced, setDebounced] = createSignal(source());
  createEffect(() => {
    const v = source();
    const id = setTimeout(() => setDebounced(v), ms);
    return () => clearTimeout(id);
  });
  return debounced;
}
