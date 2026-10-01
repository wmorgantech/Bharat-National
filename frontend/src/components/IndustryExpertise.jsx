import React, { useState } from "react";
import {
  Building2,
  Camera,
  Landmark,
  MonitorSmartphone,
  School,
  Server,
  Store,
  Warehouse,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const customerGroups = [
  {
    label: "Offices & SMEs",
    detail: "Computers, laptops & IT support",
    Icon: Building2,
    accent: "bg-[#E5F4F1] text-[#087D70]",
    edge: "bg-[#168A7C]",
  },
  {
    label: "Schools & colleges",
    detail: "Devices, labs & campus networks",
    Icon: School,
    accent: "bg-[#EAF2FC] text-[#376B9A]",
    edge: "bg-[#5E8FC0]",
  },
  {
    label: "Government & public institutions",
    detail: "Business hardware & maintenance",
    Icon: Landmark,
    accent: "bg-[#EEF2F4] text-[#485965]",
    edge: "bg-[#70818A]",
  },
  {
    label: "Retail & multi-site businesses",
    detail: "Branch hardware, CCTV & networks",
    Icon: Store,
    accent: "bg-[#FFF3E4] text-[#A66920]",
    edge: "bg-[#C98A3B]",
  },
  {
    label: "Warehouses & industrial sites",
    detail: "Workstations, cameras & networks",
    Icon: Warehouse,
    accent: "bg-[#E9F4F2] text-[#28766D]",
    edge: "bg-[#3A9185]",
  },
  {
    label: "Server rooms & data centers",
    detail: "Servers, firewalls & maintenance",
    Icon: Server,
    accent: "bg-[#EDF0F8] text-[#4F6287]",
    edge: "bg-[#7886AA]",
  },
];

const capabilities = [
  {
    label: "Hardware supply & setup",
    description: "Device selection, installation and setup for your team.",
    Icon: MonitorSmartphone,
  },
  {
    label: "CCTV, networking & firewalls",
    description: "Camera, network and firewall systems for your site.",
    Icon: Camera,
  },
  {
    label: "Server maintenance & IT support",
    description: "Routine server care, upgrades and responsive IT support.",
    Icon: Wrench,
  },
];

export default function IndustryExpertise() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const activeGroup = customerGroups[activeGroupIndex];
  const ActiveGroupIcon = activeGroup.Icon;

  const moveGroup = (direction) => {
    setActiveGroupIndex((index) =>
      (index + direction + customerGroups.length) % customerGroups.length,
    );
  };

  return (
    <>
    <section className="border-y border-[#253238] bg-[#111B20] py-12 text-white md:py-14">
      <div className="section-shell">
        <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] xl:items-center xl:gap-10">
          <header className="max-w-xl" data-aos="fade-up">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#76C7B3]">
              Who we serve
            </span>
            <h2 className="mt-2 font-display text-[28px] font-bold leading-[1.12] tracking-[-0.02em] text-white md:text-[38px]">
              Technology for the teams that keep your business running
            </h2>
            <p className="mt-3 text-[12px] leading-relaxed text-[#B7C5C7] sm:text-[13px]">
              BNC supplies computers, laptops, desktops and accessories, with CCTV,
              networking, firewalls, server maintenance and IT support.
            </p>
          </header>

          <div className="min-w-0">
            <h3 className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#819397]">
              Customer groups
            </h3>
            <div className="mx-auto grid w-full max-w-[720px] grid-cols-[34px_minmax(0,1fr)_34px] items-center gap-2 sm:grid-cols-[40px_minmax(0,1fr)_40px] sm:gap-3">
              <button
                type="button"
                aria-label="Previous customer group"
                aria-controls="who-we-serve-detail"
                onClick={() => moveGroup(-1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-[#D5DFE0] transition-colors hover:border-[#76C7B3] hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>

              <article
                id="who-we-serve-detail"
                aria-live="polite"
                className="relative mx-auto flex min-h-[170px] w-full max-w-[560px] flex-col justify-center overflow-hidden rounded-xl border border-[#58777B] bg-[#23363B] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.2)] sm:min-h-[190px] sm:p-5"
              >
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${activeGroup.edge}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${activeGroup.accent}`}>
                    <ActiveGroupIcon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                  </span>
                  <span className="pt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#93A9AC]">
                    {String(activeGroupIndex + 1).padStart(2, "0")} / {String(customerGroups.length).padStart(2, "0")}
                  </span>
                </div>
                <h4 className="mt-3 font-display text-[17px] font-bold leading-tight text-white sm:mt-4 sm:text-[22px]">
                  {activeGroup.label}
                </h4>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#B7C5C7] sm:text-[13px]">
                  {activeGroup.detail}
                </p>
              </article>

              <button
                type="button"
                aria-label="Next customer group"
                aria-controls="who-we-serve-detail"
                onClick={() => moveGroup(1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-[#D5DFE0] transition-colors hover:border-[#76C7B3] hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex justify-center gap-1.5" role="group" aria-label="Choose customer group">
              {customerGroups.map((group, index) => (
                <button
                  key={group.label}
                  type="button"
                  aria-label={`Show ${group.label}`}
                  aria-current={index === activeGroupIndex ? "true" : undefined}
                  onClick={() => setActiveGroupIndex(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${index === activeGroupIndex ? "w-6 bg-[#76C7B3]" : "w-2 bg-white/25 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>

    <section className="bg-[#F5FAF9] py-7 sm:py-8 md:py-10">
      <div className="section-shell">
        <div className="mb-3 sm:mb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00897B]">
            What BNC provides
          </span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {capabilities.map(({ label, description, Icon }) => (
            <li
              key={label}
              className="group relative grid min-h-[112px] min-w-0 grid-cols-[44px_minmax(0,1fr)] content-center items-center gap-x-3 gap-y-1.5 overflow-hidden rounded-xl border border-[#CFE8E2] bg-[#EAF6F4] p-3.5 shadow-[0_4px_12px_rgba(18,60,54,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93C8BD] hover:bg-[#DFF1ED] hover:shadow-[0_10px_20px_rgba(18,60,54,0.08)] sm:flex sm:min-h-[190px] sm:flex-col sm:items-start sm:gap-3.5 sm:p-4"
            >
              <span aria-hidden="true" className="absolute inset-x-4 top-0 h-[2px] rounded-b-full bg-[#70B7A9] opacity-70 transition-opacity group-hover:opacity-100" />
              <span className="row-span-2 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/80 bg-white text-[#00897B] shadow-sm transition-transform duration-200 group-hover:scale-105 sm:row-span-1 sm:h-12 sm:w-12">
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </span>
              <span className="text-[13px] font-bold leading-snug text-[#17302D] sm:text-[15px]">
                {label}
              </span>
              <p className="col-start-2 text-[11px] leading-relaxed text-[#506B66] sm:col-start-auto sm:text-[12px]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
    </>
  );
}