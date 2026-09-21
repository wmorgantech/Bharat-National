import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Phone, Mail, User, ShoppingCart, Search, Menu, X } from "lucide-react";
import Logo from "../assets/logo.jpeg"
import { NavLink, useNavigate, Link } from "react-router-dom";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { getActiveCategories } from "../api/Category";
import { loadCart } from "../utils/CartStorage";



const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const isLoggedIn = () => !!localStorage.getItem("authToken");
const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export default function Header() {
  const [openNav, setOpenNav] = useState(false); // ✅ Mobile drawer
  const [openCategoryList, setOpenCategoryList] = useState(false);
const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [user, setUser] = useState(() => getStoredUser());

  const [cartCount, setCartCount] = useState(0);

  // ✅ sticky-on-scroll state (Desktop only)
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef(null);
  const navTopRef = useRef(0);

  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "IT Services", path: "/services" },
    { name: "Contact", path: "/contact" },
      { name: "My Orders", path: "/orders" }, 
  ];



  // Load active categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        const res = await getActiveCategories();
        const list = res?.data ?? res;
        setCategories(list || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);


    // Refresh user when storage changes
  useEffect(() => {
    const refresh = () => setUser(getStoredUser());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (!e.target.closest("#profile-dropdown") && !e.target.closest("#profile-btn")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [profileOpen]);

  // Cart count sync
  useEffect(() => {
    const syncFromStorage = () => {
      const items = loadCart();
      const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(count);
    };

    syncFromStorage();

    const handleCartUpdated = (event) => {
      if (event?.detail?.count !== undefined) setCartCount(event.detail.count);
      else syncFromStorage();
    };

    window.addEventListener("cart_updated", handleCartUpdated);
    return () => window.removeEventListener("cart_updated", handleCartUpdated);
  }, []);

  const closeAllMenus = () => {
    setOpenNav(false);
    setOpenCategoryList(false);
  };


    const handleLogout = () => {
    logoutUser();
    setUser(null);
    setProfileOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { redirectTo: window.location.pathname } });
    } else {
      setProfileOpen((p) => !p);
    }
  };

  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || "U";
  
  const toggleCategoryList = () => setOpenCategoryList((p) => !p);

  const handleCategoryClick = (cat) => {
    navigate(`/category/${cat.id}/products`, { state: { category: cat } });
    closeAllMenus();
  };

  // ✅ Measure nav position + height (Desktop only)
  useLayoutEffect(() => {
    const measure = () => {
      if (!navRef.current) return;
      if (window.innerWidth < 768) return;

      const rect = navRef.current.getBoundingClientRect();
      navTopRef.current = rect.top + window.scrollY;
      setNavHeight(rect.height);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ✅ Sticky-on-scroll behavior (Desktop only)
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 768) {
        if (isNavSticky) setIsNavSticky(false);
        return;
      }
      setIsNavSticky(window.scrollY >= navTopRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isNavSticky]);

  const isDesktopSticky = isNavSticky;

  return (
    <header className="w-full bg-white">
      {/* Top Info Bar */}
      <div className="bg-[var(--primary)] text-white px-4 py-2 flex flex-row justify-between items-center shadow-sm">
        <span className="flex items-center gap-1 text-xs sm:text-sm">
          <Phone size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">9789345333, 8903037883</span><span className="sm:hidden">9789345333</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] sm:text-sm">
          <Mail size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">bncbalajicbe@gmail.com</span><span className="sm:hidden">bncbalajicbe@gmail.com</span>
        </span>
        <div className="hidden sm:flex gap-4">
          <a
            href="https://www.facebook.com/share/1EAEtbPJU8/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF
              size={18}
              className="cursor-pointer hover:text-gray-200 transition-colors"
            />
          </a>
          <a
          href="https://www.instagram.com/bncbalaji?igsh=MThrZXo4M2IzeWRpeQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram
              size={18}
                   className="cursor-pointer hover:text-gray-200 transition-colors"
              
            />
          </a>
          <FaTwitter
            size={18}
            className="cursor-pointer hover:text-gray-200 transition-colors"
          />
          <a
            href="https://wa.me/919789345333"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp
              size={18}
              className="cursor-pointer hover:text-gray-200 transition-colors"
            />
          </a>
        </div>
      </div>

      {/* Logo + Search + Actions (DESKTOP LOOK SAME, only search input removed) */}
      <div className="px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer"
          onClick={closeAllMenus}
        >
          <div className="w-12 h-12 flex items-center justify-center ">
            <img
              src={Logo}
              alt="logo"
              className="w-[85%] h-[85%] object-contain"
            />
          </div>
          <span className="font-bold text-2xl text-black">
            Bharat National Computers
          </span>
        </Link>

        {/* ✅ Search (MOBILE + DESKTOP SAME FORMAT): dropdown + search icon only */}
        <div className="w-full md:flex md:flex-1 md:max-w-xl">
          <div className="w-full rounded-xl border border-[var(--grey-300)] bg-white shadow-sm overflow-hidden flex items-stretch">
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCategoryId(id);
                if (!id) return;

                const cat = categories.find((c) => String(c.id) === String(id));
                navigate(`/category/${id}/products`, {
                  state: { category: cat },
                });
                closeAllMenus();
              }}
              className="flex-1 h-[46px] px-3 bg-[var(--grey-100)] text-[var(--grey-900)] outline-none text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              aria-label="Search"
              className="h-[46px] w-[54px] grid place-items-center text-white"
              style={{ background: "var(--primary)" }}
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Actions (Desktop) */}
              {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-6 relative">
          <div className="text-sm text-black">
            Hotline: <b className="text-[var(--primary)]">9789345333</b>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              id="profile-btn"
              type="button"
              onClick={handleProfileClick}
              className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                isLoggedIn() 
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {isLoggedIn() ? <span className="text-sm font-bold">{userInitial}</span> : <User size={18} />}
            </button>

            {profileOpen && isLoggedIn() && (
              <div
                id="profile-dropdown"
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl text-sm z-50 overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="relative inline-flex items-center cursor-pointer hover:text-[var(--primary)] transition-colors"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

    
                {/* Mobile Icons */}
        <div className="flex md:hidden items-center justify-between gap-4">
       {/* Mobile Profile: Login if guest, open drawer if authenticated */}
<button
  type="button"
  onClick={() => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { redirectTo: window.location.pathname } });
    } else {
      setOpenNav(true); // open mobile drawer where profile section is
    }
  }}
  className={`flex items-center justify-center w-8 h-8 rounded-full border ${
    isLoggedIn()
      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
      : "bg-white text-gray-700 border-gray-300"
  }`}
