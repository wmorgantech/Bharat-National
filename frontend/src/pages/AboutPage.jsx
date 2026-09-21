import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Settings2,
  Wrench,
  ArrowRight,
  Eye,
  Target,
} from "lucide-react";
 import server from "../assets/server.jpeg";
import PageHeroBreadcrumb from "../components/Breadcrumb";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO / INTRO SECTION */}
      <PageHeroBreadcrumb title="About Us" currentLabel="About" />
      <section className="bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr,1fr] items-center">
            {/* LEFT TEXT BLOCK */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-slate-900">
                Empowering Your{" "}
                <span className="text-[#00897b]">Digital World</span>
              </h1>

              <p className="mt-4 text-sm md:text-base text-slate-600 max-w-xl">
                Bharat National Computers isn&apos;t just a store. We are your
                end-to-end technology partner. From purchasing the latest
                hardware to complex implementations and lifetime service
                support, we are with you every step of the way.
              </p>

              {/* CTA BUTTONS */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center rounded-lg bg-[#00897b] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/40 hover:shadow-lg hover:brightness-110 transition"
                >
                  View Products
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition"
                >
                  Our Services
                </button>
              </div>
            </div>

            {/* RIGHT IMAGE CARD */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.25)] bg-black/5">
                  <img
                    src={server}
                    alt="Person working on laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION SECTION */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#00897b] mb-2">
              Our Direction
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Our Vision &amp; Mission
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Vision */}
            <div className="rounded-3xl bg-slate-50 border border-slate-100 shadow-sm p-6 md:p-7 flex flex-col">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Our Vision
              </h3>
              <p className="text-sm font-semibold text-[#00897b]">
                On Time Services.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                To be the most trusted IT partner in our region by delivering
                fast, reliable, and on-time services for every customer, every
                single day.
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-3xl bg-slate-50 border border-slate-100 shadow-sm p-6 md:p-7 flex flex-col">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Our Mission
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                To simplify technology for homes, SMBs, and institutions by
                offering honest consulting, quality products, and responsive
                support—backed by clear communication, transparent pricing, and
                a long-term service relationship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM / FEATURES SECTION */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-10 md:mb-12">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#00897b] mb-2">
              Our Expertise
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              The BNC Ecosystem
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              Unlike big-box retailers, we don&apos;t just hand you a box. We
              provide a complete lifecycle solution for your technology needs.
            </p>
          </div>

          {/* CARDS */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Product Sales */}
            <div className="rounded-3xl bg-slate-50/70 border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="p-6 md:p-7 flex flex-col h-full">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900">
                  Product Sales
                </h3>
                <p className="mt-2 text-sm text-slate-600 flex-1">
                  Access the world&apos;s best technology brands. From PCs and
                  laptops to servers, networking gear, and smart devices, we
                  source genuine products at competitive prices.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-[#00897b] hover:text-emerald-700"
                  onClick={() => navigate("/products")}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Implementation */}
            <div className="rounded-3xl bg-slate-50/70 border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="p-6 md:p-7 flex flex-col h-full">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500 mb-4">
                  <Settings2 className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900">
                  Implementation
                </h3>
                <p className="mt-2 text-sm text-slate-600 flex-1">
                  Buying is easy; setting up is hard. Our certified team handles
                  on-site installation, network configuration, software
                  deployment, and integration so you&apos;re productive from day
                  one.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-[#00897b] hover:text-emerald-700"
                  onClick={() => navigate("/services")}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Service & Repair */}
            <div className="rounded-3xl bg-slate-50/70 border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="p-6 md:p-7 flex flex-col h-full">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 mb-4">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900">
                  Service &amp; Repair
                </h3>
                <p className="mt-2 text-sm text-slate-600 flex-1">
                  Downtime is costly. We offer warranty support, annual
                  maintenance contracts (AMC), emergency repair services, and
                  proactive health checks to keep you running.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center text-sm font-semibold text-[#00897b] hover:text-emerald-700"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
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
