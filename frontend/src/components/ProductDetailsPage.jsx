// src/pages/ProductDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Check,
  Package,
  ArrowRight,
} from "lucide-react";
import { toast } from 'react-toastify';
import { getProductById } from "../api/Product";
import { addToCart, loadCart } from "../utils/CartStorage";

/**
 * Product console.
 *
 * Only fields the API returns are rendered. The Product model has no rating,
 * discount or specification table, so none are shown; `stock` is displayed
 * only when the payload actually carries it.
 */
const HIGHLIGHTS = [
  {
    Icon: Truck,
    title: "Fast Delivery",
    copy: "Delivery in 2–5 business days for major cities.",
    tint: "text-primary",
    chip: "bg-primary-50",
  },
  {
    Icon: ShieldCheck,
    title: "Warranty",
    copy: "1-year standard brand warranty on electronics.",
    tint: "text-primary",
    chip: "bg-primary-50",
  },
];

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        const data = res?.data ?? res;
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);
        // Keyed so StrictMode's double-invoked mount effect cannot double-toast.
        toast.error("Failed to load product details", {
          toastId: `product-load-failed-${id}`,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Store product to add after login
      const pendingItem = { product, quantity: 1 };
      localStorage.setItem('pendingCartItem', JSON.stringify(pendingItem));

      toast.error('Please login to add items to cart', {
        duration: 3000,
        position: "top-right",
      });

      // Navigate to signup page
      navigate('/signup', {
        state: {
          redirectTo: `/product/${id}`,
          pendingCartItem: pendingItem
        }
      });
      return;
    }

    // User is authenticated, add to cart
    addToCart(product, 1);

    // Open cart drawer
    window.dispatchEvent(new Event("cart:open"));

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);

    toast.success('Added to cart!', {
      duration: 1500,
      position: "top-right",
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Store product to add after login
      const pendingItem = { product, quantity: 1 };
      localStorage.setItem('pendingCartItem', JSON.stringify(pendingItem));

      toast.error('Please login to proceed with purchase', {
        duration: 3000,
        position: "top-right",
      });

      // Navigate to signup page
      navigate('/signup', {
        state: {
          redirectTo: `/product/${id}`,
          pendingCartItem: pendingItem,
          buyNow: true
        }
      });
      return;
    }

    // User is authenticated, add to cart and go to checkout
    addToCart(product, 1);

    // Open cart drawer briefly
    window.dispatchEvent(new Event("cart:open"));

    // Navigate to checkout
    const cartItems = loadCart();
    navigate("/checkout", { state: { cartItems } });
  };

  if (loading || !product) {
    return (
      <div className="section-shell py-12 md:py-16">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="glass-2 p-4">
            <div className="skeleton aspect-square w-full" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-14 w-48 mt-8" />
            <div className="skeleton h-12 w-full mt-6" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Normalize images array
  const images = Array.isArray(product.imageUrl)
    ? product.imageUrl
    : product.imageUrl
    ? [product.imageUrl]
    : product.image
    ? [product.image]
    : [];

  const mainImage = images[activeImageIndex] || "/placeholder-product.png";

  const categoryLabel =
    product.category?.name || product.categoryName || product.category || "";

  const brandLabel =
    product.brand?.name || product.brandName || product.brand || "";

  const priceNumber = Number(product.price) || 0;

  const inStock = product.stock === undefined || product.stock > 0;

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Top bar */}
      <div className="relative bg-white border-b border-ink-200 sticky top-0 z-20">
        <div className="section-shell h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2 text-xs min-w-0">
            {categoryLabel && (
              <span className="rounded-full bg-white border border-ink-200 px-3 py-1 font-medium text-ink-600 truncate">
                {categoryLabel}
              </span>
            )}
            {brandLabel && (
              <span className="rounded-full bg-primary-50 border border-primary/30 px-3 py-1 font-semibold text-primary truncate">
                {brandLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative section-shell py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] gap-8 lg:gap-12 items-start">
        {/* ---- LEFT: gallery ---- */}
        <div
          className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24"
          data-aos="fade-right"
        >
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0 shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  aria-current={idx === activeImageIndex}
                  className={`w-[70px] h-[70px] rounded-xl border-2 flex-shrink-0 overflow-hidden bg-white p-1.5 transition-all duration-300 ${
 idx === activeImageIndex
 ? "border-primary "
 : "border-ink-200 hover:border-primary/30"
 }`}
                >
                  <img
                    src={img}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="glass-1 relative flex-1 overflow-hidden">
            <div className="relative w-full aspect-square max-h-[560px] flex items-center justify-center p-8 md:p-12">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* ---- RIGHT: information console ---- */}
        <div data-aos="fade-left"data-aos-delay="100">
          <div className="glass-1 p-6 md:p-8">
            {brandLabel && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {brandLabel}
              </p>
            )}

            <h1 className="mt-3 font-display text-2xl md:text-[32px] font-bold tracking-[-0.03em] leading-[1.14] text-ink-900 text-balance">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-7 pb-7 border-b border-ink-200">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">
                Price
              </p>
              <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-4xl font-bold tracking-tight text-ink-900 tabular-nums">
                  {priceNumber.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span className="text-xs text-ink-500">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Availability - only when the API supplies stock. */}
              {product.stock !== undefined && (
                <div
                  className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
 inStock
 ? "border-primary/30 bg-primary-50 text-primary"
 : "border-red-200 bg-red-50 text-red-700"
 }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
 inStock ? "bg-primary" : "bg-red-400"
 }`}
                  />
                  <span>
                    {product.stock > 0
                      ? `In Stock (${product.stock} left)`
                      : "Out of Stock"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary btn-lg flex-1"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-secondary btn-lg flex-1"
              >
                Buy Now
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Highlights */}
            <ul className="mt-8 grid gap-2.5">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item.title}
                  className="glass-3 flex items-start gap-3 p-3.5 transition-colors duration-300 hover:bg-white"
                >
                  <span
                    className={`grid place-items-center h-9 w-9 shrink-0 rounded-xl ${item.chip} ${item.tint}`}
                  >
                    <item.Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed text-ink-500 mt-0.5">
                      {item.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <div className="glass-2 mt-5 p-6">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Description
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {product.description || "No description available."}
            </p>

            {categoryLabel && (
              <div className="mt-6 pt-5 border-t border-ink-200 flex items-center gap-2.5 text-[12.5px] text-ink-500">
                <Package size={14} className="text-primary shrink-0" />
                Listed under{" "}
                <span className="font-semibold text-ink-700">
                  {categoryLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
