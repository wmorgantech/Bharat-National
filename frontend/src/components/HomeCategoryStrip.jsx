// src/components/HomeCategoryStrip.jsx
import React, { useEffect, useState } from "react";
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

/**
 * Compact "shop by category" rail under the banner.
 *
 * Categories come from the existing public endpoint. A category's own
 * `imageUrl` is used whenever the API provides one; the local illustrations
 * below are only a fallback so a category without artwork still renders as a
 * proper tile instead of a broken image.
 */
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

  // Nothing to show and nothing loading: render nothing rather than an
  // empty frame.
  if (!loading && categories.length === 0) return null;

  return (
    <section className="section-shell pt-3 md:pt-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3"
              >
                <div className="skeleton h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton h-3 w-4/5" />
                  <div className="skeleton mt-2 h-2.5 w-3/5" />
                </div>
              </div>
            ))
          : categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  navigate(`/category/${cat.id}/products`, {
                    state: { category: cat },
                  })
                }
                className="group flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-card"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-50">
                  <img
                    src={cat.imageUrl || artFor(cat.name)}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // A category whose stored image 404s still gets a tile.
                      e.currentTarget.src = artFor(cat.name);
                    }}
                  />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink-900">
                    {cat.name}
                  </span>
                  <span className="block text-[11.5px] text-primary">
                    Shop Now
                  </span>
                </span>
              </button>
            ))}
      </div>
    </section>
  );
}
