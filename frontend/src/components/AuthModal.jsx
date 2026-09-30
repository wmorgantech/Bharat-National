// src/components/AuthModal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Logo from "../assets/logo.jpeg";

/**
 * Shared shell for the Login and Signup screens.
 *
 * Presentation only - it holds no auth state and performs no navigation of its
 * own; `onClose` is whatever the page already used for its Back control.
 *
 * Header and Footer are rendered outside <Routes> in App.jsx, so they stay on
 * screen underneath this scrim. That is deliberate: the blur is over the real
 * site rather than a painted-on backdrop.
 *
 * Rendered through a portal onto <body>, and that is not optional. Routes are
 * wrapped in `<main class="page-enter">`, whose pageIn animation uses
 * `animation-fill-mode: both` and so leaves an identity transform matrix on the
 * element for good. Any transform - even an identity one - makes that <main>
 * the containing block for `position: fixed` descendants, and because the only
 * child here is out of flow the <main> collapses to zero height. Rendered
 * in place, `fixed inset-0` would resolve to a ~32px sliver at the footer
 * instead of the viewport.
 */
export default function AuthModal({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  footer,
}) {
  // Escape closes, and the page behind must not scroll while this is open.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9000] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      {/* Scrim - the live page stays visible, dimmed and blurred behind it. */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="anim-overlay absolute inset-0 cursor-default bg-ink-900/55 backdrop-blur-[6px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="anim-modal-card relative my-auto w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-[0_28px_70px_-16px_rgba(15,23,42,0.40)] sm:p-9"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-all duration-200 hover:rotate-90 hover:bg-ink-50 hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <X size={16} />
        </button>

        <div className="text-center">
          <span className="anim-logo mx-auto grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-ink-200 bg-white">
            <img
              src={Logo}
              alt=""
              aria-hidden="true"
              className="h-[85%] w-[85%] object-contain"
            />
          </span>

          {eyebrow && <span className="eyebrow mt-5">{eyebrow}</span>}

          <h1 className="mt-2 font-display text-[24px] font-bold tracking-[-0.02em] text-ink-900 sm:text-[27px]">
            {title}
          </h1>

          {subtitle && (
            <p className="mx-auto mt-2 max-w-[30ch] text-[13.5px] leading-relaxed text-ink-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-7">{children}</div>

        {footer && (
          <div className="mt-6 border-t border-ink-100 pt-5 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
