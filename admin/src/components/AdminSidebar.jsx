// src/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import {
  Home,
  FileText,
  Box,
  ShoppingCart,
  Users,
  ChevronDown,
  ListOrdered,
  Tag,
  FolderTree,
  Menu,
  X,
  LayoutDashboard,
  Package,
  TrendingUp,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(true);
  const [customerOpen, setCustomerOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile, setSidebarOpen]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200
    ${isActive
      ? "bg-blue-50 text-blue-600 font-semibold"
      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
    }`;

  const menuItemClass = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-blue-600";

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl flex flex-col z-50 transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-72 lg:w-64 lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-200">
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
              Admin Panel
            </div>
            <div className="font-bold text-base sm:text-lg text-gray-800">Control Panel</div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md">
            A
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {/* Dashboard Section */}
          <div className="mb-2">
            <div
              onClick={() => setDashboardOpen(!dashboardOpen)}
              className={menuItemClass}
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
                <LayoutDashboard size={16} className="text-blue-600" />
              </div>
              <span className="flex-1 text-left">Dashboard</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${dashboardOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {dashboardOpen && (
              <div className="ml-10 mt-1 space-y-1">
                <NavLink to="/dashboard" end className={linkClass}>
                  <Home size={14} />
                  <span className="text-xs sm:text-sm">Dashboard </span>
                </NavLink>
                <NavLink to="/overview" className={linkClass}>
                  <TrendingUp size={14} />
                  <span className="text-xs sm:text-sm">Analytics</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Master Section */}
          <div className="mb-2">
            <div
              onClick={() => setMasterOpen(!masterOpen)}
              className={menuItemClass}
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
                <Package size={16} className="text-blue-600" />
              </div>
              <span className="flex-1 text-left">Master</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${masterOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {masterOpen && (
              <div className="ml-10 mt-1 space-y-1">
                <NavLink to="/product" className={linkClass}>
                  <ListOrdered size={14} />
                  <span className="text-xs sm:text-sm">Products</span>
                </NavLink>
                <NavLink to="/brand" className={linkClass}>
                  <Tag size={14} />
                  <span className="text-xs sm:text-sm">Brands</span>
                </NavLink>
                <NavLink to="/category" className={linkClass}>
                  <FolderTree size={14} />
                  <span className="text-xs sm:text-sm">Categories</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div className="mb-2">
            <NavLink to="/orders" className={linkClass}>
              <ShoppingCart size={16} />
              <span className="text-xs sm:text-sm">Orders List</span>
            </NavLink>
          </div>

          {/* Customers Section */}
          <div className="mb-2">
            <div
              onClick={() => setCustomerOpen(!customerOpen)}
              className={menuItemClass}
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
                <Users size={16} className="text-blue-600" />
              </div>
              <span className="flex-1 text-left">Customers</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${customerOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {customerOpen && (
              <div className="ml-10 mt-1 space-y-1">
                <NavLink to="/customers" className={linkClass}>
                  <Users size={14} />
                  <span className="text-xs sm:text-sm">Customer List</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>


      </div>
    </>
  );
};

export default AdminSidebar;