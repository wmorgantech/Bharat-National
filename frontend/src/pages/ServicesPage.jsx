import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import {
  MonitorSmartphone,
  Printer,
  Camera,
  Network,
  ShieldCheck,
  Crown,
  Server,
  Shield,
  RefreshCw,
  Settings2,
  ClipboardCheck,
  ClipboardList,
  Check,
  ArrowRight,
  Headset,
  Briefcase,
  GraduationCap,
  Search,
  MessagesSquare,
  Lightbulb,
  PackageCheck,
  LifeBuoy,
} from "lucide-react";
import cctv from "../assets/cctv.jpeg";
import printer from "../assets/printer.avif";
import driverinstall from "../assets/driverinstall.avif";
import laptop from "../assets/laptop.jpeg";
import lan from "../assets/lan.jpeg";
import firewall from "../assets/firewall.jpeg";
import server from "../assets/server.jpeg";
import antivirus from "../assets/antivirus.jpeg";

/**
 * Services - recomposed as a floating-glass composition.
 *
 * All nine services, their categories, points and imagery are the project's
 * existing data. The capability console groups them by the three categories
 * that already exist (core / infra / protection) rather than inventing new
 * ones, and the AMC plans keep their original copy verbatim.
 */

// Edge lighting cycles across the four accent colours.
const EDGES = [
  { edge: "", tint: "text-primary", chip: "bg-primary-50", ring: "hover:border-primary/30" },
  { edge: "", tint: "text-primary", chip: "bg-primary-50", ring: "hover:border-primary/30" },
  { edge: "", tint: "text-primary", chip: "bg-primary-50", ring: "hover:border-primary/30" },
  { edge: "", tint: "text-primary", chip: "bg-primary-50", ring: "hover:border-primary/30" },
];

// Hero satellites. Each statement is traceable to the data on this page.
const HERO_PANELS = [
  {
    Icon: Headset,
    title: "IT Support",
    copy: "Desktops, laptops, printers and CCTV — repaired, upgraded and maintained.",
    ...EDGES[0],
  },
  {
    Icon: Briefcase,
    title: "Business Solutions",
    copy: "Annual maintenance contracts built around uptime, comprehensive or service-only.",
    ...EDGES[1],
  },
  {
    Icon: GraduationCap,
    title: "Technical Expertise",
    copy: "Nine service specialisms across core support, infrastructure and protection.",
    ...EDGES[2],
  },
];

