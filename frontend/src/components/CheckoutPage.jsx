// src/pages/CheckoutPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Package,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TextInput } from "./FormControl";
import { createOrder, getLastOrderForUser } from "../api/Order";
import { createPaymentOrder, verifyPayment } from "../api/Payment";
import { clearCart } from "../utils/CartStorage";
import { toast } from "react-toastify";
import upiLogo from "../assets/upi.png";
import mastercardLogo from "../assets/mastercard.png";
import netbankingLogo from "../assets/netbanking.png";

const PENDING_CART_KEY = "pendingCheckoutCart";
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

/**
 * Checkout accent.
 *
 * The storefront's brand colour is the teal in tailwind.config.js; this red is
 * used only here, and only on the commit action and its supporting marks, so
 * the single most important button on the site reads instantly. Declared once
 * so it can be retuned in one place rather than hunted through the markup.
 */
const BNC_RED = "#C8102E";
const BNC_RED_DARK = "#A00D25";

/**
 * Each payment option carries its own accent so the two tiles read apart at a
 * glance instead of relying on the radio dot alone. Online uses the storefront
 * teal; cash uses a warm amber. Colour is applied only to the selected tile -
 * an unselected tile stays neutral, so the choice stays obvious.
 *
 * Declared outside the component: this never changes between renders.
 */
const PAYMENT_OPTIONS = [
  {
    value: "online",
    Icon: CreditCard,
    title: "Online",
    hint: "UPI, Cards, Net Banking",
    accent: "#00897B",
    tint: "#E6F4F2",
    ring: "rgba(0,137,123,0.45)",
  },
  {
    value: "cod",
    Icon: Wallet,
    title: "Cash on Delivery",
    hint: "Pay when you receive",
    accent: "#B45309",
    tint: "#FEF6E7",
    ring: "rgba(180,83,9,0.40)",
  },
];

