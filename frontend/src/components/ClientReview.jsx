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

  const arrowClass =
"hidden lg:flex absolute -translate-y-1/2 top-1/2 items-center justify-center h-11 w-11 rounded-full bg-white shadow-lift border border-ink-200 text-ink-700 hover:bg-primary hover:text-ink-900 hover:border-primary transition-all duration-200 z-20";

  return (
    <section className="section">
      <div className="section-shell">
        {/* Heading */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12"
          data-aos="fade-up"
        >
          <div className="max-w-2xl">
            <span className="eyebrow">Testimonials</span>
            <h2 className="section-title mt-3">Trusted by teams like yours</h2>
            <p className="section-sub">
              Bharat National Computers is trusted by businesses for reliable IT
              infrastructure, networking and hardware solutions.
            </p>
          </div>

          {/* Mobile / tablet paging, where the side arrows are hidden. */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous reviews"
              className="h-11 w-11 grid place-items-center rounded-full border border-ink-200 text-ink-900 hover:bg-primary hover:text-ink-900 hover:border-primary transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next reviews"
              className="h-11 w-11 grid place-items-center rounded-full border border-ink-200 text-ink-900 hover:bg-primary hover:text-ink-900 hover:border-primary transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel. The reveal sits on this wrapper because the track below
            carries an inline translateX for sliding. */}
        <div className="relative"data-aos="fade-up"data-aos-delay="100">
          {/* Slides wrapper */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-200 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0 px-0.5 md:px-1">
                  <div className="grid gap-5 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {slide.map((review, idx) => (
                      <article
                        key={review.name + idx}
                        className="group relative flex h-full flex-col rounded-3xl bg-white border border-ink-200 shadow-card
 p-6 md:p-7 overflow-hidden
 hover:shadow-lift hover:-translate-y-1 hover:border-primary/30
 transition-all duration-300"
                      >
                        {/* Oversized quote mark as a watermark. */}
                        <Quote
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-2 -right-1 h-24 w-24 text-primary/[0.07] rotate-12"
                        />

                        {/* stars */}
                        <div className="relative z-[1] flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400" />
                          ))}
                        </div>

                        {/* text */}
                        <p className="relative z-[1] mt-4 flex-1 text-sm leading-relaxed text-ink-500">
                          “{review.message}”
                        </p>

                        {/* footer */}
                        <div className="relative z-[1] mt-6 pt-5 border-t border-ink-200 flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-ink-900 truncate">
                              {review.name}
                            </div>
                            <div className="text-[11px] uppercase tracking-wider text-ink-500 truncate">
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
            className={`${arrowClass} -left-5`}
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className={`${arrowClass} -right-5`}
            aria-label="Next reviews"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={[
"h-1.5 rounded-full transition-all duration-300",
                  isActive
                    ? "w-10 bg-primary"
                    : "w-4 bg-white hover:bg-white",
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
