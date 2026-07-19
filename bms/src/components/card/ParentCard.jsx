/**
 * Generic bordered card section with a small uppercase title/header row
 * and a responsive grid for child cards (e.g. summary metrics).
 *
 * <ParentCard title="July Summary">
 *   <ChildCard label="Income" value={1000} tone="positive" />
 *   <ChildCard label="Expenses" value={500} tone="negative" />
 * </ParentCard>
 */
export default function ParentCard({
  title,
  action,
  children,
  columns = "grid-cols-2 sm:grid-cols-4",
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 ${className}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {title}
        </h3>
        {action}
      </div>
      <div className={`grid gap-3 ${columns}`}>{children}</div>
    </div>
  );
}