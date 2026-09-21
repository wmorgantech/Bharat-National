import React, { useState } from "react";
import PageHeroBreadcrumb from "../components/Breadcrumb";
import { SelectInput, TextArea, TextInput } from "../components/FormControl";
import { toast } from "react-toastify";
import { createContact } from "../api/Contact";

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

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeroBreadcrumb title=" Contact Us" currentLabel="Contact" />

      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid gap-0 lg:grid-cols-[1.1fr,1.7fr] rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            {/* LEFT PANEL */}
            <div
              className="text-white p-6 md:p-8"
              style={{ background: "#0f615dff" }}
            >
              <h2 className="text-xl md:text-2xl font-semibold mb-3">
                Get in touch
              </h2>
              <p className="text-sm text-teal-50/90">
                Visit our office or send us a message. We usually respond within
                24 hours.
              </p>

              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-teal-100/80 mb-1">
                    Address
                  </p>
                  <p className="text-teal-50">
                  Dno - 333- F2 - Geetha Building, Nehru St,
                    <br />
                    Peranaidu Layout,Ram Nagar,
                    <br />
                    Coimbatore, Tamil Nadu 641009
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-teal-100/80 mb-1">
                    Phone
                  </p>
                  <p className="text-teal-50">9789345333, 8903037883</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-teal-100/80 mb-1">
                    Email
                  </p>
                  <p className="text-teal-50">bncbalajicbe@gmail.com</p>
                </div>

                <div className="pt-3 mt-2 border-t border-teal-100/50">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-teal-100/80 mb-1">
                    Opening Hours
                  </p>
                  <p className="text-teal-50">
                    Mon – Sat: 9:00 AM – 8:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL – FORM */}
            <div className="bg-white p-6 md:px-8 md:py-8">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
                Send us a Message / Get Quote
              </h2>

              {/* ✅ submit handler */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Your Name"
                    placeholder="Enter your full name"
                    type="text"
                    value={form.name}
                    onChange={onChange("name")}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    type="tel"
                    value={form.phone}
                    onChange={onChange("phone")}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                  />

                  {/* ✅ if SelectInput supports value/onChange pass it */}
                  <SelectInput
                    label="Interested In"
                    value={form.interestedIn}
                    onChange={onChange("interestedIn")}
                  >
                    <option value="">Select a service…</option>
                    <option value="Desktop / Laptop Service">
                      Desktop / Laptop Service
                    </option>
                    <option value="Networking & WiFi Setup">
                      Networking & WiFi Setup
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
                  placeholder="Tell us briefly about your requirement…"
                  rows={4}
                  value={form.message}
                  onChange={onChange("message")}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(0,105,95,0.6)] transition hover:brightness-110 hover:shadow-[0_22px_50px_rgba(0,105,95,0.75)] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#0f615dff" }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.9999999999995!2d76.9644659!3d11.0152736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859d49963f847%3A0x644e0375a7175ba0!2sBharat%20National%20Computers%20-%20BNC!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bharat National Computers Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
