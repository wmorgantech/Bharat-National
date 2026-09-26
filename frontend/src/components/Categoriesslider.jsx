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

function CategoriesShell({ children, actions = null }) {
  return (
    <section className="pt-7 md:pt-10">
      <div className="section-shell">
        <div className="mb-5 flex items-center justify-between gap-4" data-aos="fade-up">
          <div>
            <span className="eyebrow">Popular categories</span>
            <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[32px]">
              Technology for every business need
            </h2>
          </div>

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
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setVisible(2);
      else if (w < 1024) setVisible(3);
      else setVisible(6);
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[22px] border border-ink-200 bg-white">
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
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <Package className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink-900">No categories available yet</p>
          <p className="mt-1 text-sm text-ink-500">Categories appear here once they are published.</p>
        </div>
      </CategoriesShell>
    );
  }

  const arrowBase = "h-11 w-11 grid place-items-center rounded-full border transition-all duration-200";

  return (
    <CategoriesShell
      actions={
        <div className="hidden items-center gap-2 pb-1 sm:flex shrink-0">
          <button
            onClick={handlePrev}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className={`${arrowBase} ${
              canScrollLeft
                ? "border-ink-200 text-ink-900 hover:border-primary hover:bg-primary hover:text-white"
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
                ? "border-ink-200 text-ink-900 hover:border-primary hover:bg-primary hover:text-white"
                : "border-ink-200 text-ink-400 cursor-not-allowed"
            }`}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      }
    >
      <div data-aos="fade-up" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-5">
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
              className="group cursor-pointer rounded-[22px] border border-ink-200 bg-white p-2.5 shadow-card transition-all duration-250 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover"
            >
              <div className="relative overflow-hidden rounded-[18px] border border-ink-200 bg-[#f7faf9] transition-all duration-250 group-hover:border-primary/30 group-hover:bg-[#edf9f6]">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={cat.imageUrl || cat.image || artFor(cat.name)}
                    alt={cat.name}
                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.08] sm:p-5"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = artFor(cat.name);
                    }}
                  />
                </div>

                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-sm transition-all duration-200 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white">
                  <Icon size={14} />
                </span>
              </div>

              <div className="mt-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary/80">
                    Collection
                  </p>
                  <h3 className="mt-1 truncate text-[15px] font-semibold text-ink-900">
                    {cat.name}
                  </h3>
                </div>
                <span className="rounded-full border border-ink-200 bg-ink-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                  Shop
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </CategoriesShell>
  );
}
