// src/components/ProductGrid.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import ProductCard from "./ProductCard";

// Reveal delay per card, capped so a long grid never leaves the last cards
// waiting several seconds before they appear.
const STAGGER_STEP_MS = 120;
const MAX_STAGGER_STEPS = 5;

const getCols = (w) => {
  // Must match your Tailwind grid cols:
  // grid-cols-2, md:grid-cols-3, lg:grid-cols-4, xl:grid-cols-5
  if (w >= 1280) return 5; // xl
  if (w >= 1024) return 4; // lg
  if (w >= 768) return 3; // md
  return 2; // base/sm
};

const ProductGrid = ({
  products = [],
  title = "Products",
  eyebrow = "Catalogue",
  supportingText = "",
  showTitle = true,
  sectionClassName = "",
  containerClassName = "",
  showViewAll = false,
  gridClassName = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
}) => {
  const navigate = useNavigate();
  const [cols, setCols] = useState(getCols(window.innerWidth));

  useEffect(() => {
    const onResize = () => setCols(getCols(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Paging swaps the rendered cards for brand new DOM nodes. AOS only knows
  // about elements collected at init, so without this the next page of
  // products would mount at opacity 0 and stay invisible until a scroll.
  useEffect(() => {
    AOS.refreshHard();
  }, [products]);

  const placeholders = useMemo(() => {
    if (!products?.length) return [];
    const remainder = products.length % cols;
    const emptySlots = remainder === 0 ? 0 : cols - remainder;
    return Array(emptySlots).fill(null);
  }, [products, cols]);

  return (
    <section className={`pt-10 md:pt-14 ${sectionClassName}`}>
      <div className={`section-shell ${containerClassName}`}>
        {showTitle && (
          <div className="mb-6 md:mb-8" data-aos="fade-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h2 className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[30px] lg:text-[34px]">
                  {title}
                </h2>
                {supportingText && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 md:text-[15px]">
                    {supportingText}
                  </p>
                )}
              </div>

              {showViewAll && products.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:text-primary-dark"
                >
                  View All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className={`grid ${gridClassName} gap-3 md:gap-5 xl:gap-6 items-stretch`}>
          {products.map((p, i) => (
            <div
              key={p.id}
              data-aos="fade-up"
              data-aos-delay={Math.min(i, MAX_STAGGER_STEPS) * STAGGER_STEP_MS}
              className="h-full"
            >
              <ProductCard product={p} />
            </div>
          ))}

          {placeholders.map((_, i) => (
            <div key={`ph-${i}`} className="hidden xl:block bg-transparent" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
