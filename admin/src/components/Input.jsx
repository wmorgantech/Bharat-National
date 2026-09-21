import React from "react";

export default function TextInput({
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error,
  rows,
}) {
  const isTextArea = rows !== undefined;

  return (
    <div>
      <label className="inline-flex items-start gap-2 text-sm text-slate-600 w-full">
        {icon && <span className="text-slate-500 pt-2">{icon}</span>}

        {isTextArea ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className="
              flex-1 border rounded-lg px-3 py-2
              text-slate-800 placeholder:text-slate-400
              border-slate-300 focus:ring-1 focus:ring-blue-500
              outline-none resize-none
            "
          />
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="
              flex-1 border rounded-lg px-3 py-2
              text-slate-800 placeholder:text-slate-400
              border-slate-300 focus:ring-1 focus:ring-blue-500
              outline-none
            "
          />
        )}
      </label>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
