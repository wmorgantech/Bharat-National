import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, RefreshCw } from "lucide-react";
import { getContacts } from "../api/contact";

import SearchInput from "../CommonComponent/SearchBar";
import DataTable from "../CommonComponent/Table";
import Pagination from "../CommonComponent/Pagination";
import PageHeader from "../CommonComponent/PageHeader";
import ViewModal from "../CommonComponent/ViewModel";

const PAGE_SIZE = 8;

const formatReceived = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN");
};

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      // Kept as a visible error state rather than a toast: an empty table would
      // otherwise read as "no enquiries" when the request actually failed.
      setError(err?.message || "Failed to load contact enquiries");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.phone, contact.interestedIn, contact.message]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }, [contacts, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "interestedIn",
      label: "Interested In",
      render: (contact) => contact.interestedIn || "—",
    },
    {
      key: "message",
      label: "Message",
      render: (contact) =>
        contact.message ? (
          <span className="block max-w-xs truncate" title={contact.message}>
            {contact.message}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "createdAt",
      label: "Received",
      render: (contact) => (
        <span className="whitespace-nowrap">{formatReceived(contact.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (contact) => (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-blue-600"
            title="View enquiry"
            onClick={() => {
              setViewData(contact);
              setViewOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <PageHeader
          title="Contact Enquiries"
          subtitle="Customer enquiries submitted from the website"
        />

        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search enquiries..."
          />
        </div>

        {error ? (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>

            <p className="text-sm font-medium text-slate-800">
              Could not load contact enquiries
            </p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchContacts}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Retrying..." : "Retry"}
            </button>
          </div>
        ) : (
          <>
            {/* Table.jsx clips its own overflow, so horizontal scrolling for
                narrow screens is provided here rather than by changing it. */}
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={paginated}
                loading={loading}
                emptyText={
                  search.trim()
                    ? "No enquiries match your search."
                    : "No contact enquiries found."
                }
              />
            </div>

            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
        )}

        <ViewModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          title="Enquiry Details"
        >
          {viewData && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-medium break-words">{viewData.name}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium break-words">{viewData.email}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium break-words">{viewData.phone}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Interested In</p>
                <p className="font-medium break-words">{viewData.interestedIn || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Message</p>
                {/* Messages can be up to 1000 characters, so the block scrolls
                    internally instead of pushing the modal past the viewport. */}
                <p className="bg-slate-50 rounded-lg px-3 py-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                  {viewData.message || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Received</p>
                <p className="font-medium">{formatReceived(viewData.createdAt)}</p>
              </div>
            </div>
          )}
        </ViewModal>
      </div>
    </div>
  );
};

export default ContactList;
