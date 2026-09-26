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
    <section className="relative overflow-hidden bg-[#F4FAF8] py-8 md:py-12">
      <div className="section-shell">
        <div className="mb-6 max-w-2xl md:mb-8" data-aos="fade-up">
          <span className="eyebrow text-primary">Who we serve</span>
          <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[32px]">
            Built for business environments that need to move faster
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            We deliver dependable technology solutions tailored for industries where uptime, security, and smooth operations matter most.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-aos="fade-up" data-aos-delay="100">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.id}
                className="group rounded-[22px] border border-ink-200 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF7F5] text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[15px] font-semibold text-ink-900">{sector.label}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
                  {index % 2 === 0 ? "Operational reliability and technology enablement." : "Secure systems and practical business continuity."}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
