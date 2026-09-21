import React, { useState, useEffect, useMemo } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Rahul Sharma",
    role: "CEO, TechStart Inc.",
    message:
      "Excellent service! They set up our entire office network in record time. The team was professional and the hardware quality is top-notch.",
  },
  {
    name: "Anita Khanna",
    role: "IT Manager, GreenLeaf Foods",
    message:
      "Bharat National Computers designed a reliable server setup and provides very quick support. Perfect partner for growing businesses.",
  },
  {
    name: "Vikram Singh",
    role: "Founder, BrightWave Studios",
    message:
      "From laptops to complete infrastructure, they handled everything end-to-end. Great pricing and very transparent communication.",
  },
  {
    name: "Meera Iyer",
    role: "Director, Skyline Realty",
    message:
      "Their AMC and on-call support keeps our systems stable. Response time is fast and the engineers are very knowledgeable.",
  },
  {
    name: "Karan Mehta",
    role: "COO, Nova Logistics",
    message:
      "We upgraded all systems through BNC. Smooth deployment, proper documentation and excellent after-sales support.",
  },
  {
    name: "Maren Singh",
    role: "CEO, Startplus Inc",
    message:
      "Their products are very nice and affortable and good working capacity with good services work, and proper finishing.",
  },
];

// helper: group reviews so each slide can show up to 3 cards
const chunkReviews = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function ClientReviews() {
  // each slide = up to 3 reviews
  const slides = useMemo(() => chunkReviews(reviews, 3), []);
  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => setActiveIndex(index);

  // auto scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); // 6 seconds – adjust if you want faster/slower
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="bg-[#e8f7f4] py-14 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Heading */}
        <div className="text-center mb-10">
          
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
           Our Client Reviews
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
            Bharat National Computers is trusted by businesses for reliable IT
            infrastructure, networking and hardware solutions.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Slides wrapper */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0 px-1 md:px-2">
                  <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {slide.map((review, idx) => (
                      <article
                        key={review.name + idx}
                        className="relative h-full rounded-2xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] p-5 md:p-6 overflow-hidden"
                      >
                        {/* soft highlight */}
                        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-100/70" />

                        {/* stars + quote */}
                        <div className="mb-3 flex items-center justify-between relative z-[1]">
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-amber-400"
                              />
                            ))}
                          </div>
                          <Quote className="h-6 w-6 text-emerald-500/80" />
                        </div>

                        {/* text */}
                        <p className="relative z-[1] text-sm leading-relaxed text-slate-600 mb-4">
                          “{review.message}”
                        </p>

                        {/* footer */}
                        <div className="relative z-[1] flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm">
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {review.name}
                            </div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">
                              {review.role}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left / Right arrows */}
          <button
            type="button"
            onClick={prevSlide}
            className="hidden md:flex absolute left-1 -translate-y-1/2 top-1/2 items-center justify-center h-9 w-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="hidden md:flex absolute right-1 -translate-y-1/2 top-1/2 items-center justify-center h-9 w-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
            aria-label="Next reviews"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Indicators */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={[
                  "h-2.5 rounded-full transition-all",
                  isActive
                    ? "w-6 bg-emerald-600"
                    : "w-2.5 bg-emerald-200 hover:bg-emerald-300",
                ].join(" ")}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
