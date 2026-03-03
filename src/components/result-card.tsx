import type { Accessor, Resource } from "solid-js";
import { createMemo, Show } from "solid-js";
import { getCurrencyName } from "../constants/currencies";
import type { ConvertResult } from "../utils/api";
import { formatCurrency } from "../utils/format";
import type { ParseResult } from "../utils/parser";

const cnItemRoot = "p-6 flex flex-col justify-center gap-1";
const cnTitle = "text-2xl font-semibold font-mono truncate";
const cnSubtitle = "text-sm text-base-content/50";

type ExpressionItemProps = {
  parsedResult: ParseResult;
  input: Accessor<string>;
};

function ExpressionItem(props: ExpressionItemProps) {
  const title = createMemo(() => {
    const p = props.parsedResult;
    if (p?.type === "error") return props.input();
    if (p?.type === "math") return p.expression;
    if (p?.type === "conversion") return formatCurrency(p.amount, p.from);
    return "";
  });

  const subtitle = createMemo(() => {
    const p = props.parsedResult;
    return p?.type === "conversion" ? p.from : undefined;
  });

  return (
    <div class={cnItemRoot}>
      <p class={cnTitle}>{title()}</p>
      <Show when={subtitle()}>
        <p class={cnSubtitle}>{subtitle()}</p>
      </Show>
    </div>
  );
}

type ResultItemProps = {
  parsedResult: ParseResult;
  convertResult: Resource<ConvertResult | null>;
};

function ResultItem(props: ResultItemProps) {
  const error = createMemo<string | undefined>(() => {
    const p = props.parsedResult;
    if (p?.type === "error") return p.message;
    if (p?.type === "conversion" && props.convertResult.error)
      return String(props.convertResult.error);
  });

  const loading = createMemo(
    () =>
      !error() &&
      props.parsedResult?.type === "conversion" &&
      (props.convertResult.loading || !props.convertResult()),
  );

  const title = createMemo(() => {
    const p = props.parsedResult;
    if (p?.type === "math") return String(p.result);
    if (p?.type === "conversion") {
      const res = props.convertResult();
      return res ? formatCurrency(res.result, p.to) : "";
    }
    return "";
  });

  const subtitle = createMemo<string | undefined>(() => {
    const p = props.parsedResult;
    return p?.type === "conversion" ? getCurrencyName(p.to) : undefined;
  });

  return (
    <div class={cnItemRoot}>
      <Show when={loading()}>
        <span class="loading loading-dots loading-md text-base-content/40" />
      </Show>
      <Show when={error()}>
        <p class="text-sm text-error truncate">{error()}</p>
      </Show>
      <Show when={!loading() && !error()}>
        <p classList={{ [cnTitle]: true, "text-success": true }}>{title()}</p>
        <Show when={subtitle()}>
          <p class={cnSubtitle}>{subtitle()}</p>
        </Show>
      </Show>
    </div>
  );
}

type ResultCardProps = {
  parsedResult: ParseResult;
  input: Accessor<string>;
  convertResult: Resource<ConvertResult | null>;
};

export function ResultCard(props: ResultCardProps) {
  return (
    <div class="card bg-base-200 w-full max-w-2xl mt-4">
      <div class="grid grid-cols-2 divide-x divide-base-300 h-28">
        <ExpressionItem parsedResult={props.parsedResult} input={props.input} />
        <ResultItem parsedResult={props.parsedResult} convertResult={props.convertResult} />
      </div>
    </div>
  );
}
