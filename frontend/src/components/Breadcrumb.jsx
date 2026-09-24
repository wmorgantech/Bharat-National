import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Standard compact page header shared by the storefront's inner pages.
 *
 * `bgColor` is still accepted so existing callers keep working, but it is no
 * longer rendered.
 */
const PageHeroBreadcrumb = ({
  title,
  currentLabel,
  subtitle = null,
  // eslint-disable-next-line no-unused-vars
  bgColor = null,
}) => {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[168px] w-full items-stretch border-b border-ink-200 bg-ink-50 md:min-h-[171px]">
      <div className="section-shell py-6 md:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-ink-500">
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
            <li className="font-medium text-primary">{currentLabel}</li>
          </ol>
        </nav>

        <div className="mt-3 min-w-0 max-w-2xl">
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink-900 md:text-[34px]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-500 md:text-[15px]">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
};

export default PageHeroBreadcrumb;
