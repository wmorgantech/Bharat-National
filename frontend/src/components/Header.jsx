import { useEffect, useRef, useState } from "react";
import {
  Phone,
  Mail,
  Clock,
  User,
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Package,
} from "lucide-react";
import Logo from "../assets/logo.jpeg";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { getActiveCategories } from "../api/Category";
import { getActiveProducts } from "../api/Product";
import { auth } from "../api/auth";
import { loadCart } from "../utils/CartStorage";

const BODY_SCROLL_LOCK = Symbol.for("bnc.bodyScrollLock");

function acquireBodyScrollLock() {
  const state =
    document[BODY_SCROLL_LOCK] ||
    (document[BODY_SCROLL_LOCK] = {
      count: 0,
      previousOverflow: document.body.style.overflow,
    });

  if (state.count === 0) state.previousOverflow = document.body.style.overflow;
  state.count += 1;
  document.body.style.overflow = "hidden";

  let released = false;
  return () => {
    if (released) return;
    released = true;

    const currentState = document[BODY_SCROLL_LOCK];
    if (!currentState) return;

    currentState.count -= 1;
    if (currentState.count === 0) {
      document.body.style.overflow = currentState.previousOverflow;
      delete document[BODY_SCROLL_LOCK];
    }
  };
}

const SOCIALS = [
  { Icon: FaFacebookF, href: "https://www.facebook.com/share/1EAEtbPJU8/", label: "Facebook" },
  { Icon: FaInstagram, href: "https://www.instagram.com/bncbalaji?igsh=MThrZXo4M2IzeWRpeQ%3D%3D", label: "Instagram" },
  { Icon: FaTwitter, href: null, label: "Twitter" },
  { Icon: FaWhatsapp, href: "https://wa.me/919789345333", label: "WhatsApp" },
];

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
  // Revokes the refresh token server-side, then clears local state.
  void auth.logout();
};

const getProductBrand = (product) => product.brand?.name || product.brandName || product.brand || "";
const getProductCategory = (product) => product.category?.name || product.categoryName || product.category || "";
const getProductImage = (product) =>
  (Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl) || product.image;

