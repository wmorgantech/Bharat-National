import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Users,
  ShoppingBag,
  Download,
  Search,
  Phone,
  X,
  UserCheck,
  UserX,
  AlertTriangle,
  Camera,
} from "lucide-react";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import { getUserStats, getAllUsersWithOrderStats } from "../api/customer";
import Pagination from "../CommonComponent/Pagination";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getInitial = (name) => {
  return name?.trim()?.[0]?.toUpperCase() || "C";
};

const DEFAULT_USER_STATS = {
  totalUsers: 0,
  nonOrderCustomers: 0,
  orderedCustomers: 0,
  cancelledCustomers: 0,
  abandonedCustomers: 0,
};

const normalizeUserStats = (response) => {
  const data = response?.data ?? response ?? {};
  return {
    totalUsers: Number(data.totalUsers ?? data.totalLoggedCustomers ?? 0),
    nonOrderCustomers: Number(data.nonOrderCustomers ?? 0),
    orderedCustomers: Number(data.orderedCustomers ?? 0),
    cancelledCustomers: Number(data.cancelledCustomers ?? 0),
    abandonedCustomers: Number(data.abandonedCustomers ?? 0),
  };
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userStats, setUserStats] = useState(DEFAULT_USER_STATS);
  const [page, setPage] = useState(1);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const limit = 10;
  const summaryCardRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, statsData] = await Promise.all([
          getAllUsersWithOrderStats(),
          getUserStats(),
        ]);

        const users = usersData?.data ?? usersData ?? [];
        
        setCustomers(users);
        setUserStats(normalizeUserStats(statsData));
        
        console.log("Fetched customers:", users);
        console.log("User stats:", statsData);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, fromDate, toDate]);

  const dateFilteredCustomers = useMemo(() => {
    let list = [...customers];

    if (fromDate) {
      list = list.filter((c) => {
        if (!c.lastOrderAt) return false;
        return new Date(c.lastOrderAt).setHours(0, 0, 0, 0) >= new Date(fromDate).setHours(0, 0, 0, 0);
      });
    }

    if (toDate) {
      list = list.filter((c) => {
        if (!c.lastOrderAt) return false;
        return new Date(c.lastOrderAt).setHours(23, 59, 59, 999) <= new Date(toDate).setHours(23, 59, 59, 999);
      });
    }

    return list;
  }, [customers, fromDate, toDate]);

  const searchedCustomers = useMemo(() => {
    if (!search.trim()) return dateFilteredCustomers;
    const q = search.toLowerCase();
    return dateFilteredCustomers.filter((c) => {
      return (
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    });
  }, [dateFilteredCustomers, search]);

  const tabbedCustomers = useMemo(() => {
    if (activeTab === "ALL") return searchedCustomers;
    
    if (activeTab === "NON_ORDER") {
      return searchedCustomers.filter((c) => c.ordersCount === 0 && !c.hasCancelled && !c.hasAbandoned);
    }
    
    if (activeTab === "ORDERED") {
      return searchedCustomers.filter((c) => c.hasOrdered === true);
    }
    
    if (activeTab === "CANCELLED") {
      return searchedCustomers.filter((c) => c.hasCancelled === true);
    }
    
    if (activeTab === "ABANDONED") {
      return searchedCustomers.filter((c) => c.hasAbandoned === true);
    }
    
    return searchedCustomers;
  }, [searchedCustomers, activeTab]);

  const totalPages = Math.max(1, Math.ceil(tabbedCustomers.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = tabbedCustomers.slice(startIndex, startIndex + limit);

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setActiveTab("ALL");
    setPage(1);
  };

  const getCustomerStatus = (customer) => {
    if (customer.hasOrdered) {
      return { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    }
    if (customer.hasCancelled) {
      return { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-100" };
    }
    if (customer.hasAbandoned) {
      return { label: "Abandoned", className: "bg-rose-50 text-rose-700 border-rose-100" };
    }
    return { label: "Non Order", className: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  // Take screenshot of the summary card
  const handleSummaryCardScreenshot = async () => {
    if (!summaryCardRef.current) {
      toast.error("Card not found");
      return;
    }

    try {
      setScreenshotLoading(true);
      const canvas = await html2canvas(summaryCardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `customers-summary-${timestamp}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Summary card screenshot saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to take screenshot");
    } finally {
      setScreenshotLoading(false);
    }
  };
// Download current filtered list as CSV (FIXED: Show phone numbers as plain text)
const handleDownloadCSV = () => {
  if (tabbedCustomers.length === 0) {
    toast.error("No customers to download");
    return;
  }

  // Add BOM for UTF-8 to handle special characters
  const BOM = "\uFEFF";
  
  const headers = ["Customer Name",  "Phone Number", "Orders Count", "Total Spent (₹)", "Status", "Join Date", "Last Order Date"];
  
  const rows = tabbedCustomers.map((c) => {
    const status = getCustomerStatus(c);
    // Format phone number as plain text with tab prefix to prevent Excel conversion
    const phoneNumber = c.phone || "";
    // Add a tab character at the beginning to force Excel to treat as text
    const formattedPhone = phoneNumber ? `"${phoneNumber}\t"` : '""';
    
    return [
      `"${(c.fullName || "").replace(/"/g, '""')}"`,
      
      formattedPhone,
      c.ordersCount || 0,
      c.totalSpent || 0,
      status.label,
      formatDate(c.joinDate),
      c.lastOrderAt ? formatDate(c.lastOrderAt) : "N/A",
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const tabName = activeTab === "ALL" ? "all-customers" : activeTab.toLowerCase();
  a.download = `customers-${tabName}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

};
 
  const summaryCards = [
    { label: "Total Customers", value: userStats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Non Order Customers", value: userStats.nonOrderCustomers, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Ordered Customers", value: userStats.orderedCustomers, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Cancelled Customers", value: userStats.cancelledCustomers, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
    { label: "Abandoned Customers", value: userStats.abandonedCustomers, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const tabs = [
    { key: "ALL", label: "All Customers", count: searchedCustomers.length },
    { key: "NON_ORDER", label: "Non Order", count: searchedCustomers.filter(c => c.ordersCount === 0 && !c.hasCancelled && !c.hasAbandoned).length },
    { key: "ORDERED", label: "Ordered", count: searchedCustomers.filter(c => c.hasOrdered === true).length },
    { key: "CANCELLED", label: "Cancelled", count: searchedCustomers.filter(c => c.hasCancelled === true).length },
    { key: "ABANDONED", label: "Abandoned", count: searchedCustomers.filter(c => c.hasAbandoned === true).length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950">Customers</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your customer database</p>
        </div>

        {/* Summary Card with Screenshot Button */}
        <div className="relative">
          <div ref={summaryCardRef} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Customers Summary</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customer statistics overview</p>
              </div>
              <button
                onClick={handleSummaryCardScreenshot}
                disabled={screenshotLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {screenshotLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                Screenshot
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {summaryCards.map((item) => (
                <div key={item.label} className="flex items-center gap-3 border border-slate-100 bg-slate-50/50 rounded-xl p-4 shadow-sm">
                  <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-950 leading-none">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-tight">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 overflow-x-auto">
            <div className="flex items-center gap-8 min-w-max border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`relative pb-3 text-sm transition ${
                    activeTab === tab.key
                      ? "text-blue-600 font-semibold"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 text-xs text-slate-500">({tab.count})</span>
                  {activeTab === tab.key && (
                    <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="relative w-full lg:max-w-[420px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-[var(--primary,#00897B)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                  <span className="text-sm text-slate-600">From:</span>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-sm outline-none" />
                </div>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                  <span className="text-sm text-slate-600">To:</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-sm outline-none" />
                </div>
                <button onClick={resetFilters} className="w-10 h-10 rounded-lg bg-blue-100 text-slate-700 hover:bg-blue-200 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Download List
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Total Spent</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Join Date</th>
                  <th className="px-4 py-3 font-semibold">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">Loading customers...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">No customers found</td></tr>
                ) : (
                  paginated.map((customer) => {
                    const status = getCustomerStatus(customer);
                    return (
                      <tr key={customer.id} className="border-b border-slate-200 hover:bg-slate-50/70 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                              {getInitial(customer.fullName)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{customer.fullName || "Unknown"}</p>
                              <p className="text-xs text-slate-500 leading-tight">{customer.email || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {customer.phone || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {customer.ordersCount || 0} {customer.ordersCount === 1 ? "order" : "orders"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-900">
                          {formatCurrency(customer.totalSpent)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">{formatDate(customer.joinDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{formatDate(customer.lastOrderAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200">
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;