// src/components/ProductGrid.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

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

  const placeholders = useMemo(() => {
    if (!products?.length) return [];
    const remainder = products.length % cols;
    const emptySlots = remainder === 0 ? 0 : cols - remainder;
    return Array(emptySlots).fill(null);
  }, [products, cols]);

  return (
    <section className={`py-8 md:py-12 bg-gray-50 ${sectionClassName}`}>
      <div className={`container mx-auto px-4 ${containerClassName}`}>
        {showTitle && (
          <div className="mb-6 md:mb-8 text-center relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
              {title}
            </h2>

            {showViewAll && products.length > 0 && (
              <>
                {/* Desktop */}
                <span
                  onClick={() => navigate("/products")}
                  className="hidden md:inline-block absolute right-0 top-1/2 -translate-y-1/2
                    text-sm font-medium text-black cursor-pointer
                    hover:text-[var(--primary)] hover:underline"
                >
                  See all products
                </span>

                {/* Mobile */}
                <div className="mt-1 md:hidden">
                  <span
                    onClick={() => navigate("/products")}
                    className="text-sm font-medium text-[var(--primary)] cursor-pointer hover:underline"
                  >
                    See all products
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 xl:gap-8 items-stretch">
          {products.map((p) => (
            <div key={p.id} className="h-full">
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
