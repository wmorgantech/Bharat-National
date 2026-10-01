// src/components/HomeCategoryStrip.jsx
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export default function HomeCategoryStrip() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getActiveCategories();
        const list = res?.data ?? res ?? [];
        if (!cancelled) setCategories(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="section-shell pt-6 md:pt-8">
      <div className="mb-3 flex items-center justify-between gap-4 md:mb-4" data-aos="fade-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[20px] font-bold leading-tight text-ink-900 md:text-[26px]">
              Shop by category
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary transition-colors hover:text-primary-dark"
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[20px] border border-ink-200 bg-white p-3 shadow-card"
              >
                <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton h-3 w-4/5" />
                  <div className="skeleton mt-2 h-2.5 w-3/5" />
                </div>
              </div>
            ))
          : categories.map((cat, index) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  navigate(`/category/${cat.id}/products`, {
                    state: { category: cat },
                  })
                }
                data-aos="fade-up"
                data-aos-delay={Math.min(index, 5) * 80}
                className="group flex items-center gap-2.5 rounded-xl border border-ink-200 bg-white p-2.5 text-left shadow-card transition-all duration-250 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover sm:gap-3 sm:p-3"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F2FAF8] ring-1 ring-primary/10 transition-all duration-250 group-hover:bg-[#E7F7F3]">
                  <img
                    src={cat.imageUrl || artFor(cat.name)}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = artFor(cat.name);
                    }}
                  />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink-900">
                    {cat.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-primary">
                    Shop Now
                    <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            ))}
      </div>
    </section>
  );
}
