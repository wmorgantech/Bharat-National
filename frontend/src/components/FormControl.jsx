
import React from "react";

// Text input with label + optional icon
export function TextInput({ label, icon: Icon, className, ...inputProps }) {
  const base =
    "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-1 focus:ring-[var(--primary)]";
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          {label}
        </label>
      )}
      <input className={finalClass} {...inputProps} />
    </div>
  );
}

// Textarea with label + optional icon
export function TextArea({ label, icon: Icon, className, ...textareaProps }) {
  const base =
    "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-1 focus:ring-[var(--primary)] resize-none";
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          {label}
        </label>
      )}
      <textarea className={finalClass} {...textareaProps} />
    </div>
  );
}

// Select with label + optional icon
export function SelectInput({
  label,
  icon: Icon,
  className,
  children,
  ...selectProps
}) {
  const base =
    "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-1 focus:ring-[var(--primary)]";
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          {label}
        </label>
      )}
      <select className={finalClass} {...selectProps}>
        {children}
      </select>
    </div>
  );
}

// Primary button (full width by default)
export function PrimaryButton({
  children,
  iconRight: IconRight,
  className,
  ...buttonProps
}) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] transition";
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <button className={finalClass} {...buttonProps}>
      <span>{children}</span>
      {IconRight && <IconRight className="w-4 h-4" />}
    </button>
  );
}
