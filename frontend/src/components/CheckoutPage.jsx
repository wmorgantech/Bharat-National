// src/pages/CheckoutPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Mail,
  X,
  CreditCard,
  ShieldCheck,
  LockKeyhole,
  Wallet,
  Pencil,
  Plus,
  Truck,
  Package,
  ShoppingBag,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, TextInput } from "./FormControl";
import { createOrder, getLastOrderForUser } from "../api/Order";
import { clearCart, getOrCreateCartId } from "../utils/CartStorage";
import { toast } from "react-toastify";
import upiLogo from "../assets/upi.png";
import mastercardLogo from "../assets/mastercard.png";
import netbankingLogo from "../assets/netbanking.png";

const PENDING_CART_KEY = "pendingCheckoutCart";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const [cartItems, setCartItems] = useState(() => {
    const fromState = location.state?.cartItems;
    if (fromState && Array.isArray(fromState) && fromState.length > 0) {
      return fromState;
    }
    try {
      const stored = localStorage.getItem(PENDING_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.mobilenumber || "");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState("form");
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("online");

  const { subtotal, totalItems } = useMemo(() => {
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const qty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, totalItems: qty };
  }, [cartItems]);

  const shippingLabel = subtotal > 0 ? "Free" : "—";
  const total = subtotal;
  const isCartEmpty = cartItems.length === 0;

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const getDigits = (value) => String(value || "").replace(/\D/g, "");

  // Load last order address
  useEffect(() => {
    const loadLastOrderAddress = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!currentUser?.id) {
        setViewMode("form");
        setHasSavedAddress(false);
        return;
      }

      try {
        const lastOrder = await getLastOrderForUser(currentUser.id);
        if (!lastOrder) {
          setViewMode("form");
          setHasSavedAddress(false);
          return;
        }
        setFullName(lastOrder.fullName || currentUser.name || "");
        setEmail(lastOrder.email || "");
        setPhone(lastOrder.phone || currentUser.mobilenumber || "");
        setAddress(lastOrder.address || "");
        setPlace(lastOrder.place || "");
        setState(lastOrder.state || "");
        setPincode(lastOrder.pincode || "");

        const hasAddress = !!(lastOrder.fullName || lastOrder.address || lastOrder.place || lastOrder.pincode || lastOrder.phone || lastOrder.email);
        setHasSavedAddress(hasAddress);
        setViewMode(hasAddress ? "card" : "form");
      } catch (err) {
        console.log("No last order / failed to load last order:", err.message);
        setViewMode("form");
        setHasSavedAddress(false);
      }
    };
    loadLastOrderAddress();
  }, []);

  // Handle auth change
  useEffect(() => {
    const handleAuthChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(updatedUser);
      if (!location.state?.cartItems && updatedUser?.id && cartItems.length === 0) {
        const pending = localStorage.getItem(PENDING_CART_KEY);
        if (pending) {
          try {
            setCartItems(JSON.parse(pending));
          } catch {}
        }
      }
    };
    window.addEventListener("storage", handleAuthChange);
    handleAuthChange();
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  // Save pending cart
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(PENDING_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleSaveAddress = () => {
    const name = fullName.trim();
    const mail = email.trim();
    const addr = address.trim();
    const plc = place.trim();
    const st = state.trim();
    const pin = pincode.trim();
    const phoneDigits = getDigits(phone);

    if (!name) return toast.error("Please enter your full name");
    if (!mail) return toast.error("Please enter your email");
    if (!isValidEmail(mail)) return toast.error("Please enter a valid email address");
    if (!phoneDigits) return toast.error("Please enter your mobile number");
    if (phoneDigits.length !== 10) return toast.error("Mobile number must be exactly 10 digits");
    if (!addr) return toast.error("Please enter your full address");
    if (!plc) return toast.error("Please enter your city/place");
    if (!st) return toast.error("Please enter your state");
    if (!pin) return toast.error("Please enter your pincode");
    if (!/^\d{6}$/.test(pin)) return toast.error("Pincode must be a 6-digit number");

    setHasSavedAddress(true);
    setViewMode("card");
    toast.success(hasSavedAddress ? "Address updated!" : "Delivery address saved!");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (viewMode === "form") { handleSaveAddress(); return; }
    if (cartItems.length === 0) return toast.error("Your cart is empty");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser?.id) {
      localStorage.setItem(PENDING_CART_KEY, JSON.stringify(cartItems));
      toast.info("Please login to place order", { autoClose: 2000 });
      setTimeout(() => navigate("/login", { state: { redirectTo: "/checkout", pendingAction: "checkout" }, replace: true }), 2500);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        userId: currentUser.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: getDigits(phone),
        address: address.trim(),
        place: place.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        status: "PLACED",
        paymentMethod,
        items: cartItems.map((item) => ({ productId: item.id ?? item.productId, quantity: item.quantity })),
      };
      await createOrder(payload);
      clearCart();
      localStorage.removeItem(PENDING_CART_KEY);
      window.history.replaceState({}, document.title);
      toast.success(paymentMethod === "online" ? "Payment successful! Order placed." : "Order placed with Cash on Delivery.");
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-slate-200/60 top-0 z-30 shadow-[0_1px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900">Secure Checkout</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Cart</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>

          <div className="border-t border-slate-100/80 bg-gradient-to-b from-slate-50/30 to-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex justify-center">
            <nav aria-label="Checkout progress" className="w-full max-w-xl">
              <ol className="flex items-center justify-between relative">
                <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-slate-200 rounded-full"></div>
                <div
                  className="absolute top-5 left-[10%] h-[2px] rounded-full transition-all duration-500"
                  style={{ width: "40%", background: "linear-gradient(90deg, var(--primary, #00897B), #00695C)" }}
                ></div>

                {[
                  { icon: ShoppingBag, label: "Cart", status: "done", onClick: () => navigate("/cart") },
                  { icon: Truck, label: "Shipping", status: "active" },
                  { icon: CreditCard, label: "Payment", status: "pending" },
                ].map((step, i) => (
                  <li key={i} className="flex flex-col items-center relative z-10">
                    {step.status === "done" && (
                      <button
                        type="button"
                        onClick={step.onClick}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white transition-transform hover:scale-110"
                        style={{ background: "linear-gradient(135deg, var(--primary, #00897B), #00695C)", boxShadow: "0 6px 20px -4px rgba(0,137,123,0.4)" }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                    {step.status === "active" && (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: "var(--primary, #00897B)" }}></div>
                        <div
                          className="relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white"
                          style={{ background: "linear-gradient(135deg, var(--primary, #00897B), #00695C)", boxShadow: "0 8px 24px -4px rgba(0,137,123,0.5)" }}
                        >
                          <step.icon className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                    {step.status === "pending" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white text-slate-400 ring-4 ring-white">
                        <step.icon className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`mt-2.5 text-[11px] font-bold uppercase tracking-wider ${step.status === "pending" ? "text-slate-400" : "text-slate-900"}`}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-10">
        {isCartEmpty ? (
          <div className="py-16 sm:py-20 md:py-24 text-center">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3 sm:mb-4">
              <ShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 text-slate-400" />
            </div>
            <p className="text-sm sm:text-base text-slate-700 font-semibold">Your cart is empty</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
              style={{ color: "var(--primary, #00897B)" }}
            >
              Continue shopping
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex flex-col lg:grid lg:grid-cols-[2fr_1.1fr] gap-4 sm:gap-5 md:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {viewMode === "card" ? (
                <section className="space-y-3 sm:space-y-4">
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 tracking-tight">Shipping Details</h2>
                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 max-w-xl">Review and manage your primary delivery information.</p>
                  </div>

                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-[0_12px_40px_rgba(15,23,42,0.06)] overflow-hidden">
                    <div className="p-4 sm:p-5 md:px-6 md:py-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--primary-lighthead,#E0F2F1)" }}>
                            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--primary,#00897B)" }} />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">Shipping Address</p>
                            <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-[0.18em]">Default Address</p>
                          </div>
                        </div>
                        <button onClick={() => setViewMode("form")} className="text-[10px] sm:text-[11px] font-semibold text-[var(--primary,#00897B)] hover:underline">Edit Details</button>
                      </div>

                      <div className="flex flex-col sm:grid sm:grid-cols-[1.1fr_1.4fr] gap-6 sm:gap-8 md:gap-10 text-xs mb-4 sm:mb-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-1 sm:mb-1.5">Recipient</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 break-words">{fullName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-1 sm:mb-1.5">Contact</p>
                            <div className="space-y-1 sm:space-y-1.5">
                              <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 break-all"><Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />{email || "No email added"}</p>
                              <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600"><Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />{phone ? `+91 ${phone}` : "No phone added"}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-1 sm:mb-1.5">Delivery Address</p>
                          <div className="flex gap-1.5 sm:gap-2.5">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" style={{ color: "var(--primary,#00897B)" }} />
                            <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed break-words">
                              {address || "No address saved yet"}
                              {(place || state || pincode) && (
                                <><br />{place}{place && (state || pincode) ? ", " : ""}{state}{state && pincode ? ", " : ""}{pincode}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button onClick={() => setViewMode("form")} className="w-full mt-2 sm:mt-3 h-9 sm:h-10 rounded-xl border border-dashed border-slate-200 bg-white text-[10px] sm:text-[11px] font-semibold text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1.5 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" /> ADD NEW ADDRESS
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_30px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 md:px-6 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--primary, #00897B), #00695C)" }}>
                        {hasSavedAddress ? <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{hasSavedAddress ? "Edit Delivery Address" : "Add Delivery Address"}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{hasSavedAddress ? "Update your delivery information" : "Where should we send your order?"}</p>
                      </div>
                    </div>
                    {hasSavedAddress && (
                      <button onClick={() => setViewMode("card")} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition self-start sm:self-auto">
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Cancel
                      </button>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <TextInput label="Full Name" placeholder="John Doe" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <TextInput label="Email" placeholder="johndoe@gmail.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <TextInput label="Phone Number" icon={Phone} type="tel" maxLength={14} placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <TextInput label="Address" icon={MapPin} placeholder="House / Flat No, Street, Area" value={address} onChange={(e) => setAddress(e.target.value)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      <TextInput label="City" placeholder="Chennai" icon={MapPin} value={place} onChange={(e) => setPlace(e.target.value)} />
                      <TextInput label="State" placeholder="Tamil Nadu" icon={MapPin} value={state} onChange={(e) => setState(e.target.value)} />
                      <TextInput label="Pincode" placeholder="560001" icon={MapPin} type="tel" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      className="group relative w-full flex items-center justify-center gap-2 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all duration-300 overflow-hidden text-sm sm:text-base"
                      style={{ background: "linear-gradient(135deg, var(--primary, #00897B), #00695C)", boxShadow: "0 10px 30px -10px rgba(0, 137, 123, 0.5)" }}
                    >
                      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                      <span className="relative flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{hasSavedAddress ? "Update Address" : "Save Address"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-5 h-fit lg:sticky lg:top-20">
              {/* Order Summary */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_30px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-4 sm:p-5 md:p-6">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-3">Order Summary</h3>

                  {cartItems.length > 0 && (
                    <div className="mb-4 border border-slate-100 rounded-xl sm:rounded-2xl bg-slate-50/50 max-h-40 overflow-y-auto custom-scrollbar">
                      {cartItems.map((item) => (
                        <div key={item.id || item.productId} className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 border-b last:border-b-0 border-slate-100">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            <img src={item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] sm:text-[13px] font-medium text-slate-900 truncate">{item.name}</p>
                            <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-[11px] sm:text-[13px] font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <dl className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500">Subtotal ({totalItems} {totalItems !== 1 ? "items" : "item"})</dt>
                      <dd className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500 flex items-center gap-1 sm:gap-1.5">Shipping<span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-emerald-50 text-emerald-700 uppercase">Free</span></dt>
                      <dd className="text-emerald-600 font-bold">{shippingLabel}</dd>
                    </div>
                    <div className="border-t border-dashed border-slate-200 my-2 sm:my-3"></div>
                    <div className="flex justify-between items-center">
                      <dt className="text-sm sm:text-base font-bold text-slate-900">Total</dt>
                      <dd className="text-lg sm:text-xl font-bold" style={{ color: "var(--primary, #00897B)" }}>₹{total.toLocaleString()}</dd>
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 text-right">Inclusive of all taxes</p>
                  </dl>
                </div>
              </div>

              {/* Payment Method - Fixed icon alignment */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_30px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Payment Method</h3>
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600"><ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />Secure</span>
                  </div>

                  {/* Online Payment Option */}
                  <label className={`group/pay block rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 cursor-pointer transition-all ${paymentMethod === "online" ? "border-[var(--primary,#00897B)] bg-gradient-to-br from-[var(--primary-lighthead,#E0F2F1)]/30 to-transparent shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="sr-only peer" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "online" ? "border-[var(--primary,#00897B)]" : "border-slate-300"}`}>
                          {paymentMethod === "online" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--primary, #00897B)" }}></div>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">Online Payment</p>
                            <p className="text-xs text-slate-500">UPI, Cards, Net Banking</p>
                          </div>
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: paymentMethod === "online" ? "var(--primary-lighthead, #E0F2F1)" : "#F1F5F9" }}>
                            <CreditCard className="w-4 h-4" style={{ color: paymentMethod === "online" ? "var(--primary, #00897B)" : "#64748B" }} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          {[{ src: upiLogo, alt: "UPI" }, { src: mastercardLogo, alt: "Mastercard" }, { src: netbankingLogo, alt: "Net Banking" }].map((logo, i) => (
                            <div key={i} className="flex h-9 w-16 items-center justify-center bg-white rounded-lg border border-slate-100 px-2">
                              <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* COD Payment Option */}
                  <label className={`group/pay block rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[var(--primary,#00897B)] bg-gradient-to-br from-[var(--primary-lighthead,#E0F2F1)]/30 to-transparent shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="sr-only peer" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "cod" ? "border-[var(--primary,#00897B)]" : "border-slate-300"}`}>
                          {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--primary, #00897B)" }}></div>}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                          <p className="text-xs text-slate-500">Pay when you receive</p>
                        </div>
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: paymentMethod === "cod" ? "var(--primary-lighthead, #E0F2F1)" : "#F1F5F9" }}>
                          <Wallet className="w-4 h-4" style={{ color: paymentMethod === "cod" ? "var(--primary, #00897B)" : "#64748B" }} />
                        </div>
                      </div>
                    </div>
                  </label>

                  {paymentMethod === "online" && (
                    <div className="flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs leading-5 text-emerald-700">Secure payment. Your card/UPI details are not stored on our website.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || viewMode === "form"}
                className="group relative w-full flex items-center justify-center gap-2 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-sm sm:text-base"
                style={{ background: "linear-gradient(135deg, var(--primary, #00897B), #00695C)", boxShadow: "0 12px 30px -10px rgba(0, 137, 123, 0.6)" }}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center gap-2">
                  {submitting ? (
                    <><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Processing...</>
                  ) : viewMode === "form" ? (
                    "Save address to continue"
                  ) : paymentMethod === "online" ? (
                    <><LockKeyhole className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Pay ₹{total.toLocaleString()} Now</>
                  ) : (
                    <><Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Place Order (COD)</>
                  )}
                </span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-[90%] sm:max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <button onClick={() => { setShowSuccess(false); navigate("/products"); }} className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur hover:bg-slate-100 text-slate-500 hover:text-slate-900 hover:rotate-90 transition-all">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 text-center">
              <div className="relative mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20">
                <div className="absolute inset-0 rounded-full bg-emerald-200 animate-ping opacity-20"></div>
                <div className="absolute inset-1 sm:inset-2 rounded-full bg-emerald-100 animate-pulse"></div>
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{paymentMethod === "online" ? "Payment Successful!" : "Order Placed!"}</h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                {paymentMethod === "online" ? "Your payment is complete and your order is confirmed." : "Your order has been placed successfully. Please pay in cash upon delivery."}
              </p>
              <div className="mt-4 sm:mt-5 inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-50 border border-slate-100">
                <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700">{totalItems} {totalItems === 1 ? "item" : "items"} • ₹{total.toLocaleString()}</span>
              </div>
              <div className="mt-5 sm:mt-7 space-y-2 sm:space-y-3">
                <button onClick={() => navigate("/products")} className="group relative w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 overflow-hidden text-sm sm:text-base" style={{ background: "linear-gradient(135deg, var(--primary, #00897B), #00695C)", boxShadow: "0 10px 30px -10px rgba(0, 137, 123, 0.5)" }}>
                  <span className="relative flex items-center gap-2">Continue Shopping <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" /></span>
                </button>
                <button onClick={() => navigate("/orders")} className="w-full text-xs sm:text-sm font-bold hover:underline transition-colors" style={{ color: "var(--primary, #00897B)" }}>View My Orders →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        }
      `}</style>
    </div>
  );
}