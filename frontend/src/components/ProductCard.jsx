// ProductCard.jsx
import React, { useState } from "react";
import { ShoppingCart, Check, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { addToCart } from "../utils/CartStorage";
import placeholderImg from "../assets/products/placeholder.svg";

/**
 * Compact, image-led product card.
 *
 * Only fields the API actually returns are rendered - name, image, price,
 * brand and category. There is no rating, discount or stock field on the
 * Product model, so none are shown.
 */
const ProductCard = ({ product }) => {
  const [justAdded, setJustAdded] = useState(false);
  const navigate = useNavigate();

  const mainImage = Array.isArray(product.imageUrl)
    ? product.imageUrl[0]
    : product.imageUrl || product.image || placeholderImg;

  const categoryLabel =
    product.category?.name || product.categoryName || product.category || "";

  const brandLabel =
    product.brand?.name || product.brandName || product.brand || "";

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
    <article className="card-product group h-full cursor-pointer" onClick={handleCardClick}>
      {/* ---- Media -------------------------------------------------------- */}
      <div className="card-product-media">
        {categoryLabel && (
          <span className="absolute left-2.5 top-2.5 z-10 max-w-[70%] truncate rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-600">
            {categoryLabel}
          </span>
        )}

        {/* Quick view. Hover-to-reveal is gated on (hover:hover) so touch
            devices - tablets included - keep the action permanently visible
            rather than hiding it behind a hover that never fires. */}
        <button
          type="button"
          onClick={handleViewMoreClick}
          aria-label={`View details for ${product.name}`}
          className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white
 [@media(hover:hover)]:lg:opacity-0 [@media(hover:hover)]:lg:pointer-events-none
 [@media(hover:hover)]:lg:group-hover:opacity-100 [@media(hover:hover)]:lg:group-hover:pointer-events-auto"
        >
          <ArrowUpRight size={15} />
        </button>

        <img
          src={mainImage}
          alt={product.name}
          className="card-product-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = placeholderImg;
          }}
        />
      </div>

      {/* ---- Body --------------------------------------------------------- */}
      <div className="card-product-body">
        {brandLabel && (
          <p className="mb-1 truncate text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
            {brandLabel}
          </p>
        )}

        <h3 className="h-card line-clamp-2 leading-snug transition-colors duration-200 group-hover:text-primary">
          {product.name}
        </h3>

        {/* Pushes the price/action block to the bottom so cards in a row
            stay aligned regardless of title length. */}
        <div className="mt-auto pt-3">
          <span className="text-price block whitespace-nowrap">
            {priceNumber.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}
          </span>

          <button
            type="button"
            onClick={handleCartClick}
            className="btn-primary btn-sm mt-2.5 w-full"
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
