
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      image:
       server,
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
      image:
       antivirus,
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ===== TOP HERO / BREADCRUMB (PRIMARY BG) ===== */}
      <PageHeroBreadcrumb
        title="Our Services"
        currentLabel="Services"
        bgColor="#0f615dff"
      />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-10">
        {/* FILTERS */}
        <div className="flex gap-3 flex-wrap mb-8">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full border backdrop-blur-md text-xs sm:text-sm transition
              ${
                activeFilter === f.key
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                  : "bg-white/40 text-slate-700 border-slate-300 hover:bg-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="relative rounded-xl overflow-hidden 
                  bg-white/20 backdrop-blur-lg 
                  border border-white/40 
                  shadow-[0_4px_20px_rgba(15,23,42,0.08)]
                  hover:shadow-[0_8px_30px_rgba(15,23,42,0.18)]
                  hover:-translate-y-1
                  transition 
                  group cursor-pointer"
              >
                {/* IMAGE */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* DESCRIPTION ON HOVER (line-by-line reveal) */}
                  <div className="absolute inset-0 bg-black/55 text-white p-4 flex flex-col justify-center items-start opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ul className="space-y-1">
                      {service.points.map((p, i) => (
                        <li
                          key={i}
                          style={{ transitionDelay: `${i * 70}ms` }}
                          className="text-xs sm:text-sm flex items-center gap-2 opacity-0 translate-y-1
                                     transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ICON + TITLE */}
                <div className="p-5 flex items-center gap-3 bg-white/70 backdrop-blur-md">
                  <div
                    className="inline-flex items-center justify-center h-10 w-10 rounded-2xl 
                               bg-[var(--primary)]/10 text-[var(--primary)]
                               transition-colors duration-200
                               group-hover:bg-[var(--primary)] group-hover:text-white"
                  >
                    <Icon size={24} />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                    {service.title}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* ================= AMC SECTION ================= */}
        <section className="mt-16">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Choose the AMC plan that fits your business
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
              Flexible annual maintenance contracts designed for uptime and
              peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* ================= COMPREHENSIVE AMC (KING) ================= */}
            <article className="relative pt-12 rounded-3xl bg-[var(--primary)] text-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.5)]">
              {/* KING CROWN BADGE */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 text-center">
                <div
                  className="flex items-center justify-center
                     h-14 w-14 rounded-full
                     bg-white text-amber-400
                     shadow-[0_12px_35px_rgba(0,0,0,0.45)]
                     ring-4 ring-[var(--primary)]"
                >
                  <Crown className="w-7 h-7" />
                </div>
                <span className="mt-1 block text-[10px] font-semibold tracking-widest uppercase text-white/90">
                  Most Popular
                </span>
              </div>

              <ClipboardCheck className="w-6 h-6 mb-4" />

              <h3 className="text-2xl font-semibold mb-2">Comprehensive AMC</h3>

              <p className="text-sm text-white/80 mb-6">
                Complete peace of mind with zero surprise costs.
              </p>

              {/* CLEAN TICK BULLETS */}
              <ul className="space-y-3 text-sm text-white/90">
                {[
                  "Customer need not pay anything during AMC period.",
                  "All services & spares will be provided by BNC.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center
                         rounded-full bg-white/10 border border-white/25"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/contact")}
                className="mt-8 rounded-full bg-white text-[var(--primary)]
                   px-6 py-2.5 text-sm font-semibold
                   hover:bg-slate-100 transition"
              >
                Get Premium Quote
              </button>
            </article>

            {/* ================= NON-COMPREHENSIVE AMC ================= */}
            <article className="rounded-3xl bg-white border border-slate-200 p-7 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              <ClipboardList className="w-6 h-6 text-[var(--primary)] mb-4" />

              <h3 className="text-2xl font-semibold mb-2">
                Non–Comprehensive AMC
              </h3>

              <p className="text-sm text-slate-600 mb-6">
                Service covered, spares billed separately.
              </p>

              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  "All service charges will be free under the AMC.",
                  "Replacement spares billed separately.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center
                         rounded-full bg-[var(--primary)]/10
                         border border-[var(--primary)]/20"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/contact")}
                className="mt-8 rounded-full bg-[var(--primary)] text-white
                   px-6 py-2.5 text-sm font-semibold
                   hover:bg-emerald-800 transition"
              >
                Get Standard Quote
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
