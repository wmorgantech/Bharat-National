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
    imagePosition: "center 52%",
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
    imagePosition: "center 62%",
    points: ["Ink & toner replacement", "Printer repair", "New printer setup"],
  },
  {
    id: 3,
    title: "CCTV Maintenance & Sales",
    icon: Camera,
    image: cctv,
    imagePosition: "center 52%",
    points: ["CCTV installation", "Monitoring setup", "Regular maintenance"],
  },
];

export default function HomeServicesPreview() {
  const navigate = useNavigate();

  return (
    <section className="py-8 md:py-12">
      <div className="section-shell">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8" data-aos="fade-up">
          <div className="max-w-2xl">
            <span className="eyebrow">What we do</span>
            <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[32px]">
              Services that solve real operational challenges
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              We deliver dependable IT support and smart technology solutions focused on performance, security, and long-term business continuity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/services")}
            className="btn-secondary btn-md self-start shrink-0 sm:self-auto"
          >
            See all services
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {previewServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                data-aos="fade-up"
                data-aos-delay={Math.min(index, 5) * 120}
                onClick={() => navigate("/services")}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] border border-ink-200 bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className="relative h-[220px] w-full overflow-hidden bg-ink-50 sm:h-[230px]">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    style={{ objectPosition: service.imagePosition || "center" }}
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7F5] text-primary ring-1 ring-primary/10 shadow-sm">
                    <Icon size={18} />
                  </span>

                  <h3 className="text-base font-semibold tracking-tight text-ink-900 transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>

                  <ul className="mt-3 space-y-2">
                    {service.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-500">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#EAF7F5] text-primary">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-5 inline-flex items-center gap-1.5 border-t border-ink-200 pt-4 text-[13px] font-semibold text-primary">
                    Learn more
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
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
