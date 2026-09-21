import React, { useEffect, useMemo, useState } from "react";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadCart, saveCart } from "../utils/CartStorage";
import { PrimaryButton } from "./FormControl";

export default function CartDrawer({ open, onClose }) {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // load when opened (fresh data)
  useEffect(() => {
    if (open) setCartItems(loadCart());
  }, [open]);

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
    <div className="fixed inset-0 z-[999]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <aside
        className="
  absolute right-0 top-0 h-full
  w-[92%] sm:w-[420px]
  bg-white shadow-2xl flex flex-col
"
      >
        {/* header */}
        <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
            shopping Cart
            </h3>
            <p className="text-xs text-slate-500">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto px-4 py-4">
          {isEmpty ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ShoppingCart className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Cart is empty
              </h4>
              <p className="mt-2 text-xs text-slate-500">
                Add products to see them here.
              </p>
              <PrimaryButton
                className="mt-5 px-5"
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
              >
                Browse Products
              </PrimaryButton>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border border-slate-100 rounded-2xl p-3"
                >
                  <div className="h-16 w-20 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                    <img
                      src={
                        Array.isArray(item.imageUrl)
                          ? item.imageUrl[0]
                          : item.imageUrl
                      }
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      ₹{Number(item.price).toLocaleString()}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/60 px-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-2 min-w-[1.75rem] text-center text-sm font-medium text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, +1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-50"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        {!isEmpty && (
          <div className="border-t border-slate-100 px-4 py-4">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>

            <PrimaryButton
              iconRight={ArrowRight}
              onClick={() => {
                onClose();
                navigate("/checkout", { state: { cartItems } });
              }}
              className="w-full"
            >
              Checkout
            </PrimaryButton>

            <button
              type="button"
              className="mt-3 w-full text-sm font-medium text-slate-700 hover:text-[var(--primary)]"
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
            >
              View full cart
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
