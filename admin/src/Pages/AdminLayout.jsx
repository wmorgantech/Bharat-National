// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/TopBar";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The sidebar is only persistent from `lg` (1024px) up, which is the
  // breakpoint the sidebar's own classes use (lg:translate-x-0 / lg:w-64) and
  // that both toggle buttons use (lg:hidden). Below that it behaves as a
  // drawer, so it must start closed - otherwise it sits over the content.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content. The offset is purely responsive: from lg up the sidebar
          is always on screen (lg:translate-x-0), so the margin must always be
          applied there rather than tracking open/closed state. Below lg the
          sidebar is an overlaying drawer and the content stays full width. */}
      <div className="transition-all duration-300 lg:ml-64">
        <AdminTopbar setSidebarOpen={setSidebarOpen} />
        
        <div className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}