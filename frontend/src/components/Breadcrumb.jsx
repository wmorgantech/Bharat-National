import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Standard page header: breadcrumb, title, short description and optional
 * actions on a light band. One neutral treatment shared by every inner page.
 *
 * `bgColor` is still accepted so existing callers keep working, but it is no
 * longer rendered.
 */
const PageHeroBreadcrumb = ({
  title,
  currentLabel,
  subtitle = null,
  eyebrow = null,
  actions = null,
  // eslint-disable-next-line no-unused-vars
  bgColor = null,
}) => {
  const navigate = useNavigate();

  return (
    <section className="w-full border-b border-ink-200 bg-ink-50">
      <div className="section-shell py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-[13px] text-ink-500">
            <li>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
            </li>
            <li className="font-medium text-ink-800">{currentLabel}</li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}

            <h1 className={`font-display text-[26px] md:text-[34px] font-bold tracking-[-0.02em] leading-tight text-ink-900 ${eyebrow ? "mt-2" : ""}`}>
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-500">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </section>
  );
};

export default PageHeroBreadcrumb;
