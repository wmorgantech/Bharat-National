// components/AdminTopbar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutSession } from '../api/admin';

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

  const handleLogout = async () => {
    // Revoke the refresh token server-side before clearing local state, so the
    // session cannot be resumed with a token left behind on this device.
    await logoutSession();

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

  // Close dropdown on Escape.
  useEffect(() => {
    if (!showDropdown) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDropdown]);

  // Get admin name from email
  const adminName = adminData?.email ? adminData.email.split('@')[0] : 'Admin';
  const adminEmail = adminData?.email || 'admin@example.com';
  const initial = adminName.charAt(0).toUpperCase();

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-ink-100 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="btn-icon lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
              Welcome back
            </p>
            <p className="text-sm font-semibold text-ink-900 truncate capitalize">
              {adminName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Admin Avatar Dropdown.
              A notification bell used to sit here with a permanently lit red
              dot, but there is no notification source behind it, so it is not
              rendered rather than implying unread activity that cannot exist. */}
          <div className="relative admin-dropdown">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              aria-expanded={showDropdown}
              aria-haspopup="menu"
              className="flex items-center gap-2 p-1 pr-2 rounded-full border border-ink-100 hover:border-primary/40 hover:bg-ink-50 transition-colors"
            >
              <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                {initial}
              </span>
              <span className="hidden sm:block text-sm font-medium text-ink-600 capitalize">
                {adminName}
              </span>
              <ChevronDown
                className={`hidden sm:block w-4 h-4 text-ink-500 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lift border border-ink-100 overflow-hidden z-50
                           motion-safe:animate-[scaleIn_160ms_ease-out_both]"
              >
                {/* Admin Info */}
                <div className="px-4 py-4 border-b border-ink-100 bg-ink-50/60">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-primary text-white font-bold shadow-glow">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 capitalize truncate">
                        {adminName}
                      </p>
                      <p className="text-xs text-ink-500 break-all">{adminEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
    </header>
  );
};

export default AdminTopbar;
