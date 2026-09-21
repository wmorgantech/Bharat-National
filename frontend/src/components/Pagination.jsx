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
        "mt-6 flex flex-col items-center gap-3 text-xs md:text-sm text-slate-600 " +
        className
      }
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {/* Prev */}
        <button
          type="button"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          className={`h-8 px-2 rounded-md border flex items-center justify-center ${
            safePage === 1
              ? "text-slate-300 border-slate-200 cursor-not-allowed"
              : "text-slate-700 border-slate-300 hover:bg-slate-100"
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
              className={`h-8 min-w-[2rem] px-2 rounded-md border text-xs md:text-sm flex items-center justify-center ${
                active
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "text-slate-700 border-slate-300 hover:bg-slate-100"
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
          className={`h-8 px-2 rounded-md border flex items-center justify-center ${
            safePage === totalPages
              ? "text-slate-300 border-slate-200 cursor-not-allowed"
              : "text-slate-700 border-slate-300 hover:bg-slate-100"
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
