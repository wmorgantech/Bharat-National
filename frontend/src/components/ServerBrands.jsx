// src/components/ServerBrands.jsx
import React from "react";
import dell from "../assets/dell1.png";
import hp from "../assets/hp.png";
import lenova from "../assets/lenova.png";

const BRANDS = [
  {
    id: "dell",
    name: "Dell Technologies",
    tagline:
      "PowerEdge servers for scalable business architecture and high-performance computing.",
    logo: dell,
    tint: "bg-blue-50",
    accent: "bg-blue-500",
  },
  {
    id: "hpe",
    name: "HPE",
    tagline:
      "ProLiant Gen11 servers designed for hybrid cloud intelligence and data security.",
    logo: hp,
    tint: "bg-emerald-50",
    accent: "bg-emerald-500",
  },
  {
    id: "lenovo",
    name: "Lenovo Infrastructure",
    tagline:
      "ThinkSystem servers delivering reliability, management, and security for the data center.",
    logo: lenova,
    tint: "bg-rose-50",
    accent: "bg-rose-500",
  },
];

export default function ServerBrands({
  title = "Server Brands",
  subtitle = "We partner with global technology leaders to provide robust, scalable, and high-performance server infrastructure for your enterprise needs.",
}) {
  return (
    <section className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        {/* Heading */}
        <div className="text-center">
         <h1 className="text-3xl font-bold">
            {title}
          </h1>
         
          <p className="mt-4 text-sm md:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {BRANDS.map((b) => (
            <article
              key={b.id}
              className="relative overflow-hidden rounded-2xl bg-white
                         border border-slate-200/70
                         shadow-[0_10px_30px_rgba(15,23,42,0.07)]
                         hover:shadow-[0_18px_48px_rgba(15,23,42,0.12)]
                         hover:-translate-y-1 transition-all duration-300"
            >
              {/* soft corner blobs (like screenshot) */}
              <div
                className={`absolute -top-10 -right-10 h-28 w-28 rounded-full ${b.tint}`}
              />
              <div
                className={`absolute -bottom-12 -left-12 h-32 w-32 rounded-full ${b.tint}`}
              />

              <div className="relative p-6 md:p-7 flex flex-col items-center text-center">
                {/* logo holder */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white border border-slate-200/70 flex items-center justify-center shadow-sm">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="h-11 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* tiny accent dot */}
                  <span
                    className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full ${b.accent} ring-4 ring-white`}
                  />
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-900">
                  {b.name}
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-600 max-w-[28ch]">
                  {b.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