>
  {isLoggedIn() ? (
    <span className="text-xs font-bold">{userInitial}</span>
  ) : (
    <User size={16} />
  )}
</button>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative inline-flex items-center hover:text-[var(--primary)] transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpenNav(true)}
            aria-label="Open Menu"
          >
            <Menu size={28} className="text-black" />
          </button>
        </div>
      </div>

      {/* ✅ Placeholder only for Desktop sticky */}
      {isDesktopSticky && (
        <div style={{ height: navHeight }} className="hidden md:block" />
      )}

      {/* ✅ NAV BAR */}
      <nav
        ref={navRef}
        className={[
          "px-4 py-3 font-medium text-sm border-b border-[var(--grey-300)] shadow-sm transition-all duration-200",
          "bg-[var(--primary-lighthead)]",
          isDesktopSticky
            ? "md:fixed md:top-0 md:left-0 md:right-0 md:z-[9999]"
            : "relative",
        ].join(" ")}
      >
        {/* Mobile social icons */}
        <div className="flex md:hidden gap-4 justify-center pb-3">
          <a
            href="https://www.facebook.com/share/1EAEtbPJU8/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF
              size={18}
              className="cursor-pointer hover:text-[var(--primary)] transition-colors text-black"
            />
          </a>
          <a
            href="https://www.instagram.com/bncbalaji?igsh=MThrZXo4M2IzeWRpeQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram
              size={18}
              className="cursor-pointer hover:text-[var(--primary)] transition-colors text-black"
            />
          </a>
          <FaTwitter size={18} className="cursor-pointer hover:text-[var(--primary)] transition-colors text-black" />
          <a href="https://wa.me/919789345333" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={18} className="cursor-pointer hover:text-[var(--primary)] transition-colors text-black" />
          </a>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center justify-between relative">
          <button
  type="button"
  onClick={toggleCategoryList}
  className="flex items-center gap-2 cursor-pointer 
             bg-[var(--primary)] text-white 
             hover:opacity-90 transition-opacity
             rounded-lg px-3 py-2"
>
  <Menu size={18} /> Shop By Categories
