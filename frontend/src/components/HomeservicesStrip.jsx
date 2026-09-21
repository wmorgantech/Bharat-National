import React from "react";
import { useNavigate } from "react-router-dom";
import { MonitorSmartphone, Printer, Camera } from "lucide-react";
import cctv from "../assets/cctv.jpeg";
import laptop from "../assets/laptop.jpeg";
import printer from "../assets/printer.avif";

const previewServices = [
  {
    id: 1,
    title: "Desktop & Laptop Services",
    icon: MonitorSmartphone,
    image: laptop,
     
    points: [
      "OS installation & updates",
      "Hardware repair & upgrades",
      "Performance optimization",
    ],
  },
  {
    id: 2,
    title: "Printer Service & Sales",
    icon: Printer,
    image:printer,
    points: ["Ink & toner replacement", "Printer repair", "New printer setup"],
  },
  {
    id: 3,
    title: "CCTV Maintenance & Sales",
    icon: Camera,
    image: cctv,
    points: ["CCTV installation", "Monitoring setup", "Regular maintenance"],
  },
];

export default function HomeServicesPreview() {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 py-10 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Heading + paragraph + links */}
        <div className="mb-6 text-center relative">
          <h1 className="text-3xl font-bold">What we do</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            We offer a wide range of IT services and electronic products built
            for performance and reliability. Every solution we provide is
            focused on quality, precision and long-term trust.
          </p>

          {/* Desktop / tablet: right-aligned text link */}
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
            <span
              onClick={() => navigate("/services")}
              className="text-xs md:text-sm font-medium text-black cursor-pointer
                         hover:text-[var(--primary)] underline-offset-2 hover:underline"
            >
              See all services
            </span>
          </div>

          {/* Mobile: centered text link below text */}
          <div className="mt-3 flex justify-center md:hidden">
            <span
              onClick={() => navigate("/services")}
              className="text-sm font-medium text-[var(--primary)] cursor-pointer hover:underline"
            >
              See all services
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {previewServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="relative rounded-xl overflow-hidden 
              bg-white/20 backdrop-blur-lg 
              border border-white/40 
              shadow-[0_4px_20px_rgba(15,23,42,0.08)]
              hover:shadow-[0_8px_30px_rgba(15,23,42,0.18)]
              hover:-translate-y-1
              transition 
              group cursor-pointer"
                onClick={() => navigate("/services")}
              >
                {/* IMAGE */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* DESCRIPTION ON HOVER */}
                  <div className="absolute inset-0 bg-black/55 text-white p-4 flex flex-col justify-center items-start opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ul className="space-y-1">
                      {service.points.map((p, i) => (
                        <li
                          key={i}
                          style={{ transitionDelay: `${i * 70}ms` }}
                          className="text-xs sm:text-sm flex items-center gap-2 opacity-0 translate-y-1
                                     transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ICON + TITLE */}
                <div className="p-5 flex flex-col items-center gap-2 bg-white/70 backdrop-blur-md">
                  <div
                    className="inline-flex items-center justify-center h-10 w-10 rounded-2xl 
                           bg-[var(--primary)]/10 text-[var(--primary)]
                           transition-colors duration-200
                           group-hover:bg-[var(--primary)] group-hover:text-white"
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 text-center">
                    {service.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
