import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  ClipboardCheck,
  LockKeyhole,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import monitorDevice from "../assets/hero/monitor.jpg";
import laptopDevice from "../assets/hero/laptop.jpg";
import phoneDevice from "../assets/hero/phone.jpg";
import headphonesDevice from "../assets/hero/headphones.jpg";
import watchDevice from "../assets/hero/watch.jpg";
import earbudsDevice from "../assets/hero/earbuds.jpg";
import cameraDevice from "../assets/hero/camera.jpg";


/**
 * Home banner.
 *
 * The product composition is a single local asset showing only hardware BNC
 * actually supplies - desktops, laptops, monitors, printers, networking,
 * servers, storage and CCTV. It replaces a set of hot-linked stock photos of
 * consumer devices (phone, earbuds, smartwatch, camera) that the business
 * does not sell.
 *
 * Every badge below restates a commitment already made elsewhere in this
 * codebase. Nothing here asserts a returns policy, a support window or a
 * guarantee that the project does not already document.
 */
// Self-hosted copies of the hero device shots. Same source images at the same
// dimensions as before, served from this origin so the banner does not depend
// on a third-party image host and no visitor request leaves the site.
const HERO_DEVICES = {
  monitor: monitorDevice,
  laptop: laptopDevice,
  phone: phoneDevice,
  headphones: headphonesDevice,
  watch: watchDevice,
  earbuds: earbudsDevice,
  camera: cameraDevice,
};

const TRUST_BADGES = [
  {
    Icon: BadgeCheck,
    title: "Genuine Products",
    subtitle: "Brand warranty",
  },
  {
    Icon: Wrench,
    title: "On-site Installation",
    subtitle: "Handled by our team",
  },
  {
    Icon: ClipboardCheck,
    title: "AMC Plans",
    subtitle: "Comprehensive or standard",
  },
  {
    Icon: LockKeyhole,
    title: "Secure Checkout",
    subtitle: "Razorpay protected",
  },
  {
    Icon: Clock,
    title: "Mon – Sat",
    subtitle: "9:00 AM – 8:00 PM",
  },
];

