import React, { useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, PackageOpen, AlertCircle, RefreshCw, Filter, LayoutGrid, List } from "lucide-react";
import { getActiveProducts } from "../api/Product";
import ProductGrid from "../components/ProductGrid";
import PageHeroBreadcrumb from "../components/Breadcrumb";
import productsBanner from "../assets/Product.png";

import Pagination from "../components/Pagination";

const PAGE_SIZE = 9;

const getName = (value) => String(value || "").trim();
const getCategory = (product) => getName(product.category?.name || product.categoryName || product.category);
const getBrand = (product) => getName(product.brand?.name || product.brandName || product.brand);

function FilterSection({ title, children }) {
  return (
    <section className="border-b border-ink-200 py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 text-[13px] font-bold text-ink-900">{title}</h3>
      {children}
    </section>
  );
}

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
    const [category, setCategory] = useState("all");
    const [brand, setBrand] = useState("all");
    const [price, setPrice] = useState("all");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [view, setView] = useState("grid");

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

    useEffect(() => { loadProducts(); }, []);

    const categories = useMemo(() => [...new Set(products.map(getCategory).filter(Boolean))].sort(), [products]);
    const brands = useMemo(() => [...new Set(products.map(getBrand).filter(Boolean))].sort(), [products]);

    const visible = useMemo(() => {
      const q = query.trim().toLowerCase();
      let list = products.filter((product) => {
        const matchesSearch = !q || [product.name, getBrand(product), getCategory(product)]
          .some((value) => getName(value).toLowerCase().includes(q));
        const matchesCategory = category === "all" || getCategory(product) === category;
        const matchesBrand = brand === "all" || getBrand(product) === brand;
        const amount = Number(product.price) || 0;
        const matchesPrice = price === "all"
          || (price === "under-10000" && amount < 10000)
          || (price === "10000-50000" && amount >= 10000 && amount <= 50000)
          || (price === "over-50000" && amount > 50000);
        return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
      });

      if (sort !== "default") {
        list = [...list].sort((a, b) => {
          if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
          if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
          return getName(a.name).localeCompare(getName(b.name));
        });
      }
      return list;
    }, [products, query, sort, category, brand, price]);

    useEffect(() => { setCurrentPage(1); }, [query, sort, category, brand, price]);

    const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageProducts = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const activeFilters = [
      category !== "all" && { key: "category", label: category, clear: () => setCategory("all") },
      brand !== "all" && { key: "brand", label: brand, clear: () => setBrand("all") },
      price !== "all" && { key: "price", label: price === "under-10000" ? "Under ₹10,000" : price === "over-50000" ? "Over ₹50,000" : "₹10,000–₹50,000", clear: () => setPrice("all") },
    ].filter(Boolean);
    const clearFilters = () => { setCategory("all"); setBrand("all"); setPrice("all"); };

    const filterContent = (
      <>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Refine</p>
            <p className="mt-1 text-xs text-ink-500">{visible.length} matching products</p>
          </div>
          {activeFilters.length > 0 && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-primary-dark">Clear all</button>}
        </div>
        <FilterSection title="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="field text-[13px]">
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </FilterSection>
        <FilterSection title="Brand">
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="field text-[13px]">
            <option value="all">All brands</option>
            {brands.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </FilterSection>
        <FilterSection title="Price">
          <div className="space-y-2 text-[13px] text-ink-600">
            {[['all', 'Any price'], ['under-10000', 'Under ₹10,000'], ['10000-50000', '₹10,000–₹50,000'], ['over-50000', 'Over ₹50,000']].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2.5">
                <input type="radio" name="price" value={value} checked={price === value} onChange={(e) => setPrice(e.target.value)} className="accent-primary" />
                {label}
              </label>
            ))}
          </div>
        </FilterSection>
      </>
    );

    return (
      <div className="min-h-screen bg-ink-50">
        <PageHeroBreadcrumb
          currentLabel="Products"
          title="Products"
          subtitle="Browse our computer, IT hardware and technology products."
          image={productsBanner}
          imagePosition="50% 44%"
          heightClass="min-h-[160px] md:min-h-[180px] lg:min-h-[190px]"
        />

        <main className="section-shell py-6 md:py-8">
          <div className="mb-5 flex justify-end">
            <span className="text-sm text-ink-500">{visible.length} {visible.length === 1 ? "result" : "results"}</span>
          </div>

          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-card sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, brands or categories" aria-label="Search products" className="field pl-10 pr-9 [&::-webkit-search-cancel-button]:hidden" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-800"><X size={14} /></button>}
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <label className="relative min-w-0 flex-1 sm:w-48 sm:flex-none"><span className="sr-only">Sort products</span><SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><select value={sort} onChange={(e) => setSort(e.target.value)} className="field cursor-pointer pl-9 pr-7 text-[13px]">{SORTS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
              <button type="button" onClick={() => setMobileFiltersOpen(true)} className="btn-secondary btn-sm sm:hidden"><Filter size={15} /> Filters</button>
              <div className="hidden items-center rounded-lg border border-ink-200 p-1 sm:flex"><button type="button" aria-label="Grid view" onClick={() => setView("grid")} className={`rounded-md p-2 ${view === "grid" ? "bg-primary-50 text-primary" : "text-ink-400"}`}><LayoutGrid size={16} /></button><button type="button" aria-label="List view" onClick={() => setView("list")} className={`rounded-md p-2 ${view === "list" ? "bg-primary-50 text-primary" : "text-ink-400"}`}><List size={16} /></button></div>
            </div>
          </div>

          {activeFilters.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-ink-500">Active filters</span>{activeFilters.map((filter) => <button type="button" key={filter.key} onClick={filter.clear} className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-dark">{filter.label}<X size={13} /></button>)}<button type="button" onClick={clearFilters} className="ml-1 text-xs font-semibold text-ink-500 underline underline-offset-2">Clear filters</button></div>}

          <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden self-start rounded-xl border border-ink-200 bg-white p-5 shadow-card lg:block">{filterContent}</aside>
            <section className="min-w-0">
              {loading && <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{Array.from({ length: PAGE_SIZE }, (_, index) => <div key={index} className="rounded-xl border border-ink-200 bg-white p-3 shadow-card"><div className="skeleton aspect-[4/3] w-full" /><div className="skeleton mt-4 h-3 w-2/5" /><div className="skeleton mt-2 h-4 w-4/5" /><div className="skeleton mt-4 h-9 w-full" /></div>)}</div>}
              {!loading && error && <div className="state-panel"><span className="icon-chip icon-chip-lg mx-auto bg-red-50 text-red-700"><AlertCircle size={24} /></span><h2 className="mt-5 text-lg font-semibold">Could not load the catalogue</h2><p className="mt-2 text-sm text-ink-500">{error}</p><button onClick={loadProducts} className="btn-secondary btn-md mt-6"><RefreshCw size={15} /> Retry</button></div>}
              {!loading && !error && visible.length === 0 && <div className="state-panel"><span className="icon-chip icon-chip-lg mx-auto"><PackageOpen size={24} /></span><h2 className="mt-5 text-lg font-semibold">No products match your filters</h2><p className="mt-2 text-sm text-ink-500">Try clearing a filter or searching for another product.</p><button onClick={() => { setQuery(""); clearFilters(); }} className="btn-secondary btn-md mt-6">Clear filters</button></div>}
              {!loading && !error && visible.length > 0 && <><ProductGrid products={pageProducts} showTitle={false} sectionClassName="py-0" containerClassName="px-0" gridClassName={view === "list" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2" : "grid-cols-2 md:grid-cols-3"} /><Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} /></>}
            </section>
          </div>
        </main>

        {mobileFiltersOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-ink-900/30" /><aside className="absolute right-0 top-0 h-full w-[min(88vw,360px)] overflow-y-auto bg-white p-5 shadow-2xl"><div className="mb-6 flex items-center justify-between border-b border-ink-200 pb-4"><h2 className="text-lg font-bold">Filters</h2><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"><X size={18} /></button></div>{filterContent}<button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn-primary btn-md mt-4 w-full">Show {visible.length} products</button></aside></div>}
      </div>
    );
}
