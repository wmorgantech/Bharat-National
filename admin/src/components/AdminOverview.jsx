// src/pages/AdminOverview.jsx
import React, { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  UserPlus,
  AlertTriangle,
  Edit,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { getOverviewData } from "../api/overview";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatTimeAgo = (date) => {
  if (!date) return "Just now";
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
};

// Activity type configuration
const activityConfig = {
  NEW_ORDER: {
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "New Order",
  },
  NEW_CUSTOMER: {
    icon: UserPlus,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    label: "New Customer",
  },
  PRODUCT_UPDATE: {
    icon: Edit,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    label: "Product Update",
  },
  LOW_STOCK: {
    icon: AlertTriangle,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    label: "Low Stock",
  },
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{title}</p>
  </div>
);

// Activity Item Component
const ActivityItem = ({ activity, isLast }) => {
  const config = activityConfig[activity.type] || activityConfig.NEW_ORDER;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
      <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug">
          {activity.message}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {activity.time}
        </p>
      </div>
    </div>
  );
};

// Top Performer Item Component
const TopPerformerItem = ({ product, rank, isLast }) => (
  <div className={`flex items-center gap-3 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
      {rank}
    </div>
    <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
      {product.imageUrl ? (
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/40?text=No+Image";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
      <p className="text-xs text-gray-500">{product.sales} sales · {formatCurrency(product.revenue)}</p>
    </div>
    <ArrowUpRight className="w-4 h-4 text-emerald-500 flex-shrink-0" />
  </div>
);

// Main Component
const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getOverviewData();
      console.log("Overview data:", result);
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load overview data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const result = await getOverviewData();
      setData(result);
      toast.success("Data refreshed successfully");
    } catch (err) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-36 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse" />
          ))}
        </div>
        
        {/* Chart Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-96 animate-pulse mb-6" />
        
        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentActivity, topPerformers } = data || {};

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+12.5%",
    },
    {
      title: "Total Orders",
      value: formatNumber(stats?.totalOrders || 0),
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+8.2%",
    },
    {
      title: "Total Customers",
      value: formatNumber(stats?.totalUsers || 0),
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "+5.3%",
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(stats?.avgOrderValue || 0),
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: null,
    },
  ];

  const chartData = stats?.chartData || [];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete business performance snapshot
          </p>
        </div>
       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Revenue Chart - Last 12 Months */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 12 months performance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Monthly Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: "#94a3b8" }} 
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#94a3b8" }} 
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "none", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  padding: "8px 12px",
                  fontSize: "12px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2} 
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom Grid - Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <span className="text-[10px] text-gray-400">Last 10 activities</span>
            </div>
          </div>
          <div className="px-5 py-2 max-h-[400px] overflow-y-auto">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={idx === recentActivity.length - 1}
                />
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900">Top Performing Products</h2>
              </div>
              <span className="text-[10px] text-gray-400">By sales volume</span>
            </div>
          </div>
          <div className="px-5 py-2 max-h-[400px] overflow-y-auto">
            {topPerformers && topPerformers.length > 0 ? (
              topPerformers.map((product, idx) => (
                <TopPerformerItem
                  key={product.id}
                  product={product}
                  rank={idx + 1}
                  isLast={idx === topPerformers.length - 1}
                />
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No product data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default AdminOverview;