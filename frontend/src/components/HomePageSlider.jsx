import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, Headset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import driver from "../assets/driverinstall.avif";
import computer from "../assets/computer.avif";
import server from "../assets/server.jpeg";

const slides = [
  {
    url: computer,
    eyebrow: "Desktops · Laptops · Workstations",
    title: "Technology that keeps your business moving",
    copy: "Genuine hardware from the brands you trust, configured and delivered by a team that supports it for life.",
  },
  {
    url: driver,
    eyebrow: "Installation · Configuration · Support",
    title: "We don't just sell it. We set it up.",
    copy: "On-site installation, driver and OS configuration, and proactive maintenance so you are productive from day one.",
  },
  {
    url: server,
    eyebrow: "Servers · Networking · Security",
    title: "Infrastructure built to stay up",
    copy: "Dell, HPE and Lenovo server infrastructure with firewall, backup and monitoring designed around your uptime.",
  },
];

const TRUST = [
  { Icon: ShieldCheck, label: "Genuine products" },
  { Icon: Truck, label: "On-site installation" },
  { Icon: Headset, label: "Lifetime service support" },
];

export default function HomePageSlider() {
  const autoPlayInterval = 5000;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  const slideCount = slides.length;
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  }, [slideCount]);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timerRef.current);
  }, [nextSlide]);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  return (
    // AOS animates this outer wrapper only. The inner track below owns an
    // inline translateX for sliding, so it must not carry data-aos.
    <section
      data-aos="fade-up"
      className="relative w-full bg-white overflow-hidden
 h-[78vh] min-h-[520px] max-h-[860px]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ---- Image track ---- */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full relative flex-shrink-0">
            <img
              src={slide.url}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover scale-105"
            />
            {/* Scrim: heavier on the left so the copy always stays legible. */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/50 via-ink-900/70 to-ink-900/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-ink-900/40" />
          </div>
        ))}
      </div>

      {/* Faint brand wash + grid, so the hero reads as a product surface
          rather than a stock photo with text dropped on it. */}

      {/* ---- Copy overlay (static frame, content swaps with the slide) ---- */}
      <div className="absolute inset-0 flex items-center">
        <div className="section-shell w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
              {slides[currentIndex].eyebrow}
            </span>

            <h1
              key={`t-${currentIndex}`}
              className="mt-5 text-3xl sm:text-4xl lg:text-[52px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink-900 text-balance
 motion-safe:animate-[fadeUp_600ms_ease-out_both]"
            >
              {slides[currentIndex].title}
            </h1>

            <p
              key={`c-${currentIndex}`}
              className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-ink-700
 motion-safe:animate-[fadeUp_600ms_120ms_ease-out_both]"
            >
              {slides[currentIndex].copy}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="btn-primary btn-lg"
              >
                Shop Products
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/services")}
                className="btn-on-dark btn-lg"
              >
                Explore Services
              </button>
            </div>

            {/* Trust strip */}
            <ul className="mt-10 hidden sm:flex flex-wrap items-center gap-x-7 gap-y-3">
              {TRUST.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-xs font-medium text-ink-600"
                >
                  <item.Icon size={15} className="text-primary-light" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ---- Controls ---- */}
      <div className="absolute inset-x-0 bottom-6 md:bottom-8">
        <div className="section-shell flex items-center justify-between gap-4">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
 index === currentIndex
 ? "w-10 bg-primary-light"
 : "w-4 bg-white hover:bg-white"
 }`}
              />
            ))}
            <span className="ml-3 text-[11px] font-medium tabular-nums text-ink-500">
              {String(currentIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
            </span>
          </div>

          {/* Arrows (pointer devices only - touch users swipe) */}
          <div className="hidden [@media(hover:hover)]:flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="h-10 w-10 grid place-items-center rounded-full border border-ink-200 bg-white text-ink-900 hover:bg-white hover:text-ink-900 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="h-10 w-10 grid place-items-center rounded-full border border-ink-200 bg-white text-ink-900 hover:bg-white hover:text-ink-900 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
