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
  image = null,
  imagePosition = "center center",
  heightClass = "min-h-[220px] md:min-h-[240px]",
}) => {
  const navigate = useNavigate();

  return (
    <section
      className={`relative isolate w-full overflow-hidden ${image ? "bg-ink-200" : "bg-ink-50/80"}`}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(10, 36, 33, 0.64) 0%, rgba(10, 36, 33, 0.42) 36%, rgba(10, 36, 33, 0.18) 62%, rgba(10, 36, 33, 0.08) 100%), url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: imagePosition,
            }
          : undefined
      }
    >
      <div className={`relative section-shell ${image ? `flex items-center py-4 ${heightClass}` : "py-5 md:py-6"}`}>
        <div className={`${image ? "max-w-[520px] pr-2 md:max-w-[560px]" : "max-w-xl"}`}>
          <nav aria-label="Breadcrumb">
            <ol className={`flex items-center gap-1.5 text-[10.5px] md:text-[11.5px] ${image ? "text-white" : "text-ink-500"}`}>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className={`inline-flex items-center gap-1.5 transition-colors ${image ? "text-white hover:text-white" : "text-ink-600 hover:text-primary"}`}
                >
                  <Home className={`h-3.5 w-3.5 ${image ? "text-white" : ""}`} />
                  <span>Home</span>
                </button>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className={`h-3.5 w-3.5 ${image ? "text-white/80" : "text-ink-400"}`} />
              </li>
              <li className={`font-medium ${image ? "text-white" : "text-primary"}`}>{currentLabel}</li>
            </ol>
          </nav>

          <div className="mt-2 min-w-0">
            <h1
              className={`font-display tracking-[-0.04em] ${image ? "text-[30px] font-bold leading-[0.96] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)] md:text-[40px] md:whitespace-nowrap" : "text-[28px] font-bold leading-[1.05] text-ink-900 md:text-[34px]"}`}
            >
              {title}
            </h1>
            {subtitle && (
              <p className={`mt-2 text-[14px] leading-relaxed ${image ? "text-white/90 md:text-[16px]" : "text-ink-600"}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHeroBreadcrumb;
