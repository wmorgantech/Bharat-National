import React from "react";
import { RotateCcw, Truck, Headphones, BadgeCheck } from "lucide-react";

const features = [
  {
    Icon: RotateCcw,
    title: "14-Day Returns",
    desc: "Risk-free shopping with easy returns.",
  },
  {
    Icon: Truck,
    title: "Free Shipping",
    desc: "No extra costs, just the price you see.",
  },
  {
    Icon: Headphones,
    title: "24/7 Support",
    desc: "24/7 support, always here just for you.",
  },
  {
    Icon: BadgeCheck,
    title: "Member Discounts",
    desc: "Special prices for our loyal customers.",
  },
];

// AOS is initialised once at app level in App.jsx.
export default function FeatureSection() {
  return (
    <section className="bg-white">
      <div className="section-shell py-8 md:py-10">
        {/* One continuous band with hairline dividers, rather than four
            detached cards floating on grey. */}
        <div
          className="rounded-3xl border border-ink-200 bg-white shadow-card
 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 divide-y sm:divide-y-0 divide-ink-200
 lg:divide-x lg:divide-ink-200 overflow-hidden"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              data-aos="fade-up"
              data-aos-delay={Math.min(index, 5) * 120}
              className="group relative p-6 md:p-7 flex items-start gap-4 transition-colors duration-300 hover:bg-white
 sm:[&:nth-child(2)]:border-l sm:[&:nth-child(2)]:border-ink-200
 sm:[&:nth-child(4)]:border-l sm:[&:nth-child(4)]:border-ink-200
 lg:[&:nth-child(2)]:border-l-0 lg:[&:nth-child(4)]:border-l-0"
            >
              <span
                className="shrink-0 grid place-items-center h-12 w-12 rounded-2xl
 bg-primary/10 text-primary
 transition-all duration-300
 group-hover:bg-primary group-hover:text-ink-900 group-hover:scale-105"
              >
                <feature.Icon size={22} />
              </span>

              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold tracking-tight text-ink-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
