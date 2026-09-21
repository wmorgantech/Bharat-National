import React from "react";
import { X } from "lucide-react";

export default function ViewModal({
  open,
  onClose,
  title = "Details",
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-slate-100">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onClose}
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}
