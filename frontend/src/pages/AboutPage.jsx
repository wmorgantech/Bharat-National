import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Target,
  ShieldCheck,
  Network,
  HeartHandshake,
  BadgeCheck,
  GraduationCap,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import server from "../assets/server.jpeg";
import PageHeroBreadcrumb from "../components/Breadcrumb";

/**
 * About - recomposed as a floating-glass composition.
 *
 * Every figure on this page is traceable to something the project ships:
 *   3 server partners -> ServerBrands.jsx (Dell, HPE, Lenovo)
 *   7 industries      -> IndustryExpertise.jsx sectors
 *   9 service lines   -> ServicesPage.jsx services
 *   Mon-Sat 9-8       -> ContactPage.jsx opening hours
 *
 * The previous version claimed "24/7 Support availability", which contradicts
 * those published opening hours, so it has been replaced with the real ones.
 * No founding dates appear, because none exist anywhere in the project.
 */

const STATS = [
  { value: "3", label: "Server partners", note: "Dell · HPE · Lenovo" },
  { value: "7", label: "Industries served", note: "Education to agriculture" },
  { value: "9", label: "Service specialisms", note: "Across the catalogue" },
  { value: "Mon–Sat", label: "Support hours", note: "9:00 AM – 8:00 PM" },
];

// Stage labels come from the brief; the copy under each is drawn from the real
// vision / mission / ecosystem content. Deliberately no invented years.
const JOURNEY = [
  {
    n: "01",
    title: "Beginning",
    Icon: Sparkles,
    copy: "A technology retailer in Coimbatore, supplying genuine hardware to homes and local businesses.",
    edge: "",
    tint: "text-primary",
  },
  {
    n: "02",
    title: "Growth",
    Icon: Network,
    copy: "Grew beyond the counter into installation and networking, so customers had one partner instead of three.",
    edge: "",
    tint: "text-primary",
  },
  {
    n: "03",
    title: "Expertise",
    Icon: ShieldCheck,
    copy: "Nine service specialisms spanning desktops, printers, CCTV, servers, firewalls and endpoint security.",
    edge: "",
    tint: "text-primary",
  },
  {
    n: "04",
    title: "Vision",
    Icon: Eye,
    copy: "On Time Services — to be the most trusted IT partner in our region, for every customer, every single day.",
    edge: "",
    tint: "text-primary",
  },
];

