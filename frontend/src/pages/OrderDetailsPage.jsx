import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  IndianRupee,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
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
    className: "bg-white text-ink-700 border-ink-200",
    dot: "bg-white",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-amber-100 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-primary-50 text-primary-dark border-primary/20",
    dot: "bg-primary/100",
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
        // Keyed so StrictMode's double-invoked mount effect cannot double-toast.
        toast.error(err?.message || "Failed to load order details", {
          toastId: `order-load-failed-${id}`,
        });
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

  // Fulfilment chain the backend actually moves an order through.
  const TRACK = ["PLACED", "ACCEPTED", "SHIPPED", "DELIVERED"];
  const TRACK_LABELS = {
    PLACED: "Order placed",
    ACCEPTED: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
  };
  const stageIndex = TRACK.indexOf(order?.status);
  const isCancelled = order?.status === "CANCELLED";

  if (loading) {
    return (
      <div className="section-shell py-12 md:py-16">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-10 w-72 mt-4" />
        <div className="grid lg:grid-cols-[0.9fr_1.35fr] gap-6 mt-10">
          <div className="space-y-6">
            <div className="glass-2 p-6 space-y-3">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
              <div className="skeleton h-3 w-2/3" />
            </div>
            <div className="glass-2 p-6 space-y-3">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/6" />
            </div>
          </div>
          <div className="glass-2 p-6 space-y-3">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-1 p-10 md:p-14 text-center max-w-md w-full">
          <span className="grid place-items-center h-16 w-16 mx-auto rounded-2xl bg-primary-50 text-primary">
            <Package className="w-7 h-7" />
          </span>
          <h1 className="mt-6 font-display text-xl font-semibold text-ink-900">
            Order not found
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            This order may have been removed, or the link is out of date.
          </p>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="btn-primary btn-lg mt-8"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ================= HEADER CONSOLE ================= */}
      <div className="relative section-shell pt-10 md:pt-14">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="glass-1 mt-5 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="min-w-0">
              <span className="eyebrow">Order console</span>
              <h1 className="mt-3 font-display text-[26px] md:text-[38px] font-bold tracking-[-0.03em] text-ink-900">
                Order #{order.id}
              </h1>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.className}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>

                {order.paymentStatus && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-200 bg-white text-xs font-semibold text-ink-600">
                    <CreditCard className="w-3.5 h-3.5" />
                    {order.paymentStatus}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Invoice Button - Show only for SHIPPED and DELIVERED orders */}
              {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                <button
                  onClick={() => generateInvoicePDF(order)}
                  className="btn-secondary btn-md"
                  title="Download Invoice"
                >
                  <FileText className="w-4 h-4" />
                  Invoice
                </button>
              )}
            </div>
          </div>

          {/* ---- Timeline ---- */}
          <div className="mt-8 pt-7 border-t border-ink-200">
            {isCancelled ? (
              <p className="flex items-start gap-2.5 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This order was cancelled
                  {order.cancelRemarks ? ` — ${order.cancelRemarks}` : "."}
                </span>
              </p>
            ) : (
              <ol className="flex items-center gap-2">
                {TRACK.map((stage, sIdx) => {
                  const reached = stageIndex >= sIdx;
                  return (
                    <li key={stage} className="flex-1 min-w-0">
                      <span
                        className={`block h-1 rounded-full transition-colors duration-200 ${
 reached
 ? "bg-primary"
 : "bg-white"
 }`}
                      />
                      <span
                        className={`mt-2.5 block text-[10px] font-semibold uppercase tracking-wider truncate ${
 reached ? "text-ink-700" : "text-ink-400"
 }`}
                      >
                        {TRACK_LABELS[stage]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* ================= DETAIL GRID ================= */}
      <main className="relative section-shell py-8 md:py-12">
        <div className="grid lg:grid-cols-[0.9fr_1.35fr] gap-5 lg:gap-6 items-start">
          {/* ---- LEFT ---- */}
          <div className="space-y-5"data-aos="fade-right">
            <section className="glass-2 p-6">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Order information
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <User className="w-3.5 h-3.5" />
                    Customer
                  </dt>
                  <dd className="text-ink-800 min-w-0">{order.fullName || "—"}</dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </dt>
                  <dd className="text-ink-800 break-all min-w-0">
                    {order.email || "—"}
                  </dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment
                  </dt>
                  <dd className="text-ink-800 uppercase min-w-0">
                    {order.paymentMethod || "—"}
                  </dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Total
                  </dt>
                  <dd className="font-display font-bold text-ink-900 tabular-nums min-w-0">
                    {formatCurrency(order.totalAmount)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="glass-2 p-6">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Shipping address
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <MapPin className="w-3.5 h-3.5" />
                    Address
                  </dt>
                  <dd className="text-ink-800 min-w-0">{order.address || "—"}</dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="w-[92px] shrink-0 text-ink-500">City</dt>
                  <dd className="text-ink-800 min-w-0">{order.place || "—"}</dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <Building2 className="w-3.5 h-3.5" />
                    State
                  </dt>
                  <dd className="text-ink-800 min-w-0">{order.state || "—"}</dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="w-[92px] shrink-0 text-ink-500">Pincode</dt>
                  <dd className="text-ink-800 min-w-0">{order.pincode || "—"}</dd>
                </div>

                <div className="flex items-start gap-3">
                  <dt className="flex items-center gap-1.5 w-[92px] shrink-0 text-ink-500">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </dt>
                  <dd className="text-ink-800 min-w-0">
                    {order.phone ? `+91 ${order.phone}` : "—"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* ---- RIGHT: items + summary ---- */}
          <div className="space-y-5"data-aos="fade-left"data-aos-delay="100">
            <section className="glass-2 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Order items
                </h2>
                <span className="text-[11px] font-semibold text-ink-400 tabular-nums">
                  {order.orderItem?.length || 0}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {order.orderItem?.map((item) => {
                  const imageUrl = getImageUrl(item);

                  return (
                    <div
                      key={item.id}
                      className="group glass-3 flex gap-4 p-3 md:p-4 transition-colors duration-300 hover:bg-white"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border border-ink-200 overflow-hidden grid place-items-center shrink-0 p-1.5">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/80?text=No+Image";
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-ink-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-[15px] font-medium text-ink-900 leading-snug line-clamp-2">
                          {item.productName}
                        </h3>

                        <p className="mt-2 text-[13px] text-ink-500 tabular-nums">
                          <span className="font-semibold text-ink-700">
                            {item.quantity}
                          </span>{" "}
                          × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>

                      <p className="font-display text-sm font-bold text-ink-900 tabular-nums shrink-0 self-end">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ---- Summary ---- */}
            <section className="glass-1 p-6">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Summary
              </h2>

              <dl className="mt-5 space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-ink-500">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </dt>
                  <dd className="font-semibold text-ink-900 tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </dd>
                </div>

                <div className="flex justify-between items-center">
                  <dt className="text-ink-500">Payment method</dt>
                  <dd className="font-semibold text-ink-800 uppercase">
                    {order.paymentMethod || "—"}
                  </dd>
                </div>

                {order.paymentStatus && (
                  <div className="flex justify-between items-center">
                    <dt className="text-ink-500">Payment status</dt>
                    <dd className="font-semibold text-ink-800">
                      {order.paymentStatus}
                    </dd>
                  </div>
                )}

                <div className="h-px bg-white !my-5" />

                <div className="flex justify-between items-baseline">
                  <dt className="font-semibold text-ink-900">Total</dt>
                  <dd className="font-display text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
