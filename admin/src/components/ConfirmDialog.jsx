import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, Info } from "lucide-react";

/**
 * Replaces window.confirm(). Same decision, but keyboard accessible, themed,
 * and non-blocking.
 */
const TONES = {
  danger: {
    Icon: Trash2,
    chip: "bg-red-50 text-red-600",
    confirm: "btn-danger",
  },
  warning: {
    Icon: AlertTriangle,
    chip: "bg-amber-50 text-amber-600",
    confirm: "btn-primary",
  },
  info: {
    Icon: Info,
    chip: "bg-primary/10 text-primary",
    confirm: "btn-primary",
  },
};

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const { Icon, chip, confirm } = TONES[tone] || TONES.danger;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4
                 bg-ink-900/60 backdrop-blur-sm
                 motion-safe:animate-[fadeIn_180ms_ease-out_both]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lift border border-ink-100 p-6
                   motion-safe:animate-[scaleIn_200ms_ease-out_both]"
      >
        <span className={`grid place-items-center h-12 w-12 rounded-2xl ${chip}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>

        <h2 className="mt-5 text-base font-semibold tracking-tight text-ink-900">
          {title}
        </h2>

        {message && (
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{message}</p>
        )}

        <div className="mt-7 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary btn-sm flex-1"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${confirm} btn-sm flex-1`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
