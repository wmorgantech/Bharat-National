import React, { useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, PackageOpen, AlertCircle, RefreshCw } from "lucide-react";
import { getActiveProducts } from "../api/Product";
import ProductGrid from "../components/ProductGrid";

import Pagination from "../components/Pagination";
import PageHeroBreadcrumb from "../components/Breadcrumb";

const PAGE_SIZE = 10;

// Sorting runs entirely over the list the API already returned - no extra
// requests and no change to the product API.
const SORTS = [
  { key: "default", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name-asc", label: "Name: A–Z" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getActiveProducts();
      const list = res?.data ?? res ?? [];
      setProducts(list);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("We could not load the catalogue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Search + sort, derived from the fetched list.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = !q
      ? products
      : products.filter((p) => {
          const name = String(p.name || "").toLowerCase();
          const brand = String(p.brand?.name || p.brandName || "").toLowerCase();
          const cat = String(p.category?.name || p.categoryName || "").toLowerCase();
          return name.includes(q) || brand.includes(q) || cat.includes(q);
        });

    if (sort !== "default") {
      list = [...list].sort((a, b) => {
        if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
        if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
    }
    return list;
  }, [products, query, sort]);

  // Any change to the result set returns to the first page.
  useEffect(() => {
    setCurrentPage(1);
  }, [query, sort]);

  const totalProducts = visible.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageProducts = visible.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen">
      <PageHeroBreadcrumb
        eyebrow="Catalogue"
        title="Explore Products"
        currentLabel="Products"
        subtitle="Genuine hardware from the brands we partner with — desktops, laptops, networking, printers and surveillance."
      />

      <main className="relative section overflow-hidden">

        <div className="relative section-shell">
          {/* ---- Glass toolbar ---- */}
          <div
            className="glass-2 p-4 md:p-5 mb-8 flex flex-col lg:flex-row lg:items-center gap-4"
            data-aos="fade-up"
          >
            <div className="relative flex-1 min-w-0">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by product, brand or category…"
                aria-label="Search products"
                className="field pl-11 pr-10 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 rounded-full text-ink-500 hover:bg-white hover:text-ink-900 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className="relative">
                <span className="sr-only">Sort products</span>
                <SlidersHorizontal
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500"
                  aria-hidden="true"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="field pl-10 pr-8 cursor-pointer min-w-[190px]"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key} className="bg-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <span className="hidden sm:inline-flex items-center rounded-full border border-ink-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-ink-500 tabular-nums whitespace-nowrap">
                {totalProducts} {totalProducts === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* ---- Loading ---- */}
          {loading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <div key={index} className="glass-2 overflow-hidden p-3">
                  <div className="skeleton aspect-square w-full" />
                  <div className="skeleton mt-4 h-3 w-2/5" />
                  <div className="skeleton mt-2 h-4 w-4/5" />
                  <div className="skeleton mt-4 h-9 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* ---- Error ---- */}
          {!loading && error && (
            <div className="glass-2 p-10 md:p-14 text-center"data-aos="fade-up">
              <span className="grid place-items-center h-14 w-14 mx-auto rounded-2xl bg-red-50 text-red-700">
                <AlertCircle className="w-6 h-6" />
              </span>
              <h2 className="mt-5 font-display text-lg font-semibold text-ink-900">
                Could not load the catalogue
              </h2>
              <p className="mt-2 text-sm text-ink-500">{error}</p>
              <button onClick={loadProducts} className="btn-secondary btn-md mt-7">
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* ---- Empty ---- */}
          {!loading && !error && totalProducts === 0 && (
            <div className="glass-1 p-10 md:p-16 text-center"data-aos="fade-up">
              <span className="grid place-items-center h-16 w-16 mx-auto rounded-2xl bg-primary-50 text-primary">
                <PackageOpen className="w-7 h-7" />
              </span>
              <h2 className="mt-6 font-display text-xl font-semibold text-ink-900">
                {query ? "No products match your search" : "No products available"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
                {query
                  ? "Try a different product, brand or category."
                  : "We are refreshing the catalogue. Please check back shortly."}
              </p>
              {query && (
                <button onClick={() => setQuery("")} className="btn-secondary btn-md mt-7">
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* ---- Grid ---- */}
          {!loading && !error && totalProducts > 0 && (
            <>
              <ProductGrid
                products={pageProducts}
                title="Products"
                showTitle={false}
                sectionClassName="py-0 bg-transparent"
                containerClassName="px-0"
                showViewAll={false}
              />

              {/* Reusable pagination component */}
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
