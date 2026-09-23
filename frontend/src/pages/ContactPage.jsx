import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Radio,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  User,
  AtSign,
} from "lucide-react";
import { SelectInput, TextArea, TextInput } from "../components/FormControl";
import { toast } from "react-toastify";
import { createContact } from "../api/Contact";

/**
 * Contact page.
 *
 * Every address, number, email and opening time below is the project's own
 * existing data, unchanged. The form fields, validation, API call, loading
 * state and toasts are the original implementation verbatim; only the
 * presentation around them is new.
 */

const ContactPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interestedIn: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const onChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.phone.trim()) return "Phone is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.interestedIn.trim()) return "Please select Interested In";
    if (!form.message.trim()) return "Message is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    try {
      setLoading(true);

      await createContact({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        interestedIn: form.interestedIn.trim(),
        message: form.message.trim(),
      });

      toast.success("Message sent successfully");

      setForm({
        name: "",
        phone: "",
        email: "",
        interestedIn: "",
        message: "",
      });
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Contact details - the project's real published information.
  const details = [
    {
      Icon: Phone,
      label: "Phone",
      lines: (
        <>
          <a href="tel:9789345333" className="hover:text-primary transition-colors">
            9789345333
          </a>
          <br />
          <a href="tel:8903037883" className="hover:text-primary transition-colors">
            8903037883
          </a>
        </>
      ),
    },
    {
      Icon: Mail,
      label: "Email",
      lines: (
        <a
          href="mailto:bncbalajicbe@gmail.com"
          className="hover:text-primary transition-colors break-all"
        >
          bncbalajicbe@gmail.com
        </a>
      ),
    },
    {
      Icon: MapPin,
      label: "Location",
      lines: (
        <>
          Nehru St, Peranaidu Layout,
          <br />
          Ram Nagar, Coimbatore 641009
        </>
      ),
    },
    {
      Icon: Clock,
      label: "Business Hours",
      lines: (
        <>
          Mon – Sat: 9:00 AM – 8:00 PM
          <br />
          Sunday: Closed
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ==================================================================
          HERO
      ================================================================== */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="section-shell py-14 md:py-20">
          <div className="max-w-3xl" data-aos="fade-up">
            <span className="eyebrow">Contact Us</span>

            <h1 className="mt-3 font-display text-[32px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.1] tracking-[-0.025em] text-ink-900">
              Get in touch with our team
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] md:text-base leading-relaxed text-ink-600">
              Send us your requirement or visit our Coimbatore office. We are
              open Monday to Saturday, 9:00 AM to 8:00 PM.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#contact-form" className="btn-primary btn-lg">
                Send a Message
                <ArrowRight size={16} />
              </a>
              <a href="tel:9789345333" className="btn-secondary btn-lg">
                <Phone size={15} />
                Call 9789345333
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          CONTACT DETAILS
      ================================================================== */}
      <section className="section-shell pt-12 md:pt-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((d, i) => (
            <div
              key={d.label}
              data-aos="fade-up"
              data-aos-delay={i * 70}
              className="card-contact"
            >
              <span className="icon-chip-md">
                <d.Icon className="w-[18px] h-[18px]" />
              </span>
              <h2 className="h-card">
                {d.label}
              </h2>
              <div className="text-muted mt-2">
                {d.lines}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================
          FORM + MAP
      ================================================================== */}
      <section id="contact-form" className="section scroll-mt-24">
        <div className="section-shell">
          <div className="max-w-2xl mb-10 md:mb-12" data-aos="fade-up">
            <h2 className="section-title">Tell us what you need</h2>
            <p className="section-sub">
              Share your requirement and our team will come back with a
              recommendation and a quote.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* ---- Form ---- */}
            <div
              className="lg:col-span-7 rounded-xl border border-ink-200 bg-white p-6 md:p-8 shadow-card"
              data-aos="fade-up"
            >
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-ink-200">
                <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary-50 text-primary shrink-0">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900">
                    Send us a message
                  </h3>
                  <p className="text-[12.5px] text-ink-500">
                    All fields are required.
                  </p>
                </div>
              </div>

              {/* submit handler - unchanged */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput
                    label="Your Name"
                    icon={User}
                    placeholder="Enter your full name"
                    type="text"
                    value={form.name}
                    onChange={onChange("name")}
                  />
                  <TextInput
                    label="Phone Number"
                    icon={Phone}
                    placeholder="Enter your phone number"
                    type="tel"
                    value={form.phone}
                    onChange={onChange("phone")}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput
                    label="Email Address"
                    icon={AtSign}
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                  />

                  {/* if SelectInput supports value/onChange pass it */}
                  <SelectInput
                    label="Interested In"
                    icon={Radio}
                    value={form.interestedIn}
                    onChange={onChange("interestedIn")}
                  >
                    <option value="">Select a service…</option>
                    <option value="Desktop / Laptop Service">
                      Desktop / Laptop Service
                    </option>
                    <option value="Networking & WiFi Setup">
                      Networking &amp; WiFi Setup
                    </option>
                    <option value="CCTV Installation">CCTV Installation</option>
                    <option value="Annual Maintenance (AMC)">
                      Annual Maintenance (AMC)
                    </option>
                    <option value="Other Services">Other Services</option>
                  </SelectInput>
                </div>

                <TextArea
                  label="Message / Requirements"
                  icon={MessageSquare}
                  placeholder="Tell us briefly about your requirement…"
                  rows={5}
                  value={form.message}
                  onChange={onChange("message")}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary btn-lg w-full sm:w-auto sm:min-w-[240px]"
                >
                  {loading ? "Sending..." : "Send Message"}
                  {!loading && <Send size={16} />}
                </button>
              </form>
            </div>

            {/* ---- Map + address ---- */}
            <div
              className="lg:col-span-5 rounded-xl border border-ink-200 bg-white shadow-card overflow-hidden"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.9999999999995!2d76.9644659!3d11.0152736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859d49963f847%3A0x644e0375a7175ba0!2sBharat%20National%20Computers%20-%20BNC!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0, display: "block" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bharat National Computers Location"
              ></iframe>

              <div className="p-6 md:p-7 border-t border-ink-200">
                <h3 className="font-display text-base font-semibold text-ink-900">
                  Bharat National Computers
                </h3>

                <p className="mt-3 flex gap-2.5 text-[13.5px] leading-relaxed text-ink-600">
                  <MapPin size={15} className="mt-0.5 text-primary shrink-0" />
                  <span>
                    Dno - 333- F2 - Geetha Building, Nehru St,
                    <br />
                    Peranaidu Layout, Ram Nagar,
                    <br />
                    Coimbatore, Tamil Nadu 641009
                  </span>
                </p>

                <p className="mt-3 flex items-center gap-2.5 text-[13.5px] text-ink-600">
                  <Clock size={15} className="text-primary shrink-0" />
                  Mon – Sat: 9:00 AM – 8:00 PM
                </p>

                <a
                  href="https://maps.app.goo.gl/ydSvPZEtURKrWLfb8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-md mt-6 w-full"
                >
                  Get Directions
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          FINAL CTA
      ================================================================== */}
      <section className="section-shell pb-16 md:pb-24">
        <div
          className="rounded-xl border border-ink-200 bg-ink-50 px-6 py-12 md:px-16 md:py-14 text-center"
          data-aos="fade-up"
        >
          <h2 className="font-display text-[24px] md:text-[32px] font-bold leading-tight tracking-[-0.025em] text-ink-900">
            Have a technology requirement?
          </h2>
          <p className="mt-3 mx-auto max-w-xl text-[15px] leading-relaxed text-ink-600">
            Browse what we supply and support, or talk to us about a custom
            setup.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
              onClick={() => navigate("/products")}
              className="btn-secondary btn-lg"
            >
              Explore Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
