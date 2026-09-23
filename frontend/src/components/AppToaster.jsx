import React from "react";
import { ToastContainer, Slide } from "react-toastify";
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

/**
 * The single notification surface for the storefront.
 *
 * Toastify is the only notification library in the project - modals are
 * reserved for confirmations and for the post-purchase confirmation screen,
 * never for reporting the result of an action that already toasts.
 */
const ICONS = {
  success: <CheckCircle2 className="w-[18px] h-[18px] text-primary"strokeWidth={2.2} />,
  error: <XCircle className="w-[18px] h-[18px] text-red-500"strokeWidth={2.2} />,
  warning: <AlertTriangle className="w-[18px] h-[18px] text-amber-500"strokeWidth={2.2} />,
  info: <Info className="w-[18px] h-[18px] text-primary-light"strokeWidth={2.2} />,
  default: <Info className="w-[18px] h-[18px] text-ink-500"strokeWidth={2.2} />,
};

function toastIcon({ type }) {
  if (type === "loading") {
    return <Loader2 className="w-[18px] h-[18px] animate-spin text-primary" />;
  }
  return ICONS[type] || ICONS.default;
}

export default function AppToaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      limit={3}
      theme="light"
      transition={Slide}
      icon={toastIcon}
      toastClassName="bnc-toast"
      closeButton={false}
    />
  );
}
