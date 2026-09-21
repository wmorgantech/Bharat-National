import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Image as ImageIcon,
  Package,
  Loader2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  User,
  IndianRupee,
  AlertTriangle,
  Building2,
  FileText,
} from "lucide-react";
import { getOrderById } from "../api/Order";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getImageUrl = (item) => {
  const imageUrl = item?.product?.imageUrl;

  if (Array.isArray(imageUrl)) {
    return imageUrl[0] || null;
  }

  if (typeof imageUrl === "string") {
    return imageUrl;
  }

  return null;
};

// Dynamic Status Configuration
const statusConfig = {
  PLACED: {
    label: "Placed",
    className: "bg-orange-100 text-orange-700 border-orange-100",
    dot: "bg-orange-500",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-slate-100 text-slate-700 border-slate-100",
    dot: "bg-slate-500",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-amber-100 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
  },
};

const getStatusConfig = (status) => {
  return statusConfig[status] || statusConfig.PLACED;
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

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const totalItems = useMemo(() => {
    if (!order?.orderItem) return 0;
    return order.orderItem.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const status = getStatusConfig(order?.status || "PLACED");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--primary,#00897B)]" />
          <p className="text-sm font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center max-w-sm w-full">
          <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-900">
            Order not found
          </p>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--primary,#00897B), #00695C)",
            }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Cancel Reason Banner for Cancelled Orders */}
      {order.status === "CANCELLED" && order.cancelRemarks && (
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <p className="text-sm font-semibold text-rose-800">Cancellation Reason</p>
                <p className="text-xs text-rose-700">{order.cancelRemarks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-950">
              Order Details - #{order.id}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Invoice Button - Show only for SHIPPED and DELIVERED orders */}
            {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
              <button
                onClick={() => generateInvoicePDF(order)}
                className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition"
                title="Download Invoice"
              >
                <FileText className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[0.9fr_1.35fr] gap-6">
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Order Information
              </h2>
              <div className="h-px bg-slate-200 my-3" />

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Customer:
                  </p>
                  <p className="text-slate-700">{order.fullName || "—"}</p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    Email:
                  </p>
                  <p className="text-slate-700 break-all">
                    {order.email || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950">Status:</p>
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${status.className}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment:
                  </p>
                  <p className="text-slate-700 uppercase">
                    {order.paymentMethod || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Total:
                  </p>
                  <p className="font-bold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <p className="font-bold text-slate-950">Items:</p>
                  <p className="text-slate-700">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Shipping Address
              </h2>
              <div className="h-px bg-slate-200 my-3" />

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Address:
                  </p>
                  <p className="text-slate-700">{order.address || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950">City:</p>
                  <p className="text-slate-700">{order.place || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    State:
                  </p>
                  <p className="text-slate-700">{order.state || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950">Pincode:</p>
                  <p className="text-slate-700">{order.pincode || "—"}</p>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <p className="font-bold text-slate-950 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Phone:
                  </p>
                  <p className="text-slate-700">
                    {order.phone ? `+91 ${order.phone}` : "—"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">
              Order Items
            </h2>
            <div className="h-px bg-slate-200 my-3" />

            <div className="space-y-3">
              {order.orderItem?.map((item) => {
                const imageUrl = getImageUrl(item);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:p-4 flex gap-4"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                      ) : (
                        <Package className="w-7 h-7 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-extrabold text-slate-950 leading-snug">
                        {item.productName}
                      </h3>

                      <p className="mt-2 text-sm text-slate-700">
                        Qty:{" "}
                        <span className="font-semibold">{item.quantity}</span>{" "}
                        × {formatCurrency(item.unitPrice)}
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        Total:{" "}
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}