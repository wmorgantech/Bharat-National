import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { ArrowUpRight, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import Logo from "../assets/logo.jpeg";

const QUICK_LINKS = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Products", path: "/products" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];

// Points at the real catalogue route; categories themselves are API-driven, so
// these are entry points rather than invented category names.
const PRODUCTS = [
  { name: "All Products", path: "/products" },
  { name: "Desktops & Workstations", path: "/products" },
  { name: "Laptops & Notebooks", path: "/products" },
  { name: "Servers & Storage", path: "/products" },
  { name: "Networking Hardware", path: "/products" },
];

const SERVICES = [
"Desktop & Laptop Repair",
"Printer Service",
"CCTV Installation",
"Networking Solutions",
"AMC Contracts",
];

const SUPPORT = [
  { name: "Contact Support", path: "/contact" },
  { name: "My Orders", path: "/orders" },
  { name: "Your Cart", path: "/cart" },
  { name: "Request a Quote", path: "/contact" },
];

const SOCIALS = [
  { Icon: FaFacebookF, href: "https://www.facebook.com/share/1EAEtbPJU8/", label: "Facebook" },
  { Icon: FaInstagram, href: "https://www.instagram.com/bncbalaji?igsh=MThrZXo4M2IzeWRpeQ%3D%3D", label: "Instagram" },
  { Icon: FaYoutube, href: null, label: "YouTube" },
  { Icon: FaWhatsapp, href: "https://wa.me/919789345333", label: "WhatsApp" },
];

// Shared link styling for the four navigation columns.
const linkClass =
"group inline-flex items-center gap-2 text-[13.5px] text-ink-500 hover:text-ink-900 transition-colors";
const dash = (
  <span
    aria-hidden="true"
    className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3"
  />
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      {/* ---- Lighting ---- */}

      <div className="relative section-shell pt-16 md:pt-20 pb-8">
        {/* ===== Top: brand + newsletter ===== */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr] lg:gap-16 pb-12 border-b border-ink-200">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl overflow-hidden bg-white grid place-items-center shrink-0">
                <img src={Logo} alt="logo"className="w-[85%] h-[85%] object-contain" />
              </span>
              <span className="leading-none">
                <span className="block font-display font-bold text-lg tracking-tight text-ink-900">
                  Bharat National
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-primary mt-1">
                  Computers
                </span>
              </span>
            </div>

            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-500">
              Your end-to-end technology partner in Coimbatore — hardware,
              implementation and lifetime service support under one roof.
            </p>

            <ul className="mt-7 space-y-3.5 text-sm text-ink-500">
              <li className="flex gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                <span className="leading-relaxed">
                  Dno - 333- F2 - Geetha Building
                  <br />
                  Nehru St, Peranaidu Layout, Ram Nagar,
                  <br />
                  Coimbatore, Tamil Nadu 641009
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={15} className="mt-0.5 shrink-0 text-primary" />
                <a href="tel:9789345333"className="hover:text-ink-900 transition-colors">
                  9789345333, 8903037883
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={15} className="mt-0.5 shrink-0 text-primary" />
                <a
                  href="mailto:bncbalajicbe@gmail.com"
                  className="hover:text-ink-900 transition-colors break-all"
                >
                  bncbalajicbe@gmail.com
                </a>
              </li>
            </ul>

            <a
              href="https://maps.app.goo.gl/ydSvPZEtURKrWLfb8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 border-b border-primary pb-0.5 hover:text-primary hover:border-primary transition-colors"
            >
              Get direction
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Newsletter panel */}
          <div className="glass-dark p-7 md:p-8 self-start w-full">
            <span className="eyebrow text-primary">Stay in the loop</span>
            <h3 className="mt-3 font-display text-xl md:text-2xl font-semibold tracking-tight text-ink-900">
              Technology updates, straight to your inbox
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
              Sign up for our newsletter and get 10% off your first purchase.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Enter your e-mail"
                aria-label="Email address for newsletter"
                className="flex-1 h-12 px-4 rounded-xl bg-white border border-ink-200 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15 transition-all"
              />
              <button className="btn-primary btn-md shrink-0">
                Subscribe
                <ArrowRight size={15} />
              </button>
            </div>

            <label className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
              <input type="checkbox"className="mt-0.5 accent-primary shrink-0" />
              <span>
                By clicking subscribe, you agree to the{" "}
                <span className="underline cursor-pointer hover:text-ink-900 transition-colors">
                  Terms
                </span>{" "}
                &amp;{" "}
                <span className="underline cursor-pointer hover:text-ink-900 transition-colors">
                  Privacy Policy
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* ===== Navigation columns ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 py-12">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkClass}>
                    {dash}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Products
            </h3>
            <ul className="mt-5 space-y-3">
              {PRODUCTS.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkClass}>
                    {dash}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Services
            </h3>
            <ul className="mt-5 space-y-3">
              {SERVICES.map((service) => (
                <li key={service}>
                  <Link to="/services"className={linkClass}>
                    {dash}
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Support
            </h3>
            <ul className="mt-5 space-y-3">
              {SUPPORT.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkClass}>
                    {dash}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                Follow
              </h3>
              <div className="mt-4 flex items-center gap-2">
                {SOCIALS.map((social) =>
                  social.href ? (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="h-10 w-10 grid place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:bg-primary hover:border-primary hover:text-ink-900 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <social.Icon className="w-4 h-4" />
                    </a>
                  ) : (
                    <span
                      key={social.label}
                      aria-label={social.label}
                      className="h-10 w-10 grid place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:bg-primary hover:border-primary hover:text-ink-900 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <social.Icon className="w-4 h-4" />
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Bottom bar ===== */}
        <div className="pt-6 border-t border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-400 text-center sm:text-left">
            © {currentYear} Bharat National Computers. All Rights Reserved.
          </p>

          <div className="flex items-center gap-5 text-xs text-ink-400">
            <span className="hover:text-ink-700 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-ink-700 transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hidden sm:inline">Coimbatore, Tamil Nadu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
