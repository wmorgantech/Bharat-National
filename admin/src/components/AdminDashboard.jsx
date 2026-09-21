// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Package,
  Star,
  ArrowUpRight,
  Clock,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
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

const statusConfig = {
  PLACED: { label: "Placed", class: "bg-purple-100 text-purple-700" },
  ACCEPTED: { label: "Accepted", class: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", class: "bg-amber-100 text-amber-700" },
  DELIVERED: { label: "Delivered", class: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", class: "bg-red-100 text-red-700" },
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-800" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
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

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subtext: "Last 30 days",
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      subtext: `${totalQuantity.toLocaleString()} items sold`,
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Active Customers",
      value: totalCustomers.toLocaleString(),
      subtext: "Last 30 days",
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "+5.3%",
      trendUp: true,
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Overview of your store performance</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition shadow-sm w-full sm:w-auto">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-2 sm:mt-3">{stat.value}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">{stat.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{stat.subtext}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart - Responsive */}
        <div className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 shadow-sm mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 30 days performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: "#94a3b8" }} 
                    axisLine={false} 
                    tickLine={false}
                    interval={Math.floor(chartData.length / 5)}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#94a3b8" }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#94a3b8" }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? formatCurrency(value) : value,
                      name === "revenue" ? "Revenue" : "Orders"
                    ]}
                    contentStyle={{ 
                      borderRadius: "8px", 
                      border: "none", 
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      padding: "6px 10px",
                      fontSize: "11px"
                    }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#10b981" }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] sm:h-[280px] md:h-[300px] flex items-center justify-center text-gray-400">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>

        {/* Two Column Layout - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Top Selling Products - Responsive */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-medium text-gray-900">Top Products</h3>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400">By quantity sold</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {topProducts.length > 0 ? (
                topProducts.slice(0, 5).map((product, idx) => (
                  <div key={product.productId} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] sm:text-xs font-medium text-gray-600">
                      {idx + 1}
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{product.productName}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{product.totalQuantity} units · {formatCurrency(product.revenue)}</p>
                    </div>
                    <div className="hidden sm:block w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min((product.totalQuantity / (topProducts[0]?.totalQuantity || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 sm:px-4 py-8 text-center text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products sold</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders - Responsive Table */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Recent Orders</h3>
                </div>
                <button className="text-[10px] sm:text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  View all
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-gray-500">Order ID</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-gray-500">Customer</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-gray-500">Amount</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-gray-500">Status</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-gray-500 hidden sm:table-cell">Date</th>
                    <th className="w-8"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {latestOrders.length > 0 ? (
                    latestOrders.slice(0, 5).map((order) => {
                      const status = statusConfig[order.status] || statusConfig.PLACED;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">#{order.id}</span>
                           </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-800">{order.customerName}</p>
                              <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">{order.email}</p>
                            </div>
                           </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
                           </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                            <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${status.class}`}>
                              {status.label}
                            </span>
                           </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 hidden sm:table-cell">
                            <span className="text-[10px] sm:text-xs text-gray-500">{formatDate(order.date)}</span>
                           </td>
                          <td className="px-2 py-2.5 sm:py-3">
                            <button className="p-1 rounded hover:bg-gray-100 transition">
                              <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                            </button>
                           </td>
                         </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-3 sm:px-4 py-8 text-center text-gray-400">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;