// components/AdminTopbar.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Menu, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminTopbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    // Get admin data from localStorage
    const getAdminData = () => {
      const admin = localStorage.getItem('admin');
      if (admin) {
        try {
          const parsedAdmin = JSON.parse(admin);
          setAdminData(parsedAdmin);
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }
    };

    getAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('isAdminLoggedIn');
    
    toast.success('Logged out successfully');
    navigate('login');
    
 
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.admin-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Get admin name from email
  const adminName = adminData?.email ? adminData.email.split('@')[0] : 'Admin';
  const adminEmail = adminData?.email || 'admin@example.com';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-sm sm:text-base font-medium text-gray-700">
            Welcome back, {adminName}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Admin Avatar Dropdown */}
          <div className="relative admin-dropdown">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-gray-700">
                {adminName}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Admin Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-lg">
                      {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{adminName}</p>
                      <p className="text-xs text-gray-500 break-all">{adminEmail}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;