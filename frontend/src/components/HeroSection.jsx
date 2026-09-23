// src/components/HeroSection.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Wrench,
  Lock,
} from "lucide-react";
import laptopImg from "../assets/products/laptop.svg";
import monitorImg from "../assets/products/monitor.svg";
import routerImg from "../assets/products/router.svg";
import cctvImg from "../assets/products/cctv.svg";
import printerImg from "../assets/products/printer.svg";
import accessoriesImg from "../assets/products/accessories.svg";

/**
 * Home banner.
 *
 * Three slides, each pointing at a route that already exists. Copy is drawn
 * from what BNC actually supplies and supports - nothing here claims a
 * product line, statistic or policy the project does not already state.
 */
const SLIDES = [
  {
    id: "compute",
    eyebrow: "Laptops, desktops & workstations",
    title: ["Technology that", "powers your business"],
    copy: "Genuine hardware from the brands we partner with, specified for the way you actually work.",
    cta: { label: "Shop Now", to: "/products" },
    alt: { label: "Talk to us", to: "/contact" },
    lead: laptopImg,
    leadAlt: "Laptop",
    thumbs: [
      { src: monitorImg, alt: "Monitor" },
      { src: accessoriesImg, alt: "Keyboard and mouse" },
    ],
  },
  {
    id: "network",
    eyebrow: "Networking & surveillance",
    title: ["Connected and", "secured, end to end"],
    copy: "Routers, switches, firewalls and CCTV - supplied, installed and maintained by our own engineers.",
    cta: { label: "Explore Services", to: "/services" },
    alt: { label: "Browse Products", to: "/products" },
    lead: routerImg,
    leadAlt: "Wireless router",
    thumbs: [
      { src: cctvImg, alt: "CCTV camera" },
      { src: monitorImg, alt: "Monitor" },
    ],
  },
  {
    id: "print",
    eyebrow: "Printers & peripherals",
    title: ["Everything else", "your office runs on"],
    copy: "Printers, scanners, storage and accessories, with service support that continues after the sale.",
    cta: { label: "Shop Now", to: "/products" },
    alt: { label: "Our Services", to: "/services" },
    lead: printerImg,
    leadAlt: "Office printer",
    thumbs: [
      { src: accessoriesImg, alt: "Keyboard and mouse" },
      { src: routerImg, alt: "Wireless router" },
    ],
  },
];

/** Grounded in commitments the site already makes elsewhere. */
const ASSURANCES = [
  { Icon: ShieldCheck, label: "100% Genuine Products" },
  { Icon: BadgeCheck, label: "Official Brand Warranty" },
  { Icon: Wrench, label: "On-site Installation" },
  { Icon: Lock, label: "Secure Checkout" },
];

const AUTOPLAY_MS = 6000;

export default function HeroSection() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  // Absolute jump from the dots; wrapped so an out-of-range index is safe.
  const go = useCallback((next) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  // Autoplay, skipped entirely when the visitor prefers reduced motion and
  // paused while the banner has pointer or keyboard focus.
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || paused) return undefined;

    timer.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer.current);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <>
      {/* ================= BANNER ================= */}
      <section className="section-shell pt-6 md:pt-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-50 via-white to-ink-50"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Featured categories"
        >
          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 md:py-14 lg:grid-cols-2 lg:gap-6 lg:px-14">
            {/* ---- Copy ---- */}
            <div key={`copy-${slide.id}`} className="anim-panel-fast min-w-0">
              <span className="eyebrow">{slide.eyebrow}</span>

              <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[38px] lg:text-[46px]">
                {slide.title[0]}
                <br />
                <span className="text-primary">{slide.title[1]}</span>
              </h1>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
                {slide.copy}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(slide.cta.to)}
                  className="btn-primary btn-lg"
                >
                  {slide.cta.label}
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(slide.alt.to)}
                  className="btn-secondary btn-lg"
                >
                  {slide.alt.label}
                </button>
              </div>
            </div>

            {/* ---- Product visual ---- */}
            <div key={`art-${slide.id}`} className="anim-panel-fast">
              <img
                src={slide.lead}
                alt={slide.leadAlt}
                className="mx-auto w-full max-w-[420px]"
                width="400"
                height="300"
              />
              <div className="mx-auto mt-2 flex max-w-[420px] items-center justify-center gap-4">
                {slide.thumbs.map((t) => (
                  <img
                    key={t.alt}
                    src={t.src}
                    alt={t.alt}
                    className="w-28 sm:w-32"
                    width="400"
                    height="300"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ---- Slide controls ---- */}
          <div className="flex items-center justify-center gap-2 pb-5">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}: ${s.eyebrow}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-primary"
                    : "w-2 bg-ink-300 hover:bg-ink-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="section-shell pt-4">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200 lg:grid-cols-4">
          {ASSURANCES.map((a) => (
            <li
              key={a.label}
              className="flex items-center justify-center gap-2.5 bg-white px-4 py-4 text-center"
            >
              <a.Icon size={18} className="shrink-0 text-primary" />
              <span className="text-[12.5px] font-medium text-ink-700 sm:text-[13.5px]">
                {a.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
