import React, { useEffect, useMemo, useState } from "react";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingCart, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadCart, saveCart } from "../utils/CartStorage";

/**
 * Floating glass side console for the cart.
 *
 * Cart state management is unchanged - loadCart/saveCart, the quantity
 * clamp and the removal filter are all the original implementation.
 */
export default function CartDrawer({ open, onClose }) {
 const [cartItems, setCartItems] = useState([]);
 const navigate = useNavigate();

 // load when opened (fresh data)
 useEffect(() => {
 if (open) setCartItems(loadCart());
 }, [open]);

 // Escape closes the console; background scroll is locked while it is open.
 useEffect(() => {
 if (!open) return;
 const onKey = (e) => {
 if (e.key === "Escape") onClose?.();
 };
 document.addEventListener("keydown", onKey);
 const prev = document.body.style.overflow;
 document.body.style.overflow = "hidden";
 return () => {
 document.removeEventListener("keydown", onKey);
 document.body.style.overflow = prev;
 };
 }, [open, onClose]);

 const updateQty = (id, delta) => {
 setCartItems((items) => {
 const next = items
 .map((item) =>
 item.id === id
 ? { ...item, quantity: Math.max(1, item.quantity + delta) }
 : item
 )
 .filter((item) => item.quantity > 0);

 saveCart(next);
 return next;
 });
 };

 const removeItem = (id) => {
 setCartItems((items) => {
 const next = items.filter((item) => item.id !== id);
 saveCart(next);
 return next;
 });
 };

 const { subtotal, totalItems } = useMemo(() => {
 const sub = cartItems.reduce(
 (sum, item) => sum + item.price * item.quantity,
 0
 );
 const qty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
 return { subtotal: sub, totalItems: qty };
 }, [cartItems]);

 const isEmpty = cartItems.length === 0;

 if (!open) return null;

 return (
 <div className="fixed inset-0 z-[999]"role="dialog"aria-modal="true"aria-label="Shopping cart">
 {/* backdrop */}
 <div
 className="absolute inset-0 bg-white motion-safe:animate-[fadeIn_200ms_ease-out_both]"
 onClick={onClose}
 />

 {/* console */}
 <aside
 className="absolute right-0 top-0 h-full w-[92%] sm:w-[440px] flex flex-col
 border-l border-ink-200 bg-white 
 shadow-[-24px_0_80px_rgba(0,0,0,0.7)]
 motion-safe:animate-[slideInRight_320ms_cubic-bezier(0.22,1,0.36,1)_both]"
 >
 {/* ambient lighting inside the console */}

 {/* header */}
 <div className="relative px-5 py-5 border-b border-ink-200 flex items-center justify-between shrink-0">
 <div>
 <span className="eyebrow">Your bag</span>
 <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-ink-900">
 Shopping Cart
 </h3>
 <p className="text-xs text-ink-500 mt-0.5 tabular-nums">
 {totalItems} item{totalItems === 1 ? "" : "s"}
 </p>
 </div>

 <button
 type="button"
 onClick={onClose}
 className="grid place-items-center h-9 w-9 rounded-xl bg-white border border-ink-200 text-ink-700 hover:bg-white hover:text-ink-900 hover:rotate-90 transition-all duration-300"
 aria-label="Close cart"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* body */}
 <div className="relative flex-1 overflow-auto px-5 py-5">
 {isEmpty ? (
 <div className="py-20 flex flex-col items-center text-center">
 <span className="grid place-items-center h-16 w-16 rounded-2xl bg-primary-50 text-primary">
 <ShoppingCart className="w-7 h-7" />
 </span>
 <h4 className="mt-5 font-display text-base font-semibold text-ink-900">
 Your cart is empty
 </h4>
 <p className="mt-1.5 text-sm text-ink-500">
 Add products to see them here.
 </p>
 <button
 type="button"
 className="btn-primary btn-md mt-7"
 onClick={() => {
 onClose();
 navigate("/products");
 }}
 >
 Browse Products
 <ArrowRight size={15} />
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 {cartItems.map((item) => (
 <div
 key={item.id}
 className="group glass-3 flex gap-3.5 p-3 transition-all duration-300 hover:border-primary/30 hover:bg-white"
 >
 <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-white border border-ink-200 p-1.5">
 <img
 src={
 Array.isArray(item.imageUrl)
 ? item.imageUrl[0]
 : item.imageUrl
 }
 alt=""
 aria-hidden="true"
 className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
 loading="lazy"
 />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <p className="text-[13px] font-medium leading-snug text-ink-900 line-clamp-2">
 {item.name}
 </p>
 <button
 type="button"
 onClick={() => removeItem(item.id)}
 className="shrink-0 grid place-items-center h-7 w-7 rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-700 transition-colors"
 aria-label={`Remove ${item.name} from cart`}
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="mt-2.5 flex items-center justify-between gap-2">
 <div className="inline-flex items-center rounded-full border border-ink-200 bg-white">
 <button
 type="button"
 onClick={() => updateQty(item.id, -1)}
 className="grid place-items-center h-8 w-8 rounded-full text-ink-600 hover:text-primary hover:bg-primary-50 transition-colors"
 aria-label={`Decrease quantity of ${item.name}`}
 >
 <Minus className="w-3.5 h-3.5" />
 </button>
 <span className="px-1 min-w-[1.75rem] text-center text-[13px] font-semibold tabular-nums text-ink-900">
 {item.quantity}
 </span>
 <button
 type="button"
 onClick={() => updateQty(item.id, +1)}
 className="grid place-items-center h-8 w-8 rounded-full text-ink-600 hover:text-primary hover:bg-primary-50 transition-colors"
 aria-label={`Increase quantity of ${item.name}`}
 >
 <Plus className="w-3.5 h-3.5" />
 </button>
 </div>

 <p className="text-sm font-bold tabular-nums text-ink-900">
 ₹{(Number(item.price) * item.quantity).toLocaleString()}
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* footer */}
 {!isEmpty && (
 <div className="relative border-t border-ink-200 px-5 py-5 shrink-0 bg-white ">
 <div className="flex justify-between items-baseline mb-4">
 <span className="text-sm text-ink-500">Subtotal</span>
 <span className="font-display text-xl font-bold tracking-tight tabular-nums text-ink-900">
 ₹{subtotal.toLocaleString()}
 </span>
 </div>

 <button
 type="button"
 onClick={() => {
 onClose();
 navigate("/checkout", { state: { cartItems } });
 }}
 className="btn-primary btn-lg w-full"
 >
 Checkout
 <ArrowRight size={16} />
 </button>

 <button
 type="button"
 className="mt-3 w-full text-[13px] font-semibold text-ink-500 hover:text-primary transition-colors"
 onClick={() => {
 onClose();
 navigate("/cart");
 }}
 >
 View full cart
 </button>

 <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-ink-400">
 <ShieldCheck size={13} className="text-primary" />
 Secure checkout
 </p>
 </div>
 )}
 </aside>
 </div>
 );
}
