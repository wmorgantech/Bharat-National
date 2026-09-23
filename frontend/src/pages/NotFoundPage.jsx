// src/pages/NotFoundPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Wrench,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

/**
 * 404 page.
 *
 * Every suggestion points at a route that actually exists in App.jsx.
 */
const SUGGESTIONS = [
  {
    Icon: ShoppingBag,
    label: "Browse Products",
    copy: "Desktops, laptops, networking and more.",
    path: "/products",
  },
  {
    Icon: Wrench,
    label: "IT Services",
    copy: "Installation, AMC, security and support.",
    path: "/services",
  },
  {
    Icon: MessageSquare,
    label: "Contact Us",
    copy: "Tell us what you need and we'll reply.",
    path: "/contact",
  },
];

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="section-shell py-16 md:py-24 w-full">
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <p className="font-display text-[72px] sm:text-[96px] font-bold leading-none tracking-[-0.04em] text-primary select-none">
            404
          </p>

          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Page not found
          </h1>

          <p className="mt-3 mx-auto max-w-md text-[15px] leading-relaxed text-ink-500">
            The page you are looking for may have moved, or the link is out of
            date.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-primary btn-lg"
            >
              <Home size={16} />
              Go Home
            </button>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="btn-secondary btn-lg"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ---- Suggestions ---- */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s.path}
              type="button"
              onClick={() => navigate(s.path)}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              className="card-service group p-5 text-left"
            >
              <span className="icon-chip-md">
                <s.Icon size={17} />
              </span>

              <span className="mt-4 flex items-center gap-1.5 font-display text-sm font-semibold text-ink-900">
                {s.label}
                <ArrowUpRight
                  size={14}
                  className="text-primary opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                />
              </span>

              <span className="mt-1.5 block text-[12.5px] leading-relaxed text-ink-500">
                {s.copy}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