</button>

          <div className="flex gap-10 flex-1 justify-center">
          {navLinks.map((link) => {
  const isOrders = link.path === "/orders";
  return (
    <NavLink
      key={link.name}
      to={link.path}
      onClick={(e) => {
        closeAllMenus();
        if (isOrders && !isLoggedIn()) {
          e.preventDefault();
          navigate("/login", { state: { redirectTo: "/orders" } });
        }
      }}
      className="relative group transition-colors"
      style={({ isActive }) => ({
        color: isActive ? "var(--primary)" : "#000",
        fontWeight: isActive ? 700 : 600,
      })}
    >
      {link.name}
      <span
        className="absolute left-0 -bottom-1 w-0 h-[2px] group-hover:w-full transition-all"
        style={{ backgroundColor: "var(--primary)" }}
      />
    </NavLink>
  );
})}
          </div>

          <div className="w-40" />

          {/* Desktop categories dropdown */}
          {openCategoryList && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-[var(--grey-300)] rounded-md shadow-md z-30 text-black">
              <div className="flex justify-end px-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCategoryList(false)}
                  className="text-[var(--grey-700)] hover:text-black"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="py-1 max-h-72 overflow-y-auto text-sm">
                {catLoading ? (
                  <p className="px-3 py-2 text-[var(--grey-700)]">Loading...</p>
                ) : categories.length === 0 ? (
                  <p className="px-3 py-2 text-[var(--grey-700)]">
                    No categories available.
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="px-3 py-2 hover:bg-[var(--grey-200)] cursor-pointer text-black"
                      onClick={() => handleCategoryClick(cat)}
                    >
                      {cat.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ Mobile Drawer (LEFT SIDE) */}
      {openNav && (
        <div className="fixed inset-0 z-[99999] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeAllMenus}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--grey-300)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 p-2 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <img
    src={Logo}
    alt="BNC Logo"
    className="w-full h-full object-contain"
  />
                </div>
                <span className="font-bold text-[15px] text-black">BNC</span>
              </div>

              <button type="button" onClick={closeAllMenus} aria-label="Close">
                <X size={22} className="text-black" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4">
              {/* Categories */}
             <button
  type="button"
  onClick={toggleCategoryList}
  className="w-full flex items-center justify-between px-3 py-3 
             bg-[var(--primary)] text-white rounded-lg
             hover:opacity-90 transition-opacity"
>
  <span className="flex items-center gap-2">
    <Menu size={18} /> Shop By Categories
  </span>
  <span className="text-xs">Show</span>
</button>
              {openCategoryList && (
                <div className="mt-3 rounded-lg border border-[var(--grey-300)] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {catLoading ? (
                      <p className="px-3 py-2 text-[var(--grey-700)]">
                        Loading...
                      </p>
                    ) : categories.length === 0 ? (
                      <p className="px-3 py-2 text-[var(--grey-700)]">
                        No categories.
                      </p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className="w-full text-left px-3 py-3 text-sm text-black hover:bg-[var(--grey-100)]"
                          onClick={() => handleCategoryClick(cat)}
                        >
                          {cat.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Profile Section (mobile/tablet) */}
<div className="mt-5 border border-[var(--grey-300)] rounded-lg p-3 bg-[var(--grey-50)]">
  {isLoggedIn() && user ? (
    <>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold">
          {userInitial}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Signed in as</span>
          <span className="text-sm font-semibold text-gray-900 truncate">
            {user?.name || "User"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
     <button
  type="button"
  onClick={() => {
    closeAllMenus();
    if (!isLoggedIn()) {
      navigate("/login", { state: { redirectTo: "/orders" } });
    } else {
      navigate("/orders");
    }
  }}
          className="w-full text-left text-sm px-3 py-2 rounded-md bg-white border border-[var(--grey-300)] flex items-center justify-between"
        >
          <span>My Orders</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleLogout();
            closeAllMenus();
          }}
          className="w-full text-left text-sm px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-100"
        >
          Logout
        </button>
      </div>
    </>
  ) : (
    <button
      type="button"
      onClick={() => {
        navigate("/login", { state: { redirectTo: window.location.pathname } });
        closeAllMenus();
      }}
      className="w-full text-center text-sm px-3 py-2 rounded-md bg-[var(--primary)] text-white font-semibold"
    >
      Login / Sign Up
    </button>
  )}
</div>

              {/* Links */}
              <div className="mt-5 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={closeAllMenus}
                    className="px-3 py-3 rounded-lg"
                    style={({ isActive }) => ({
                      color: isActive ? "var(--primary)" : "#000",
                      fontWeight: isActive ? 800 : 600,
                      background: isActive ? "rgba(0,0,0,0.03)" : "transparent",
                    })}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
