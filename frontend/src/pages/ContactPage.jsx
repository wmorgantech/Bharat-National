import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Send,
  Radio,
  ArrowUpRight,
  MessageSquare,
  User,
  AtSign,
} from "lucide-react";
import { SelectInput, TextArea, TextInput } from "../components/FormControl";
import { toast } from "react-toastify";
import { createContact } from "../api/Contact";
import PageHeroBreadcrumb from "../components/Breadcrumb";
import contactBanner from "../assets/contact-banner.jpg";

/**
 * Contact page.
 *
 * Every address, number, email and opening time below is the project's own
 * existing data, unchanged. The form fields, validation, API call, loading
 * state and toasts are the original implementation verbatim; only the
 * presentation around them is new.
 */

const ContactPage = () => {
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
    if (!form.interestedIn.trim()) return "Please select a subject";
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
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeroBreadcrumb
        currentLabel="Contact Us"
        title="Contact Us"
        subtitle="Phone, email, location and support from our Coimbatore team."
        image={contactBanner}
        imagePosition="50% 38%"
        heightClass="min-h-[160px] md:min-h-[180px] lg:min-h-[190px]"
      />

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
              className="lg:col-span-7 rounded-xl border border-[#1D5A4F] bg-[#123C36] p-6 md:p-8 shadow-[0_18px_40px_rgba(8,32,28,0.18)]"
              data-aos="fade-up"
            >
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
                <span className="grid place-items-center h-11 w-11 rounded-xl bg-[#1C524D] text-[#E9F8F4] shrink-0">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Send us a message
                  </h3>
                  <p className="text-[12.5px] text-[#D7EEE9]">
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
                    labelClassName="text-[#EAF9F4]"
                    iconClassName="w-3.5 h-3.5 text-[#A9D9D0]"
                    className="border-[#D9EAE7] bg-[#F7FBFA] text-[#0F172A] placeholder:text-[#6B7E7A] focus:border-[#2AAEA0] focus:ring-[#2AAEA0]/15"
                    placeholder="Enter your full name"
                    type="text"
                    value={form.name}
                    onChange={onChange("name")}
                  />
                  <TextInput
                    label="Phone Number"
                    icon={Phone}
                    labelClassName="text-[#EAF9F4]"
                    iconClassName="w-3.5 h-3.5 text-[#A9D9D0]"
                    className="border-[#D9EAE7] bg-[#F7FBFA] text-[#0F172A] placeholder:text-[#6B7E7A] focus:border-[#2AAEA0] focus:ring-[#2AAEA0]/15"
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
                    labelClassName="text-[#EAF9F4]"
                    iconClassName="w-3.5 h-3.5 text-[#A9D9D0]"
                    className="border-[#D9EAE7] bg-[#F7FBFA] text-[#0F172A] placeholder:text-[#6B7E7A] focus:border-[#2AAEA0] focus:ring-[#2AAEA0]/15"
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                  />

                  <SelectInput
                    label="Subject"
                    icon={Radio}
                    labelClassName="text-[#EAF9F4]"
                    iconClassName="w-3.5 h-3.5 text-[#A9D9D0]"
                    className="border-[#D9EAE7] bg-[#F7FBFA] text-[#0F172A] placeholder:text-[#6B7E7A] focus:border-[#2AAEA0] focus:ring-[#2AAEA0]/15"
                    value={form.interestedIn}
                    onChange={onChange("interestedIn")}
                  >
                    <option value="">Select a subject…</option>
                    <option value="Product enquiry">Product enquiry</option>
                    <option value="Service enquiry">Service enquiry</option>
                    <option value="Support">Support</option>
                    <option value="Order enquiry">Order enquiry</option>
                    <option value="Other">Other</option>
                  </SelectInput>
                </div>

                <TextArea
                  label="Message / Requirements"
                  icon={MessageSquare}
                  labelClassName="text-[#EAF9F4]"
                  iconClassName="w-3.5 h-3.5 text-[#A9D9D0]"
                  className="border-[#D9EAE7] bg-[#F7FBFA] text-[#0F172A] placeholder:text-[#6B7E7A] focus:border-[#2AAEA0] focus:ring-[#2AAEA0]/15"
                  placeholder="Tell us briefly about your requirement…"
                  rows={5}
                  value={form.message}
                  onChange={onChange("message")}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-lg w-full sm:w-auto sm:min-w-[240px] rounded-xl border border-[#1AA992] bg-[#1AA992] text-white shadow-[0_12px_24px_rgba(26,169,146,0.28)] transition hover:bg-[#159A84] hover:border-[#159A84] focus:outline-none focus:ring-4 focus:ring-[#1AA992]/20 disabled:cursor-not-allowed disabled:opacity-70"
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

    </div>
  );
};

export default ContactPage;
