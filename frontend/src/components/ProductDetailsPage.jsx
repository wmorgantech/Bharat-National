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
        <div className="section-shell py-14 md:py-20">
          <div className="grid gap-10 lg:gap-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,440px)]">
            <div className="skeleton aspect-square w-full rounded-3xl" />
            <div className="space-y-5 pt-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-10 w-4/5" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-12 w-56 mt-10" />
              <div className="skeleton h-12 w-full mt-8" />
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
      {/* ================================================================
          BREADCRUMB
      ================================================================= */}
      <div className="border-b border-ink-100">
        <div className="section-shell flex h-14 items-center gap-2 text-[13px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 font-medium text-ink-500 transition-colors hover:text-primary"
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

      {/* ================================================================
          HERO - gallery left, buying console right
      ================================================================= */}
      <section className="section-shell py-10 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,440px)] lg:gap-20">
          {/* ---- Gallery ---- */}
          <div className="lg:sticky lg:top-24" data-aos="fade-up">
            <div className="group relative overflow-hidden rounded-3xl bg-ink-50">
              <div className="flex aspect-square max-h-[620px] w-full items-center justify-center p-8 md:p-14">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(15,23,42,0.10)] transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  loading="eager"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={idx === activeImageIndex}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ink-50 p-2.5 transition-all duration-300 ${
                      idx === activeImageIndex
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-white"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- Buying console ---- */}
          <div data-aos="fade-up" data-aos-delay="100">
            {brandLabel && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {brandLabel}
              </p>
            )}

            <h1 className="mt-4 font-display text-[30px] font-bold leading-[1.12] tracking-[-0.03em] text-ink-900 text-balance md:text-[40px]">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-5 line-clamp-3 text-[15px] leading-relaxed text-ink-500">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mt-9 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-[38px] font-bold tracking-tight text-ink-900 tabular-nums md:text-[44px]">
                {priceLabel}
              </span>
              <span className="text-[13px] text-ink-400">
                Inclusive of all taxes
              </span>
            </div>

            {/* Availability - only when the API supplies stock. */}
            {product.stock !== undefined && (
              <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold">
                <span
                  className={`h-2 w-2 rounded-full ${
                    inStock ? "bg-primary" : "bg-red-500"
                  }`}
                />
                <span className={inStock ? "text-primary" : "text-red-600"}>
                  {product.stock > 0
                    ? `In Stock (${product.stock} left)`
                    : "Out of Stock"}
                </span>
              </div>
            )}

            <div className="mt-9 h-px bg-ink-100" />

            {/* Quantity */}
            <div className="mt-8 flex items-center gap-5">
              <span className="text-[13px] font-semibold text-ink-700">
                Quantity
              </span>
              <div className="inline-flex items-center rounded-full border border-ink-200">
                <button
                  type="button"
                  onClick={() => stepQty(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-11 w-11 place-items-center rounded-full text-ink-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-display text-base font-bold tabular-nums text-ink-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => stepQty(1)}
                  disabled={quantity >= MAX_QTY}
                  aria-label="Increase quantity"
                  className="grid h-11 w-11 place-items-center rounded-full text-ink-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary btn-lg flex-1"
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
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
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Assurances */}
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <item.Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                      {item.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          DESCRIPTION - editorial
      ================================================================= */}
      <section className="border-t border-ink-100 bg-ink-50/50">
        <div className="section-shell py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-20">
            <div data-aos="fade-up">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900 md:text-[26px]">
                About this product
              </h2>
              {categoryLabel && (
                <p className="mt-3 text-[13px] text-ink-500">
                  Listed under{" "}
                  <span className="font-semibold text-ink-700">
                    {categoryLabel}
                  </span>
                </p>
              )}
            </div>

            <div data-aos="fade-up" data-aos-delay="80">
              <p className="max-w-[68ch] whitespace-pre-line text-[15.5px] leading-[1.85] text-ink-600">
                {product.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY BHARAT NATIONAL
      ================================================================= */}
      <section className="border-t border-ink-100">
        <div className="section-shell py-14 md:py-20">
          <h2
            className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900 md:text-[26px]"
            data-aos="fade-up"
          >
            Why Bharat National
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {HIGHLIGHTS.map((item, i) => (
              <div
                key={item.title}
                className="group flex items-start gap-4"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary transition-transform duration-300 group-hover:scale-105">
                  <item.Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[15px] font-bold text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-500">
                    {item.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          RELATED PRODUCTS - real products from the same category
      ================================================================= */}
      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-ink-50/50">
          <div className="section-shell py-14 md:py-20">
            <div
              className="flex flex-wrap items-end justify-between gap-4"
              data-aos="fade-up"
            >
              <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900 md:text-[26px]">
                More in {categoryLabel || "this range"}
              </h2>

              {categoryLabel && product.categoryId && (
                <Link
                  to={`/category/${product.categoryId}/products`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {related.map((item, i) => (
                <div key={item.id} data-aos="fade-up" data-aos-delay={i * 60}>
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
