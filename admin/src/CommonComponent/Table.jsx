import React from "react";
import { Inbox, AlertCircle, RefreshCw } from "lucide-react";

/**
 * Shared admin table.
 *
 * Existing callers pass { columns, data, loading, emptyText } and keep working.
 * `error` / `onRetry` are optional so a network failure can be shown as a
 * failure instead of masquerading as an empty result.
 */
export default function DataTable({
  columns, // [{ key, label, render?, align? }]
  data = [],
  loading,
  emptyText = "No data found",
  emptyHint,
  emptyIcon,
  error = null,
  onRetry,
  skeletonRows = 6,
}) {
  // Assigned as a variable rather than destructured: this eslint config
  // exempts unused *variables* matching /^[A-Z_]/, but not parameters, and
  // JSX-only usage is not counted as a read.
  const EmptyIcon = emptyIcon || Inbox;
  const colCount = columns.length;

  return (
    <div className="surface overflow-hidden">
      {/* Horizontal scroll keeps every action reachable on narrow screens
          rather than hiding columns. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="bg-ink-50/80 border-b border-ink-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`tbl-head ${col.align === "right" ? "text-right" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-ink-100">
            {loading &&
              Array.from({ length: skeletonRows }).map((_, r) => (
                <tr key={`sk-${r}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="tbl-cell">
                      <span
                        className="skeleton block h-4"
                        style={{ width: `${45 + ((r + col.key.length) % 4) * 14}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={colCount} className="px-4 py-16">
                  <div className="flex flex-col items-center text-center">
                    <span className="grid place-items-center h-14 w-14 rounded-2xl bg-red-50 text-red-600">
                      <AlertCircle className="w-6 h-6" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-ink-900">
                      Could not load this data
                    </p>
                    <p className="mt-1 text-sm text-ink-500 max-w-sm">
                      {typeof error === "string" ? error : "Something went wrong."}
                    </p>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="btn-secondary btn-sm mt-5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-4 py-16">
                  <div className="flex flex-col items-center text-center">
                    <span className="grid place-items-center h-14 w-14 rounded-2xl bg-ink-50 text-ink-500">
                      <EmptyIcon className="w-6 h-6" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-ink-900">
                      {emptyText}
                    </p>
                    {emptyHint && (
                      <p className="mt-1 text-sm text-ink-500 max-w-sm">{emptyHint}</p>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="transition-colors duration-150 hover:bg-primary/[0.04]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`tbl-cell ${col.align === "right" ? "text-right" : ""}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
