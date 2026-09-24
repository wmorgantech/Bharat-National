// src/components/CategoriesSlider.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Laptop,
  Monitor,
  Cpu,
  Keyboard,
  Network,
  Printer,
  HardDrive,
  Camera,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveCategories } from "../api/Category";
import laptopImg from "../assets/products/laptop.svg";
import desktopImg from "../assets/products/desktop.svg";
import monitorImg from "../assets/products/monitor.svg";
import routerImg from "../assets/products/router.svg";
import printerImg from "../assets/products/printer.svg";
import serverImg from "../assets/products/server.svg";
import storageImg from "../assets/products/storage.svg";
import cctvImg from "../assets/products/cctv.svg";
import accessoriesImg from "../assets/products/accessories.svg";

/** Local fallback artwork for a category with no stored image. */
const ART_RULES = [
  [/laptop|notebook/i, laptopImg],
  [/desktop|workstation|pc\b|computer/i, desktopImg],
  [/monitor|display|screen/i, monitorImg],
  [/network|router|switch|lan|wifi|firewall/i, routerImg],
  [/print|scanner|toner/i, printerImg],
  [/server|rack/i, serverImg],
  [/storage|nas|drive|hdd|ssd/i, storageImg],
  [/cctv|camera|surveill|security/i, cctvImg],
  [/accessor|keyboard|mouse|periph|component/i, accessoriesImg],
];

const artFor = (name = "") => {
  const hit = ART_RULES.find(([re]) => re.test(name));
  return hit ? hit[1] : accessoriesImg;
};

/**
 * Picks an icon from the category's own name. Purely presentational - the
 * name, image and description all come from the API, nothing is invented.
 */
const ICON_RULES = [
  [/laptop|notebook/i, Laptop],
  [/desktop|pc|workstation|computer/i, Monitor],
  [/component|processor|cpu|ram|motherboard/i, Cpu],
  [/accessor|keyboard|mouse|periph/i, Keyboard],
  [/network|router|switch|lan|wifi/i, Network],
  [/print|scanner|toner/i, Printer],
  [/server|storage|nas|drive/i, HardDrive],
  [/cctv|camera|surveill/i, Camera],
  [/security|firewall|antivirus/i, ShieldCheck],
];

const iconFor = (name = "") => {
  const hit = ICON_RULES.find(([re]) => re.test(name));
  return hit ? hit[1] : Package;
};

// Shared section chrome so the loading / empty / loaded states all sit in the
// same frame instead of each rendering their own heading.
function CategoriesShell({ children, actions = null }) {
  return (
    <section className="pt-7 md:pt-10">
      <div className="section-shell">
        {/* Compact storefront section header: title left, VIEW ALL right. */}
        <div className="mb-5 flex items-center justify-between gap-4" data-aos="fade-up">
          <h2 className="section-heading">Popular Categories</h2>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="text-[12px] font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:text-primary-dark"
            >
              View All
            </Link>
            {actions}
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}

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
      <CategoriesShell>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-ink-200 overflow-hidden">
              <div className="aspect-[4/5] skeleton rounded-none" />
            </div>
          ))}
        </div>
      </CategoriesShell>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <CategoriesShell>
        <div className="state-panel">
          <span className="grid place-items-center h-14 w-14 mx-auto rounded-2xl bg-primary/10 text-primary">
            <Package className="w-6 h-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink-900">
            No categories available yet
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Categories appear here once they are published.
          </p>
        </div>
      </CategoriesShell>
    );
  }

  const arrowBase =
"h-11 w-11 grid place-items-center rounded-full border transition-all duration-200";

  return (
    <CategoriesShell
      actions={
        <div className="hidden sm:flex items-center gap-2 shrink-0 pb-1">
          <button
            onClick={handlePrev}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className={`${arrowBase} ${
 canScrollLeft
 ? "border-ink-200 text-ink-900 hover:bg-primary hover:text-ink-900 hover:border-primary"
 : "border-ink-200 text-ink-400 cursor-not-allowed"
 }`}
          >
            <ChevronLeft size={19} />
          </button>
          <button
            onClick={handleNext}
            disabled={!canScrollRight}
            aria-label="Next categories"
            className={`${arrowBase} ${
 canScrollRight
 ? "border-ink-200 text-ink-900 hover:bg-primary hover:text-ink-900 hover:border-primary"
 : "border-ink-200 text-ink-400 cursor-not-allowed"
 }`}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      }
    >
      {/* The reveal sits on this row rather than on each card: the carousel
          remounts cards when paging, and per-card AOS would leave freshly
          mounted cards hidden until the next scroll event. */}
      <div
        data-aos="fade-up"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5"
      >
        {categories.slice(index, index + visible).map((cat, i) => {
          const Icon = iconFor(cat.name);
          return (
            <article
              key={cat.id ?? i}
              onClick={() =>
                navigate(`/category/${cat.id}/products`, {
                  state: { category: cat },
                })
              }
              className="group cursor-pointer"
            >
              {/* Soft grey plate holding the product image, as in the
                  reference. A category with no stored image falls back to a
                  local illustration rather than a third-party placeholder. */}
              <div className="relative overflow-hidden rounded-2xl bg-ink-100 transition-colors duration-200 group-hover:bg-ink-200/70">
                <div className="aspect-square w-full">
                  <img
                    src={cat.imageUrl || cat.image || artFor(cat.name)}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = artFor(cat.name);
                    }}
                  />
                </div>

                <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-ink-600 transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Icon size={15} />
                </span>
              </div>

              <h3 className="mt-3 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-800 transition-colors duration-200 group-hover:text-primary">
                {cat.name}
              </h3>
            </article>
          );
        })}
      </div>

      {/* Mobile paging sits under the rail where the arrows are hidden. */}
      <div className="mt-8 flex sm:hidden items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={!canScrollLeft}
          aria-label="Previous categories"
          className={`${arrowBase} ${
 canScrollLeft
 ? "border-ink-200 text-ink-900"
 : "border-ink-200 text-ink-400 cursor-not-allowed"
 }`}
        >
          <ChevronLeft size={19} />
        </button>
        <button
          onClick={handleNext}
          disabled={!canScrollRight}
          aria-label="Next categories"
          className={`${arrowBase} ${
 canScrollRight
 ? "border-ink-200 text-ink-900"
 : "border-ink-200 text-ink-400 cursor-not-allowed"
 }`}
        >
          <ChevronRight size={19} />
        </button>
      </div>
    </CategoriesShell>
  );
}
