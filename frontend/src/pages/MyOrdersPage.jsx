import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Calendar,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Truck,
  ClipboardCheck,
  XCircle,
  Layers,
  CreditCard,
} from "lucide-react";
import { getOrdersByUser } from "../api/Order";
import { toast } from "react-toastify";
import PageHeroBreadcrumb from "../components/Breadcrumb";

/**
 * My Orders - customer order command center.
 *
 * Every number on this page is derived from the orders the API returns; none
 * are hardcoded. The progress tracker maps only onto the status values the
 * backend actually produces: PLACED, ACCEPTED, SHIPPED, DELIVERED, CANCELLED.
 */

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN")}`;

// Status presentation. `dot` drives a small indicator so the state is
// readable without relying on the pill colour alone.
const statusConfig = {
  PLACED: {
    label: "Placed",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    Icon: ClipboardCheck,
  },
  ACCEPTED: {
    label: "Accepted",
    pill: "bg-primary-50 text-primary border-primary/30",
    dot: "bg-primary",
    Icon: CheckCircle2,
  },
  SHIPPED: {
    label: "Shipped",
    pill: "bg-primary-50 text-primary border-primary/30",
    dot: "bg-primary",
    Icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    pill: "bg-primary-50 text-primary border-primary/30",
    dot: "bg-primary",
    Icon: Package,
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-400",
    Icon: XCircle,
  },
};

const getStatusConfig = (status) => {
  return statusConfig[status] || statusConfig.PLACED;
};

// The fulfilment chain the backend actually moves an order through.
const TRACK = ["PLACED", "ACCEPTED", "SHIPPED", "DELIVERED"];
const TRACK_LABELS = {
  PLACED: "Ordered",
  ACCEPTED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const getProductImage = (order) => {
  if (order.orderItem && order.orderItem.length > 0) {
    const firstItem = order.orderItem[0];
    const imageUrl = firstItem?.product?.imageUrl || firstItem?.imageUrl;

    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || null;
    }
    if (typeof imageUrl === "string" && imageUrl) {
      return imageUrl;
    }
  }

  if (order.productImage) {
    return order.productImage;
  }

  return null;
};

const getProductName = (order) => {
  if (order.orderItem && order.orderItem.length > 0) {
    return order.orderItem[0]?.productName || "Order Items";
  }
  return "Order Items";
};

