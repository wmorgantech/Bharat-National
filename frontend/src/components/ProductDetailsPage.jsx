// src/pages/ProductDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  IndianRupee,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { toast } from 'react-toastify';
import { getProductById } from "../api/Product";
import { addToCart, loadCart } from "../utils/CartStorage";

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
        toast.error("Failed to load product details");
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
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-500">Loading product details...</p>
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-xs sm:text-sm text-gray-500">
            {categoryLabel && (
              <>
                <span className="text-gray-400">Category:</span>{" "}
                <span className="font-medium text-gray-700">
                  {categoryLabel}
                </span>
              </>
            )}
            {brandLabel && (
              <>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-gray-400">Brand:</span>{" "}
                <span className="font-medium text-gray-700">{brandLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* LEFT: Image gallery */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center justify-center">
            <div className="w-full aspect-square max-h-[480px] bg-white flex items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl border flex-shrink-0 overflow-hidden bg-white transition-all ${
                    idx === activeImageIndex
                      ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
                      : "border-gray-200 hover:border-[var(--primary)]/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h1>

            {brandLabel && (
              <p className="text-sm text-gray-500 mb-1">
                by{" "}
                <span className="font-medium text-gray-800">{brandLabel}</span>
              </p>
            )}
          </div>

          {/* Price box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-start gap-4 shadow-sm">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {priceNumber.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--text-light)",
              }}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              {justAdded ? "Added to Cart ✓" : "Add to Cart"}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-all transform hover:scale-105"
            >
              Buy Now
            </button>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 bg-white rounded-2xl border border-gray-100 p-3">
              <Truck className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Fast Delivery</p>
                <p className="text-xs text-gray-500">
                  Delivery in 2–5 business days for major cities.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white rounded-2xl border border-gray-100 p-3">
              <ShieldCheck className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Warranty</p>
                <p className="text-xs text-gray-500">
                  1-year standard brand warranty on electronics.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed">
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--primary)" }}
            >
              Description
            </h3>
            <p className="whitespace-pre-line">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Additional Info */}
          {product.stock !== undefined && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Availability:</span>
                <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;