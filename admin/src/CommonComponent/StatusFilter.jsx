import React from "react";

export default function StatusFilter({
  checked,
  onChange,
  label = "Show inactive",
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="
          rounded border-slate-300
          focus:ring-1 focus:ring-blue]
          focus:ring-offset-1
        "
      />
      <span>{label}</span>
    </label>
  );
}
