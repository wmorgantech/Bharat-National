import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (visible) {
      setAnimateBell(true);
      const t = setTimeout(() => setAnimateBell(false), 900);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const openWhatsApp = () => {
    const url = `https://wa.me/919789345333`;
    window.open(url, "_blank", "noopener,noreferrer");
  };


  return (
    <>
      <style>{`
        @keyframes bell {
          0% { transform: rotate(0deg); }
          12% { transform: rotate(-18deg); }
          24% { transform: rotate(14deg); }
          36% { transform: rotate(-10deg); }
          48% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          72% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-bell { 
          animation: bell 900ms ease-in-out; 
          transform-origin: 50% 20%; 
        }
      `}</style>

      {visible && (
        <div className="fixed bottom-6 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end gap-3 z-[9999]">
          {/* Scroll-to-top button — ABOVE WhatsApp */}
          <button
            onClick={scrollToTop}
            className="
              flex h-11 w-11 items-center justify-center rounded-full
              bg-[var(--primary)] text-white shadow-lg
              hover:shadow-xl hover:-translate-y-0.5 hover:opacity-90
              transition-all duration-200
            "
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          {/* WhatsApp button + optional hover label */}
          <div className="flex items-center gap-2 group">
            <div
              className="
                hidden sm:block px-3 py-1 rounded-full bg-white/90 text-[11px]
                font-medium text-slate-700 shadow-sm border border-slate-200
                backdrop-blur
                opacity-0 scale-95 translate-x-1
                group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0
                transition-all duration-200
              "
            >
              Chat on WhatsApp
            </div>

            <button
              onClick={openWhatsApp}
              title="Message on WhatsApp"
              aria-label="Open WhatsApp chat"
              className={`
                flex h-11 w-11 items-center justify-center rounded-full 
                bg-white shadow-lg border border-slate-200
                hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-200
                ${animateBell ? "animate-bell" : ""}
              `}
            >
              <FaWhatsapp size={24} color="#25D366" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
