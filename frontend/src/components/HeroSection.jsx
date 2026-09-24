import React from "react";
import { ArrowRight, BadgeCheck, Headphones, LockKeyhole, RefreshCcw, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HERO_DEVICES = {
  monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
  laptop: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  earbuds: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
  camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
};

const TRUST_BADGES = [
  { Icon: Truck, title: "100% Genuine", subtitle: "Products" },
  { Icon: BadgeCheck, title: "Official Warranty", subtitle: "& Support" },
  { Icon: RefreshCcw, title: "Easy Returns", subtitle: "& Exchanges" },
  { Icon: LockKeyhole, title: "Secure Checkout", subtitle: "& Payment" },
  { Icon: Headphones, title: "24/7 Customer", subtitle: "Support" },
];

function DeviceImage({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      onError={(event) => {
        event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-ink-50 via-primary-50/30 to-ink-100">
        <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 md:px-8 md:py-9 lg:px-10">
          <div className="pointer-events-none absolute -right-28 -top-40 -z-10 h-[500px] w-[500px] rounded-full border-[28px] border-white/70 bg-primary-50/60 blur-[1px]" />
          <div className="pointer-events-none absolute bottom-[-210px] left-[38%] -z-10 h-[400px] w-[650px] rounded-[50%] bg-white/80 blur-2xl" />

          <div className="grid items-center gap-5 lg:grid-cols-[38%_62%] lg:gap-2">
            <div className="relative z-10 max-w-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Latest tech collection</p>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-ink-900 md:text-5xl">
                Tech That
                <br />
                <span className="text-primary">Powers</span> Your Life
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
                Discover the latest electronics, smart devices and accessories at the best prices.
              </p>
              <button type="button" onClick={() => navigate("/products")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg">
                Shop Now
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="relative mx-auto h-[260px] w-full max-w-[700px] sm:h-[320px] lg:h-[350px]">
              <div className="absolute bottom-3 left-[6%] right-[2%] h-20 rounded-[45%] bg-white/90 shadow-2xl [transform:perspective(800px)_rotateX(58deg)] sm:h-28" />
              <div className="absolute bottom-12 left-[13%] right-[10%] h-20 rounded-2xl border border-white bg-white/75 shadow-xl [transform:perspective(800px)_rotateX(58deg)] sm:bottom-20 sm:h-28" />

              <div className="absolute right-[9%] top-[7%] hidden h-[42%] w-[27%] rounded-lg bg-ink-900 p-1.5 shadow-2xl sm:block">
                <DeviceImage src={HERO_DEVICES.monitor} alt="Desktop monitor" className="h-full w-full rounded object-cover" />
              </div>
              <div className="absolute right-[2%] top-[19%] hidden h-[43%] w-[15%] rounded-lg bg-ink-900 shadow-2xl sm:block">
                <div className="ml-auto mt-5 h-24 w-2 rounded-l bg-ink-600/80" />
                <div className="absolute bottom-4 left-2 right-2 h-1 rounded-full bg-ink-600" />
              </div>

              <div className="absolute left-[20%] top-[28%] z-20 h-[47%] w-[52%] -rotate-3 rounded-xl bg-ink-600 p-1 shadow-2xl sm:left-[17%] sm:top-[25%] sm:h-[52%] sm:w-[55%]">
                <DeviceImage src={HERO_DEVICES.laptop} alt="Modern laptop" className="h-[84%] w-full rounded-lg object-cover" />
                <div className="absolute bottom-[-9%] left-[-7%] h-[14%] w-[114%] rounded-b-[50%] bg-ink-800 shadow-lg" />
              </div>

              <div className="absolute bottom-[12%] left-[3%] z-30 h-28 w-16 -rotate-6 overflow-hidden rounded-[13px] border-[3px] border-ink-900 bg-ink-800 shadow-2xl sm:h-36 sm:w-20">
                <DeviceImage src={HERO_DEVICES.phone} alt="Modern smartphone" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[19%] left-[0%] z-20 h-24 w-20 -rotate-12 overflow-hidden rounded-[45%] bg-ink-700 shadow-xl sm:h-28 sm:w-24">
                <DeviceImage src={HERO_DEVICES.headphones} alt="Wireless headphones" className="h-full w-full object-cover opacity-90" />
              </div>
              <div className="absolute bottom-[15%] left-[24%] z-30 h-12 w-12 rounded-full bg-primary-light/70 shadow-lg sm:h-16 sm:w-16" aria-label="Desk plant" role="img">
                <span className="absolute -left-2 bottom-1 h-12 w-5 -rotate-45 rounded-full bg-primary-light" />
                <span className="absolute left-7 bottom-2 h-14 w-5 rotate-45 rounded-full bg-primary-dark" />
                <span className="absolute left-5 top-3 h-12 w-4 -rotate-12 rounded-full bg-primary-100" />
              </div>

              <div className="absolute bottom-[12%] right-[4%] z-30 h-16 w-16 overflow-hidden rounded-full border-4 border-ink-800 bg-ink-900 shadow-xl sm:h-20 sm:w-20">
                <DeviceImage src={HERO_DEVICES.camera} alt="DSLR camera" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[18%] right-[27%] z-30 h-12 w-12 overflow-hidden rounded-xl border-2 border-ink-300 bg-white shadow-lg sm:h-14 sm:w-14">
                <DeviceImage src={HERO_DEVICES.earbuds} alt="Wireless earbuds case" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[18%] right-[18%] z-30 h-10 w-10 overflow-hidden rounded-xl border-2 border-ink-800 bg-ink-900 shadow-lg sm:h-12 sm:w-12">
                <DeviceImage src={HERO_DEVICES.watch} alt="Smartwatch" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pt-3 sm:px-6 md:px-8 md:pt-4 lg:px-10">
        <ul className="grid grid-cols-2 divide-x divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_BADGES.map(({ Icon, title, subtitle }) => (
            <li key={title} className="flex items-center justify-center gap-3 px-3 py-3 text-left sm:px-4 md:py-4">
              <Icon size={22} strokeWidth={1.8} className="shrink-0 text-primary" />
              <span className="text-[11px] leading-tight text-ink-700 sm:text-xs"><strong className="block font-semibold text-ink-900">{title}</strong>{subtitle}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
