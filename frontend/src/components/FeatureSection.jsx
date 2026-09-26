import React from "react";
import { RotateCcw, Truck, Headphones, BadgeCheck } from "lucide-react";

const features = [
  {
    Icon: RotateCcw,
    title: "Business-ready support",
    desc: "Flexible service coverage that keeps operations moving.",
  },
  {
    Icon: Truck,
    title: "Fast deployment",
    desc: "Products delivered and implemented with minimal friction.",
  },
  {
    Icon: Headphones,
    title: "Expert assistance",
    desc: "Real people helping with setup, upgrades, and troubleshooting.",
  },
  {
    Icon: BadgeCheck,
    title: "Trusted by teams",
    desc: "Solutions shaped for reliability, security, and long-term value.",
  },
];

export default function FeatureSection() {
  return (
    <section className="bg-white">
      <div className="section-shell py-8 md:py-10">
        <div className="mb-5 md:mb-6" data-aos="fade-up">
          <span className="eyebrow">Why businesses choose BNC</span>
          <h2 className="mt-3 font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[32px]">
            Practical technology support, built around outcomes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              data-aos="fade-up"
              data-aos-delay={Math.min(index, 5) * 120}
              className="group rounded-[22px] border border-ink-200 bg-[#F9FBFB] p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-card-hover"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF7F5] text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                <feature.Icon size={22} />
              </span>

              <div className="mt-4 min-w-0">
                <h3 className="text-[15px] font-semibold tracking-tight text-ink-900">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