const VALUES = [
  {
    Icon: HeartHandshake,
    title: "Customer First",
    copy: "Honest consulting and transparent pricing, so you buy what you actually need.",
    tint: "text-primary",
    bg: "bg-primary-50",
  },
  {
    Icon: BadgeCheck,
    title: "Reliable Solutions",
    copy: "Genuine products with brand warranty, installed properly the first time.",
    tint: "text-primary",
    bg: "bg-primary-50",
  },
  {
    Icon: GraduationCap,
    title: "Technical Expertise",
    copy: "A certified team covering hardware, networking, security and servers.",
    tint: "text-primary",
    bg: "bg-primary-50",
  },
  {
    Icon: LifeBuoy,
    title: "Long-Term Support",
    copy: "AMC, emergency repair and proactive health checks that outlast the sale.",
    tint: "text-primary",
    bg: "bg-primary-50",
  },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <PageHeroBreadcrumb
        currentLabel="About"
        title="About Us"
        subtitle="Technology that works for you."
      />

      {/* ==================================================================
          WHO WE ARE
      ================================================================== */}
      <section className="section-shell pt-12 md:pt-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* OUR STORY */}
          <div
            className="card-service"
            data-aos="fade-up"
          >
            <span className="icon-chip-md">
              <Sparkles size={17} />
            </span>
            <h2 className="h-card mt-5">
              Our Story
            </h2>
            <p className="text-muted mt-2.5">
              We combine a full product catalogue with the engineering team to
              deploy and maintain it — so you deal with one partner instead of a
              vendor, an installer and a repair shop.
            </p>
          </div>

          {/* OUR EXPERTISE */}
          <div
            className="card-service"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <span className="icon-chip-md">
              <Network size={17} />
            </span>
            <h2 className="h-card mt-5">
              Our Expertise
            </h2>
            <p className="text-muted mt-2.5">
              Nine service specialisms spanning desktops, printers, CCTV,
              networking, servers, firewalls and endpoint security.
            </p>
          </div>

          {/* OUR VISION */}
          <div
            className="card-service"
            data-aos="fade-up"
            data-aos-delay="160"
          >
            <span className="icon-chip-md">
              <Eye size={17} />
            </span>
            <h2 className="h-card mt-5">
              Our Vision
            </h2>
            <p className="mt-2.5 text-[13.5px] font-semibold text-primary">
              On Time Services.
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
              To be the most trusted IT partner in our region by delivering
              fast, reliable, and on-time services — every customer, every
              single day.
            </p>
          </div>
        </div>

        {/* ---- Infrastructure image ---- */}
        <div
          className="mt-5 rounded-xl border border-ink-200 bg-white shadow-card overflow-hidden"
          data-aos="fade-up"
        >
          <img
            src={server}
            alt="Server infrastructure installed by Bharat National Computers"
            className="w-full object-cover aspect-[21/9]"
            loading="lazy"
          />
        </div>

        {/* ---- Stats ---- */}
        <div
          className="mt-5 rounded-xl border border-ink-200 bg-ink-50 p-6 md:p-8"
          data-aos="fade-up"
        >
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="card-stat-value">
                  {s.value}
                </dt>
                <dd className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                  {s.label}
                </dd>
                <dd className="mt-0.5 text-[11px] text-ink-400">{s.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ==================================================================
          OUR JOURNEY - glowing timeline
      ================================================================== */}
      <section className="relative section overflow-hidden">
        <div className="section-shell">
          <div className="max-w-2xl mb-12 md:mb-20"data-aos="fade-up">
            <span className="eyebrow">Our journey</span>
            <h2 className="section-title mt-3">How we got here</h2>
            <p className="section-sub">
              From a technology counter in Coimbatore to a full lifecycle
              partner — hardware, implementation and lifetime support.
            </p>
          </div>

          {/* ---- Desktop: horizontal timeline ---- */}
          <div className="hidden lg:block relative">
            {/* Rail */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-[46px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            {/* Travelling light */}
            <div
              aria-hidden="true"
              className="absolute top-[44px] h-[5px] w-[90px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px] "
            />

            <ol className="relative grid grid-cols-4 gap-6">
              {JOURNEY.map((m, i) => (
                <li
                  key={m.n}
                  data-aos="fade-up"
                  data-aos-delay={i * 120}
                  className="flex flex-col items-center text-center"
                >
                  {/* Node */}
                  <span
                    className={`relative z-10 grid place-items-center h-[92px] w-[92px] rounded-full glass-2 ${m.edge}`}
                  >
                    <span className={`font-display text-lg font-bold ${m.tint}`}>
                      {m.n}
                    </span>
                  </span>

                  <div className="glass-3 mt-7 p-5 w-full transition-all duration-200 hover:-translate-y-0.5 hover:bg-white">
                    <span
                      className={`grid place-items-center h-9 w-9 mx-auto rounded-lg bg-white ${m.tint}`}
                    >
                      <m.Icon size={16} />
                    </span>
                    <h3 className="mt-3.5 font-display text-[15px] font-semibold text-ink-900">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">
                      {m.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ---- Mobile / tablet: vertical timeline ---- */}
          <ol className="lg:hidden relative pl-12">
            <div
              aria-hidden="true"
              className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute left-[19px] w-[5px] h-[70px] rounded-full bg-gradient-to-b from-transparent via-primary to-transparent blur-[2px] "
            />

            {JOURNEY.map((m, i) => (
              <li
                key={m.n}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="relative mb-5 last:mb-0"
              >
                <span
                  className={`absolute -left-12 top-1 grid place-items-center h-11 w-11 rounded-full glass-2 ${m.edge}`}
                >
                  <span className={`font-display text-[12px] font-bold ${m.tint}`}>
                    {m.n}
                  </span>
                </span>

                <div className="glass-3 p-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid place-items-center h-8 w-8 rounded-lg bg-white ${m.tint}`}
                    >
                      <m.Icon size={15} />
                    </span>
                    <h3 className="font-display text-[15px] font-semibold text-ink-900">
                      {m.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-500">
                    {m.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================================================================
          OUR VALUES - deliberately uneven composition
      ================================================================== */}
      <section className="relative section overflow-hidden">

        <div className="relative section-shell">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 items-start">
            {/* Heading + mission, as a tall panel */}
            <div className="lg:col-span-5"data-aos="fade-right">
              <span className="eyebrow">Our values</span>
              <h2 className="section-title mt-3">What we hold to</h2>

              <div className="glass-2 mt-8 p-7">
                <span className="grid place-items-center h-11 w-11 rounded-2xl bg-primary-50 text-primary">
                  <Target size={18} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">
                  Our Mission
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-600">
                  To simplify technology for homes, SMBs, and institutions by
                  offering honest consulting, quality products, and responsive
                  support — backed by clear communication, transparent pricing,
                  and a long-term service relationship.
                </p>
              </div>
            </div>

            {/* Four values at varied weights */}
            <div className="lg:col-span-7 grid gap-5 sm:grid-cols-2">
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  data-aos="fade-up"
                  data-aos-delay={i * 110}
                  /* Staggered offsets give the block an uneven, floating
                     rhythm instead of a flat 2x2 grid. */
                  className={`glass-2 p-6 transition-all duration-200
 hover:-translate-y-0.5 hover:bg-white hover:border-ink-200
 ${i === 1 ? "" : ""} ${i === 2 ? "" : ""} ${
 i === 3 ? "" : ""
 }`}
                >
                  <span
                    className={`grid place-items-center h-11 w-11 rounded-2xl ${v.bg} ${v.tint}`}
                  >
                    <v.Icon size={18} />
                  </span>
                  <h3 className="mt-5 font-display text-[15px] font-semibold text-ink-900">
                    {v.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-500">
                    {v.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          FINAL CTA
      ================================================================== */}
      <section className="relative section overflow-hidden">
        <div className="section-shell">
          <div
            className="glass-1 relative overflow-hidden px-6 py-14 md:px-16 md:py-20 text-center"
            data-aos="fade-up"
          >

            <div className="relative">
              <span className="eyebrow">Next step</span>

              <h2 className="mt-4 font-display text-[28px] leading-[1.1] md:text-[42px] font-bold tracking-[-0.03em] text-ink-900 text-balance max-w-3xl mx-auto">
                Let&apos;s build your next{" "}
                <span className="text-primary">
                  technology solution
                </span>
                .
              </h2>

              <p className="mt-5 mx-auto max-w-xl text-[15px] leading-relaxed text-ink-600">
                Tell us what you need and our team will come back with a
                recommendation and a quote.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="btn-primary btn-lg"
                >
                  Explore Services
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="btn-secondary btn-lg"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
