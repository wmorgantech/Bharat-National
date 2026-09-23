// src/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import {
  Home,
  FileText,
  ShoppingCart,
  Users,
  ChevronDown,
  ListOrdered,
  Tag,
  FolderTree,
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

  // "Mobile" here means "sidebar is a drawer", which is everything below lg
  // (1024px) - matching lg:hidden on the toggles and lg:translate-x-0 on the
  // panel. This keeps the backdrop and close-on-navigate active on tablets.
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile, setSidebarOpen]);

  // Leaf link inside the rail.
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-all duration-200 ${
      isActive
        ? "bg-primary/15 text-white font-semibold ring-1 ring-primary/30"
        : "text-white/55 hover:bg-white/5 hover:text-white"
    }`;

  // Collapsible group header.
  const groupClass =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors duration-200 text-white/80 hover:bg-white/5 hover:text-white";

  const sectionLabel =
    "px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30";

  return (
    <>
      {/* Overlay for mobile. The only toggle lives in the topbar, so no
          floating button is rendered here (it used to overlap page content). */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-ink-900 flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-72 lg:w-64 lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-primary text-white font-bold shadow-glow">
              B
            </span>
            <span className="leading-none min-w-0">
              <span className="block font-bold text-[15px] text-white truncate">
                Bharat National
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-light mt-1">
                Admin Panel
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="lg:hidden grid place-items-center h-8 w-8 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {/* ---- Overview group ---- */}
          <div>
            <p className={sectionLabel}>Overview</p>

            <button
              type="button"
              onClick={() => setDashboardOpen(!dashboardOpen)}
              aria-expanded={dashboardOpen}
              className={groupClass}
            >
              <LayoutDashboard size={17} className="text-primary-light shrink-0" />
              <span className="flex-1 text-left">Dashboard</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  dashboardOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dashboardOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                <NavLink to="/dashboard" end className={linkClass}>
                  <Home size={14} className="shrink-0" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/overview" className={linkClass}>
                  <TrendingUp size={14} className="shrink-0" />
                  <span>Analytics</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* ---- Catalogue group ---- */}
          <div>
            <p className={sectionLabel}>Catalogue</p>

            <button
              type="button"
              onClick={() => setMasterOpen(!masterOpen)}
              aria-expanded={masterOpen}
              className={groupClass}
            >
              <Package size={17} className="text-primary-light shrink-0" />
              <span className="flex-1 text-left">Master</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  masterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {masterOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                <NavLink to="/product" className={linkClass}>
                  <ListOrdered size={14} className="shrink-0" />
                  <span>Products</span>
                </NavLink>
                <NavLink to="/brand" className={linkClass}>
                  <Tag size={14} className="shrink-0" />
                  <span>Brands</span>
                </NavLink>
                <NavLink to="/category" className={linkClass}>
                  <FolderTree size={14} className="shrink-0" />
                  <span>Categories</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* ---- Operations group ---- */}
          <div>
            <p className={sectionLabel}>Operations</p>

            <div className="space-y-0.5">
              <NavLink to="/orders" className={linkClass}>
                <ShoppingCart size={16} className="shrink-0" />
                <span>Orders List</span>
              </NavLink>

              <NavLink to="/contacts" className={linkClass}>
                <FileText size={16} className="shrink-0" />
                <span>Contact Enquiries</span>
              </NavLink>
            </div>

            <button
              type="button"
              onClick={() => setCustomerOpen(!customerOpen)}
              aria-expanded={customerOpen}
              className={`${groupClass} mt-1`}
            >
              <Users size={17} className="text-primary-light shrink-0" />
              <span className="flex-1 text-left">Customers</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  customerOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {customerOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                <NavLink to="/customers" className={linkClass}>
                  <Users size={14} className="shrink-0" />
                  <span>Customer List</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        <div className="px-5 py-4 border-t border-white/10 shrink-0">
          <p className="text-[10px] text-white/30">Bharat National Computers</p>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
