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
    tagline:
"PowerEdge servers for scalable business architecture and high-performance computing.",
    logo: dell,
  },
  {
    id: "hpe",
    name: "HPE",
    line: "ProLiant Gen11",
    tagline:
"ProLiant Gen11 servers designed for hybrid cloud intelligence and data security.",
    logo: hp,
  },
  {
    id: "lenovo",
    name: "Lenovo Infrastructure",
    line: "ThinkSystem",
    tagline:
"ThinkSystem servers delivering reliability, management, and security for the data center.",
    logo: lenova,
  },
];

export default function ServerBrands({
  title = "Server Brands",
  subtitle = "We partner with global technology leaders to provide robust, scalable, and high-performance server infrastructure for your enterprise needs.",
}) {
  return (
    <section className="py-8 md:py-12">
      <div className="section-shell">
        {/* Heading */}
        <div className="max-w-2xl mb-6 md:mb-8"data-aos="fade-up">
          <span className="eyebrow">Partners</span>
          <h2 className="section-title mt-3">{title}</h2>
          <p className="section-sub">{subtitle}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {BRANDS.map((b, index) => (
            <article
              key={b.id}
              data-aos="fade-up"
              data-aos-delay={Math.min(index, 5) * 120}
              className="group relative overflow-hidden rounded-3xl bg-white
 border border-ink-200 shadow-card
 hover:shadow-lift hover:-translate-y-0.5 hover:border-primary/30
 transition-all duration-300 ease-out"
            >
              {/* Teal wash that warms the card on hover. */}

              <div className="relative p-7 md:p-8 flex flex-col">
                {/* logo plate */}
                <div className="h-20 w-full flex items-center justify-start">
                  <img
                    src={b.logo}
                    alt={b.name}
                    className="h-10 md:h-11 w-auto max-w-[70%] object-contain object-left
 grayscale opacity-60
 transition-all duration-300
 group-hover:grayscale-0 group-hover:opacity-100"
                    loading="lazy"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-ink-200">
                  <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {b.line}
                  </span>

                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">
                    {b.name}
                  </h3>

                  <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
                    {b.tagline}
                  </p>
                </div>
              </div>

              {/* Accent rule sweeping in along the bottom edge. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]
 bg-gradient-to-r from-primary-light via-primary to-primary-dark
 origin-left scale-x-0 transition-transform duration-300 ease-out
 group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