function loadRazorpayCheckout() {
 if (window.Razorpay) return Promise.resolve(window.Razorpay);
 if (razorpayScriptPromise) return razorpayScriptPromise;

 razorpayScriptPromise = new Promise((resolve, reject) => {
 const existingScript = document.querySelector(
 'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
 );
 const script = existingScript || document.createElement("script");

 const handleLoad = () => {
 if (window.Razorpay) resolve(window.Razorpay);
 else reject(new Error("Razorpay Checkout could not be loaded"));
 };
 const handleError = () => reject(new Error("Razorpay Checkout could not be loaded"));

 script.addEventListener("load", handleLoad, { once: true });
 script.addEventListener("error", handleError, { once: true });

 if (!existingScript) {
 script.src = RAZORPAY_SCRIPT_URL;
 script.async = true;
 document.body.appendChild(script);
 }
 }).catch((error) => {
 razorpayScriptPromise = null;
 throw error;
 });

 return razorpayScriptPromise;
}

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
 const [pendingOnlineOrderId, setPendingOnlineOrderId] = useState(null);

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
 console.error("No last order / failed to load last order:", err.message);
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
 } catch {
 setCartItems([]);
 }
 }
 }
 };
 window.addEventListener("storage", handleAuthChange);
 handleAuthChange();
 return () => window.removeEventListener("storage", handleAuthChange);
 }, [cartItems.length, location.state?.cartItems]);

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

 let orderId = pendingOnlineOrderId;
 if (paymentMethod === "online" && !orderId) {
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
 const createdOrder = await createOrder(payload);
 orderId = createdOrder?.order?.id;
 if (!orderId) throw new Error("Order could not be created");
 setPendingOnlineOrderId(orderId);
 }

 if (paymentMethod === "cod") {
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
 // Single notification for this action: the confirmation screen below.
 // A success toast here duplicated it.
 setShowSuccess(true);
 return;
 }

 const paymentOrder = await createPaymentOrder(orderId);
 if (!paymentOrder?.razorpayOrderId || !paymentOrder?.amount || !paymentOrder?.currency || !paymentOrder?.keyId) {
 throw new Error("Payment order could not be created");
 }

 const Razorpay = await loadRazorpayCheckout();
 let checkoutFinished = false;

 const finishPayment = async (paymentResponse) => {
 if (checkoutFinished) return;
 checkoutFinished = true;

 if (
 paymentResponse?.razorpay_order_id !== paymentOrder.razorpayOrderId ||
 !paymentResponse?.razorpay_payment_id ||
 !paymentResponse?.razorpay_signature
 ) {
 setSubmitting(false);
 toast.error("Payment details were incomplete. Your cart is still saved.");
 return;
 }

 try {
 await verifyPayment({
 razorpayOrderId: paymentResponse.razorpay_order_id,
 razorpayPaymentId: paymentResponse.razorpay_payment_id,
 razorpaySignature: paymentResponse.razorpay_signature,
 });
 clearCart();
 localStorage.removeItem(PENDING_CART_KEY);
 window.history.replaceState({}, document.title);
 setPendingOnlineOrderId(null);
 // Single notification for this action: the confirmation screen below.
 setShowSuccess(true);
 } catch (error) {
 console.error("Payment verification failed", error);
 toast.error("Payment verification failed. Your cart is still saved; please retry.");
 } finally {
 setSubmitting(false);
 }
 };

 const checkout = new Razorpay({
 key: paymentOrder.keyId,
 amount: paymentOrder.amount,
 currency: paymentOrder.currency,
 order_id: paymentOrder.razorpayOrderId,
 name: "Bharat National Computers",
 prefill: {
 name: fullName.trim(),
 email: email.trim(),
 contact: getDigits(phone),
 },
 handler: finishPayment,
 modal: {
 ondismiss: () => {
 if (checkoutFinished) return;
 checkoutFinished = true;
 setSubmitting(false);
 toast.info("Payment window closed. Your cart is saved; you can retry.");
 },
 },
 });
 checkout.on("payment.failed", () => {
 if (checkoutFinished) return;
 checkoutFinished = true;
 setSubmitting(false);
 toast.error("Payment failed. Your cart is saved; please try again.");
 });
 checkout.open();
 } catch (err) {
 console.error(err);
 setSubmitting(false);
 toast.error(paymentMethod === "online" ? "Unable to start online payment. Please try again." : "Failed to place order. Please try again.");
 } finally {
 if (paymentMethod === "cod") setSubmitting(false);
 }
 };

 const sectionLabel =
 "text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400";

 return (
 <div className="min-h-screen bg-white">
 {/* ==============================================================
 HEADER
 =============================================================== */}
 <header className="border-b border-ink-100">
 <div className="section-shell flex h-16 items-center justify-between gap-4">
 <h1 className="font-display text-lg font-bold tracking-[-0.02em] text-ink-900 md:text-xl">
 Secure Checkout
 </h1>

 <button
 type="button"
 onClick={() => navigate("/cart")}
 className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-900"
 >
 <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
 <span className="hidden sm:inline">Back to Cart</span>
 <span className="sm:hidden">Back</span>
 </button>
 </div>
 </header>

 {/* ==============================================================
 MAIN
 =============================================================== */}
 <main className="section-shell py-10 md:py-14">
 {isCartEmpty ? (
 <div className="py-24 text-center">
 <ShoppingBag className="mx-auto h-10 w-10 text-ink-300" />
 <p className="mt-5 font-display text-lg font-bold text-ink-900">
 Your cart is empty
 </p>
 <button
 type="button"
 onClick={() => navigate("/products")}
 className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-dark"
 >
 Continue shopping
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 ) : (
 <form
 onSubmit={handlePlaceOrder}
 className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,400px)] lg:gap-20"
 >
 {/* ==========================================================
 LEFT - contact, address, payment
 =========================================================== */}
 <div className="space-y-14">
 {/* ---------- CONTACT + DELIVERY ---------- */}
 <section>
 <div className="flex items-baseline justify-between gap-4">
 <h2 className={sectionLabel}>Contact &amp; Delivery</h2>
 {viewMode === "card" && (
 <button
 type="button"
 onClick={() => setViewMode("form")}
 className="text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-dark"
 >
 Edit
 </button>
 )}
 {viewMode === "form" && hasSavedAddress && (
 <button
 type="button"
 onClick={() => setViewMode("card")}
 className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-400 transition-colors hover:text-ink-700"
 >
 <X className="h-3.5 w-3.5" />
 Cancel
 </button>
 )}
 </div>

 <div className="mt-5 h-px bg-ink-100" />

 {viewMode === "card" ? (
 <div className="mt-7 grid gap-8 sm:grid-cols-2">
 <div>
 <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
 Recipient
 </p>
 <p className="mt-2 text-[15px] font-semibold text-ink-900 break-words">
 {fullName || "—"}
 </p>
 <p className="mt-3 flex items-center gap-2 text-[13.5px] text-ink-500 break-all">
 <Mail className="h-3.5 w-3.5 shrink-0 text-ink-300" />
 {email || "No email added"}
 </p>
 <p className="mt-1.5 flex items-center gap-2 text-[13.5px] text-ink-500">
 <Phone className="h-3.5 w-3.5 shrink-0 text-ink-300" />
 {phone ? `+91 ${phone}` : "No phone added"}
 </p>
 </div>

 <div>
 <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
 Delivery Address
 </p>
 <p className="mt-2 flex gap-2 text-[13.5px] leading-relaxed text-ink-600">
 <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
 <span className="break-words">
 {address || "No address saved yet"}
 {(place || state || pincode) && (
 <>
 <br />
 {place}
 {place && (state || pincode) ? ", " : ""}
 {state}
 {state && pincode ? ", " : ""}
 {pincode}
 </>
 )}
 </span>
 </p>
 </div>
 </div>
 ) : (
 <div className="mt-7 space-y-5">
 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
 <TextInput label="Full Name" placeholder="John Doe" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} />
 <TextInput label="Email" placeholder="johndoe@gmail.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
 </div>

 <TextInput label="Phone Number" icon={Phone} type="tel" maxLength={14} placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
 <TextInput label="Address" icon={MapPin} placeholder="House / Flat No, Street, Area" value={address} onChange={(e) => setAddress(e.target.value)} />

 <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
 <TextInput label="City" placeholder="Chennai" icon={MapPin} value={place} onChange={(e) => setPlace(e.target.value)} />
 <TextInput label="State" placeholder="Tamil Nadu" icon={MapPin} value={state} onChange={(e) => setState(e.target.value)} />
 <TextInput label="Pincode" placeholder="560001" icon={MapPin} type="tel" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} />
 </div>

 <button
 type="button"
 onClick={handleSaveAddress}
 className="btn-primary btn-lg mt-1 w-full sm:w-auto sm:min-w-[240px]"
 >
 <CheckCircle2 className="h-4 w-4" />
 {hasSavedAddress ? "Update Address" : "Save Address"}
 </button>
 </div>
 )}
 </section>

 {/* ---------- PAYMENT METHOD ---------- */}
 <section>
 <div className="flex items-baseline justify-between gap-4">
 <h2 className={sectionLabel}>Payment Method</h2>
 <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
 <ShieldCheck className="h-3.5 w-3.5" />
 Secure
 </span>
 </div>

 <div className="mt-5 h-px bg-ink-100" />

 {/*
 Two compact tiles side by side rather than stacked full-width
 cards. The provider logos moved out of the selected tile and sit
 underneath, so choosing a method no longer changes the height of
 the block - the layout stays still as you switch.
 */}
 <div className="mt-6 grid grid-cols-2 gap-3">
 {PAYMENT_OPTIONS.map((option) => {
 const { value, title, hint, accent, tint, ring } = option;
 const active = paymentMethod === value;

 return (
 <label
 key={value}
 style={active ? { borderColor: accent, backgroundColor: tint, boxShadow: `0 0 0 1px ${accent}, 0 6px 18px -10px ${ring}` } : undefined}
 className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-200 ${
 active ? "" : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50/60"
 }`}
 >
 <input
 type="radio"
 name="paymentMethod"
 value={value}
 checked={active}
 onChange={() => setPaymentMethod(value)}
 className="sr-only"
 />

 <span
 style={active ? { backgroundColor: accent } : undefined}
 className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
 active ? "text-white" : "bg-ink-100 text-ink-400 group-hover:text-ink-600"
 }`}
 >
 <option.Icon className="h-[15px] w-[15px]" />
 </span>

 <span className="min-w-0 flex-1">
 <span
 style={active ? { color: accent } : undefined}
 className={`block truncate text-[13.5px] font-semibold leading-tight transition-colors ${
 active ? "" : "text-ink-700"
 }`}
 >
 {title}
 </span>
 <span className="mt-0.5 block truncate text-[11.5px] leading-tight text-ink-400">
 {hint}
 </span>
 </span>

 {active && (
 <CheckCircle2
 style={{ color: accent }}
 className="h-4 w-4 shrink-0"
 />
 )}
 </label>
 );
 })}
 </div>

 {/* Provider marks - shown once, outside the tiles. */}
 <div className="mt-5 flex items-center gap-4">
 <div className="flex items-center gap-2.5">
 {[
 { src: upiLogo, alt: "UPI" },
 { src: mastercardLogo, alt: "Mastercard" },
 { src: netbankingLogo, alt: "Net Banking" },
 ].map((logo, i) => (
 <img
 key={i}
 src={logo.src}
 alt={logo.alt}
 className={`h-5 w-auto object-contain transition-opacity duration-200 ${
 paymentMethod === "online" ? "opacity-100" : "opacity-30"
 }`}
 />
 ))}
 </div>

 <span className="h-4 w-px bg-ink-200" />

 <p className="flex items-center gap-1.5 text-[11.5px] text-ink-400">
 <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
 Card / UPI details are never stored on our website
 </p>
 </div>
 </section>
 </div>

 {/* ==========================================================
 RIGHT - sticky order summary
 =========================================================== */}
 <aside className="lg:sticky lg:top-8">
 <div className="rounded-2xl border border-ink-200 p-6 md:p-7">
 <h2 className={sectionLabel}>Order Summary</h2>

 <div className="mt-5 h-px bg-ink-100" />

 {/* Items */}
 <ul className="mt-5 max-h-[248px] space-y-4 overflow-y-auto pr-1 custom-scrollbar">
 {cartItems.map((item) => (
 <li
 key={item.id || item.productId}
 className="flex items-center gap-3.5"
 >
 <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
 <img
 src={item.image || item.imageUrl}
 alt={item.name}
 className="h-full w-full object-contain p-1.5"
 />
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-[13.5px] font-medium text-ink-900">
 {item.name}
 </p>
 <p className="mt-0.5 text-[12px] text-ink-400">
 Qty {item.quantity}
 </p>
 </div>
 <p className="shrink-0 text-[13.5px] font-semibold tabular-nums text-ink-900">
 ₹{(item.price * item.quantity).toLocaleString()}
 </p>
 </li>
 ))}
 </ul>

 <div className="mt-6 h-px bg-ink-100" />

 {/* Totals */}
 <dl className="mt-5 space-y-3 text-[13.5px]">
 <div className="flex items-center justify-between">
 <dt className="text-ink-500">
 Subtotal ({totalItems} {totalItems !== 1 ? "items" : "item"})
 </dt>
 <dd className="font-semibold tabular-nums text-ink-900">
 ₹{subtotal.toLocaleString()}
 </dd>
 </div>
 <div className="flex items-center justify-between">
 <dt className="text-ink-500">Delivery</dt>
 <dd className="font-semibold text-primary">{shippingLabel}</dd>
 </div>
 </dl>

 <div className="mt-5 h-px bg-ink-100" />

 <div className="mt-5 flex items-baseline justify-between">
 <span className="font-display text-[15px] font-bold text-ink-900">
 Total
 </span>
 <span className="font-display text-[26px] font-bold tabular-nums text-ink-900">
 ₹{total.toLocaleString()}
 </span>
 </div>
 <p className="mt-1 text-right text-[11.5px] text-ink-400">
 Inclusive of all taxes
 </p>

 {/* Commit action */}
 <button
 type="submit"
 disabled={submitting || viewMode === "form"}
 style={{
 backgroundColor:
 submitting || viewMode === "form" ? undefined : BNC_RED,
 "--tw-ring-color": BNC_RED,
 }}
 onMouseEnter={(e) => {
 if (!submitting && viewMode !== "form")
 e.currentTarget.style.backgroundColor = BNC_RED_DARK;
 }}
 onMouseLeave={(e) => {
 if (!submitting && viewMode !== "form")
 e.currentTarget.style.backgroundColor = BNC_RED;
 }}
 className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_28px_-10px_rgba(200,16,46,0.55)] focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none"
 >
 {submitting ? (
 <>
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
 Processing...
 </>
 ) : viewMode === "form" ? (
 "Save address to continue"
 ) : paymentMethod === "online" ? (
 <>
 <LockKeyhole className="h-4 w-4" />
 Pay ₹{total.toLocaleString()} Now
 </>
 ) : (
 <>
 <Wallet className="h-4 w-4" />
 Place Order (COD)
 </>
 )}
 </button>

 <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-400">
 <LockKeyhole className="h-3 w-3" />
 Encrypted and processed by Razorpay
 </p>
 </div>
 </aside>
 </form>
 )}
 </main>

 {/* ==============================================================
 SUCCESS MODAL
 =============================================================== */}
 {/*
 Portalled onto <body> deliberately. Routes render inside
 `<main class="page-enter">`, whose pageIn animation uses
 `animation-fill-mode: both` and therefore leaves an identity transform
 matrix on that element permanently. A transform - even an identity one -
 makes the element the containing block for `position: fixed` children,
 and that <main> collapses to zero height once its only child is out of
 flow. Rendered in place, this modal resolved to a ~32px sliver at the
 footer instead of covering the viewport.
 */}
 {showSuccess && createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-900/40 p-4 animate-in fade-in duration-300">
 <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
 <button
 type="button"
 onClick={() => { setShowSuccess(false); navigate("/products"); }}
 className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-all hover:rotate-90 hover:text-ink-900"
 >
 <X className="h-4 w-4" />
 </button>

 <div className="px-8 py-12 text-center">
 <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-50">
 <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={2.2} />
 </div>

 <h2 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em] text-ink-900">
 {paymentMethod === "online" ? "Payment Successful" : "Order Placed"}
 </h2>
 <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-relaxed text-ink-500">
 {paymentMethod === "online"
 ? "Your payment is complete and your order is confirmed."
 : "Your order has been placed successfully. Please pay in cash upon delivery."}
 </p>

 <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2">
 <Package className="h-3.5 w-3.5 text-ink-400" />
 <span className="text-[12.5px] font-semibold text-ink-700">
 {totalItems} {totalItems === 1 ? "item" : "items"} • ₹{total.toLocaleString()}
 </span>
 </div>

 <div className="mt-8 space-y-3">
 <button
 type="button"
 onClick={() => navigate("/products")}
 className="btn-primary btn-lg w-full"
 >
 Continue Shopping
 <ChevronRight className="h-4 w-4" />
 </button>
 <button
 type="button"
 onClick={() => navigate("/orders")}
 className="w-full text-[13px] font-semibold text-ink-500 transition-colors hover:text-ink-900"
 >
 View My Orders →
 </button>
 </div>
 </div>
 </div>
 </div>,
 document.body,
 )}

 <style>{`
 .custom-scrollbar::-webkit-scrollbar { width: 4px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 3px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
 `}</style>
 </div>
 );
}
