import AnimatedNumber from "./AnimatedNumber";

const TONE_CLASSES = {
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
  neutral: "text-blue-600 dark:text-blue-400",
  muted: "text-slate-500 dark:text-slate-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
};

/**
 * Single metric tile used inside a ParentCard.
 *
 * - Pass `currency` (default true) to auto-format `value` as ₱ currency,
 *   animated with an odometer roll while `loading` is true.
 * - Pass `currency={false}` for non-money numeric metrics like counts —
 *   these still animate, just with no ₱ prefix and no decimals.
 * - If `value` isn't a finite number (e.g. a string/node), it's rendered
 *   as-is with no animation.
 * - `tone` picks the value color explicitly:
 *   "positive" | "negative" | "neutral" | "muted" | "indigo".
 *   If omitted, falls back to green/red based on whether `value` is >= 0.
 * - `loading`: while true, the number spins like an odometer; once false,
 *   it eases smoothly into the real value.
 */
export default function ChildCard({ label, value, tone, currency = true, loading = false }) {
  const resolvedTone =
    TONE_CLASSES[tone] ??
    (value >= 0 ? TONE_CLASSES.positive : TONE_CLASSES.negative);

  const isNumeric = typeof value === "number" && Number.isFinite(value);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${resolvedTone}`}>
        {isNumeric ? (
          <AnimatedNumber
            value={value}
            loading={loading}
            prefix={currency ? "₱" : ""}
            decimals={currency ? 2 : 0}
          />
        ) : (
          value
        )}
      </p>
    </div>
  );
}