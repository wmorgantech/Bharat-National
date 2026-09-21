import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  X,
  Download,
  Package,
  Users,
  Layers,
    FileText,
  Receipt,
  ImageIcon,
  CheckCircle2,
  Truck,
  AlertTriangle,
  BadgeCheck,
  Search,
  Pencil,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";

import Pagination from "../CommonComponent/Pagination";
import PageHeader from "../CommonComponent/PageHeader";
import jsPDF from "jspdf";  
import autoTable from "jspdf-autotable"; 
import { getOrders, getOrderStatusStats, getSalesStats, updateOrder } from "../api/order";

// Updated status list
const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusConfig = {
  PLACED: {
    label: "Placed",
    pill: "bg-orange-100 text-orange-700 border-orange-100",
    cardColor: "text-orange-600",
    cardBg: "bg-orange-50",
  },
  ACCEPTED: {
    label: "Accepted",
    pill: "bg-blue-100 text-blue-700 border-blue-100",
    cardColor: "text-blue-600",
    cardBg: "bg-blue-50",
  },
  SHIPPED: {
    label: "Shipped",
    pill: "bg-amber-100 text-amber-700 border-amber-100",
    cardColor: "text-amber-600",
    cardBg: "bg-amber-50",
  },
  DELIVERED: {
    label: "Delivered",
    pill: "bg-emerald-100 text-emerald-700 border-emerald-100",
    cardColor: "text-emerald-600",
    cardBg: "bg-emerald-50",
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "bg-rose-100 text-rose-700 border-rose-100",
    cardColor: "text-rose-600",
    cardBg: "bg-rose-50",
  },
};

const statusIconMap = {
  PLACED: Package,
  ACCEPTED: BadgeCheck,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: AlertTriangle,
};


// Generate Invoice PDF
const generateInvoicePDF = async (order) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFont("helvetica");

    // ================= HELPERS =================
    const toNumber = (val) => {
      if (!val) return 0;
      return Number(String(val).replace(/[^0-9.]/g, ""));
    };

    const formatMoney = (val) => {
      const num = toNumber(val);
      return `Rs. ${num.toLocaleString("en-IN")}`;
    };

    // ================= HEADER =================
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BHARAT NATIONAL COMPUTERS", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE", 150, 25);
    doc.text(`#INV-${order.id}`, 150, 32);
    doc.text(`Order ID: ORD-${order.id}`, 150, 38);

    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
      150,
      44
    );

    // ================= COMPANY INFO =================
    doc.setFontSize(10);
    doc.text("Bharat National Computers", 20, 55);
    doc.text("Dno - 333- F2 - Geetha Building", 20, 61);
    doc.text("Nehru St, Ram Nagar, Coimbatore", 20, 67);
    doc.text("Tamil Nadu - 641009", 20, 73);
    doc.text("Phone: 9789345333 / 8903037883", 20, 79);
    doc.text("Email: bncbalajicbe@gmail.com", 20, 85);
    doc.text("GST: 33ABCDE1234F1Z5", 20, 91);

    doc.line(20, 96, 190, 96);

    // ================= BILL TO =================
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 106);

    doc.setFont("helvetica", "normal");
    doc.text(order.fullName || "Customer", 20, 114);
    doc.text(order.address || "No address provided", 20, 120);
    doc.text(
      `${order.place || ""}${order.state ? ", " + order.state : ""}`,
      20,
      126
    );
    doc.text(order.pincode ? `Pincode: ${order.pincode}` : "", 20, 132);
    doc.text(`Phone: ${order.phone || "N/A"}`, 20, 138);
    doc.text(`Email: ${order.email || "N/A"}`, 20, 144);

    // ================= ORDER DETAILS =================
    doc.setFont("helvetica", "bold");
    doc.text("ORDER DETAILS:", 20, 156);

    doc.setFont("helvetica", "normal");
    doc.text(
      `Payment Method: ${order.paymentMethod?.toUpperCase() || "N/A"}`,
      20,
      164
    );
    doc.text(`Order Status: ${order.status}`, 20, 170);

    // ================= TABLE =================
    const tableColumn = ["S.No", "Product Name", "Qty", "Unit Price", "Total"];
    const tableRows = [];

    let subtotal = 0;

    order.orderItem?.forEach((item, index) => {
      const qty = toNumber(item.quantity);
      const unitPrice = toNumber(item.unitPrice);
      const total = qty * unitPrice;

      subtotal += total;

      tableRows.push([
        index + 1,
        item.productName || "Product",
        qty,
        formatMoney(unitPrice),
        formatMoney(total),
      ]);
    });

    const startY = 178;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY,
      theme: "grid",
      headStyles: {
        fontSize: 9,
        halign: "center",
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 70, halign: "left" },
        2: { cellWidth: 20 },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    });

    // ================= TOTALS =================
    const finalY = doc.lastAutoTable.finalY + 10;

    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    doc.setFontSize(10);

    doc.setFont("helvetica", "normal");

    doc.text("Subtotal:", 140, finalY);
    doc.text(formatMoney(subtotal), 180, finalY, { align: "right" });

    doc.text("GST (18%):", 140, finalY + 7);
    doc.text(formatMoney(gst), 180, finalY + 7, { align: "right" });

    doc.line(130, finalY + 12, 190, finalY + 12);

    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", 140, finalY + 20);
    doc.text(formatMoney(grandTotal), 180, finalY + 20, {
      align: "right",
    });

    // ================= PAYMENT STATUS =================
    doc.setFont("helvetica", "normal");
    doc.text("Payment Status:", 20, finalY + 20);
    doc.text(
      order.paymentMethod === "cod" ? "Pending (COD)" : "Paid",
      60,
      finalY + 20
    );

    // ================= FOOTER =================
    const footerY = finalY + 45;

    doc.setFontSize(8);
    doc.text(
      "Thank you for choosing Bharat National Computers!",
      105,
      footerY,
      { align: "center" }
    );

    doc.text("Contact: 9789345333 / 8903037883", 105, footerY + 6, {
      align: "center",
    });

    doc.text("Email: bncbalajicbe@gmail.com", 105, footerY + 12, {
      align: "center",
    });

    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")}`,
      105,
      footerY + 18,
      { align: "center" }
    );

    doc.save(`Invoice_ORD-${order.id}.pdf`);

    toast.success("Invoice downloaded successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to generate invoice");
  }
};

