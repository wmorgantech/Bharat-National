import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function ViewModal({
  open,
  onClose,
  title = "Details",
  children,
  size = "md",
}) {
  const panelRef = useRef(null);

  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-ink-900/60 backdrop-blur-sm
                 motion-safe:animate-[fadeIn_180ms_ease-out_both]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widths[size] || widths.md}
                    max-h-[90vh] overflow-y-auto
                    bg-white rounded-2xl shadow-lift border border-ink-100
                    outline-none
                    motion-safe:animate-[scaleIn_200ms_ease-out_both]`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-ink-100 bg-white/95 backdrop-blur-sm rounded-t-2xl">
          <h2 className="text-base font-semibold tracking-tight text-ink-900">
            {title}
          </h2>
          <button
            className="btn-icon shrink-0"
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
