import React from "react";

// Shared field chrome. Kept in one place so every input, textarea and select
// across the cart, checkout and contact forms share the same shape and focus
// treatment.
const FIELD_BASE =
"w-full rounded-2xl border border-ink-200 bg-white  px-4 py-3.5 text-sm text-ink-900 " +
"placeholder:text-ink-500/60 outline-none transition-all duration-200 " +
"hover:border-ink-200 " +
"focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white " +
"disabled:bg-white disabled:text-ink-500 disabled:cursor-not-allowed";

const LABEL_BASE =
"flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 mb-2.5";

// Text input with label + optional icon
export function TextInput({ label, icon: Icon, className, ...inputProps }) {
  const finalClass = className ? `${FIELD_BASE} ${className}` : FIELD_BASE;

  return (
    <div>
      {label && (
        <label className={LABEL_BASE}>
          {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
          {label}
        </label>
      )}
      <input className={finalClass} {...inputProps} />
    </div>
  );
}

// Textarea with label + optional icon
export function TextArea({ label, icon: Icon, className, ...textareaProps }) {
  const base = `${FIELD_BASE} resize-none leading-relaxed`;
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <div>
      {label && (
        <label className={LABEL_BASE}>
          {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
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
  const base = `${FIELD_BASE} cursor-pointer`;
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <div>
      {label && (
        <label className={LABEL_BASE}>
          {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
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
  const base = "btn-primary btn-md w-full";
  const finalClass = className ? `${base} ${className}` : base;

  return (
    <button className={finalClass} {...buttonProps}>
      <span>{children}</span>
      {IconRight && <IconRight className="w-4 h-4" />}
    </button>
  );
}
