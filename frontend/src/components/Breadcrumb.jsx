
import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageHeroBreadcrumb = ({ title, currentLabel, bgColor = "#0f615dff" }) => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full border-b border-black/10"
      style={{ background: bgColor }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-white">
        {/* Page title */}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
          {title}
        </h1>

        {/* Breadcrumb pill */}
        <div className="flex items-center justify-center mt-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[11px] sm:text-xs backdrop-blur">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1 hover:text-[#facc15] transition-colors"
            >
              <Home className="w-3 h-3" />
              <span>Home</span>
            </button>
            <span className="text-white/60">›</span>
            <span className="font-medium">{currentLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeroBreadcrumb;
