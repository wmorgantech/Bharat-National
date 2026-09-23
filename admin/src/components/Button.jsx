import { Loader2 } from "lucide-react";

/**
 * Admin button. `variant` maps onto the shared button system in index.css so
 * the dashboard and the storefront share one set of states.
 */
const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
};

const SIZES = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export default function Button({
  children,
  type = "button",
  full,
  disabled,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = "",
  ...rest
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${variantClass} ${sizeClass} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="w-4 h-4" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
}
