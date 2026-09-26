import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  HardDrive,
  HeartHandshake,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import PageHeroBreadcrumb from "../components/Breadcrumb";
import aboutUsBanner from "../assets/About.jpeg";
import serverInfrastructure from "../assets/server.jpeg";

const CAPABILITIES = [
  {
    number: "01",
    Icon: HardDrive,
    title: "Technology Products",
    description: "Reliable hardware and solutions designed for everyday performance and easy business use.",
  },
  {
    number: "02",
    Icon: Headphones,
    title: "IT Services & Support",
    description: "Installation, troubleshooting and responsive support that keeps your systems running smoothly.",
  },
  {
    number: "03",
    Icon: ShieldCheck,
    title: "Business Infrastructure",
    description: "Secure networks and dependable systems built for long-term business continuity and growth.",
  },
];

const VALUES = [
  {
    number: "01",
    Icon: HeartHandshake,
    title: "Customer First",
    description: "Clear guidance and honest recommendations that match what your business actually needs.",
  },
  {
    number: "02",
    Icon: BadgeCheck,
    title: "Reliable Solutions",
    description: "Genuine products, dependable setup and practical support from the first installation onward.",
  },
  {
    number: "03",
    Icon: BriefcaseBusiness,
    title: "Long-Term Support",
    description: "A trusted partner for maintenance, technical help and business continuity over time.",
  },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <PageHeroBreadcrumb
        currentLabel="About Us"
        title="About Us"
        subtitle="Technology that works for you."
        image={aboutUsBanner}
        imagePosition="50% 50%"
        heightClass="min-h-[160px] md:min-h-[180px] lg:min-h-[190px]"
      />

      <section className="section-shell pt-12 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4" data-aos="fade-up">
              <span className="eyebrow">ABOUT BNC</span>
              <h2 className="font-display text-[30px] font-bold leading-[1.05] tracking-[-0.04em] text-ink-900 md:text-[46px]">
                Technology that keeps your business moving.
              </h2>
              <p className="max-w-xl text-[15px] leading-relaxed text-ink-600 md:text-[16px]">
                Bharat National Computers helps businesses and institutions source the right <span className="font-semibold text-ink-900">Technology Products</span>,
                deploy dependable systems and keep operations supported through expert <span className="font-semibold text-ink-900">IT Services</span> and long-term maintenance.
              </p>
            </div>

            <div className="rounded-[20px] border border-ink-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]" data-aos="fade-up" data-aos-delay="80">
              <div className="flex items-center justify-between border-b border-ink-200 pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">Trusted support</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF6F4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#00897B]">
                  BNC
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Technology Products",
                  "IT Services",
                  "Business Infrastructure",
                  "Technical Support",
                  "Reliable Solutions",
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between gap-3 border-b border-ink-100 pb-2.5 last:border-b-0 last:pb-0">
                    <span className="text-sm font-medium text-ink-700">{item}</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF6F4] text-[#00897B]">
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-12 md:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6" data-aos="fade-up">
            <span className="eyebrow">WHAT WE DO</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CAPABILITIES.map((item, index) => (
              <div
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group rounded-[18px] border border-ink-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-[#CFE8E5] hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF6F4] text-[#00897B]">
                    <item.Icon size={18} />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{item.number}</span>
                </div>

                <h3 className="mt-5 font-display text-[20px] font-semibold tracking-[-0.03em] text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-600">{item.description}</p>

                <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00897B]">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pt-12 md:pt-14">
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="overflow-hidden rounded-[20px] border border-ink-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]" data-aos="fade-right">
            <img
              src={serverInfrastructure}
              alt="IT infrastructure support and server systems"
              className="h-[260px] w-full object-cover md:h-[320px]"
              loading="lazy"
            />
          </div>

          <div className="rounded-[20px] border border-ink-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]" data-aos="fade-left">
            <span className="eyebrow">BUILT FOR BUSINESS</span>
            <h3 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.04em] text-ink-900 md:text-[34px]">
              Infrastructure designed to keep operations moving.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
              We help businesses deploy and maintain systems that are practical, secure and ready to support day-to-day work.
            </p>

            <ul className="mt-5 space-y-3">
              {[
                "Technology Products",
                "IT Services & Support",
                "Business Infrastructure",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF6F4] text-[#00897B]">
                    <ArrowUpRight size={12} />
                  </span>
                  <span className="text-[14px] font-medium text-ink-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell pt-12 md:pt-14">
        <div className="mx-auto max-w-6xl rounded-[24px] bg-[#123C36] px-6 py-8 text-white md:px-8 md:py-10" data-aos="fade-up">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#DDEEEB]">OUR MISSION</span>
              <h3 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.04em] text-white md:text-[38px]">
                To simplify technology for the people and businesses we serve.
              </h3>
            </div>

            <div className="md:pl-8">
              <p className="text-[15px] leading-relaxed text-[#DDEEEB] md:text-[16px]">
                We aim to provide honest consulting, quality products and responsive support backed by clear communication,
                transparent pricing and a long-term service relationship built on trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-12 md:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6" data-aos="fade-up">
            <span className="eyebrow">OUR VALUES</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {VALUES.map((value, index) => (
              <div
                key={value.title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00897B]">{value.number}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF6F4] text-[#00897B]">
                    <value.Icon size={16} />
                  </span>
                </div>

                <h3 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.03em] text-ink-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-12 md:py-16">
        <div className="mx-auto max-w-5xl rounded-[22px] bg-[#123C36] px-6 py-8 text-white md:px-10 md:py-10" data-aos="fade-up">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#DDEEEB]">NEXT STEP</span>
            <h2 className="mt-4 font-display text-[28px] font-bold leading-tight tracking-[-0.04em] text-white md:text-[38px]">
              Let&apos;s build your next technology solution.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#DDEEEB]">
              Tell us what you need and our team will come back with a recommendation and a quote.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => navigate("/services")} className="btn-primary btn-lg">
                Explore Services
                <ArrowRight size={16} />
              </button>
              <button type="button" onClick={() => navigate("/contact")} className="btn-secondary btn-lg border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
