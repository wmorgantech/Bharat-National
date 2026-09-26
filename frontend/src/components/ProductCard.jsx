// ProductCard.jsx
import React, { useState } from "react";
import { ShoppingCart, Check, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "../utils/CartStorage";
import placeholderImg from "../assets/products/placeholder.svg";

const ProductCard = ({ product }) => {
  const [justAdded, setJustAdded] = useState(false);
  const navigate = useNavigate();

  const firstImage = Array.isArray(product.imageUrl)
    ? product.imageUrl[0]
    : product.imageUrl;

  const mainImage = firstImage || product.image || placeholderImg;

  const categoryLabel =
    product.category?.name || product.categoryName || product.category || "";

  const brandLabel =
    product.brand?.name || product.brandName || product.brand || "";

  const priceNumber = Number(product.price) || 0;

  const isAuthenticated = () => {
    return !!localStorage.getItem("authToken");
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
      const pendingItem = { product, quantity: 1 };
      localStorage.setItem("pendingCartItem", JSON.stringify(pendingItem));

      toast.error("Please login to add items to cart", {
        duration: 3000,
        position: "top-right",
      });

      navigate("/signup", {
        state: {
          redirectTo: "/",
          pendingCartItem: pendingItem,
        },
      });
      return;
    }

    addToCart(product, 1);
    window.dispatchEvent(new Event("cart:open"));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);

    toast.success("Added to cart!", {
      duration: 1500,
      position: "top-right",
    });
  };

  return (
    <article
      className="group relative h-full cursor-pointer overflow-hidden rounded-[26px] border border-ink-200 bg-white p-2.5 shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-card-hover"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-[20px] border border-ink-200 bg-[#F7FAF9] transition-colors duration-300 group-hover:border-primary/25 group-hover:bg-[#F1F9F7]">
        {categoryLabel && (
          <span className="absolute left-2.5 top-2.5 z-10 max-w-[72%] truncate rounded-full border border-ink-200 bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-600 backdrop-blur-sm">
            {categoryLabel}
          </span>
        )}

        <button
          type="button"
          onClick={handleViewMoreClick}
          aria-label={`View details for ${product.name}`}
          className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white
          [@media(hover:hover)]:lg:opacity-0 [@media(hover:hover)]:lg:pointer-events-none
          [@media(hover:hover)]:lg:group-hover:opacity-100 [@media(hover:hover)]:lg:group-hover:pointer-events-auto"
        >
          <ArrowUpRight size={15} />
        </button>

        <div className="relative aspect-[5/4] overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.08] sm:p-4"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = placeholderImg;
            }}
          />
        </div>
      </div>

      <div className="flex h-full flex-col px-1 pb-1 pt-4">
        {brandLabel && (
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
            {brandLabel}
          </p>
        )}

        <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-ink-900 transition-colors duration-200 group-hover:text-primary md:text-[16px]">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500 md:text-[13px]">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-price block whitespace-nowrap">
              {priceNumber.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF6F4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              View
            </span>
          </div>

          <button
            type="button"
            onClick={handleCartClick}
            className="btn-primary btn-sm mt-3 w-full transition-transform duration-200 group-hover:translate-y-[-1px]"
          >
            {justAdded ? (
              <>
                <Check size={15} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
