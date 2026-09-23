// src/components/Pagination.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null; // nothing to paginate

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div
      className={
"mt-10 flex flex-col items-center gap-3 text-xs md:text-sm text-ink-500 " +
        className
      }
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {/* Prev */}
        <button
          type="button"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Previous page"
          className={`h-10 w-10 rounded-full border grid place-items-center transition-all duration-200 ${
 safePage === 1
 ? "text-ink-400 border-ink-200 cursor-not-allowed"
 : "text-ink-900 border-ink-200 hover:bg-primary hover:text-ink-900 hover:border-primary"
 }`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          const active = page === safePage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-current={active ? "page" : undefined}
              className={`h-10 min-w-[2.5rem] px-3 rounded-full border text-[13px] font-semibold grid place-items-center transition-all duration-200 ${
 active
 ? "bg-primary text-ink-900 border-primary shadow-glow"
 : "text-ink-700 border-ink-200 hover:border-primary hover:text-primary"
 }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label="Next page"
          className={`h-10 w-10 rounded-full border grid place-items-center transition-all duration-200 ${
 safePage === totalPages
 ? "text-ink-400 border-ink-200 cursor-not-allowed"
 : "text-ink-900 border-ink-200 hover:bg-primary hover:text-ink-900 hover:border-primary"
 }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
