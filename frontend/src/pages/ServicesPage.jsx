import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeroBreadcrumb from "../components/Breadcrumb";
import {
  MonitorSmartphone,
  Printer,
  Camera,
  Network,
  ShieldCheck,
  Server,
  Shield,
  RefreshCw,
  Settings2,
  Check,
  ArrowRight,
  ArrowUpRight,
  Search,
  MessagesSquare,
  Lightbulb,
  PackageCheck,
  LifeBuoy,
} from "lucide-react";
import servicesBanner from "../assets/Service.jpeg";
import cctv from "../assets/cctv.jpeg";
import printer from "../assets/printer.avif";
import driverinstall from "../assets/driverinstall.avif";
import laptop from "../assets/laptop.jpeg";
import lan from "../assets/lan.jpeg";
import firewall from "../assets/firewall.jpeg";
import server from "../assets/server.jpeg";
import antivirus from "../assets/antivirus.jpeg";

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

  const serviceGroups = [
    {
      number: "01",
      icon: MonitorSmartphone,
      title: "Technology & Devices",
      description: "Practical support for the devices and workplace technology your team depends on.",
      items: services.filter((service) =>
        ["Desktop & Laptop Services", "Printer Service & Sales", "Driver Installation"].includes(service.title)
      ),
    },
    {
      number: "02",
      icon: Network,
      title: "Infrastructure & Networks",
      description: "Reliable network, server and firewall infrastructure for connected business operations.",
      items: services.filter((service) =>
        ["Network Installation", "Server Maintenance", "Firewall Setup"].includes(service.title)
      ),
    },
    {
      number: "03",
      icon: ShieldCheck,
      title: "Security & Maintenance",
      description: "Ongoing protection, monitoring and maintenance for dependable IT operations.",
      items: services.filter((service) =>
        ["CCTV Maintenance & Sales", "Antivirus & Security", "Windows Updates"].includes(service.title)
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeroBreadcrumb
        currentLabel="Services"
        title="Services"
        subtitle="Professional IT solutions for your business."
        image={servicesBanner}
        imagePosition="48% 50%"
        heightClass="min-h-[150px] md:min-h-[175px] lg:min-h-[188px]"
      />

      {/* ==================================================================
          SERVICES OVERVIEW + GROUPED LISTINGS
      ================================================================== */}
      <section id="services-grid" className="scroll-mt-24 relative overflow-hidden bg-[#F5FAF9] py-10 md:py-12 lg:py-14">
        <div className="section-shell relative">
          <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-[#EAF6F4] blur-3xl opacity-80" aria-hidden="true" />

          <div className="mb-6 md:mb-8 lg:mb-9" data-aos="fade-up">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-10 bg-[#00897B]" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897B]">OUR SERVICES</span>
            </div>
            <h2 className="max-w-2xl font-display text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#17302D] md:text-[34px] lg:text-[38px]">
              Technology support built around your business.
            </h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[#58706C] md:text-[15px]">
              From workplace devices to infrastructure, networks and security,
              we provide practical IT support for everyday business operations.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {serviceGroups.map((group, index) => {
              const panelTone =
                index === 0
                  ? "border-[#D5E8E4] bg-white/90"
                  : index === 1
                    ? "border-[#DDEEEA] bg-[#F9FCFB]"
                    : "border-[#D9E9E2] bg-white/90";

              return (
                <div
                  key={group.title}
                  data-aos="fade-up"
                  data-aos-delay={index * 110}
                  className={`group relative rounded-[24px] border p-5 shadow-[0_12px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#8FC7BE] hover:shadow-[0_18px_30px_rgba(18,60,54,0.08)] md:p-6 ${panelTone}`}
                >
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897B]">{group.number}</span>
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF6F4] text-[#00897B] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#E0F3F0]">
                        <group.icon size={15} />
                      </span>
                    </div>
                    <span className="rounded-full border border-[#D5E8E4] bg-[#F5FAF9] p-1.5 text-[#00897B] transition-all duration-200 group-hover:border-[#00897B] group-hover:bg-[#EAF6F4]">
                      <ArrowUpRight size={14} />
                    </span>
                  </div>

                  <div className="mb-4 h-px w-12 bg-[#00897B] opacity-75" aria-hidden="true" />

                  <h3 className="font-display text-[20px] font-semibold leading-tight tracking-[-0.03em] text-[#17302D]">
                    {group.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#58706C]">{group.description}</p>

                  <ul className="mt-5 space-y-0">
                    {group.items.map((service) => (
                      <li key={service.title} className="border-t border-[#E7F0EE] first:border-t-0">
                        <button
                          type="button"
                          className="group/row flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-250 hover:-translate-x-1 hover:bg-[#F1FAF8] hover:px-3"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F0F8F7] text-[#6F7F7B] transition-all duration-200 group-hover/row:bg-[#EAF6F4] group-hover/row:text-[#00897B]">
                              <service.icon size={12} />
                            </span>
                            <span className="truncate text-[13px] font-medium leading-relaxed text-[#1F2E2B]">
                              {service.title}
                            </span>
                          </span>
                          <ArrowRight
                            size={13}
                            className="shrink-0 text-[#7B8F8B] transition-all duration-200 group-hover/row:translate-x-1 group-hover/row:text-[#00897B]"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================
          INFRASTRUCTURE & IT SUPPORT
          Step 2: a premium editorial support section that breaks the repeated
          card layout without changing any other Services page areas.
      ================================================================== */}
      <section className="section-shell pb-10 pt-2 md:pb-12 md:pt-4 lg:pb-14">
        <div
          className="overflow-hidden rounded-[30px] border border-[#DDEEEA] bg-white shadow-[0_18px_32px_rgba(18,60,54,0.06)]"
          data-aos="fade-up"
        >
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="p-3 md:p-4 lg:p-5" data-aos="fade-right" data-aos-delay="80">
              <img
                src={server}
                alt="IT infrastructure support"
                className="h-[270px] w-full rounded-[22px] border border-[#DDEEEA] object-cover shadow-[0_14px_24px_rgba(14,36,32,0.06)] md:h-[340px] lg:h-[420px]"
                loading="lazy"
              />
            </div>

            <div className="px-5 pb-6 pt-4 md:px-7 md:pb-7 md:pt-5 lg:px-9 lg:pb-8 lg:pt-6">
              <div className="mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897B]">
                  INFRASTRUCTURE & IT SUPPORT
                </span>
              </div>

              <h2 className="max-w-[14ch] font-display text-[26px] font-bold leading-[1.05] tracking-[-0.04em] text-[#17302D] md:text-[32px] lg:text-[38px]">
                Reliable technology infrastructure for everyday business.
              </h2>

              <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#58706C] md:text-[15px]">
                From networks and servers to firewalls and workplace systems, we help
                businesses maintain reliable, secure and well-supported technology environments.
              </p>

              <div className="mt-7 space-y-3.5">
                {[
                  {
                    number: "01",
                    title: "Network & Connectivity",
                    copy: "Stable, well-planned access for day-to-day operations.",
                    Icon: Network,
                  },
                  {
                    number: "02",
                    title: "Server & Infrastructure",
                    copy: "Dependable systems that keep critical workloads running.",
                    Icon: Server,
                  },
                  {
                    number: "03",
                    title: "Security & Protection",
                    copy: "Layered safeguards that reduce risk and downtime.",
                    Icon: ShieldCheck,
                  },
                ].map((row, index) => {
                  const { number, title, copy, Icon } = row;

                  return (
                    <div
                      key={title}
                      className="flex items-start gap-3 rounded-2xl border border-[#E8F1EF] bg-[#F5FAF9] px-3.5 py-3 transition-colors duration-200 hover:border-[#D1E8E4]"
                      data-aos="fade-up"
                      data-aos-delay={120 + index * 80}
                    >
                      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-white text-[#00897B] shadow-[0_4px_12px_rgba(0,137,123,0.08)]">
                        <Icon size={14} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00897B]">
                            {number}
                          </span>
                          <span className="text-[14px] font-semibold text-[#17302D]">{title}</span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-[#58706C]">{copy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          HOW WE WORK
      ================================================================== */}
      <section className="section-shell pb-12 pt-12 md:pt-16 lg:pb-14">
        <div className="mb-6 md:mb-8" data-aos="fade-up">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-10 bg-[#00897B]" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897B]">
              HOW WE WORK
            </span>
          </div>
          <h2 className="max-w-2xl font-display text-[26px] font-bold leading-tight tracking-[-0.04em] text-[#17302D] md:text-[32px] lg:text-[36px]">
            A clear process from first conversation to ongoing support.
          </h2>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[#58706C] md:text-[15px]">
            We keep the process straightforward — understand your needs, recommend the right solution,
            deliver it carefully, and stay available for support.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-[#E2EFEB] md:left-8 lg:hidden" aria-hidden="true" />
          <div className="absolute left-[10%] right-[10%] top-[54px] hidden h-px bg-[#E2EFEB] lg:block" aria-hidden="true" />

          <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((step, i) => (
              <li
                key={step.n}
                data-aos="fade-up"
                data-aos-delay={i * 70}
                className="group relative z-10 lg:pt-7"
              >
                <div className="relative flex h-full items-start gap-3 rounded-[18px] border border-[#E8F1EF] bg-white p-4 pl-5 shadow-[0_10px_20px_rgba(18,60,54,0.03)] transition-all duration-250 group-hover:-translate-y-1 group-hover:border-[#D4E9E5] group-hover:shadow-[0_14px_22px_rgba(18,60,54,0.06)] md:p-4.5 md:pl-5 lg:flex-col lg:items-center lg:gap-4 lg:rounded-[22px] lg:p-5 lg:text-center lg:pl-5">
                  <div className="lg:mt-1">
                    <div className="flex items-center gap-2.5 lg:flex-col lg:gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897B] lg:text-[11px]">
                        {step.n}
                      </span>
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-[#DDEEEA] bg-[#F5FAF9] text-[#00897B] transition-all duration-200 group-hover:border-[#00897B] group-hover:bg-[#EAF6F4] group-hover:text-[#006F66]">
                        <step.Icon size={15} />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 lg:flex-1 lg:pt-0">
                    <h3 className="font-display text-[17px] font-semibold leading-tight tracking-[-0.03em] text-[#17302D] transition-colors duration-200 group-hover:text-[#123C36]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[#58706C] lg:max-w-[18ch]">
                      {step.copy}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================================================================
          FINAL CTA
      ================================================================== */}
      <section className="section-shell py-12 md:py-16">
        <div
          className="relative overflow-hidden rounded-[28px] border border-[#0F3D36] bg-[#123C36] px-5 py-7 shadow-[0_20px_30px_rgba(18,60,54,0.12)] md:px-7 md:py-8 lg:px-8 lg:py-9"
          data-aos="fade-up"
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 border-l border-[#2B5E57] bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.06))] lg:block" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#2C5F5A]" aria-hidden="true" />

          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-xl text-white">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#7EDBC0]" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7F6EE]">
                  LET&apos;S WORK TOGETHER
                </span>
              </div>

              <h2 className="font-display text-[24px] font-bold leading-tight tracking-[-0.04em] text-white md:text-[30px] lg:text-[34px]">
                Need the right technology solution?
              </h2>

              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#D8F3EE] md:text-[15px]">
                Tell us what your business needs. We&apos;ll help you identify the right technology,
                infrastructure and support approach for reliable day-to-day operations.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#00897B] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_22px_rgba(0,137,123,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#007B70]"
              >
                Contact Us
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center justify-center rounded-full border border-[#D7F6EE]/35 bg-white/5 px-5 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7F6EE]/60 hover:bg-white/8"
              >
                Explore Products
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
