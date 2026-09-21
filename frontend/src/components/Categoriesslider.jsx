// src/components/CategoriesSlider.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getActiveCategories } from "../api/Category";

export default function CategoriesSlider() {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ responsive visible count
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;

      // Mobile: 2
      if (w < 640) setVisible(2); // <sm
      // Tablet: 3
      else if (w < 1024) setVisible(3); // sm..md/ small laptop
      // Desktop: 6
      else setVisible(6); // lg+
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getActiveCategories();
        const list = data?.data ?? data;
        setCategories(list || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // ✅ if visible changes, keep index valid
  useEffect(() => {
    const maxIndex = Math.max(categories.length - visible, 0);
    if (index > maxIndex) setIndex(maxIndex);
  }, [visible, categories.length, index]);

  const maxIndex = useMemo(
    () => Math.max(categories.length - visible, 0),
    [categories.length, visible]
  );

  const canScrollLeft = index > 0;
  const canScrollRight = index < maxIndex;

  const handleNext = () => {
    if (canScrollRight) setIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (canScrollLeft) setIndex((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="w-full py-10 bg-white">
        <h2 className="text-center text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
          Our Categories
        </h2>
        <p className="text-center text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="w-full py-10 bg-white">
        <h2 className="text-center text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
          Our Categories
        </h2>
        <p className="text-center text-sm text-gray-500">
          No categories available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-10 bg-white">
      <h2 className="text-center text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">
        Our Categories
      </h2>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-10">
        {/* LEFT BTN (✅ mobile also) */}
        <button
          onClick={handlePrev}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200 p-2 sm:p-3 rounded-full shadow
            ${
              !canScrollLeft
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-300"
            }`}
          aria-label="Previous categories"
        >
          <ChevronLeft size={22} />
        </button>

        {/* RIGHT BTN (✅ mobile also) */}
        <button
          onClick={handleNext}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-200 p-2 sm:p-3 rounded-full shadow
            ${
              !canScrollRight
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-300"
            }`}
          aria-label="Next categories"
        >
          <ChevronRight size={22} />
        </button>

        {/* ✅ no overflow: only render visible items + responsive sizes */}
        <div className="mx-10 sm:mx-12 flex gap-4 sm:gap-6 justify-center">
          {categories.slice(index, index + visible).map((cat, i) => (
            <div
              key={cat.id ?? i}
              className="group flex flex-col items-center cursor-pointer w-[140px] sm:w-[170px] md:w-[180px]"
              onClick={() =>
                navigate(`/category/${cat.id}/products`, {
                  state: { category: cat },
                })
              }
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md bg-white transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 group-hover:shadow-xl">
                <img
                  src={
                    cat.imageUrl ||
                    cat.image ||
                    "https://via.placeholder.com/150?text=Category"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <p className="mt-2 sm:mt-3 font-semibold text-center text-xs sm:text-sm text-gray-700 group-hover:text-black transition-all duration-300 line-clamp-2">
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
