// src/components/ProductDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Check,
  ArrowRight,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { getProductById, getProductsByCategory } from "../api/Product";
import { addToCart, loadCart } from "../utils/CartStorage";
import ProductCard from "./ProductCard";
import placeholderImg from "../assets/products/placeholder.svg";

/**
 * Product console.
 *
 * Only fields the API returns are rendered. The Product model carries
 * name, description, price, imageUrl[], category and brand - and nothing
 * else - so there is deliberately no specification table, rating or
 * discount here. `stock` is displayed only when the payload carries it.
 */
const HIGHLIGHTS = [
  {
    Icon: Truck,
    title: "Delivery",
    copy: "Shipped to the delivery address on your order.",
  },
  {
    Icon: ShieldCheck,
    title: "Warranty",
    copy: "Standard brand warranty on electronics.",
  },
];

const MAX_QTY = 10;

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem("authToken");
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

  // A new product means a new gallery, a fresh quantity and a new category.
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  // Related products come from the product's own category. Failures are
  // silent: the section simply does not render, which must never block the
  // page the customer actually asked for.
  useEffect(() => {
    const categoryId = product?.categoryId ?? product?.category?.id;
    if (!categoryId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await getProductsByCategory(categoryId);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (cancelled) return;
        setRelated(list.filter((p) => String(p.id) !== String(product.id)).slice(0, 4));
      } catch {
        if (!cancelled) setRelated([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Store product to add after login
      const pendingItem = { product, quantity };
      localStorage.setItem("pendingCartItem", JSON.stringify(pendingItem));

      toast.error("Please login to add items to cart", {
        duration: 3000,
        position: "top-right",
      });

      // Navigate to signup page
      navigate("/signup", {
        state: {
          redirectTo: `/product/${id}`,
          pendingCartItem: pendingItem,
        },
      });
      return;
    }

    // User is authenticated, add to cart
    addToCart(product, quantity);

    // Open cart drawer
    window.dispatchEvent(new Event("cart:open"));

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);

    toast.success("Added to cart!", {
      duration: 1500,
      position: "top-right",
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Store product to add after login
      const pendingItem = { product, quantity };
      localStorage.setItem("pendingCartItem", JSON.stringify(pendingItem));

      toast.error("Please login to proceed with purchase", {
        duration: 3000,
        position: "top-right",
      });

      // Navigate to signup page
      navigate("/signup", {
        state: {
          redirectTo: `/product/${id}`,
          pendingCartItem: pendingItem,
          buyNow: true,
        },
      });
      return;
    }

    // User is authenticated, add to cart and go to checkout
    addToCart(product, quantity);

    // Open cart drawer briefly
    window.dispatchEvent(new Event("cart:open"));

    // Navigate to checkout
    const cartItems = loadCart();
    navigate("/checkout", { state: { cartItems } });
  };

  if (loading || !product) {
    return (
      <div className="bg-white">
        <div className="section-shell py-5 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-10">
            <div className="skeleton aspect-[4/3] w-full rounded-[20px]" />
            <div className="space-y-4 pt-1">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-10 w-4/5" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton mt-7 h-14 w-48" />
              <div className="skeleton mt-6 h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
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

  const mainImage = images[activeImageIndex] || placeholderImg;

  const categoryLabel =
    product.category?.name || product.categoryName || product.category || "";

  const brandLabel =
    product.brand?.name || product.brandName || product.brand || "";

  const priceNumber = Number(product.price) || 0;

  const inStock = product.stock === undefined || product.stock > 0;

  const priceLabel = priceNumber.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const stepQty = (delta) =>
    setQuantity((q) => Math.min(MAX_QTY, Math.max(1, q + delta)));

  return (
    <div className="bg-white">
      <div className="border-b border-ink-100">
        <div className="section-shell flex h-11 min-w-0 items-center gap-1.5 text-[12px] sm:gap-2 sm:text-[13px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-ink-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {categoryLabel && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-300" />
              <span className="truncate text-ink-500">{categoryLabel}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-300" />
          <span className="truncate font-medium text-ink-800">{product.name}</span>
        </div>
      </div>

      <section className="section-shell min-w-0 py-4 sm:py-6 lg:py-9">
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:gap-9">
          <div className="min-w-0 lg:sticky lg:top-28" data-aos="fade-up">
            <div className="grid min-w-0 gap-2.5 lg:grid-cols-[68px_minmax(0,1fr)] lg:gap-3">
              {images.length > 1 && (
                <div className="order-2 flex max-w-full gap-2 overflow-x-auto pb-1 lg:order-1 lg:max-h-[620px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      aria-current={idx === activeImageIndex}
                      className={`grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white p-1.5 transition-all duration-200 sm:h-16 sm:w-16 lg:h-[64px] lg:w-[64px] ${
                        idx === activeImageIndex
                          ? "border-primary shadow-[0_0_0_2px_rgba(0,137,123,0.12)]"
                          : "border-ink-200 opacity-70 hover:border-ink-400 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" aria-hidden="true" className="h-full w-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <div className="group relative order-1 min-w-0 overflow-hidden rounded-[20px] bg-[#F1F5F4] lg:order-2">
                <div className="relative flex aspect-[4/3] max-h-[650px] items-center justify-center p-4 sm:p-7 lg:p-10">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                    loading="eager"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((current) => (current - 1 + images.length) % images.length)}
                        aria-label="Previous product image"
                        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/90 text-ink-800 shadow-card transition-all hover:scale-105 hover:text-primary"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((current) => (current + 1) % images.length)}
                        aria-label="Next product image"
                        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/90 text-ink-800 shadow-card transition-all hover:scale-105 hover:text-primary"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-ink-700 shadow-card">
                        {activeImageIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:pl-2" data-aos="fade-up" data-aos-delay="80">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.14em]">
              {brandLabel && <span className="text-primary">{brandLabel}</span>}
              {brandLabel && categoryLabel && <span className="h-1 w-1 rounded-full bg-ink-300" />}
              {categoryLabel && <span className="text-ink-500">{categoryLabel}</span>}
            </div>

            <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.08] tracking-[-0.03em] text-ink-900 sm:text-[32px] lg:text-[38px]">
              {product.name}
            </h1>

            {product.stock !== undefined && (
              <div className={`mt-3 inline-flex items-center gap-2 text-[12px] font-semibold ${inStock ? "text-[#18815F]" : "text-red-600"}`}>
                <span className={`h-2 w-2 rounded-full ${inStock ? "bg-[#1C9A70]" : "bg-red-500"}`} />
                {product.stock > 0 ? `In stock · ${product.stock} available` : "Out of stock"}
              </div>
            )}

            <div className="mt-5 border-y border-ink-200 py-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">Price</p>
                  <p className="mt-1 font-display text-[36px] font-bold leading-none tracking-[-0.03em] text-ink-900 tabular-nums sm:text-[42px]">
                    {priceLabel}
                  </p>
                </div>
                <p className="pb-1 text-[11px] text-ink-500">Inclusive of all taxes</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-[13px] font-semibold text-ink-700">Quantity</span>
              <div className="inline-flex items-center rounded-lg border border-ink-200 bg-white">
                <button
                  type="button"
                  onClick={() => stepQty(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-10 w-10 place-items-center text-ink-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-9 text-center text-sm font-bold tabular-nums text-ink-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => stepQty(1)}
                  disabled={quantity >= MAX_QTY}
                  aria-label="Increase quantity"
                  className="grid h-10 w-10 place-items-center text-ink-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary btn min-h-12 w-full px-4 py-3 text-[13px]"
              >
                {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                {justAdded ? "Added to Cart" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-secondary btn min-h-12 w-full px-4 py-3 text-[13px]"
              >
                Buy Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-5 grid gap-3 border-t border-ink-200 pt-4 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <item.Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-ink-900">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-[#F7F9F8]">
        <div className="section-shell grid gap-5 py-7 sm:py-9 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Product information</p>
            <h2 className="mt-2 font-display text-[21px] font-bold leading-tight text-ink-900 sm:text-[24px]">
              About this product
            </h2>
          </div>
          <div className="max-w-[72ch]">
            <p className="whitespace-pre-line text-[14px] leading-[1.8] text-ink-600 sm:text-[15px]">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink-100">
          <div className="section-shell py-8 sm:py-10 lg:py-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Related products</p>
                <h2 className="mt-1 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900 md:text-[26px]">
                  More in {categoryLabel || "this range"}
                </h2>
              </div>
              {categoryLabel && product.categoryId && (
                <Link
                  to={`/category/${product.categoryId}/products`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((item, index) => (
                <div key={item.id} data-aos="fade-up" data-aos-delay={index * 60}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;
