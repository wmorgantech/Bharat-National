import React, { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteBrand, getBrands } from "../api/Brand";
import BrandModal from "./Brandmodel";

import SearchInput from "../CommonComponent/SearchBar";
import DataTable from "../CommonComponent/Table";
import Pagination from "../CommonComponent/Pagination";
import PageHeader from "../CommonComponent/PageHeader";
import StatusFilter from "../CommonComponent/StatusFilter";
import ViewModal from "../CommonComponent/ViewModel";


const BrandList = () => {
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // ✅ view modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, showInactiveOnly]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      setBrands(data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const filtered = brands
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .filter((b) => (showInactiveOnly ? !b.isActive : b.isActive));

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil((filtered.length || 1) / limit);

  const columns = [
    {
      key: "logo",
      label: "Logo",
      render: (b) => (
        <img
          src={b.imageUrl || b.image}
          className="w-10 h-10 rounded-md object-cover"
          alt={b.name}
        />
      ),
    },
    { key: "name", label: "Brand Name" },
    { key: "description", label: "Description" },
    {
      key: "status",
      label: "Status",
      render: (b) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            b.isActive
              ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          {b.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (b) => (
        <div className="flex justify-end gap-3">
          {/* ✅ VIEW */}
          <button
            className="text-blue-600 hover:text-blue-800"
            title="View"
            onClick={() => {
              setViewData(b);
              setViewOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* EDIT */}
          <button
            className="text-amber-600 hover:text-amber-800"
            title="Edit"
            onClick={() => {
              setEditData(b);
              setModalOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* DELETE */}
          <button
            className="text-red-600 hover:text-red-800"
            title="Delete"
            onClick={() => deleteBrand(b.id).then(fetchBrands)}
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
          title="Brands"
          subtitle="Manage your product brands"
          actionLabel="Add Brand"
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
            label="Show inactive brands"
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          emptyText="No brands found"
        />

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        {modalOpen && (
          <BrandModal
            open={modalOpen}
            editData={editData}
            onClose={() => setModalOpen(false)}
            onSuccess={fetchBrands}
          />
        )}

        {/* ✅ VIEW MODAL */}
        <ViewModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setViewData(null);
          }}
          title="Brand Details"
        >
          {viewData && (
            <div className="space-y-4 text-sm text-left">
              <div className="flex justify-center mb-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                  <img
                    src={viewData.imageUrl || viewData.image}
                    alt={viewData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Name</p>
                <p className="text-slate-900 font-medium">{viewData.name}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Description
                </p>
                <p className="text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                  {viewData.description || "No description provided."}
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

export default BrandList;
