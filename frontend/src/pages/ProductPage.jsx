
import React, { useEffect, useState } from "react";
import { getActiveProducts } from "../api/Product";
import ProductGrid from "../components/ProductGrid";

import Pagination from "../components/Pagination";
import PageHeroBreadcrumb from "../components/Breadcrumb";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await getActiveProducts();
        const list = res?.data ?? res ?? [];
        setProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageProducts = products.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero + breadcrumb */}
      <PageHeroBreadcrumb title="Our Products" currentLabel="Products" />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : totalProducts === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No products found.
          </div>
        ) : (
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
      </main>
    </div>
  );
}
