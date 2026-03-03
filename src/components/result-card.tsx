import type { Accessor, JSX, Resource } from "solid-js";
import { Show } from "solid-js";
import { getCurrencyName } from "../constants/currencies";
import type { ConvertResult } from "../utils/api";
import { formatCurrency } from "../utils/format";
import type { ParseResult } from "../utils/parser";

interface ResultCardProps {
  math: Accessor<Extract<ParseResult, { type: "math" }> | null>;
  conv: Accessor<Extract<ParseResult, { type: "conversion" }> | null>;
  convertResult: Resource<ConvertResult | null>;
}

interface ResultItemProps {
  title: JSX.Element;
  subtitle?: string;
  loading?: boolean;
  error?: string;
}

function ResultItem(props: ResultItemProps) {
  return (
    <div class="flex-1 p-6 flex flex-col justify-center gap-1">
      <Show when={props.loading}>
        <span class="loading loading-dots loading-md text-base-content/40" />
      </Show>
      <Show when={props.error}>
        <p class="text-sm text-error truncate">{props.error}</p>
      </Show>
      <Show when={!props.loading && !props.error}>
        <p class="text-2xl font-semibold font-mono truncate">{props.title}</p>
        <Show when={props.subtitle}>
          <p class="text-sm text-base-content/50">{props.subtitle}</p>
        </Show>
      </Show>
    </div>
  );
}

export function ResultCard(props: ResultCardProps) {
  const leftTitle = () =>
    props.math()
      ? props.math()!.expression
      : formatCurrency(props.conv()!.amount, props.conv()!.from);

  const rightTitle = () =>
    props.math()
      ? String(props.math()!.result)
      : props.convertResult()
        ? formatCurrency(props.convertResult()!.result, props.conv()!.to)
        : "";

  return (
    <div class="card bg-base-200 w-full max-w-2xl mt-4">
      <div class="flex divide-x divide-base-300">
        <ResultItem title={leftTitle()} subtitle={props.conv()?.from} />
        <ResultItem
          title={<span class="text-success">{rightTitle()}</span>}
          subtitle={props.conv() ? getCurrencyName(props.conv()!.to) : undefined}
          loading={!!props.conv() && props.convertResult.loading}
          error={props.convertResult.error ? String(props.convertResult.error) : undefined}
        />
      </div>
    </div>
  );
}