const HERO_TAGS = ["Servers", "Networking", "Hardware", "Support", "Infrastructure"];

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
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(38,166,154,0.12),_transparent_32%),linear-gradient(135deg,_#f8fafc_0%,_#eefaf7_50%,_#f8fafc_100%)]">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-10">
          <div className="pointer-events-none absolute -right-20 -top-16 -z-10 h-[360px] w-[360px] rounded-full border-[26px] border-primary/10 bg-primary-50/40 blur-sm" />
          <div className="pointer-events-none absolute bottom-[-200px] left-[28%] -z-10 h-[420px] w-[600px] rounded-[50%] bg-primary-50/50 blur-3xl" />

          <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_1.18fr] lg:gap-6">
            <div className="relative z-10 max-w-[580px]" data-aos="fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary shadow-[0_4px_14px_rgba(0,137,123,0.08)] backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Technology products • Infrastructure • Support
              </span>

              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-ink-900 md:text-5xl lg:text-[58px]">
                Infrastructure, hardware, and support for modern businesses.
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-600 md:text-[16px]">
                From dependable workstations and networking to server
                infrastructure and ongoing business support, BNC helps
                organisations build resilient, efficient technology
                environments.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,137,123,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  Explore Solutions
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  Browse Services
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {HERO_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-ink-200 bg-white/80 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto h-[280px] w-full max-w-[700px] sm:h-[330px] lg:h-[400px]" data-aos="fade-up" data-aos-delay="120">
              <div className="absolute inset-x-[3%] bottom-2 h-[94px] rounded-[28px] border border-primary/10 bg-primary-50/60 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:h-[110px]" />
              <div className="absolute bottom-3 left-[5%] right-[2%] h-20 rounded-[45%] bg-white/90 shadow-[0_24px_50px_rgba(15,23,42,0.12)] [transform:perspective(800px)_rotateX(58deg)] sm:h-28" />
              <div className="absolute bottom-14 left-[12%] right-[9%] h-20 rounded-2xl border border-primary/10 bg-white/75 shadow-[0_24px_50px_rgba(15,23,42,0.08)] [transform:perspective(800px)_rotateX(58deg)] sm:bottom-20 sm:h-28" />

              <div className="absolute right-[7%] top-[9%] hidden h-[45%] w-[28%] rounded-xl border border-primary/10 bg-ink-900 p-1.5 shadow-[0_30px_60px_rgba(15,23,42,0.18)] sm:block">
                <DeviceImage src={HERO_DEVICES.monitor} alt="Desktop monitor" className="h-full w-full rounded-lg object-cover" />
              </div>
              <div className="absolute right-[1%] top-[18%] hidden h-[42%] w-[14%] rounded-xl border border-primary/10 bg-ink-900 shadow-[0_24px_48px_rgba(15,23,42,0.12)] sm:block">
                <div className="ml-auto mt-4 h-24 w-2 rounded-l bg-ink-600/80" />
                <div className="absolute bottom-3 left-2 right-2 h-1 rounded-full bg-ink-600" />
              </div>

              <div className="absolute left-[16%] top-[28%] z-20 h-[50%] w-[56%] -rotate-3 rounded-[20px] border border-primary/10 bg-ink-900 p-1.5 shadow-[0_30px_60px_rgba(15,23,42,0.22)] sm:left-[15%] sm:top-[26%] sm:h-[54%] sm:w-[57%]">
                <DeviceImage src={HERO_DEVICES.laptop} alt="Modern laptop" className="h-[84%] w-full rounded-[14px] object-cover" />
                <div className="absolute bottom-[-9%] left-[-7%] h-[14%] w-[114%] rounded-b-[50%] bg-ink-800 shadow-lg" />
              </div>

              <div className="absolute bottom-[12%] left-[3%] z-30 h-28 w-16 -rotate-6 overflow-hidden rounded-[15px] border-[3px] border-ink-900 bg-ink-800 shadow-[0_30px_60px_rgba(15,23,42,0.2)] sm:h-36 sm:w-20">
                <DeviceImage src={HERO_DEVICES.phone} alt="Modern smartphone" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[20%] left-[0%] z-20 h-24 w-20 -rotate-12 overflow-hidden rounded-[45%] bg-ink-700 shadow-[0_24px_48px_rgba(15,23,42,0.18)] sm:h-28 sm:w-24">
                <DeviceImage src={HERO_DEVICES.headphones} alt="Wireless headphones" className="h-full w-full object-cover opacity-90" />
              </div>

              <div className="absolute bottom-[15%] left-[26%] z-30 h-12 w-12 rounded-full bg-primary/75 shadow-[0_20px_30px_rgba(0,137,123,0.28)] sm:h-16 sm:w-16" aria-label="Desk plant" role="img">
                <span className="absolute -left-2 bottom-1 h-12 w-5 -rotate-45 rounded-full bg-primary-light" />
                <span className="absolute left-7 bottom-2 h-14 w-5 rotate-45 rounded-full bg-primary-dark" />
                <span className="absolute left-5 top-3 h-12 w-4 -rotate-12 rounded-full bg-primary-100" />
              </div>

              <div className="absolute bottom-[12%] right-[4%] z-30 h-16 w-16 overflow-hidden rounded-full border-4 border-ink-800 bg-ink-900 shadow-[0_20px_40px_rgba(15,23,42,0.2)] sm:h-20 sm:w-20">
                <DeviceImage src={HERO_DEVICES.camera} alt="DSLR camera" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[18%] right-[27%] z-30 h-12 w-12 overflow-hidden rounded-xl border-2 border-ink-300 bg-white shadow-[0_18px_30px_rgba(15,23,42,0.08)] sm:h-14 sm:w-14">
                <DeviceImage src={HERO_DEVICES.earbuds} alt="Wireless earbuds case" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[18%] right-[18%] z-30 h-10 w-10 overflow-hidden rounded-xl border-2 border-ink-800 bg-ink-900 shadow-[0_18px_30px_rgba(15,23,42,0.1)] sm:h-12 sm:w-12">
                <DeviceImage src={HERO_DEVICES.watch} alt="Smartwatch" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pt-3 sm:px-6 md:px-8 md:pt-4 lg:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_BADGES.map((badge, index) => {
            const Icon = badge.Icon;

            return (
              <div
                key={badge.title}
                data-aos="fade-up"
                data-aos-delay={index * 60}
                className="flex min-h-[82px] items-center gap-2.5 rounded-[16px] border border-primary/20 bg-primary-50 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-200 hover:bg-primary-100"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
                  <Icon size={18} strokeWidth={2} />
                </div>

                <div className="min-w-0 text-left leading-tight">
                  <div className="text-[12.5px] font-bold text-ink-900">
                    {badge.title}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-ink-600">
                    {badge.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