export default function Header() {
  const [openNav, setOpenNav] = useState(false); // ✅ Mobile drawer
  const [openCategoryList, setOpenCategoryList] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catalogueProducts, setCatalogueProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  const [cartCount, setCartCount] = useState(0);

  // Drives the "glass over hero -> solid once scrolled"treatment.
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const desktopCategoryRef = useRef(null);
  const mobileCategoryRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // The header floats transparently over a dark hero, but must become a solid
  // surface on pages that start with light content.
  const isOverHero = location.pathname === "/";
  const solid = isScrolled || !isOverHero || openNav;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Product", path: "/products" },
    { name: "Contact", path: "/contact" },
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

  useEffect(() => {
    let cancelled = false;

    getActiveProducts()
      .then((res) => {
        const list = res?.data ?? res;
        if (!cancelled) setCatalogueProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Failed to load products for search:", err));

    return () => {
      cancelled = true;
    };
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

  // Close the category dropdown when clicking outside either responsive version.
  useEffect(() => {
    if (!openCategoryList) return;
    const handler = (event) => {
      const insideMenu = [desktopCategoryRef, mobileCategoryRef].some(
        (ref) => ref.current?.contains(event.target),
      );
      if (!insideMenu) {
        setOpenCategoryList(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openCategoryList]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (event) => {
      const insideSearch = [desktopSearchRef, mobileSearchRef].some(
        (ref) => ref.current?.contains(event.target),
      );
      if (!insideSearch) setSearchOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [searchOpen]);

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

  // Scroll state. Replaces the previous measure/placeholder machinery: the bar
  // is `sticky`, so it needs no height compensation, only a solidity flag.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!openNav) return;
    return acquireBodyScrollLock();
  }, [openNav]);

  const closeAllMenus = () => {
    setOpenNav(false);
    setOpenCategoryList(false);
    setSearchOpen(false);
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

  const toggleCategoryList = () => {
    setSearchOpen(false);
    setOpenCategoryList((current) => !current);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/category/${cat.id}/products`, { state: { category: cat } });
    closeAllMenus();
  };

  const cartBadge =
    cartCount > 0 ? (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-ink-900 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
        {cartCount}
      </span>
    ) : null;

  // Action buttons adapt to whether the bar is glass-over-hero or solid.
  const actionBtn = solid
    ? "border-ink-200 text-ink-900 hover:border-primary hover:text-primary"
    : "border-ink-200 text-ink-900 hover:border-primary-light hover:text-primary-light";

  const normalizedQuery = productSearch.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? catalogueProducts
        .filter((product) =>
          [product.name, getProductBrand(product), getProductCategory(product)]
            .some((value) => String(value || "").toLowerCase().includes(normalizedQuery)),
        )
        .slice(0, 6)
    : [];

  const selectProduct = (product) => {
    navigate(`/product/${product.id}`);
    setProductSearch("");
    closeAllMenus();
  };

  const renderProductSearch = (ref, mobile = false) => (
    <div
      ref={ref}
      className={mobile ? "relative mb-5" : "relative hidden min-w-0 w-[248px] shrink-0 md:block lg:w-[288px] xl:w-[250px]"}
    >
      <div className={`relative flex items-center rounded-lg border border-ink-200 bg-white transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${mobile ? "h-11" : "h-10"}`}>
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
        <input
          type="search"
          value={productSearch}
          onChange={(event) => {
            setProductSearch(event.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSearchOpen(false);
            if (event.key === "Enter" && searchResults[0]) selectProduct(searchResults[0]);
          }}
          autoComplete="off"
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={Boolean(searchOpen && normalizedQuery)}
          aria-controls={mobile ? "mobile-product-results" : "desktop-product-results"}
          placeholder="Search products, brands..."
          className="h-full min-w-0 w-full bg-transparent pl-10 pr-9 text-[13px] text-ink-900 outline-none placeholder:text-ink-400"
        />
        {productSearch && (
          <button
            type="button"
            aria-label="Clear product search"
            onClick={() => {
              setProductSearch("");
              setSearchOpen(true);
            }}
            className="absolute right-2 grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {searchOpen && normalizedQuery && (
        <div
          id={mobile ? "mobile-product-results" : "desktop-product-results"}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[130] mt-2 max-h-80 overflow-y-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
        >
          {searchResults.length ? (
            searchResults.map((product) => {
              const image = getProductImage(product);
              const price = Number(product.price) || 0;

              return (
                <button
                  key={product.id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onClick={() => selectProduct(product)}
                  className="flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-primary-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md border border-ink-100 bg-ink-50 text-primary">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                      <Package size={17} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink-900">{product.name}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-ink-500">
                      {[getProductBrand(product), getProductCategory(product)].filter(Boolean).join(" · ") || "Product"}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-ink-700">
                    {price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" />
                </button>
              );
            })
          ) : (
            <div className="flex items-center gap-2 px-3 py-3 text-[12px] text-ink-500">
              <Package size={16} className="text-ink-400" />
              No matching products found.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-[100] w-full">
      {/* ================= ANNOUNCEMENT BAR =================
          Dark navy strip above the white nav, matching the reference
          layout. Content is BNC's own published contact details and
          opening hours - no delivery or pricing promise is implied. */}
      <div className="hidden bg-ink-900 md:block">
        <div className="section-shell flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            <a
              href="tel:9789345333"
              className="flex items-center gap-2 text-[11.5px] text-white/80 transition-colors hover:text-white"
            >
              <Phone size={12} className="shrink-0 text-primary-light" />
              9789345333, 8903037883
            </a>
            <a
              href="mailto:bncbalajicbe@gmail.com"
              className="flex min-w-0 items-center gap-2 text-[11.5px] text-white/80 transition-colors hover:text-white"
            >
              <Mail size={12} className="shrink-0 text-primary-light" />
              <span className="truncate">bncbalajicbe@gmail.com</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-[11.5px] text-white/70 lg:inline-flex">
              <Clock size={12} className="shrink-0 text-primary-light" />
              Mon&ndash;Sat, 9:00 AM &ndash; 8:00 PM
            </span>

            <span aria-hidden="true" className="hidden h-3.5 w-px bg-white/20 lg:block" />

            <div className="flex items-center gap-0.5">
              {SOCIALS.map((social) =>
                social.href ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-7 w-7 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <social.Icon size={12} />
                  </a>
                ) : (
                  <span
                    key={social.label}
                    aria-label={social.label}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <social.Icon size={12} />
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN BAR ================= */}
      <div
        className={`relative transition-all duration-300 ${
 solid
 ? "bg-white border-b border-ink-200 shadow-[0_2px_24px_-10px_rgba(6,12,24,0.6)]"
 : "bg-transparent border-b border-ink-200"
 }`}
      >
        <div className="section-shell flex items-center gap-4 lg:gap-7 h-16 lg:h-[72px]">
          {/* ---- Brand ---- */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
            onClick={closeAllMenus}
          >
            <span className="relative h-10 w-10 lg:h-11 lg:w-11 rounded-full overflow-hidden bg-white ring-1 ring-ink-200 grid place-items-center shadow-card">
              <img src={Logo} alt="Bharat National Computers"className="w-[85%] h-[85%] object-contain" />
            </span>
            <span className="leading-none hidden sm:block">
              <span
                className={`block font-display font-bold text-[15px] lg:text-[17px] tracking-tight transition-colors ${
 solid ? "text-ink-900" : "text-ink-900"
 }`}
              >
                Bharat National
              </span>
              <span className="block text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.24em] text-primary mt-1">
                Computers
              </span>
            </span>
          </Link>

          {/* ---- Desktop nav ---- */}
          <nav className="hidden xl:flex items-center gap-1 whitespace-nowrap shrink-0">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                onClick={closeAllMenus}
                className={({ isActive }) =>
                  [
"relative px-3 py-2 rounded-lg text-[13.5px] font-semibold transition-colors duration-200",
                    isActive
                      ? solid
                        ? "text-primary"
                        : "text-ink-900"
                      : solid
                      ? "text-ink-700 hover:text-primary"
                      : "text-ink-700 hover:text-ink-900",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {/* Active indicator */}
                    <span
                      aria-hidden="true"
                        className={`absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-primary transition-transform duration-300 origin-left ${
 isActive ? "scale-x-100" : "scale-x-0"
 }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {renderProductSearch(desktopSearchRef)}

          {/* ---- Actions ---- */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Categories (desktop) */}
            <div className="relative hidden xl:block" ref={desktopCategoryRef}>
              <button
                type="button"
                onClick={toggleCategoryList}
                aria-expanded={openCategoryList}
                className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-xl border text-[13px] font-semibold transition-colors ${actionBtn}`}
              >
                <LayoutGrid size={15} />
                <span className="hidden xl:inline">Categories</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${openCategoryList ? "rotate-180" : ""}`}
                />
              </button>

              {openCategoryList && (
                <div className="absolute right-0 top-full mt-2 w-72 glass rounded-2xl overflow-hidden z-50 motion-safe:animate-[scaleIn_180ms_ease-out_both]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200 bg-white">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                      Shop by category
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenCategoryList(false)}
                      aria-label="Close categories"
                      className="text-ink-500 hover:text-ink-900 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="py-1.5 max-h-80 overflow-y-auto bg-white ">
                    {catLoading ? (
                      <p className="px-4 py-2.5 text-sm text-ink-500">Loading…</p>
                    ) : categories.length === 0 ? (
                      <p className="px-4 py-2.5 text-sm text-ink-500">No categories available.</p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className="w-full text-left px-4 py-2.5 mx-1.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => handleCategoryClick(cat)}
                        >
                          {cat.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Cart"
              className={`relative grid place-items-center h-10 w-10 rounded-xl border transition-colors ${actionBtn}`}
            >
              <ShoppingCart size={17} />
              {cartBadge}
            </Link>

            {/* Account */}
            <div className="relative">
              <button
                id="profile-btn"
                type="button"
                onClick={handleProfileClick}
                aria-label="Account"
                className={`grid place-items-center h-10 w-10 rounded-xl border transition-all ${
 isLoggedIn()
 ? "bg-primary text-ink-900 border-primary shadow-glow"
 : actionBtn
 }`}
              >
                {isLoggedIn() ? (
                  <span className="text-[13px] font-bold">{userInitial}</span>
                ) : (
                  <User size={17} />
                )}
              </button>

              {profileOpen && isLoggedIn() && (
                <div
                  id="profile-dropdown"
                  className="absolute right-0 mt-2 w-56 glass rounded-2xl text-sm z-50 overflow-hidden motion-safe:animate-[scaleIn_180ms_ease-out_both]"
                >
                  <div className="px-4 py-3.5 bg-white border-b border-ink-200">
                    <p className="text-[11px] text-ink-500">Signed in as</p>
                    <p className="font-semibold text-ink-900 truncate">{user?.name || "User"}</p>
                  </div>

                  <div className="p-1.5 bg-white ">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/orders");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-ink-700 font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Package size={15} />
                      My Orders
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors"
                    >
                      <X size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setOpenNav(true)}
              aria-label="Open menu"
              className={`xl:hidden grid place-items-center h-10 w-10 rounded-xl border transition-colors ${actionBtn}`}
            >
              <Menu size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {openNav && (
        <div className="fixed inset-0 z-[120] xl:hidden">
          <div
            className="absolute inset-0 bg-ink-900/30 motion-safe:animate-[fadeIn_200ms_ease-out_both]"
            onClick={closeAllMenus}
          />

          <div className="absolute right-0 top-0 h-full w-[88%] max-w-[360px] bg-white border-l border-ink-200 text-ink-900 flex flex-col motion-safe:animate-[slideInRight_300ms_cubic-bezier(0.22,1,0.36,1)_both]">

            {/* Drawer header */}
            <div className="relative flex items-center justify-between p-5 border-b border-ink-200 shrink-0">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full overflow-hidden bg-white grid place-items-center">
                  <img src={Logo} alt="BNC"className="w-[85%] h-[85%] object-contain" />
                </span>
                <span className="leading-none">
                  <span className="block font-display font-bold text-[15px]">Bharat National</span>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-light mt-1">
                    Computers
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={closeAllMenus}
                aria-label="Close menu"
                className="grid place-items-center h-9 w-9 rounded-xl bg-white text-ink-800 hover:bg-white transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <div className="relative p-5 overflow-y-auto flex-1">
              {renderProductSearch(mobileSearchRef, true)}

              {/* Primary nav */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.path === "/"}
                    onClick={closeAllMenus}
                    className={({ isActive }) =>
                      [
"px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors",
                        isActive
                          ? "bg-primary/20 text-ink-900 ring-1 ring-primary/40"
                          : "text-ink-600 hover:bg-white hover:text-ink-900",
                      ].join(" ")
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>

              {/* Categories */}
              <div ref={mobileCategoryRef}>
                <button
                  type="button"
                  onClick={toggleCategoryList}
                  aria-expanded={openCategoryList}
                  className="mt-5 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-ink-200 text-[13px] font-semibold text-ink-900 hover:bg-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutGrid size={16} className="text-primary-light" />
                    Shop by category
                  </span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${openCategoryList ? "rotate-180" : ""}`}
                  />
                </button>

                {openCategoryList && (
                  <div className="mt-2 rounded-xl border border-ink-200 overflow-hidden bg-white">
                    <div className="max-h-56 overflow-y-auto">
                      {catLoading ? (
                        <p className="px-4 py-3 text-sm text-ink-500">Loading…</p>
                      ) : categories.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-ink-500">No categories.</p>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className="w-full text-left px-4 py-3 text-sm font-medium text-ink-700 hover:bg-primary/15 hover:text-ink-900 transition-colors"
                            onClick={() => handleCategoryClick(cat)}
                          >
                            {cat.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Account */}
              <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-4">
                {isLoggedIn() && user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center h-10 w-10 rounded-full bg-primary text-ink-900 text-sm font-bold shadow-glow">
                        {userInitial}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-ink-500">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
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
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white text-sm font-semibold text-ink-900 hover:bg-white transition-colors"
                      >
                        <Package size={15} />
                        My Orders
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          closeAllMenus();
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-red-50 text-sm font-semibold text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
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
                    className="btn-primary btn-md w-full"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>

              {/* Contact + socials */}
              <div className="mt-6 pt-5 border-t border-ink-200 space-y-3">
                <a href="tel:9789345333"className="flex items-center gap-2.5 text-[13px] text-ink-600 hover:text-ink-900 transition-colors">
                  <Phone size={14} className="text-primary-light" />
                  9789345333
                </a>
                <a href="mailto:bncbalajicbe@gmail.com"className="flex items-center gap-2.5 text-[13px] text-ink-600 hover:text-ink-900 transition-colors break-all">
                  <Mail size={14} className="text-primary-light" />
                  bncbalajicbe@gmail.com
                </a>

                <div className="flex items-center gap-2 pt-2">
                  {SOCIALS.map((social) =>
                    social.href ? (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="h-9 w-9 grid place-items-center rounded-xl bg-white border border-ink-200 text-ink-600 hover:bg-primary hover:text-ink-900 hover:border-primary transition-colors"
                      >
                        <social.Icon size={14} />
                      </a>
                    ) : (
                      <span
                        key={social.label}
                        aria-label={social.label}
                        className="h-9 w-9 grid place-items-center rounded-xl bg-white border border-ink-200 text-ink-600 hover:bg-primary hover:text-ink-900 hover:border-primary transition-colors cursor-pointer"
                      >
                        <social.Icon size={14} />
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
