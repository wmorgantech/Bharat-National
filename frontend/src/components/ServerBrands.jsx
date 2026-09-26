// src/components/ServerBrands.jsx
import React from "react";
import dell from "../assets/dell1.png";
import hp from "../assets/hp.png";
import lenova from "../assets/lenova.png";

const BRANDS = [
  {
    id: "dell",
    name: "Dell Technologies",
    line: "PowerEdge",
    tagline: "PowerEdge servers for scalable business architecture and high-performance computing.",
    logo: dell,
    theme: {
      card: "border-[#cfe2f7] bg-[#edf6ff] shadow-[0_10px_24px_rgba(24,62,99,0.08)]",
      panel: "border-[#d3e6fb] bg-[#f6fbff]",
      label: "border-[#d7e9ff] bg-[#f7fbff] text-blue-800",
    },
  },
  {
    id: "hpe",
    name: "HPE",
    line: "ProLiant Gen11",
    tagline: "ProLiant Gen11 servers designed for hybrid cloud intelligence and data security.",
    logo: hp,
    theme: {
      card: "border-[#c9eaf3] bg-[#eaf8ff] shadow-[0_10px_24px_rgba(20,74,95,0.08)]",
      panel: "border-[#d4edf7] bg-[#f7fdff]",
      label: "border-[#d7effa] bg-[#f7fdff] text-cyan-800",
    },
  },
  {
    id: "lenovo",
    name: "Lenovo Infrastructure",
    line: "ThinkSystem",
    tagline: "ThinkSystem servers delivering reliability, management, and security for the data center.",
    logo: lenova,
    theme: {
      card: "border-[#f2d2d8] bg-[#fff0f3] shadow-[0_10px_24px_rgba(126,64,70,0.08)]",
      panel: "border-[#f5dfe5] bg-[#fffafc]",
      label: "border-[#f7e1e7] bg-[#fffafc] text-red-700",
    },
  },
];

export default function ServerBrands({
  title = "Trusted technology brands",
  subtitle = "We work with established technology leaders to deliver scalable, dependable infrastructure for growing businesses.",
}) {
  return (
    <section className="py-8 md:py-12">
      <div className="section-shell">
        <div className="mb-5 md:mb-7" data-aos="fade-up">
          <span className="eyebrow">Partners</span>
          <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[32px]">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BRANDS.map((b, index) => (
            <article
              key={b.id}
              data-aos="fade-up"
              data-aos-delay={Math.min(index, 5) * 120}
              className={`group relative overflow-hidden rounded-[22px] border ${b.theme.card} p-4 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover`}
            >
              <div className="relative flex flex-col">
                <div className={`flex h-28 items-center justify-center rounded-[18px] border ${b.theme.panel} px-4 shadow-sm md:h-32`}>
                  <img
                    src={b.logo}
                    alt={b.name}
                    className="h-14 w-auto max-w-[80%] object-contain object-center transition-transform duration-300 group-hover:scale-[1.05] md:h-16"
                    loading="lazy"
                  />
                </div>

                <div className="mt-5 border-t border-ink-200/80 pt-5">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${b.theme.label}`}>
                    {b.line}
                  </span>

                  <h3 className="mt-3 text-lg font-extrabold tracking-[-0.02em] text-ink-900 md:text-[1.1rem]">
                    {b.name}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-ink-600 md:text-[13px]">
                    {b.tagline}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
