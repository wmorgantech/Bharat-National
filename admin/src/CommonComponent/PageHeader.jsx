import React from "react";

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: Icon,
  eyebrow,
  children,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className={`page-title ${eyebrow ? "mt-2" : ""}`}>{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {children}
        {actionLabel && (
          <button onClick={onAction} className="btn-primary btn-md">
            {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