// Process stages. Labels come from the brief; the copy describes the workflow
// these services already imply - no metrics or claims are introduced.
const PROCESS = [
  { n: "01", title: "Discover", Icon: Search, copy: "We start with your setup — what you run, and where it slows you down.", ...EDGES[0] },
  { n: "02", title: "Understand", Icon: MessagesSquare, copy: "We map the requirement against budget, scale and the people using it.", ...EDGES[1] },
  { n: "03", title: "Recommend", Icon: Lightbulb, copy: "An honest specification, with transparent pricing and no surprise extras.", ...EDGES[2] },
  { n: "04", title: "Deliver", Icon: PackageCheck, copy: "On-site installation, configuration and integration, handled by our team.", ...EDGES[3] },
  { n: "05", title: "Support", Icon: LifeBuoy, copy: "AMC, emergency repair and proactive health checks after the handover.", ...EDGES[0] },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      category: "core",
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
      category: "core",
      title: "Printer Service & Sales",
      icon: Printer,
      image: printer,
      points: [
"Ink & toner replacement",
"Printer repair",
"New printer setup",
      ],
    },
    {
      id: 3,
      category: "core",
      title: "CCTV Maintenance & Sales",
      icon: Camera,
      image: cctv,
      points: ["CCTV installation", "Monitoring setup", "Regular maintenance"],
    },
    {
      id: 4,
      category: "infra",
      title: "Network Installation",
      icon: Network,
      image: lan,
      points: ["LAN setup", "Router configuration", "Structured cabling"],
    },
    {
      id: 5,
      category: "infra",
      title: "Firewall Setup",
      icon: ShieldCheck,
      image: firewall,
      points: [
"Network protection",
"Access control policies",
"Threat detection",
      ],
    },
    {
      id: 6,
      category: "infra",
      title: "Server Maintenance",
      icon: Server,
      image: server,
      points: [
"Server installation",
"Backup configuration",
"Remote monitoring",
      ],
    },
    {
      id: 7,
      category: "protection",
      title: "Antivirus & Security",
      icon: Shield,
      image: antivirus,
      points: ["Malware protection", "Endpoint security", "Threat blocking"],
    },
    {
      id: 8,
      category: "protection",
      title: "Windows Updates",
      icon: RefreshCw,
      image: printer,
      points: ["System patching", "Bug fixes", "Security improvements"],
    },
    {
      id: 9,
      category: "protection",
      title: "Driver Installation",
      icon: Settings2,
      image: driverinstall,
      points: ["Driver updates", "Compatibility check", "Device setup"],
    },
  ];

  const filters = [
    { key: "all", label: "All" },
    { key: "core", label: "Core IT Support" },
    { key: "infra", label: "Infrastructure" },
    { key: "protection", label: "Protection" },
  ];

  const [activeFilter, setActiveFilter] = useState("all");
  const filteredServices =
    activeFilter === "all"
      ? services
      : services.filter((s) => s.category === activeFilter);

  // Switching a filter mounts a fresh set of cards. AOS only tracks elements
  // collected at init, so they are re-collected here to avoid new cards
  // staying at opacity 0.
  useEffect(() => {
    AOS.refreshHard();
  }, [activeFilter]);

  /**
   * Asymmetric spans on a 12-column grid. Rows alternate between [6,3,3] and
   * [4,4,4], so the composition tiles exactly at 9 services (unfiltered) and
   * at 3 (every category holds three), instead of leaving a ragged last row.
   */
  const spanFor = (i) => {
    const group = Math.floor(i / 3);
    const within = i % 3;
    const pattern = group % 2 === 0 ? [6, 3, 3] : [4, 4, 4];
    return pattern[within];
  };

  const SPAN_CLASS = {
    6: "lg:col-span-6",
    4: "lg:col-span-4",
    3: "lg:col-span-3",
  };

  // Capability console groups the real services by their real categories.
  const CAPABILITIES = filters
    .filter((f) => f.key !== "all")
    .map((f, i) => ({
      key: f.key,
      label: f.label,
      items: services.filter((s) => s.category === f.key),
      ...EDGES[i],
    }));

  const scrollToServices = () => {
    document
      .getElementById("services-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      {/* ==================================================================
          HERO
      ================================================================== */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="section-shell py-14 md:py-20">
          <div className="max-w-3xl" data-aos="fade-up">
            <span className="eyebrow">Our Services</span>

            <h1 className="mt-3 font-display text-[32px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.1] tracking-[-0.025em] text-ink-900">
              Technology solutions beyond hardware
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] md:text-base leading-relaxed text-ink-600">
              From a single laptop repair to full server and network
              infrastructure — one team, covering the whole lifecycle.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToServices}
                className="btn-primary btn-lg"
              >
                Explore Our Services
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
      </section>

      {/* ==================================================================
          WHAT WE COVER
      ================================================================== */}
      <section className="section-shell pt-12 md:pt-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HERO_PANELS.map((p, i) => (
            <div
              key={p.title}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              className="card-service"
            >
              <span
                className="icon-chip-md"
              >
                <p.Icon size={17} />
              </span>
              <h2 className="h-card mt-5">
                {p.title}
              </h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-500">
                {p.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================
          CAPABILITY CONSOLE
      ================================================================== */}
      <section className="relative section overflow-hidden">

        <div className="relative section-shell">
          <div className="max-w-2xl mb-12 md:mb-16"data-aos="fade-up">
            <span className="eyebrow">Capabilities</span>
            <h2 className="section-title mt-3">Our technology capabilities</h2>
            <p className="section-sub">
              Nine service specialisms, grouped into the three areas we cover
              end to end.
            </p>
          </div>

          <div
            className="glass-1 relative p-6 md:p-10"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            {/* Connecting rail between the three capability columns. */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute left-10 right-10 top-1/2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-[calc(50%-2px)] h-[5px] w-[80px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px] "
            />

            <div className="relative grid gap-5 md:grid-cols-3 md:gap-6">
              {CAPABILITIES.map((cap, i) => (
                <div
                  key={cap.key}
                  data-aos="fade-up"
                  data-aos-delay={i * 110}
                  className={`glass-3 ${cap.edge} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      className={`font-display text-[15px] font-semibold ${cap.tint}`}
                    >
                      {cap.label}
                    </h3>
                    <span className="text-[11px] font-semibold text-ink-400 tabular-nums">
                      {cap.items.length}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {cap.items.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5"
                      >
                        <span className={`shrink-0 ${cap.tint}`}>
                          <s.icon size={14} />
                        </span>
                        <span className="text-[12.5px] text-ink-700 truncate">
                          {s.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          SERVICE GRID - asymmetric floating panels
      ================================================================== */}
      <section
        id="services-grid"
        className="relative section overflow-hidden scroll-mt-24"
      >
        <div className="relative section-shell">
          <div className="max-w-2xl mb-10 md:mb-12"data-aos="fade-up">
            <span className="eyebrow">What we do</span>
            <h2 className="section-title mt-3">Every service we offer</h2>
          </div>

          {/* FILTERS - behaviour unchanged */}
          <div className="flex gap-2.5 flex-wrap mb-10"data-aos="fade-up">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                aria-pressed={activeFilter === f.key}
                className={`rounded-full px-5 py-2.5 text-[13px] font-semibold border transition-all duration-300 ${
 activeFilter === f.key
 ? "bg-white text-ink-900 border-primary/30 "
 : "bg-white text-ink-600 border-ink-200 hover:text-ink-900 hover:border-ink-200"
 }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ASYMMETRIC GRID */}
          <div className="grid gap-5 lg:grid-cols-12">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              const span = spanFor(index);
              const isFeature = span === 6;
              const look = EDGES[index % EDGES.length];

              return (
                <article
                  key={service.id}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index, 5) * 100}
                  className={`group glass-2 ${look.edge} ${look.ring}
 relative flex flex-col overflow-hidden
 transition-all duration-200 ease-out
 hover:-translate-y-0.5 hover:bg-white
 ${SPAN_CLASS[span]}`}
                >
                  {/* Aura that strengthens on hover. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-60"
                  />

                  {/* The featured panel carries its image; the smaller ones
                      stay compact so the row keeps a real hierarchy. */}
                  {isFeature && (
                    <div className="relative h-44 md:h-52 w-full overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover opacity-70 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent" />
                    </div>
                  )}

                  <div
                    className={`relative flex flex-1 flex-col p-6 ${
 isFeature ? "" : ""
 }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`grid place-items-center h-11 w-11 rounded-2xl ${look.chip} ${look.tint}
 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105`}
                      >
                        <Icon size={19} />
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-display text-3xl font-bold leading-none text-ink-200 select-none"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-[17px] font-semibold text-ink-900">
                      {service.title}
                    </h3>

                    <ul className="mt-3.5 flex-1 space-y-2">
                      {service.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-500"
                        >
                          <span
                            className={`mt-0.5 grid place-items-center h-4 w-4 shrink-0 rounded-full ${look.chip} ${look.tint}`}
                          >
                            <Check size={10} strokeWidth={3} />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => navigate("/contact")}
                      className={`mt-6 pt-5 border-t border-ink-200 inline-flex items-center gap-1.5 text-[13px] font-semibold ${look.tint} self-start`}
                    >
                      Explore
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================
          HOW WE WORK
      ================================================================== */}
      <section className="relative section overflow-hidden">

        <div className="relative section-shell">
          <div className="max-w-2xl mb-12 md:mb-20"data-aos="fade-up">
            <span className="eyebrow">Process</span>
            <h2 className="section-title mt-3">How we work</h2>
            <p className="section-sub">
              The same five steps, whether it is one laptop or a whole office.
            </p>
          </div>

          {/* ---- Desktop: horizontal flow ---- */}
          <div className="hidden lg:block relative">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-[46px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute top-[44px] h-[5px] w-[90px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px] "
            />

            <ol className="relative grid grid-cols-5 gap-4">
              {PROCESS.map((s, i) => (
                <li
                  key={s.n}
                  data-aos="fade-up"
                  data-aos-delay={i * 110}
                  className="flex flex-col items-center text-center"
                >
                  <span
                    className={`relative z-10 grid place-items-center h-[92px] w-[92px] rounded-full glass-2 ${s.edge}`}
                  >
                    <span className={`font-display text-lg font-bold ${s.tint}`}>
                      {s.n}
                    </span>
                  </span>

                  <div className="glass-3 mt-7 p-5 w-full transition-all duration-200 hover:-translate-y-0.5 hover:bg-white">
                    <span
                      className={`grid place-items-center h-9 w-9 mx-auto rounded-lg bg-white ${s.tint}`}
                    >
                      <s.Icon size={16} />
                    </span>
                    <h3 className="mt-3.5 font-display text-[15px] font-semibold text-ink-900">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">
                      {s.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ---- Mobile / tablet: vertical flow ---- */}
          <ol className="lg:hidden relative pl-12">
            <div
              aria-hidden="true"
              className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute left-[19px] w-[5px] h-[70px] rounded-full bg-gradient-to-b from-transparent via-primary to-transparent blur-[2px] "
            />

            {PROCESS.map((s, i) => (
              <li
                key={s.n}
                data-aos="fade-up"
                data-aos-delay={i * 90}
                className="relative mb-5 last:mb-0"
              >
                <span
                  className={`absolute -left-12 top-1 grid place-items-center h-11 w-11 rounded-full glass-2 ${s.edge}`}
                >
                  <span className={`font-display text-[12px] font-bold ${s.tint}`}>
                    {s.n}
                  </span>
                </span>

                <div className="glass-3 p-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid place-items-center h-8 w-8 rounded-lg bg-white ${s.tint}`}
                    >
                      <s.Icon size={15} />
                    </span>
                    <h3 className="font-display text-[15px] font-semibold text-ink-900">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-muted mt-2.5">
                    {s.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================================================================
          AMC PLANS
      ================================================================== */}
      <section className="relative section overflow-hidden">
        <div className="relative section-shell">
          <div className="max-w-2xl mb-12 md:mb-16"data-aos="fade-up">
            <span className="eyebrow">Annual maintenance</span>
            <h2 className="section-title mt-3">
              Choose the AMC plan that fits your business
            </h2>
            <p className="section-sub">
              Flexible annual maintenance contracts designed for uptime and
              peace of mind.
            </p>
          </div>

          <div className="grid gap-5 md:gap-6 md:grid-cols-2 items-stretch">
            {/* ---- Comprehensive (featured) ---- */}
            <article
              data-aos="fade-right"
              className="glass-1 relative flex flex-col overflow-hidden p-8 md:p-10 "
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full "
              />

              <div className="relative flex items-start justify-between gap-4">
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-50 text-primary">
                  <ClipboardCheck size={20} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-900">
                  <Crown className="w-3.5 h-3.5 text-primary" />
                  Most Popular
                </span>
              </div>

              <h3 className="relative mt-7 font-display text-2xl font-semibold tracking-tight text-ink-900">
                Comprehensive AMC
              </h3>
              <p className="relative mt-2 text-sm text-ink-600">
                Complete peace of mind with zero surprise costs.
              </p>

              <ul className="relative mt-7 space-y-3.5 flex-1">
                {[
"Customer need not pay anything during AMC period.",
"All services & spares will be provided by BNC.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-ink-700"
                  >
                    <span className="mt-0.5 grid place-items-center h-5 w-5 shrink-0 rounded-full bg-primary-50 text-primary">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/contact")}
                className="btn-primary btn-lg relative mt-9 w-full"
              >
                Get Premium Quote
                <ArrowRight size={16} />
              </button>
            </article>

            {/* ---- Non-comprehensive ---- */}
            <article
              data-aos="fade-left"
              data-aos-delay="120"
              className="glass-2 relative flex flex-col p-8 md:p-10"
            >
              <span className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-50 text-primary">
                <ClipboardList size={20} />
              </span>

              <h3 className="mt-7 font-display text-2xl font-semibold tracking-tight text-ink-900">
                Non–Comprehensive AMC
              </h3>
              <p className="mt-2 text-sm text-ink-500">
                Service covered, spares billed separately.
              </p>

              <ul className="mt-7 space-y-3.5 flex-1">
                {[
"All service charges will be free under the AMC.",
"Replacement spares billed separately.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-ink-700"
                  >
                    <span className="mt-0.5 grid place-items-center h-5 w-5 shrink-0 rounded-full bg-primary-50 text-primary">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/contact")}
                className="btn-secondary btn-lg mt-9 w-full"
              >
                Get Standard Quote
                <ArrowRight size={16} />
              </button>
            </article>
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
              <span className="eyebrow">Get in touch</span>

              <h2 className="mt-4 font-display text-[28px] leading-[1.1] md:text-[42px] font-bold tracking-[-0.03em] text-ink-900 text-balance max-w-3xl mx-auto">
                Need the right{" "}
                <span className="text-primary">
                  technology solution
                </span>
                ?
              </h2>

              <p className="mt-5 mx-auto max-w-xl text-[15px] leading-relaxed text-ink-600">
                From a single laptop repair to full server and network
                infrastructure — one team, covering the whole lifecycle.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="btn-primary btn-lg"
                >
                  Contact Us
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="btn-secondary btn-lg"
                >
                  Explore Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