const getStatusConfig = (status) => {
  return statusConfig[status || "PLACED"] || statusConfig.PLACED;
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSameOrAfterDate = (orderDate, filterDate) => {
  return (
    new Date(orderDate).setHours(0, 0, 0, 0) >=
    new Date(filterDate).setHours(0, 0, 0, 0)
  );
};

const isSameOrBeforeDate = (orderDate, filterDate) => {
  return (
    new Date(orderDate).setHours(23, 59, 59, 999) <=
    new Date(filterDate).setHours(23, 59, 59, 999)
  );
};

const getProductImageUrl = (item) => {
  const product = item.product || {};
  const imageUrl = product.imageUrl;
  
  if (Array.isArray(imageUrl) && imageUrl.length > 0) {
    return imageUrl[0];
  }
  if (typeof imageUrl === "string" && imageUrl) {
    return imageUrl;
  }
  return null;
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [apiStatusStats, setApiStatusStats] = useState({});
  const [loading, setLoading] = useState(false);

  const [activeStatus, setActiveStatus] = useState("ALL");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [editStatusOrder, setEditStatusOrder] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [stats, setStats] = useState({
    totalSales: 0,
    uniqueCustomers: 0,
    totalQuantity: 0,
    totalValue: 0,
  });
  
  const [screenshotLoading, setScreenshotLoading] = useState({
    statusCard: false,
    salesCard: false,
  });

  const modalRef = useRef(null);
  const statusCardRef = useRef(null);
  const salesCardRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const [ordersData, statsData] = await Promise.all([
          getOrders(),
          getOrderStatusStats(),
        ]);

        const list = ordersData?.data ?? ordersData ?? [];
        setOrders(list);

        const formattedStats = {};
        (statsData?.data || []).forEach((item) => {
          formattedStats[item.status] = item.count;
        });
        setApiStatusStats(formattedStats);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getSalesStats();
        const data = res?.data || res;
        setStats({
          totalSales: data.totalSales || 0,
          uniqueCustomers: data.uniqueCustomers || 0,
          totalQuantity: data.totalQuantity || 0,
          totalValue: data.totalValue || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate, activeStatus]);

  const searchDateFiltered = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        const itemsText = (o.orderItem || [])
          .map((it) => `${it.productName || ""} ${it.product?.name || ""}`)
          .join(" ")
          .toLowerCase();
        return (
          o.fullName?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          String(o.id).includes(q) ||
          o.status?.toLowerCase().includes(q) ||
          o.paymentMethod?.toLowerCase().includes(q) ||
          itemsText.includes(q)
        );
      });
    }

    if (fromDate) {
      list = list.filter((o) => isSameOrAfterDate(o.createdAt, fromDate));
    }

    if (toDate) {
      list = list.filter((o) => isSameOrBeforeDate(o.createdAt, toDate));
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [orders, search, fromDate, toDate]);

  const currentStatusCounts = useMemo(() => {
    const counts = {
      PLACED: 0,
      ACCEPTED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    searchDateFiltered.forEach((o) => {
      const status = (o.status || "PLACED").toUpperCase().trim();
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });
    return counts;
  }, [searchDateFiltered]);

  const filtered = useMemo(() => {
    if (activeStatus === "ALL") return searchDateFiltered;
    return searchDateFiltered.filter(
      (o) => (o.status || "PLACED") === activeStatus
    );
  }, [searchDateFiltered, activeStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setActiveStatus("ALL");
    setPage(1);
  };

  const handleStatusCardScreenshot = async () => {
    if (!statusCardRef.current) return;
    try {
      setScreenshotLoading(prev => ({ ...prev, statusCard: true }));
      const canvas = await html2canvas(statusCardRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `order-status-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Status card screenshot saved!");
    } catch (err) {
      toast.error("Failed to capture status card");
    } finally {
      setScreenshotLoading(prev => ({ ...prev, statusCard: false }));
    }
  };

  const handleSalesCardScreenshot = async () => {
    if (!salesCardRef.current) return;
    try {
      setScreenshotLoading(prev => ({ ...prev, salesCard: true }));
      const canvas = await html2canvas(salesCardRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `sales-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Sales card screenshot saved!");
    } catch (err) {
      toast.error("Failed to capture sales card");
    } finally {
      setScreenshotLoading(prev => ({ ...prev, salesCard: false }));
    }
  };

  const handleSingleOrderDownload = (order) => {
    const BOM = "\uFEFF";
    const headers = ["Order ID", "Customer", "Email", "Phone", "Status", "Payment", "State", "Date", "Items", "Quantity", "Total Amount", "Cancel Reason"];
    const itemCount = order.orderItem?.length || 0;
    const qty = (order.orderItem || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    
   const rows = [[
  `"#ORD-${order.id}"`,
  `"${(order.fullName || "").replace(/"/g, '""')}"`,
  `"${(order.email || "").replace(/"/g, '""')}"`,
  `"${(order.phone || "").replace(/"/g, '""')}\t"`,
  `"${order.status || "PLACED"}"`,
  `"${order.paymentMethod || ""}"`,
  `"${(order.state || "").replace(/"/g, '""')}"`, // Add state
  `"${formatDateTime(order.createdAt)}"`,
  itemCount,
  qty,
  order.totalAmount || 0,
  `"${(order.cancelRemarks || "").replace(/"/g, '""')}"`,
]];

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.id}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Order #ORD-${order.id} downloaded!`);
  };

  const handleBulkDownload = () => {
    if (filtered.length === 0) {
      toast.error("No data to download");
      return;
    }

    const BOM = "\uFEFF";
    const headers = [
      "Order ID", "Customer", "Email", "Phone", "Status", 
      "Payment", "Date", "Items", "Quantity", "Total Amount", "Cancel Reason"
    ];

    const rows = filtered.map((o) => {
      const itemCount = o.orderItem?.length || 0;
      const qty = (o.orderItem || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      return [
        `"#ORD-${o.id}"`,
        `"${(o.fullName || "").replace(/"/g, '""')}"`,
        `"${(o.email || "").replace(/"/g, '""')}"`,
        `"${(o.phone || "").replace(/"/g, '""')}\t"`,
        `"${o.status || "PLACED"}"`,
        `"${o.paymentMethod || ""}"`,
        `"${formatDateTime(o.createdAt)}"`,
        itemCount,
        qty,
        o.totalAmount || 0,
        `"${(o.cancelRemarks || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const tabName = activeStatus === "ALL" ? "all-orders" : activeStatus.toLowerCase();
    a.download = `orders-${tabName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${filtered.length} orders downloaded!`);
  };

  const handleViewModalScreenshot = async () => {
    if (!modalRef.current || !viewData) return;
    try {
      const canvas = await html2canvas(modalRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `order-${viewData.id}-details.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Order details screenshot saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download screenshot");
    }
  };

  const refreshStatusStats = async () => {
    try {
      const statsData = await getOrderStatusStats();
      const formattedStats = {};
      (statsData?.data || []).forEach((item) => {
        formattedStats[item.status] = item.count;
      });
      setApiStatusStats(formattedStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId, newStatus, remarks) => {
    try {
      setStatusUpdatingId(orderId);
      
      const updateData = { status: newStatus };
      
      if (newStatus === 'CANCELLED') {
        if (!remarks) {
          toast.error("Please provide a reason for cancellation");
          setStatusUpdatingId(null);
          return;
        }
        updateData.cancelRemarks = remarks;
      }
      
      await updateOrder(orderId, updateData);
      
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId 
            ? { ...order, status: newStatus, cancelRemarks: newStatus === 'CANCELLED' ? remarks : order.cancelRemarks } 
            : order
        )
      );
      
      setViewData((prev) =>
        prev?.id === orderId 
          ? { ...prev, status: newStatus, cancelRemarks: newStatus === 'CANCELLED' ? remarks : prev.cancelRemarks }
          : prev
      );
      
      setEditStatusOrder((prev) =>
        prev?.id === orderId 
          ? { ...prev, status: newStatus, cancelRemarks: newStatus === 'CANCELLED' ? remarks : prev.cancelRemarks }
          : prev
      );
      
      await refreshStatusStats();
      toast.success(`Order status updated to ${getStatusConfig(newStatus).label}`);
      setEditStatusOpen(false);
      setEditStatusOrder(null);
      setSelectedNewStatus("");
      setCancelRemarks("");
      setIsCancelling(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update order status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openViewModal = (order) => {
    setViewData(order);
    setViewModalOpen(true);
  };

  const openEditStatus = (order) => {
  // Only prevent editing if status is CANCELLED
  if (order.status === "CANCELLED") {
    toast.warning("Cannot edit cancelled orders");
    return;
  }
  setEditStatusOrder(order);
  setSelectedNewStatus(order.status || "PLACED");
  setCancelRemarks(order.cancelRemarks || "");
  setIsCancelling(order.status === "CANCELLED");
  setEditStatusOpen(true);
};

  return (
    <div className="min-h-screen bg-slate-50 px-3 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <PageHeader title="Orders" subtitle="Manage your customer orders" />

        {/* Status Summary Card - Responsive */}
        <div ref={statusCardRef} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Order Status Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">Count updates with search and date filters</p>
            </div>
            <button
              onClick={handleStatusCardScreenshot}
              disabled={screenshotLoading.statusCard}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {screenshotLoading.statusCard ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              Screenshot
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {ORDER_STATUSES.map((status) => {
              const cfg = getStatusConfig(status);
              const Icon = statusIconMap[status] || Package;
              return (
                <button
                  type="button"
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex items-center gap-2 sm:gap-3 border rounded-xl p-2 sm:p-3 text-left transition ${
                    activeStatus === status
                      ? "border-[var(--primary,#00897B)] bg-[var(--primary-lighthead,#E0F2F1)]/40"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/70"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${cfg.cardBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cfg.cardColor}`} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-500">{cfg.label}</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900">{currentStatusCounts?.[status] || 0}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sales Summary Card - Responsive */}
        <div ref={salesCardRef} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Sales Summary</h3>
            <button
              onClick={handleSalesCardScreenshot}
              disabled={screenshotLoading.salesCard}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {screenshotLoading.salesCard ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              Screenshot
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: "Total Orders", val: stats.totalSales, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Customers", val: stats.uniqueCustomers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Total Quantity", val: stats.totalQuantity, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Total Value", val: formatCurrency(stats.totalValue), icon: Receipt, color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 border border-slate-100 bg-slate-50/50 rounded-xl p-2 sm:p-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-900">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Table Section - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs - Responsive */}
          <div className="px-3 sm:px-4 pt-3 sm:pt-4 overflow-x-auto">
            <div className="flex items-center gap-4 sm:gap-8 min-w-max border-b border-slate-200">
              {[
                { key: "ALL", label: "All", count: searchDateFiltered.length },
                ...ORDER_STATUSES.map((status) => ({
                  key: status,
                  label: getStatusConfig(status).label,
                  count: currentStatusCounts?.[status] || 0,
                })),
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveStatus(tab.key)}
                  className={`relative pb-2 sm:pb-3 text-xs sm:text-sm transition whitespace-nowrap ${
                    activeStatus === tab.key
                      ? "text-blue-600 font-semibold"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                  {tab.key !== "ALL" && (
                    <span className="ml-1 text-[10px] sm:text-xs text-slate-500">
                      ({tab.count})
                    </span>
                  )}
                  {activeStatus === tab.key && (
                    <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters - Responsive */}
          <div className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="relative w-full lg:max-w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-[var(--primary,#00897B)]"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 bg-white">
                  <span className="text-xs sm:text-sm text-slate-600">From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="text-xs sm:text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 bg-white">
                  <span className="text-xs sm:text-sm text-slate-600">To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="text-xs sm:text-sm outline-none"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 text-slate-700 hover:bg-blue-200 flex items-center justify-center"
                  title="Reset filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleBulkDownload}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-700 w-full md:w-auto"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel
              </button>
            </div>
          </div>

          {/* Table - Horizontal Scroll on Mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-slate-700">
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Order ID</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Customer</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold hidden sm:table-cell">Products</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Qty</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Total</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Status</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold hidden md:table-cell">Payment</th>
                 
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold hidden lg:table-cell">Date</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-3 sm:px-4 py-8 sm:py-10 text-center text-slate-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 sm:px-4 py-8 sm:py-10 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  paginated.map((o) => {
                    const cfg = getStatusConfig(o.status || "PLACED");
                    const productCount = o.orderItem?.length || 0;
                    const quantity = (o.orderItem || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
                    return (
                      <tr key={o.id} className="border-b border-slate-200 hover:bg-slate-50/70 transition">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="font-medium text-slate-900 text-xs sm:text-sm">#{o.id}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div className="font-semibold text-slate-900 leading-tight text-xs sm:text-sm">{o.fullName || "Unknown"}</div>
                          <div className="text-[10px] sm:text-xs text-slate-500 leading-tight">{o.place || o.city || "-"}</div>
                          <div className="text-[10px] sm:text-xs text-slate-900 leading-tight">{o.phone || "-"}</div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden sm:table-cell">
                          {productCount} {productCount === 1 ? "item" : "items"}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{quantity}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-slate-900 text-xs sm:text-sm">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className={`inline-flex rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold ${cfg.pill}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden md:table-cell text-xs">
                          {o.paymentMethod || "-"}
                        </td>
               

                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden lg:table-cell text-xs">
                          {formatDateTime(o.createdAt)}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
  <div className="flex justify-end gap-1 sm:gap-2">
  {/* View Button */}
  <button
    onClick={() => openViewModal(o)}
    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
    title="View Order"
  >
    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  </button>
  
  {/* Edit Status Button - Only disabled for CANCELLED orders */}
  {o.status !== "CANCELLED" ? (
    <button
      onClick={() => openEditStatus(o)}
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white flex items-center justify-center transition"
      title="Edit Status"
    >
      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>
  ) : (
    <button
      disabled
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center"
      title="Cannot edit cancelled orders"
    >
      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>
  )}
  
  {/* Invoice Button - Show only for SHIPPED and DELIVERED orders */}
  {(o.status === "SHIPPED" || o.status === "DELIVERED") && (
    <button
      onClick={() => generateInvoicePDF(o)}
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition"
      title="Download Invoice"
    >
      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>
  )}
</div>
                        </td>
                       </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 sm:p-4 border-t border-slate-200">
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>

{/* View Modal - With Cancel Reason at Top (Reduced Height) */}
{viewModalOpen && viewData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
    <div ref={modalRef} className="bg-white w-full max-w-5xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col relative">
      <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-white sticky top-0 z-10">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-slate-800">Order Details - #{viewData.id}</h2>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Customer, shipping and item details</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleViewModalScreenshot}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition"
            title="Screenshot"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => { setViewModalOpen(false); setViewData(null); }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Cancel Reason Banner - Reduced Height */}
      {viewData.status === "CANCELLED" && viewData.cancelRemarks && (
        <div className="mx-4 sm:mx-6 mt-3 sm:mt-4">
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg p-2 sm:p-2.5 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-rose-800 text-xs sm:text-sm">Cancellation Reason:</p>
                <p className="text-rose-700 text-xs leading-relaxed">{viewData.cancelRemarks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4 sm:gap-6 bg-slate-50">
        {/* Left Column - Order Info & Shipping */}
        <div className="space-y-4 sm:space-y-6">
          {/* Order Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 border-b pb-2 text-sm sm:text-base">Order Information</h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <p><span className="font-semibold text-slate-600">Customer:</span> {viewData.fullName || "-"}</p>
              <p><span className="font-semibold text-slate-600">Email:</span> {viewData.email || "-"}</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Status:</span>
                <span className={`inline-flex rounded-full border px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold ${getStatusConfig(viewData.status || "PLACED").pill}`}>
                  {getStatusConfig(viewData.status || "PLACED").label}
                </span>
              </div>
              <p><span className="font-semibold text-slate-600">Payment:</span> {viewData.paymentMethod?.toLowerCase() || "online"}</p>
              <p><span className="font-semibold text-slate-600">State:</span> {viewData.state || "—"}</p>
              <div className="border-t pt-2 sm:pt-3 mt-2">
                <p className="font-bold text-base sm:text-lg pt-1"><span className="text-slate-700">Total:</span> {formatCurrency(viewData.totalAmount)}</p>
              </div>
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 border-b pb-2 text-sm sm:text-base">Shipping Address</h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <p><span className="font-semibold text-slate-600">Address:</span> {viewData.address || "N/A"}</p>
              <p><span className="font-semibold text-slate-600">City:</span> {viewData.city || viewData.place || "N/A"}</p>
              <p><span className="font-semibold text-slate-600">State:</span> {viewData.state || "N/A"}</p>
              <p><span className="font-semibold text-slate-600">Pincode:</span> {viewData.pincode || "N/A"}</p>
              <p><span className="font-semibold text-slate-600">Phone:</span> {viewData.phone || "N/A"}</p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Order Items */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 border-b pb-2 text-sm sm:text-base">Order Items</h3>
          <div className="space-y-3 sm:space-y-4">
            {viewData.orderItem?.map((it, idx) => {
              const imageUrl = getProductImageUrl(it);
              return (
                <div key={idx} className="flex gap-3 sm:gap-4 p-2 sm:p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={it.productName || "Product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/80?text=No+Image";
                        }}
                      />
                    ) : (
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug mb-1 sm:mb-2">{it.productName || "Product"}</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">Qty: {it.quantity} x {formatCurrency(it.unitPrice)}</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">Total: {formatCurrency(Number(it.quantity || 0) * Number(it.unitPrice || 0))}</p>
                  </div>
                </div>
              );
            })}
            {!viewData.orderItem?.length && (
              <div className="text-sm text-slate-500 text-center py-6 sm:py-8">No items found for this order.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Edit Status Modal - Responsive */}
        {editStatusOpen && editStatusOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden mx-3">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">Update Order Status</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Order #{editStatusOrder.id}</p>
                </div>
                <button
                  onClick={() => {
                    setEditStatusOpen(false);
                    setEditStatusOrder(null);
                    setSelectedNewStatus("");
                    setCancelRemarks("");
                    setIsCancelling(false);
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Status</label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => {
                    setSelectedNewStatus(e.target.value);
                    setIsCancelling(e.target.value === 'CANCELLED');
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--primary,#00897B)] focus:ring-1 focus:ring-[var(--primary,#00897B)] text-sm"
                >
                  {ORDER_STATUSES.filter(status => {
                    if (editStatusOrder.status === "CANCELLED" || editStatusOrder.status === "DELIVERED") {
                      return false;
                    }
                    return true;
                  }).map((status) => {
                    const cfg = getStatusConfig(status);
                    return <option key={status} value={status}>{cfg.label}</option>;
                  })}
                </select>

                {isCancelling && (
                  <>
                    <label className="block text-sm font-semibold text-rose-600 mb-2 mt-4">
                      Cancellation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cancelRemarks}
                      onChange={(e) => setCancelRemarks(e.target.value)}
                      placeholder="Please provide a reason for cancellation..."
                      rows="4"
                      className="w-full px-4 py-2.5 border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm resize-none"
                    />
                    <p className="text-xs text-rose-500 mt-1">Required - explain why this order is being cancelled</p>
                  </>
                )}

                {editStatusOrder.status === "CANCELLED" && editStatusOrder.cancelRemarks && (
                  <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <p className="text-xs font-semibold text-rose-600 mb-1">Previous Cancellation Reason:</p>
                    <p className="text-sm text-rose-700">{editStatusOrder.cancelRemarks}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditStatusOpen(false);
                      setEditStatusOrder(null);
                      setSelectedNewStatus("");
                      setCancelRemarks("");
                      setIsCancelling(false);
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(editStatusOrder.id, selectedNewStatus, cancelRemarks)}
                    disabled={statusUpdatingId === editStatusOrder.id || (isCancelling && !cancelRemarks)}
                    className="flex-1 px-4 py-2.5 bg-[var(--primary,#00897B)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-dark,#00695C)] transition disabled:opacity-50"
                  >
                    {statusUpdatingId === editStatusOrder.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;