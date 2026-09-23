import React from "react";

/**
 * Toggle switch. Replaces a checkbox whose focus ring class was malformed
 * ("focus:ring-blue]"), so it never rendered a focus state at all.
 */
export default function StatusFilter({
  checked,
  onChange,
  label = "Show inactive",
}) {
  return (
    <label className="inline-flex items-center gap-2.5 text-sm text-ink-600 cursor-pointer select-none group">
      <span className="relative inline-flex">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="block h-5 w-9 rounded-full bg-ink-200 transition-colors duration-200
                     peer-checked:bg-primary
                     peer-focus-visible:ring-2 peer-focus-visible:ring-primary
                     peer-focus-visible:ring-offset-2"
        />
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm
                     transition-transform duration-200 peer-checked:translate-x-4"
        />
      </span>
      <span className="font-medium group-hover:text-ink-900 transition-colors">
        {label}
      </span>
    </label>
  );
}
