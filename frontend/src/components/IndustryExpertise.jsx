import React from "react";
import {
  School,
  Landmark,
  Building2,
  Store,
  LineChart,
  ShieldCheck,
  Wheat,
} from "lucide-react";

const sectors = [
  { id: 1, label: "Education", icon: School },
  { id: 2, label: "Government", icon: Landmark },
  { id: 3, label: "Corporate", icon: Building2 },
  { id: 4, label: "Retail", icon: Store },
  { id: 5, label: "Finance", icon: LineChart },
  { id: 6, label: "Security", icon: ShieldCheck },
  { id: 7, label: "Agriculture", icon: Wheat },
];

export default function IndustryExpertise() {
  return (
    // Dark band: gives the homepage a rhythm break between the white product
    // and service sections instead of one continuous light scroll.
    <section className="relative py-8 md:py-12 overflow-hidden">

      <div className="relative section-shell">
        <div className="max-w-2xl mb-6 md:mb-8"data-aos="fade-up">
          <span className="eyebrow text-primary-light">Who we serve</span>
          <h2 className="section-title mt-3 text-ink-900">
            Multi-sector expertise
          </h2>
          <p className="section-sub text-ink-500">
            Delivering reliable technology solutions tailored for diverse
            industries.
          </p>
        </div>

        {/* Marquee. The reveal stays on this wrapper - the row inside is a
            duplicated, continuously scrolling track. */}
        <div className="relative"data-aos="fade-up"data-aos-delay="100">
          <div className="relative overflow-hidden">
            {/* Fade edges */}

            <div
              className="flex gap-4 md:gap-5 animate-marquee"
              style={{ width: "max-content" }}
            >
              {[...sectors, ...sectors].map((sector, idx) => {
                const Icon = sector.icon;
                return (
                  <div
                    key={idx}
                    className="group flex items-center gap-3.5 shrink-0
 rounded-2xl border border-ink-200 bg-white 
 px-5 py-4 min-w-[190px]
 transition-all duration-300
 hover:border-primary/50 hover:bg-primary/10"
                  >
                    <span
                      className="grid place-items-center h-11 w-11 shrink-0 rounded-xl
 bg-primary/15 text-primary-light
 transition-colors duration-300
 group-hover:bg-primary group-hover:text-ink-900"
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <p className="text-sm font-semibold text-ink-800 whitespace-nowrap">
                      {sector.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee keyframes */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 32s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee { animation: none; }
          }
        `}
      </style>
    </section>
  );
}
