// src/components/ProductGrid.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
  showTitle = true,
  sectionClassName = "",
  containerClassName = "",
  showViewAll = false,
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
    <section className={`section ${sectionClassName}`}>
      <div className={`section-shell ${containerClassName}`}>
        {showTitle && (
          <div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12"
            data-aos="fade-up"
          >
            <div>
              <span className="eyebrow">Catalogue</span>
              <h2 className="section-title mt-3">{title}</h2>
            </div>

            {showViewAll && products.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="btn-secondary btn-md self-start sm:self-auto shrink-0"
              >
                See all products
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 xl:gap-6 items-stretch">
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
