import React from "react";

/**
 * Shared admin field. Presentation only - callers keep owning value/onChange
 * and their own validation.
 *
 * The `showToggle` / `toggleState` / `onToggle` props were already being passed
 * in by the admin login form but were previously ignored, so the password
 * reveal button never rendered. They are handled here now.
 */
export default function TextInput({
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error,
  rows,
  label,
  hint,
  showToggle = false,
  toggleState = false,
  onToggle,
  toggleIconOn,
  toggleIconOff,
  ...rest
}) {
  const isTextArea = rows !== undefined;
  const hasToggle = showToggle && !isTextArea && typeof onToggle === "function";

  const fieldClass = [
    "field",
    error ? "field-error" : "",
    icon && !isTextArea ? "pl-10" : "",
    hasToggle ? "pr-11" : "",
    isTextArea ? "resize-none leading-relaxed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const describedBy = error
    ? `${name}-error`
    : hint
    ? `${name}-hint`
    : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={name} className="field-label">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && !isTextArea && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 [&>svg]:w-4 [&>svg]:h-4"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {isTextArea ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={fieldClass}
            {...rest}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={fieldClass}
            {...rest}
          />
        )}

        {hasToggle && (
          <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            aria-label={toggleState ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-lg text-ink-500 hover:text-primary hover:bg-ink-50 transition-colors [&>svg]:w-4 [&>svg]:h-4"
          >
            {toggleState ? toggleIconOn : toggleIconOff}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${name}-error`} className="field-msg-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
