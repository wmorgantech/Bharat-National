// src/components/CartPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "./FormControl";
import { loadCart, saveCart } from "../utils/CartStorage";

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
    <div className="min-h-screen bg-gray-50">
      {/* simple page header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-500">
            Review the items in your cart before checkout.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-10">
        {isCartEmpty ? (
          /* ========= PREMIUM EMPTY STATE ========= */
          <div className="py-12 sm:py-16 md:py-20 flex flex-col items-center justify-center text-center">
            <div className="mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
              Your Cart is Empty
            </h2>

            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 max-w-md px-4">
              Looks like you haven&apos;t added any products yet.
            </p>

            <PrimaryButton
              type="button"
              className="mt-4 sm:mt-5 md:mt-6 w-auto px-4 sm:px-5 md:px-6 text-sm sm:text-base"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 sm:gap-5 md:gap-6 items-start">
            {/* Cart items */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 md:p-5 w-full">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4 py-3 sm:py-4 ${
                    index !== cartItems.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  {/* image */}
                  <div className="h-16 w-20 sm:h-20 sm:w-24 md:h-20 md:w-28 overflow-hidden rounded-lg sm:rounded-xl bg-slate-100 flex-shrink-0 self-center xs:self-auto">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* title + price */}
                  <div className="flex-1 min-w-0 w-full xs:w-auto">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900 break-words line-clamp-2">
                      {item.name}
                    </h2>
                    <p className="mt-0.5 sm:mt-1 text-sm text-slate-600 font-medium">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* qty + delete */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto justify-between xs:justify-end mt-2 xs:mt-0">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/60 px-1 sm:px-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1.5 sm:p-1 text-slate-500 hover:text-slate-900 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <span className="px-1.5 sm:px-2 min-w-[1.75rem] text-center text-sm font-medium text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, +1)}
                        className="p-1.5 sm:p-1 text-slate-500 hover:text-slate-900 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 sm:p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 md:p-5 w-full lg:sticky lg:top-20">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">
                Order Summary
              </h3>
              <dl className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">
                    Subtotal ({totalItems} item{totalItems > 1 ? "s" : ""})
                  </dt>
                  <dd className="font-medium text-slate-900">
                    ₹{subtotal.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="font-medium text-emerald-600">
                    {shippingLabel}
                  </dd>
                </div>
                <div className="h-px bg-slate-200 my-2 sm:my-3" />
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <dt className="font-semibold text-slate-900">Total</dt>
                  <dd className="font-semibold text-slate-900">
                    ₹{total.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <PrimaryButton
                type="button"
                iconRight={ArrowRight}
                onClick={() => navigate("/checkout", { state: { cartItems } })}
                className="mt-4 sm:mt-5 w-full sm:w-auto text-sm sm:text-base"
              >
                Proceed to Checkout
              </PrimaryButton>
              
              {/* Continue shopping link for mobile */}
              <button
                onClick={() => navigate("/products")}
                className="mt-3 text-xs sm:text-sm text-slate-500 hover:text-slate-700 underline w-full text-center sm:hidden"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}