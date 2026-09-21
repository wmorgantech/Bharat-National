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
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Premium Heading */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="hidden sm:block h-px w-12 md:w-16 bg-slate-200" />
            <h1 className="text-3xl font-bold">Multi-Sector Expertise</h1>
            <span className="hidden sm:block h-px w-12 md:w-16 bg-slate-200" />
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Delivering reliable technology solutions tailored for diverse
            industries.
          </p>
        </div>

        {/* Premium marquee container */}
        <div className="relative">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-4 md:px-10 py-6 md:py-8 overflow-hidden">
            {/* Fade edges for premium feel */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />

            <div
              className="flex gap-8 animate-marquee"
              style={{ width: "max-content" }}
            >
              {[...sectors, ...sectors].map((sector, idx) => {
                const Icon = sector.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center gap-3 min-w-[120px]"
                  >
                    <div
                      className="inline-flex items-center justify-center h-14 w-14 rounded-full
                                 border border-[var(--primary)]/25 bg-[var(--primary)]/5
                                 text-[var(--primary)] shadow-sm
                                 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
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
            animation: marquee 25s linear infinite;
          }
        `}
      </style>
    </section>
  );
}
