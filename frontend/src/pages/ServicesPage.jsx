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
  ArrowUpRight,
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
import PageHeroBreadcrumb from "../components/Breadcrumb";

/**
 * Services.
 *
 * All nine services, their categories and their points are the project's
 * existing data, unchanged. The AMC plan copy is kept verbatim.
 *
 * The page deliberately lists each service once: an earlier version repeated
 * the same nine entries in a separate "capabilities" block grouped by the
 * same three categories, which doubled the page length without adding
 * information.
 */

// Process stages. Labels come from the brief; the copy describes the workflow
// these services already imply - no metrics or claims are introduced.
const PROCESS = [
  { n: "01", title: "Discover", Icon: Search, copy: "We start with your setup — what you run, and where it slows you down." },
  { n: "02", title: "Understand", Icon: MessagesSquare, copy: "We map the requirement against budget, scale and the people using it." },
  { n: "03", title: "Recommend", Icon: Lightbulb, copy: "An honest specification, with transparent pricing and no surprise extras." },
  { n: "04", title: "Deliver", Icon: PackageCheck, copy: "On-site installation, configuration and integration, handled by our team." },
  { n: "05", title: "Support", Icon: LifeBuoy, copy: "AMC, emergency repair and proactive health checks after the handover." },
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

  return (
    <div className="min-h-screen">
      <PageHeroBreadcrumb
        currentLabel="Services"
        title="Our Services"
        subtitle="Technology support, installation and maintenance for the full lifecycle."
      />

      {/* ==================================================================
          SERVICES
      ================================================================== */}
      <section id="services-grid" className="section-shell scroll-mt-24 pt-10 md:pt-14">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-heading" data-aos="fade-up">
            What We Do
          </h2>

          {/* Filters - unchanged behaviour */}
          <div className="flex flex-wrap gap-2" data-aos="fade-up">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                aria-pressed={activeFilter === f.key}
                className={`rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-200 ${
                  activeFilter === f.key
                    ? "border-primary bg-primary text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((s, i) => (
            <article
              key={s.id}
              data-aos="fade-up"
              data-aos-delay={Math.min(i, 5) * 60}
              className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="icon-chip-md">
                  <s.icon size={18} />
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>

              <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink-900">
                {s.title}
              </h3>

              {/* One compact line, built from the service's own points. */}
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
                {s.points.join(" · ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ==================================================================
          HOW WE WORK
      ================================================================== */}
      <section className="section-shell pt-12 md:pt-16">
        <h2 className="section-heading mb-5" data-aos="fade-up">
          How We Work
        </h2>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS.map((step, i) => (
            <li
              key={step.n}
              data-aos="fade-up"
              data-aos-delay={i * 60}
              className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
            >
              <div className="flex items-center gap-2.5">
                <span className="icon-chip-sm">
                  <step.Icon size={15} />
                </span>
                <span className="font-display text-[13px] font-bold tabular-nums text-ink-300">
                  {step.n}
                </span>
              </div>

              <h3 className="mt-3.5 font-display text-[14.5px] font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ==================================================================
          AMC PLANS
      ================================================================== */}
      <section className="pt-12 md:pt-16">
        <div className="section-shell">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
            <div className="border-b border-ink-200 bg-white px-6 py-5 md:px-8">
              <span className="eyebrow">Annual Maintenance</span>
              <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-[-0.02em] text-ink-900 md:text-[24px]">
                Choose the AMC plan that fits your business
              </h2>
            </div>

            <div className="grid items-stretch gap-4 p-5 md:grid-cols-2 md:gap-5 md:p-7">
              {/* ---- Comprehensive (featured) ---- */}
              <article
                data-aos="fade-up"
                className="relative flex flex-col rounded-xl border-2 border-primary bg-white p-6 shadow-card"
              >
                <span className="absolute -top-px right-5 inline-flex items-center gap-1.5 rounded-b-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  <Crown className="h-3 w-3" />
                  Most Popular
                </span>

                <span className="icon-chip-md">
                  <ClipboardCheck size={18} />
                </span>

                <h3 className="mt-4 font-display text-[18px] font-bold tracking-[-0.01em] text-ink-900">
                  Comprehensive AMC
                </h3>
                <p className="mt-1.5 text-[13px] text-ink-600">
                  Complete peace of mind with zero surprise costs.
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {[
                    "Customer need not pay anything during AMC period.",
                    "All services & spares will be provided by BNC.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[13px] text-ink-700"
                    >
                      <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-primary text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/contact")}
                  className="btn-primary btn-md mt-6 w-full"
                >
                  Get Premium Quote
                  <ArrowRight size={15} />
                </button>
              </article>

              {/* ---- Non-comprehensive ---- */}
              <article
                data-aos="fade-up"
                data-aos-delay="80"
                className="flex flex-col rounded-xl border border-ink-200 bg-white p-6 shadow-card"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
                  <ClipboardList size={18} />
                </span>

                <h3 className="mt-4 font-display text-[18px] font-bold tracking-[-0.01em] text-ink-900">
                  Non–Comprehensive AMC
                </h3>
                <p className="mt-1.5 text-[13px] text-ink-600">
                  Service covered, spares billed separately.
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {[
                    "All service charges will be free under the AMC.",
                    "Replacement spares billed separately.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[13px] text-ink-700"
                    >
                      <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-primary-50 text-primary">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/contact")}
                  className="btn-secondary btn-md mt-6 w-full"
                >
                  Get Standard Quote
                  <ArrowRight size={15} />
                </button>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          FINAL CTA
      ================================================================== */}
      <section className="section-shell py-12 md:py-16">
        <div
          className="rounded-2xl border border-ink-200 bg-ink-50 px-6 py-10 text-center md:px-12"
          data-aos="fade-up"
        >
          <h2 className="mx-auto max-w-2xl font-display text-[22px] font-bold leading-tight tracking-[-0.025em] text-ink-900 md:text-[30px]">
            Need the right <span className="text-primary">technology solution</span>?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-600">
            Tell us what you run and where it slows you down — we will come
            back with a specification and a quote.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="btn-primary btn-md"
            >
              Contact Us
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="btn-secondary btn-md"
            >
              Explore Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
