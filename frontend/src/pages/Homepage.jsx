// src/pages/Homepage.jsx
import React, { useState, useEffect } from "react";
import HomepageSlider from "../components/HomePageSlider";
import CategorySlider from "../components/Categoriesslider";
import ProductGrid from "../components/ProductGrid";
import FeatureSection from "../components/FeatureSection";
import HomeServicesStrip from "../components/HomeservicesStrip";
import { getLimitedProducts } from "../api/Product";
import IndustryExpertise from "../components/IndustryExpertise";
import ClientReviews from "../components/ClientReview";
import ServerBrands from "../components/ServerBrands";


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
      <HomepageSlider />
      <CategorySlider />
      <IndustryExpertise />
      <HomeServicesStrip />
     

      {loading ? (
        <div className="py-12 bg-gray-50 text-center text-sm text-gray-500">
          Loading products...
        </div>
      ) : (
        <ProductGrid products={products} showViewAll />
      )}

      <ServerBrands/>

      <FeatureSection />
      <ClientReviews />
    </div>
  );
};

export default Homepage;
