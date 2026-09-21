import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteCategory, getCategories } from "../api/Category";

import SearchInput from "../CommonComponent/SearchBar";
import DataTable from "../CommonComponent/Table";
import Pagination from "../CommonComponent/Pagination";
import PageHeader from "../CommonComponent/PageHeader";
import StatusFilter from "../CommonComponent/StatusFilter";
import ViewModal from "../CommonComponent/ViewModel";
import CategoryModal from "./Categorymodel";



const CategoryList = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, showInactiveOnly]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const filtered = categories
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => (showInactiveOnly ? !c.isActive : c.isActive));

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil((filtered.length || 1) / limit);

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (c) => (
        <img
          src={c.imageUrl || c.image}
          className="w-10 h-10 rounded-md object-cover"
          alt={c.name}
        />
      ),
    },
    { key: "name", label: "Category Name" },
    { key: "description", label: "Description" },
    {
      key: "status",
      label: "Status",
      render: (c) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            c.isActive
              ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          {c.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-3">
          <button
            className="text-blue-600"
            title="View"
            onClick={() => {
              setViewData(c);
              setViewOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            className="text-amber-600"
            title="Edit"
            onClick={() => {
              setEditData(c);
              setModalOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            className="text-red-600"
            title="Delete"
            onClick={() => deleteCategory(c.id).then(fetchCategories)}
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
          title="Categories"
          subtitle="Manage your product categories"
          actionLabel="Add Category"
          actionIcon={Plus}
          onAction={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        />

        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} />
          <StatusFilter
            checked={showInactiveOnly}
            onChange={setShowInactiveOnly}
            label="Show inactive categories"
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          emptyText="No categories found"
        />

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        {modalOpen && (
          <CategoryModal
            open={modalOpen}
            editData={editData}
            onClose={() => setModalOpen(false)}
            onSuccess={fetchCategories}
          />
        )}

        <ViewModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          title="Category Details"
        >
          {viewData && (
            <div className="space-y-4 text-sm">
              <img
                src={viewData.imageUrl || viewData.image}
                className="w-28 h-28 mx-auto rounded-xl object-cover"
                alt={viewData.name}
              />

              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-medium">{viewData.name}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Description</p>
                <p className="bg-slate-50 rounded-lg px-3 py-2">
                  {viewData.description || "—"}
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

export default CategoryList;
