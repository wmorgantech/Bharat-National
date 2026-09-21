// ProductCard.jsx
import React, { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { addToCart } from "../utils/CartStorage";
import { PrimaryButton } from "./FormControl";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const navigate = useNavigate();

  const mainImage = Array.isArray(product.imageUrl)
    ? product.imageUrl[0]
    : product.imageUrl || product.image || "/placeholder-product.png";

  const categoryLabel =
    product.category?.name || product.categoryName || product.category || "";

  const priceNumber = Number(product.price) || 0;

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  const handleCardClick = () => {
    if (!product?.id) return;
    navigate(`/product/${product.id}`);
  };

  const handleViewMoreClick = (e) => {
    e.stopPropagation();
    if (!product?.id) return;
    navigate(`/product/${product.id}`);
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (!product) return;

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
          redirectTo: '/',
          pendingCartItem: pendingItem
        }
      });
      return;
    }

    // User is authenticated, add to cart
    addToCart(product, 1);
    window.dispatchEvent(new Event("cart:open"));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    
    toast.success('Added to cart!', {
      duration: 1500,
      position: "top-right",
    });
  };

  return (
    <div
      className="
        group relative bg-white
        rounded-2xl border border-gray-100
        shadow-sm hover:shadow-xl transition-all duration-300
        overflow-hidden cursor-pointer
        flex flex-col
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-[4/3] md:aspect-square bg-white overflow-hidden flex items-center justify-center">
        <button
          type="button"
          onClick={handleCartClick}
          className="
            absolute top-2 right-2 md:top-3 md:right-3
            flex items-center justify-center
            h-9 w-9 rounded-full
            bg-white/90 text-[var(--primary)]
            shadow-sm hover:shadow-lg hover:scale-110
            transition-all duration-200 z-10
            opacity-100 scale-100
            md:opacity-0 md:scale-75 md:pointer-events-none
            md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:pointer-events-auto
          "
          aria-label="Add to cart"
        >
          {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
        </button>

        <img
          src={mainImage}
          alt={product.name}
          className="
            w-full h-full object-contain
            transition-transform duration-500
            group-hover:scale-110
          "
          loading="lazy"
        />
      </div>

      <div className="p-3 md:p-5 flex flex-col gap-2">
        {categoryLabel && (
          <div className="text-[11px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">
            {categoryLabel}
          </div>
        )}

        <h3
          className="font-semibold text-sm md:text-base leading-snug line-clamp-2 transition-colors"
          style={{ color: isHovered ? "var(--primary)" : "#1A1A1A" }}
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg md:text-xl font-bold text-[#1A1A1A] whitespace-nowrap">
            {priceNumber.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </span>
        </div>

        <div
          className="
            pt-1
            transition-all duration-300
            opacity-100 translate-y-0
            md:opacity-0 md:translate-y-6
            md:group-hover:opacity-100 md:group-hover:translate-y-0
          "
        >
          <PrimaryButton onClick={handleViewMoreClick} className="w-full">
            View More
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;