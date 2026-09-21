// src/pages/ProductList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { deleteProduct, getProducts, updateProduct } from "../api/Product";


import PageHeader from "../CommonComponent/PageHeader";
import SearchInput from "../CommonComponent/SearchBar";
import StatusFilter from "../CommonComponent/StatusFilter";
import DataTable from "../CommonComponent/Table";
import Pagination from "../CommonComponent/Pagination";

import ProductModal from "./ProductModel";
import ViewModal from "../CommonComponent/ViewModel";

const ProductList = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // ✅ view state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => setPage(1), [search, showInactiveOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data?.data ?? data ?? []);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      await updateProduct(product.id, { isActive: newStatus });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: newStatus } : p
        )
      );

      toast.success(`Product marked as ${newStatus ? "Active" : "Inactive"}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (!window.confirm("Mark this product as inactive?")) return;
    if (!product.isActive)
      return toast.info("This product is already inactive.");

    try {
      await deleteProduct(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: false } : p))
      );
      toast.success("Product marked as inactive");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update product status");
    }
  };

  const getFirstImage = (p) => {
    if (Array.isArray(p.imageUrl) && p.imageUrl.length) return p.imageUrl[0];
    return p.imageUrl || p.image || "";
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => (showInactiveOnly ? !p.isActive : p.isActive));
  }, [products, search, showInactiveOnly]);

  const totalPages = Math.ceil((filtered.length || 1) / limit);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (p) => (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
          {getFirstImage(p) ? (
            <img
              src={getFirstImage(p)}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-slate-400">No image</span>
          )}
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (p) => (
        <div>
          <div className="font-medium text-slate-900">{p.name}</div>
          {p.description && (
            <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
              {p.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => p.category?.name || "-",
    },
    { key: "brand", label: "Brand", render: (p) => p.brand?.name || "-" },
    {
      key: "price",
      label: "Price",
      render: (p) =>
        `₹ ${Number(p.price || 0).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(p)}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
            p.isActive
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`mr-1 inline-block h-2 w-2 rounded-full ${
              p.isActive ? "bg-green-500" : "bg-slate-400"
            }`}
          />
          {p.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-3">
          {/* ✅ VIEW */}
          <button
            className="text-blue-600 hover:text-blue-800"
            title="View"
            type="button"
            onClick={() => {
              setViewData(p);
              setViewOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* ✅ EDIT */}
          <button
            className="text-amber-600 hover:text-amber-800"
            title="Edit"
            type="button"
            onClick={() => {
              setEditData(p);
              setModalOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* ✅ DELETE */}
          <button
            className="text-red-600 hover:text-red-800"
            title="Mark Inactive"
            type="button"
            onClick={() => handleDelete(p.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <PageHeader
          title="Products"
          subtitle="Manage your product catalogue"
          actionLabel="Add Product"
          actionIcon={Plus}
          onAction={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} />
          <StatusFilter
            checked={showInactiveOnly}
            onChange={setShowInactiveOnly}
            label="Show inactive products"
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          emptyText="No products found"
        />
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
        />

        {/* ✅ Add/Edit modal */}
        {modalOpen && (
          <ProductModal
            open={modalOpen}
            editData={editData}
            onClose={() => setModalOpen(false)}
            onSuccess={fetchProducts}
          />
        )}

        {/* ✅ View modal */}
        <ViewModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          title="Product Details"
          maxWidth="max-w-xl"
        >
          {viewData && (
            <div className="space-y-4 text-sm text-left">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Images
                </p>
                {Array.isArray(viewData.imageUrl) &&
                viewData.imageUrl.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {viewData.imageUrl.slice(0, 3).map((src, idx) => (
                      <div
                        key={idx}
                        className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 border"
                      >
                        <img
                          src={src}
                          alt={`img-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                    No images
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Name</p>
                <p className="text-slate-900 font-medium">{viewData.name}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Description
                </p>
                <p className="text-slate-700 bg-slate-50 rounded-lg px-3 py-2 min-h-[40px]">
                  {viewData.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Category
                  </p>
                  <p className="text-slate-800">
                    {viewData.category?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Brand
                  </p>
                  <p className="text-slate-800">
                    {viewData.brand?.name || "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Price</p>
                <p className="text-slate-900 font-semibold">
                  ₹ {Number(viewData.price || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    viewData.isActive
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <span
                    className={`mr-1 h-2 w-2 rounded-full ${
                      viewData.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {viewData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
        </ViewModal>
      </div>
    </div>
  );
};

export default ProductList;
