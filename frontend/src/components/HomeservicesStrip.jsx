import React from "react";
import { useNavigate } from "react-router-dom";
import { MonitorSmartphone, Printer, Camera, Check, ArrowRight } from "lucide-react";
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
    image: printer,
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
    <section className="section">
      <div className="section-shell">
        {/* Heading */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12"
          data-aos="fade-up"
        >
          <div className="max-w-2xl">
            <span className="eyebrow">What we do</span>
            <h2 className="section-title mt-3">
              Services that go beyond the box
            </h2>
            <p className="section-sub">
              We offer a wide range of IT services and electronic products built
              for performance and reliability. Every solution we provide is
              focused on quality, precision and long-term trust.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/services")}
            className="btn-secondary btn-md self-start sm:self-auto shrink-0"
          >
            See all services
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {previewServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                data-aos="fade-up"
                data-aos-delay={Math.min(index, 5) * 120}
                onClick={() => navigate("/services")}
                className="group relative flex flex-col overflow-hidden rounded-3xl
 border border-ink-200 bg-white shadow-card
 hover:shadow-lift hover:-translate-y-0.5 hover:border-primary/30
 transition-all duration-300 ease-out cursor-pointer"
              >
                {/* IMAGE */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-ink-900/10 to-transparent" />

                  {/* Icon chip straddles the image edge so the card reads as
                      one object instead of a photo stacked on a panel. */}
                  <span
                    className="absolute -bottom-6 left-5 grid place-items-center h-12 w-12 rounded-2xl
 bg-white text-primary ring-1 ring-ink-200 shadow-lift
 transition-all duration-300
 group-hover:bg-primary group-hover:text-ink-900 group-hover:ring-primary"
                  >
                    <Icon size={22} />
                  </span>
                </div>

                {/* BODY */}
                <div className="flex flex-1 flex-col p-5 pt-9">
                  <h3 className="text-base font-semibold tracking-tight text-ink-900 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  {/* Always visible - the old version hid these behind a hover
                      overlay, which never fires on touch devices. */}
                  <ul className="mt-3 space-y-2">
                    {service.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-500"
                      >
                        <span className="mt-0.5 grid place-items-center h-4 w-4 shrink-0 rounded-full bg-primary/10 text-primary">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-5 pt-4 border-t border-ink-200 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                    Learn more
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
