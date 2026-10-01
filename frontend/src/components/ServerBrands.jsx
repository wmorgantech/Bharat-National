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
      card: "border-[#DCE7F1] bg-[#F4F8FC]",
      panel: "border-[#D3E2F0] bg-white/80",
      label: "border-[#D7E9FF] bg-[#F7FBFF] text-blue-800",
    },
  },
  {
    id: "hpe",
    name: "HPE",
    line: "ProLiant Gen11",
    tagline: "ProLiant Gen11 servers designed for hybrid cloud intelligence and data security.",
    logo: hp,
    theme: {
      card: "border-[#D9E9E0] bg-[#F2F8F4]",
      panel: "border-[#D4EADF] bg-white/80",
      label: "border-[#D7EFE2] bg-[#F5FBF7] text-emerald-800",
    },
  },
  {
    id: "lenovo",
    name: "Lenovo",
    line: "ThinkSystem",
    tagline: "ThinkSystem servers delivering reliability, management, and security for the data center.",
    logo: lenova,
    theme: {
      card: "border-[#F0DEDE] bg-[#FFF6F6]",
      panel: "border-[#F1DFDF] bg-white/80",
      label: "border-[#F4DEDE] bg-[#FFFAFA] text-red-700",
    },
  },
];

export default function ServerBrands() {
  return (
    <section className="py-8 md:py-12">
      <div className="section-shell">
        <div className="mb-5 md:mb-7" data-aos="fade-up">
          <span className="eyebrow">Server platforms</span>
          <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[32px]">
            Server brands we support
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up">
          {BRANDS.map(({ id, name, line, tagline, logo, theme }, index) => (
            <article
              key={id}
              data-aos="fade-up"
              data-aos-delay={index * 60}
              className={`group relative overflow-hidden rounded-[22px] border p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${theme.card}`}
            >
              <div className="relative flex flex-col">
                <div className={`flex h-28 items-center justify-center rounded-[18px] border px-4 transition-colors duration-200 group-hover:bg-white md:h-32 ${theme.panel}`}>
                  <img
                    src={logo}
                    alt={name}
                    className="h-14 w-auto max-w-[80%] object-contain object-center transition-transform duration-300 group-hover:scale-[1.04] md:h-16"
                    loading="lazy"
                  />
                </div>

                <div className="mt-4 border-t border-ink-200/80 pt-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${theme.label}`}>
                    {line}
                  </span>
                  <h3 className="mt-3 text-lg font-extrabold tracking-[-0.02em] text-ink-900 md:text-[1.1rem]">
                    {name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 md:text-[13px]">
                    {tagline}
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
