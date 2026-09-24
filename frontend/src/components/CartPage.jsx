// src/components/CartPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadCart, saveCart } from "../utils/CartStorage";

/**
 * Cart console.
 *
 * Totals, quantity clamping and persistence are the original implementation -
 * only the surface around them is new. Readability is prioritised over effect
 * here because this is a transactional screen.
 */
export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Load cart items from localStorage on first render
  useEffect(() => {
    const stored = loadCart();
    setCartItems(stored);
  }, []);

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

  const shippingLabel = subtotal > 0 ? "Free" : "—";
  const total = subtotal;
  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden">

      <div className="relative section-shell py-12 md:py-16">
        {/* ---- Header ---- */}
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <span className="eyebrow">Your bag</span>
            <h1 className="mt-3 font-display text-[30px] md:text-[42px] font-bold tracking-[-0.03em] text-ink-900">
              Your Cart
            </h1>
          </div>

          {!isCartEmpty && (
            <p className="hidden sm:block text-sm text-ink-500 pb-2 tabular-nums">
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {isCartEmpty ? (
          /* ========= EMPTY STATE ========= */
          <div
            className="glass-1 p-10 md:p-20 text-center"
            data-aos="fade-up"
          >
            <span className="grid place-items-center h-20 w-20 mx-auto rounded-3xl bg-primary-50 text-primary">
              <ShoppingCart className="w-9 h-9" />
            </span>

            <h2 className="mt-7 font-display text-xl md:text-2xl font-semibold tracking-tight text-ink-900">
              Your cart is empty
            </h2>

            <p className="mt-2.5 mx-auto max-w-md text-sm text-ink-500">
              Looks like you haven&apos;t added any products yet.
            </p>

            <button
              type="button"
              className="btn-primary btn-lg mt-9"
              onClick={() => navigate("/products")}
            >
              Start Shopping
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* ---- Items ---- */}
            <div className="lg:col-span-8"data-aos="fade-up">
              <div className="glass-2 p-4 sm:p-6">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`group flex items-start gap-4 sm:gap-5 py-4 sm:py-5 ${
 index !== cartItems.length - 1
 ? "border-b border-ink-200"
 : ""
 }`}
                  >
                    {/* image */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-white border border-ink-200 p-2">
                      <img
                        src={item.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-sm sm:text-[15px] font-medium leading-snug text-ink-900 line-clamp-2">
                          {item.name}
                        </h2>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 grid place-items-center h-8 w-8 rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="mt-1 text-sm text-ink-500 tabular-nums">
                        ₹{item.price.toLocaleString()}
                      </p>

                      <div className="mt-3.5 flex items-center justify-between gap-3 flex-wrap">
                        {/* qty stepper */}
                        <div className="inline-flex items-center rounded-full border border-ink-200 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            className="grid place-items-center h-9 w-9 rounded-full text-ink-600 hover:text-primary hover:bg-primary-50 transition-colors"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-1 min-w-[2rem] text-center text-sm font-semibold tabular-nums text-ink-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, +1)}
                            className="grid place-items-center h-9 w-9 rounded-full text-ink-600 hover:text-primary hover:bg-primary-50 transition-colors"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* line total */}
                        <p className="font-display text-base font-bold tracking-tight text-ink-900 tabular-nums">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Order summary ---- */}
            <div
              className="lg:col-span-4 lg:sticky lg:top-28"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <div className="glass-1 p-6">
                <span className="eyebrow">Order summary</span>

                <dl className="mt-6 space-y-3.5 text-sm">
                  <div className="flex justify-between items-center">
                    <dt className="text-ink-500">
                      Subtotal ({totalItems} item{totalItems === 1 ? "" : "s"})
                    </dt>
                    <dd className="font-semibold text-ink-900 tabular-nums">
                      ₹{subtotal.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-ink-500">Shipping</dt>
                    <dd className="font-semibold text-primary">
                      {shippingLabel}
                    </dd>
                  </div>

                  <div className="h-px bg-ink-200 !my-5" />

                  <div className="flex justify-between items-baseline">
                    <dt className="font-semibold text-ink-900">Total</dt>
                    <dd className="font-display text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
                      ₹{total.toLocaleString()}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => navigate("/checkout", { state: { cartItems } })}
                  className="btn-primary btn-lg w-full mt-7"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="btn-secondary btn-md w-full mt-3"
                >
                  Continue Shopping
                </button>

                <ul className="mt-6 pt-5 border-t border-ink-200 space-y-2.5">
                  <li className="flex items-center gap-2.5 text-[11.5px] text-ink-500">
                    <ShieldCheck size={13} className="text-primary shrink-0" />
                    Genuine products with brand warranty
                  </li>
                  <li className="flex items-center gap-2.5 text-[11.5px] text-ink-500">
                    <Truck size={13} className="text-primary shrink-0" />
                    Delivery in 2–5 business days for major cities
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
