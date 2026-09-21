// src/utils/CartStorage.js
const CART_KEY = "bnc_cart";
const CART_ID_KEY = "bnc_cart_id";

function getCartCountFromItems(items) {
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function notifyCartUpdated(items) {
  if (typeof window === "undefined") return;
  const count = getCartCountFromItems(items);
  window.dispatchEvent(
    new CustomEvent("cart_updated", {
      detail: { count, items },
    })
  );
}

export function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load cart from localStorage", err);
    return [];
  }
}

export function saveCart(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    notifyCartUpdated(items);
  } catch (err) {
    console.error("Failed to save cart to localStorage", err);
  }
}

export function clearCart() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_KEY);
    notifyCartUpdated([]);
  } catch (err) {
    console.error("Failed to clear cart from localStorage", err);
  }
}

/**
 * Always returns a string cartId (or null on SSR).
 */
export function getOrCreateCartId() {
  if (typeof window === "undefined") return null;

  let cid = localStorage.getItem(CART_ID_KEY);
  if (!cid) {
    if (window.crypto?.randomUUID) {
      cid = window.crypto.randomUUID();
    } else {
      cid = `cart_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
    localStorage.setItem(CART_ID_KEY, cid);
  }
  return cid;
}

export function clearCartId() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_ID_KEY);
  } catch (err) {
    console.error("Failed to clear cartId from localStorage", err);
  }
}

/**
 * Add a product to cart and store the cartId in each item (optional).
 */
export function addToCart(product, quantity = 1) {
  const cartId = getOrCreateCartId();
  const current = loadCart();

  const productId = product.id ?? product.productId;
  const priceNumber = Number(product.price) || 0;
  const mainImage = Array.isArray(product.imageUrl)
    ? product.imageUrl[0]
    : product.imageUrl || product.image || "/placeholder-product.png";

  const existingIndex = current.findIndex((item) => item.id === productId);

  let next;
  if (existingIndex !== -1) {
    next = current.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    const newItem = {
      id: productId,
      productId: productId,
      name: product.name,
      price: priceNumber,
      imageUrl: mainImage,
      quantity,
      cartId, // optional per-item info
    };
    next = [...current, newItem];
  }

  saveCart(next);
  return next;
}

export function getCartCount() {
  const items = loadCart();
  return getCartCountFromItems(items);
}
