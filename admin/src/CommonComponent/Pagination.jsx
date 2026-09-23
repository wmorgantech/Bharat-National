import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const arrow =
    "grid place-items-center h-9 w-9 rounded-lg border transition-all duration-200";

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center gap-1.5 mt-6"
    >
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
        className={`${arrow} ${
          page === 1
            ? "border-ink-100 text-ink-200 cursor-not-allowed"
            : "border-ink-200 text-ink-900 hover:bg-primary hover:text-white hover:border-primary"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={page === p ? "page" : undefined}
          className={`h-9 min-w-[2.25rem] px-2.5 rounded-lg border text-[13px] font-semibold tabular-nums transition-all duration-200 ${
            page === p
              ? "bg-primary text-white border-primary shadow-glow"
              : "bg-white text-ink-600 border-ink-200 hover:border-primary hover:text-primary"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
        className={`${arrow} ${
          page === totalPages
            ? "border-ink-100 text-ink-200 cursor-not-allowed"
            : "border-ink-200 text-ink-900 hover:bg-primary hover:text-white hover:border-primary"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
