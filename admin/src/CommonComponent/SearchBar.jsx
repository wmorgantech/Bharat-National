import React from "react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full sm:max-w-md px-3 py-2 rounded-lg text-sm
        bg-white border border-[var(--primary)]/40
        focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
        focus:ring-offset-2 focus:ring-offset-white
      "
    />
  );
}
