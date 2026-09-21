import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { RotateCcw, Truck, Headphones, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: <RotateCcw size={32} />,
    title: "14-Day Returns",
    desc: "Risk-free shopping with easy returns.",
  },
  {
    icon: <Truck size={32} />,
    title: "Free Shipping",
    desc: "No extra costs, just the price you see.",
  },
  {
    icon: <Headphones size={32} />,
    title: "24/7 Support",
    desc: "24/7 support, always here just for you.",
  },
  {
    icon: <BadgeCheck size={32} />,
    title: "Member Discounts",
    desc: "Special prices for our loyal customers.",
  },
];

export default function FeatureSection() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: false, 
      mirror: true, 
    });

    // Refresh AOS on resize or scroll for safety
    const handleRefresh = () => AOS.refresh();
    window.addEventListener("resize", handleRefresh);

    return () => {
      window.removeEventListener("resize", handleRefresh);
    };
  }, []);

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 150}
              className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-4 text-gray-700">
                {item.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
