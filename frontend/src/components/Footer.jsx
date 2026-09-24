import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";
import Logo from "../assets/logo.jpeg";

const QUICK_LINKS = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Products", path: "/products" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
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

const linkClass =
  "text-[13px] font-medium text-white/65 transition-colors hover:text-white";

const headingClass =
  "text-[11px] font-bold uppercase tracking-[0.16em] text-white";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-white/70">
      <div className="section-shell py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr,1fr,1fr,1fr] lg:gap-10">
          {/* ===== Brand + contact ===== */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
                <img src={Logo} alt="" aria-hidden="true" className="h-[85%] w-[85%] object-contain" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-[15px] font-bold tracking-tight text-white">
                  Bharat National
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-primary-light">
                  Computers
                </span>
              </span>
            </div>

            <ul className="mt-5 space-y-2.5 text-[13px]">
              <li className="flex gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary-light" />
                <span className="leading-relaxed text-white/65">
                  Nehru St, Peranaidu Layout, Ram Nagar,
                  <br />
                  Coimbatore, Tamil Nadu 641009
                </span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-primary-light" />
                <a href="tel:9789345333" className="font-medium text-white/65 transition-colors hover:text-white">
                  9789345333, 8903037883
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail size={14} className="mt-0.5 shrink-0 text-primary-light" />
                <a
                  href="mailto:bncbalajicbe@gmail.com"
                  className="break-all font-medium text-white/65 transition-colors hover:text-white"
                >
                  bncbalajicbe@gmail.com
                </a>
              </li>
            </ul>

            <a
              href="https://maps.app.goo.gl/ydSvPZEtURKrWLfb8"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-light transition-colors hover:text-white"
            >
              Get direction
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* ===== Quick links ===== */}
          <div>
            <h3 className={headingClass}>Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== Services ===== */}
          <div>
            <h3 className={headingClass}>Services</h3>
            <ul className="mt-4 space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service}>
                  <Link to="/services" className={linkClass}>
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== Support + social ===== */}
          <div>
            <h3 className={headingClass}>Support</h3>
            <ul className="mt-4 space-y-2.5">
              {SUPPORT.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((social) =>
                social.href ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-primary hover:text-white"
                  >
                    <social.Icon className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span
                    key={social.label}
                    aria-label={social.label}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-primary hover:text-white"
                  >
                    <social.Icon className="h-3.5 w-3.5" />
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* ===== Bottom bar ===== */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row">
          <p className="text-center text-[12px] font-medium text-white/50 sm:text-left">
            © {currentYear} Bharat National Computers. All Rights Reserved.
          </p>

          <div className="flex items-center gap-5 text-[12px] font-medium text-white/50">
            <span className="cursor-pointer transition-colors hover:text-white/80">
              Privacy Policy
            </span>
            <span className="cursor-pointer transition-colors hover:text-white/80">
              Terms of Service
            </span>
            <span className="hidden sm:inline">Coimbatore, Tamil Nadu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
