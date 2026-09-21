export default function Button({
  children,
  type = "button",
  full,
  disabled,
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition ${
        full ? "w-full" : ""
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
