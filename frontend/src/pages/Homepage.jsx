// src/pages/Homepage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageOpen, ArrowRight } from "lucide-react";
import HeroSection from "../components/HeroSection";
import HomeCategoryStrip from "../components/HomeCategoryStrip";
import CategorySlider from "../components/Categoriesslider";
import ProductGrid from "../components/ProductGrid";
import FeatureSection from "../components/FeatureSection";
import HomeServicesStrip from "../components/HomeservicesStrip";
import { getLimitedProducts } from "../api/Product";
import IndustryExpertise from "../components/IndustryExpertise";
import ClientReviews from "../components/ClientReview";
import ServerBrands from "../components/ServerBrands";

/**
 * Home page.
 *
 * Section order follows a standard electronics storefront: banner, trust
 * strip, quick category rail, full categories, best sellers, then the
 * supporting service / brand / review sections the site already had.
 *
 * Notifications are handled by the single global <AppToaster /> mounted in
 * App.jsx - this page deliberately does not mount a ToastContainer.
 */
const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await getLimitedProducts(); // ⬅️ changed here
        const list = res?.data ?? res ?? [];
        setProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div>
      {/* Banner + trust strip */}
      <HeroSection />

      {/* Quick shopping categories */}
      <HomeCategoryStrip />

      {/* Popular categories */}
      <CategorySlider />

      {/* Best sellers */}
      {loading ? (
        <section className="py-8 md:py-12">
          <div className="section-shell">
            <div className="mb-5 md:mb-7" data-aos="fade-up">
              <span className="eyebrow">Business technology portfolio</span>
              <h2 className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[30px] lg:text-[34px]">
                Featured Technology Solutions
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 md:text-[15px]">
                BNC provides professional technology hardware and infrastructure products for businesses and organizations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-ink-200 bg-white p-3"
                >
                  <div className="skeleton aspect-square w-full" />
                  <div className="skeleton mt-4 h-3 w-2/5" />
                  <div className="skeleton mt-2 h-4 w-4/5" />
                  <div className="skeleton mt-4 h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : products.length === 0 ? (
        /* The catalogue is genuinely empty rather than still loading. Show a
           real empty state instead of a heading above a blank grid. */
        <section className="py-8 md:py-12">
          <div className="section-shell">
            <div className="mb-5 md:mb-7" data-aos="fade-up">
              <span className="eyebrow">Business technology portfolio</span>
              <h2 className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.03em] text-ink-900 md:text-[30px] lg:text-[34px]">
                Featured Technology Solutions
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 md:text-[15px]">
                BNC provides professional technology hardware and infrastructure products for businesses and organizations.
              </p>
            </div>
            <div className="state-panel" data-aos="fade-up">
              <span className="icon-chip-lg mx-auto">
                <PackageOpen className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">
                No products published yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
                Our catalogue is being updated. In the meantime, tell us what
                you need and we will source it for you.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact" className="btn-primary btn-md">
                  Contact Us
                  <ArrowRight size={16} />
                </Link>
                <Link to="/services" className="btn-secondary btn-md">
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <ProductGrid
          products={products}
          title="Featured Technology Solutions"
          eyebrow="Business technology portfolio"
          supportingText="BNC provides professional technology hardware and infrastructure products for businesses and organizations."
          showViewAll
          sectionClassName="!pt-7 md:!pt-10"
        />
      )}

      {/* Supporting sections */}
      <IndustryExpertise />
      <HomeServicesStrip />
      <ServerBrands />
      <FeatureSection />
      <ClientReviews />
    </div>
  );
};

export default Homepage;
