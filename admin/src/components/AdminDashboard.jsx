// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  Star,
  Clock,
  ChevronRight,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDashboardStats } from "../api/dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Semantic badge classes only - the underlying status strings are unchanged.
const statusConfig = {
  PLACED: { label: "Placed", class: "badge-warning" },
  ACCEPTED: { label: "Accepted", class: "badge-neutral" },
  SHIPPED: { label: "Shipped", class: "badge-info" },
  DELIVERED: { label: "Delivered", class: "badge-success" },
  CANCELLED: { label: "Cancelled", class: "badge-danger" },
};

const BRAND = "#00897B";
const BRAND_LIGHT = "#26A69A";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <span className="skeleton block h-3 w-24 rounded" />
          <span className="skeleton block h-7 w-48 rounded mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface p-5">
              <span className="skeleton block h-11 w-11 rounded-xl" />
              <span className="skeleton block h-7 w-28 rounded mt-4" />
              <span className="skeleton block h-3 w-20 rounded mt-2" />
            </div>
          ))}
        </div>

        <div className="surface p-5 mb-6">
          <span className="skeleton block h-4 w-32 rounded" />
          <span className="skeleton block h-[280px] w-full rounded-xl mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="surface p-5">
              <span className="skeleton block h-4 w-32 rounded" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, r) => (
                  <span key={r} className="skeleton block h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface p-10 md:p-16 text-center">
        <span className="grid place-items-center h-14 w-14 mx-auto rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="w-6 h-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-ink-900">
          Could not load the dashboard
        </h2>
        <p className="mt-2 text-sm text-ink-500">{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary btn-md mt-6">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const stats30Days = dashboardData?.stats30Days || {};
  const latestOrders = dashboardData?.latestOrders || [];
  const topProducts = dashboardData?.topProducts || [];
  const chartData = stats30Days?.chartData || [];

  const totalOrders = stats30Days?.totalOrders || 0;
  const totalRevenue = stats30Days?.totalRevenue || 0;
  const totalCustomers = stats30Days?.uniqueCustomers || 0;
  const totalQuantity = stats30Days?.totalQuantity || 0;

  // Only values the API actually returns. The previous version rendered
  // hardcoded "+12.5% / +8.2% / +5.3%" growth badges that were not backed by
  // any data, so they are gone rather than shown as real metrics.
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subtext: "Last 30 days",
      Icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      subtext: "Last 30 days",
      Icon: ShoppingCart,
    },
    {
      title: "Active Customers",
      value: totalCustomers.toLocaleString(),
      subtext: "Last 30 days",
      Icon: Users,
    },
    {
      title: "Items Sold",
      value: totalQuantity.toLocaleString(),
      subtext: "Last 30 days",
      Icon: Layers,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <span className="eyebrow">Overview</span>
        <h1 className="page-title mt-2">Dashboard</h1>
        <p className="page-sub">Performance across the last 30 days.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group surface p-5 transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5"
          >
            <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
              <stat.Icon className="w-5 h-5" />
            </span>

            <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-ink-600">{stat.title}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-500">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="surface p-5 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink-900">
              Revenue trend
            </h2>
            <p className="text-sm text-ink-500 mt-0.5">Last 30 days performance</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-ink-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND }} />
              Revenue
            </span>
            <span className="flex items-center gap-2 text-xs text-ink-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND_LIGHT }} />
              Orders
            </span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E6EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#475467" }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.floor(chartData.length / 5)}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#475467" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#475467" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E4E6EB",
                    boxShadow: "0 8px 24px -12px rgba(16,24,40,0.28)",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={BRAND}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: BRAND }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke={BRAND_LIGHT}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: BRAND_LIGHT }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] sm:h-[300px] flex flex-col items-center justify-center text-center">
            <span className="grid place-items-center h-14 w-14 rounded-2xl bg-ink-50 text-ink-500">
              <Package className="w-6 h-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-900">No revenue yet</p>
            <p className="mt-1 text-sm text-ink-500">
              Data appears here once orders start coming in.
            </p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Selling Products */}
        <div className="surface overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold tracking-tight text-ink-900">
                Top products
              </h2>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-ink-500">
              By quantity
            </span>
          </div>

          <div className="divide-y divide-ink-100">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, idx) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary/[0.04] transition-colors"
                >
                  <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-ink-50 text-[11px] font-bold text-ink-600 tabular-nums">
                    {idx + 1}
                  </span>

                  <span className="w-11 h-11 shrink-0 rounded-lg bg-ink-50 border border-ink-100 overflow-hidden p-1">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="w-full h-full grid place-items-center">
                        <Package className="w-4 h-4 text-ink-200" />
                      </span>
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {product.productName}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {product.totalQuantity} units · {formatCurrency(product.revenue)}
                    </p>
                  </div>

                  <div className="hidden sm:block w-16 h-1.5 shrink-0 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (product.totalQuantity / (topProducts[0]?.totalQuantity || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-14 text-center">
                <span className="grid place-items-center h-14 w-14 mx-auto rounded-2xl bg-ink-50 text-ink-500">
                  <Package className="w-6 h-6" />
                </span>
                <p className="mt-4 text-sm font-semibold text-ink-900">
                  No products sold yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="surface overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-ink-500" />
              <h2 className="text-sm font-semibold tracking-tight text-ink-900">
                Recent orders
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead className="bg-ink-50/80 border-b border-ink-100">
                <tr>
                  <th className="tbl-head">Order</th>
                  <th className="tbl-head">Customer</th>
                  <th className="tbl-head">Amount</th>
                  <th className="tbl-head">Status</th>
                  <th className="tbl-head hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {latestOrders.length > 0 ? (
                  latestOrders.slice(0, 5).map((order) => {
                    const status = statusConfig[order.status] || statusConfig.PLACED;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-primary/[0.04] transition-colors"
                      >
                        <td className="tbl-cell">
                          <span className="font-semibold text-ink-900">#{order.id}</span>
                        </td>
                        <td className="tbl-cell">
                          <p className="font-medium text-ink-900 truncate max-w-[140px]">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-ink-500 truncate max-w-[140px]">
                            {order.email}
                          </p>
                        </td>
                        <td className="tbl-cell font-semibold text-ink-900 tabular-nums whitespace-nowrap">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="tbl-cell">
                          <span className={status.class}>{status.label}</span>
                        </td>
                        <td className="tbl-cell hidden sm:table-cell whitespace-nowrap text-ink-500">
                          {formatDate(order.date)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-14 text-center">
                      <span className="grid place-items-center h-14 w-14 mx-auto rounded-2xl bg-ink-50 text-ink-500">
                        <Package className="w-6 h-6" />
                      </span>
                      <p className="mt-4 text-sm font-semibold text-ink-900">
                        No orders yet
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
