// src/pages/CategoryProductsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { getProductsByCategory } from "../api/Product";
import ProductGrid from "../components/ProductGrid";

import Pagination from "../components/Pagination";
import PageHeroBreadcrumb from "../components/Breadcrumb";

const PAGE_SIZE = 10;

const CategoryProductsPage = () => {
  const { categoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await getProductsByCategory(categoryId);
        const list = res?.data ?? res ?? [];
        setProducts(list);

        if (list.length > 0) {
          const cat =
            list[0].category?.name ||
            list[0].categoryName ||
            list[0].category ||
            "";
          setCategoryName(cat);
        } else {
          setCategoryName("");
        }
        setCurrentPage(1); 
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) loadProducts();
  }, [categoryId]);


  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageProducts = products.slice(startIndex, endIndex);

  const label = categoryName || "Category";

  return (
    <div className="bg-gradient-to-b from-slate-50 via-slate-50 to-white min-h-screen">
      {/* Reusable breadcrumb hero */}
      <PageHeroBreadcrumb title={label} currentLabel={label} />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col items-center">
        {loading ? (
          // Loading state
          <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 py-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-500">Loading products...</p>
          </div>
        ) : totalProducts === 0 ? (
          // Empty state
          <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100 py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-1">
              <PackageOpen className="w-7 h-7 text-slate-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              No products found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              We couldn&apos;t find any items in{" "}
              <span className="font-medium">{label || "this category"}</span>.
              Please check back later or explore other categories.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full bg-white rounded-2xl shadow-md border border-slate-100">
              <ProductGrid
                products={pageProducts}
                showTitle={false}
                sectionClassName="py-8 bg-transparent"
                containerClassName="max-w-6xl mx-auto px-4"
              />
            </div>

            {/* Reusable pagination */}
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default CategoryProductsPage;
