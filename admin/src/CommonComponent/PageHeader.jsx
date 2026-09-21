import React from "react";

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: Icon,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          {Icon && <Icon className="w-4 h-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