const getItemCount = (order) => {
  if (order.orderItem && order.orderItem.length > 0) {
    return order.orderItem.length;
  }
  return 1;
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // `user` is already read synchronously by the useState initialiser, so this
  // effect only raises the sign-in prompt. React StrictMode mounts, unmounts
  // and remounts in development, running every mount effect twice - a bare
  // toast call therefore fires twice for one user action. A stable toastId
  // makes the notification idempotent: react-toastify shows one toast per id,
  // however many times the effect runs, in development and in production.
  useEffect(() => {
    if (user?.id) return;
    toast.info("Please login to view your orders", {
      toastId: "orders-login-required",
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      try {
        setLoadingList(true);
        setError("");
        const data = await getOrdersByUser(user.id);
        console.log("Orders data:", data);
        setOrders(data || []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Failed to load orders");
      } finally {
        setLoadingList(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    const statusLabel = getStatusConfig(order.status).label.toLowerCase();
    return statusLabel === activeFilter.toLowerCase();
  });

  const isEmpty = !loadingList && filteredOrders.length === 0;
  const totalOrders = orders.length;

  // Summary counts, all derived from the live order list.
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;
  const processingCount = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  ).length;

  const SUMMARY = [
    { label: "Total Orders", value: totalOrders, Icon: Layers, edge: "", tint: "text-primary", chip: "bg-primary-50" },
    { label: "Processing", value: processingCount, Icon: Truck, edge: "", tint: "text-primary", chip: "bg-primary-50" },
    { label: "Delivered", value: deliveredCount, Icon: CheckCircle2, edge: "", tint: "text-primary", chip: "bg-primary-50" },
    { label: "Cancelled", value: cancelledCount, Icon: XCircle, edge: "", tint: "text-primary", chip: "bg-primary-50" },
  ];

  const handleLoginRedirect = () => {
    navigate("/login", { state: { redirectTo: "/orders" } });
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen">
      <PageHeroBreadcrumb
        eyebrow="Order centre"
        title="My Orders"
        currentLabel="Orders"
        subtitle="Track your purchases, check delivery status and revisit past orders."
      />

      <main className="relative section overflow-hidden">

        <div className="relative section-shell">
          {/* ============ NOT SIGNED IN ============ */}
          {!user?.id && (
            <div className="glass-1 p-10 md:p-16 text-center"data-aos="fade-up">
              <span className="grid place-items-center h-16 w-16 mx-auto rounded-2xl bg-primary-50 text-primary">
                <ShoppingBag className="w-7 h-7" />
              </span>
              <h2 className="mt-6 font-display text-xl font-semibold text-ink-900">
                Sign in to view orders
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                Track your purchases and revisit past orders.
              </p>
              <button onClick={handleLoginRedirect} className="btn-primary btn-lg mt-8">
                Sign In
              </button>
            </div>
          )}

          {/* ============ LOADING ============ */}
          {loadingList && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-2 p-5">
                    <span className="skeleton block h-10 w-10 rounded-xl" />
                    <span className="skeleton block h-7 w-16 rounded mt-4" />
                    <span className="skeleton block h-3 w-20 rounded mt-2" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-2 p-6">
                    <span className="skeleton block h-4 w-40 rounded" />
                    <div className="mt-5 flex gap-4">
                      <span className="skeleton block h-20 w-20 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2.5">
                        <span className="skeleton block h-4 w-2/3 rounded" />
                        <span className="skeleton block h-6 w-28 rounded" />
                        <span className="skeleton block h-3 w-24 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ ERROR ============ */}
          {error && !loadingList && (
            <div className="glass-2 p-10 md:p-14 text-center"data-aos="fade-up">
              <span className="grid place-items-center h-14 w-14 mx-auto rounded-2xl bg-red-50 text-red-700">
                <AlertCircle className="w-6 h-6" />
              </span>
              <h2 className="mt-5 font-display text-lg font-semibold text-ink-900">
                Could not load your orders
              </h2>
              {/* Message only - never a stack trace or server internals. */}
              <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => setUser(getStoredUser())}
                className="btn-secondary btn-md mt-7"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* ============ CONTENT ============ */}
          {!loadingList && !error && user?.id && (
            <>
              {/* ---- Summary consoles ---- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {SUMMARY.map((s, i) => (
                  <div
                    key={s.label}
                    data-aos="fade-up"
                    data-aos-delay={i * 90}
                    className={`group glass-2 ${s.edge} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white`}
                  >
                    <span
                      className={`grid place-items-center h-10 w-10 rounded-xl ${s.chip} ${s.tint} transition-transform duration-200 group-hover:-translate-y-0.5`}
                    >
                      <s.Icon size={17} />
                    </span>
                    <p className="mt-4 font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 tabular-nums">
                      {s.value}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* ---- Filters ---- */}
              {totalOrders > 0 && (
                <div className="flex gap-2.5 flex-wrap mb-8"data-aos="fade-up">
                  {["all", "placed", "accepted", "shipped", "delivered", "cancelled"].map(
                    (filter) => {
                      const labels = {
                        all: "All Orders",
                        placed: "Placed",
                        accepted: "Accepted",
                        shipped: "Shipped",
                        delivered: "Delivered",
                        cancelled: "Cancelled",
                      };
                      const isActive = activeFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          aria-pressed={isActive}
                          className={`rounded-full px-5 py-2.5 text-[13px] font-semibold border transition-all duration-300 ${
 isActive
 ? "bg-white text-ink-900 border-primary/30 "
 : "bg-white text-ink-600 border-ink-200 hover:text-ink-900 hover:border-ink-200"
 }`}
                        >
                          {labels[filter]}
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {/* ---- Empty ---- */}
              {isEmpty && (
                <div className="glass-1 p-10 md:p-16 text-center"data-aos="fade-up">
                  <span className="grid place-items-center h-16 w-16 mx-auto rounded-2xl bg-primary-50 text-primary">
                    <Package className="w-7 h-7" />
                  </span>
                  <h2 className="mt-6 font-display text-xl font-semibold text-ink-900">
                    {totalOrders === 0
                      ? "No orders yet"
                      : "No orders match this filter"}
                  </h2>
                  <p className="mt-2 text-sm text-ink-500">
                    {totalOrders === 0
                      ? "Start shopping to see your orders here."
                      : "Try a different status filter."}
                  </p>
                  {totalOrders === 0 ? (
                    <button
                      onClick={() => navigate("/products")}
                      className="btn-primary btn-lg mt-8"
                    >
                      Browse Products
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="btn-secondary btn-md mt-8"
                    >
                      Show all orders
                    </button>
                  )}
                </div>
              )}

              {/* ---- Order consoles ---- */}
              {filteredOrders.length > 0 && (
                <div className="space-y-4">
                  {filteredOrders.map((order, idx) => {
                    const status = getStatusConfig(order.status);
                    const imageUrl = getProductImage(order);
                    const productName = getProductName(order);
                    const itemCount = getItemCount(order);
                    const isCancelled = order.status === "CANCELLED";
                    const stageIndex = TRACK.indexOf(order.status);

                    return (
                      <article
                        key={order.id}
                        data-aos="fade-up"
                        data-aos-delay={Math.min(idx, 4) * 80}
                        onClick={() => handleOrderClick(order.id)}
                        className="group glass-2 overflow-hidden cursor-pointer
 transition-all duration-200 ease-out
 hover:-translate-y-0.5 hover:bg-white hover:border-primary/30"
                      >
                        <div className="p-5 md:p-6">
                          {/* meta row */}
                          <div className="flex items-center justify-between gap-3 flex-wrap pb-4 mb-5 border-b border-ink-200">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-display text-sm font-bold text-ink-900">
                                Order #{order.id}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(order.createdAt)}
                              </span>
                              {/* Only rendered when the API supplies it. */}
                              {order.paymentStatus && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                                  <CreditCard className="w-3.5 h-3.5" />
                                  {order.paymentStatus}
                                </span>
                              )}
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${status.pill}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </div>

                          {/* product row */}
                          <div className="flex gap-4 items-center">
                            <div className="h-20 w-20 shrink-0 rounded-2xl bg-white border border-ink-200 overflow-hidden p-2">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt=""
                                  aria-hidden="true"
                                  className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                  loading="lazy"
                                />
                              ) : (
                                <span className="w-full h-full grid place-items-center text-ink-400">
                                  <Package className="w-7 h-7" />
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-ink-900 line-clamp-1">
                                {productName}
                                {itemCount > 1 && (
                                  <span className="ml-1.5 text-xs font-semibold text-primary">
                                    +{itemCount - 1} more
                                  </span>
                                )}
                              </p>
                              <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink-900 tabular-nums">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <p className="mt-0.5 text-xs text-ink-500">
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                              </p>
                            </div>

                            <span className="hidden sm:grid place-items-center h-10 w-10 shrink-0 rounded-full bg-white text-ink-500 transition-all duration-200 group-hover:bg-primary group-hover:text-white">
                              <ChevronRight className="w-5 h-5" />
                            </span>
                          </div>

                          {/* ---- Progress tracker ---- */}
                          <div className="mt-6 pt-5 border-t border-ink-200">
                            {isCancelled ? (
                              <p className="flex items-center gap-2 text-[12.5px] text-red-700">
                                <XCircle className="w-4 h-4 shrink-0" />
                                This order was cancelled
                                {order.cancelRemarks ? ` — ${order.cancelRemarks}` : ""}
                              </p>
                            ) : (
                              <ol className="flex items-center gap-1.5">
                                {TRACK.map((stage, sIdx) => {
                                  const reached = stageIndex >= sIdx;
                                  return (
                                    <li
                                      key={stage}
                                      className="flex-1 flex items-center gap-1.5 min-w-0"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <span
                                          className={`block h-1 rounded-full transition-colors duration-200 ${
 reached
 ? "bg-primary"
 : "bg-white"
 }`}
                                        />
                                        <span
                                          className={`mt-2 block text-[10px] font-semibold uppercase tracking-wider truncate ${
 reached ? "text-ink-700" : "text-ink-400"
 }`}
                                        >
                                          {TRACK_LABELS[stage]}
                                        </span>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ol>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
