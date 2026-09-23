import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Homepage from "./pages/Homepage";
import ProductDetailsPage from "./components/ProductDetailsPage";
import CategoryProductsPage from "./pages/CategoryProductPage";
import ServicesPage from "./pages/ServicesPage";
import ProductsPage from "./pages/ProductPage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import ScrollToTopButton from "./components/ScrollButton";
import AboutPage from "./pages/AboutPage";
import ContactSection from "./pages/ContactPage";
import AppToaster from "./components/AppToaster";
import "react-toastify/dist/ReactToastify.css";
import CartDrawer from "./components/CartDrawer";
import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * AOS measures element offsets when it initialises. A route change swaps the
 * whole page without firing a resize, so positions are recalculated here -
 * otherwise elements on a newly mounted page can stay at opacity 0.
 */
function AosRouteRefresh() {
  const location = useLocation();

  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  return null;
}

/**
 * Re-keys its subtree on every navigation so the `.page-enter` CSS animation
 * replays. Lives inside <Router> because it reads the current location, and
 * adds no routing-transition dependency.
 */
function RoutedMain({ children }) {
  const location = useLocation();

  return (
    <main key={location.pathname} className="flex-1 page-enter">
      {children}
    </main>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener("cart:open", open);
    return () => window.removeEventListener("cart:open", open);
  }, []);

  // Initialised once for the whole app. The stylesheet applies [data-aos]
  // rules globally, so initialisation has to be global too - otherwise any
  // animated element outside the initialising page would never be revealed.
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
      offset: 80,
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });

    const handleRefresh = () => AOS.refresh();
    window.addEventListener("resize", handleRefresh);

    return () => window.removeEventListener("resize", handleRefresh);
  }, []);

  return (
    <>
      <AppToaster />
      <Router>
        <AosRouteRefresh />
        <div className="min-h-screen">

          <Header />
          <RoutedMain>
            <Routes>
              <Route path="/"element={<Homepage />} />
              <Route path="/product/:id"element={<ProductDetailsPage />} />
              <Route
                path="/category/:categoryId/products"
                element={<CategoryProductsPage />}
              />
              <Route path="/services"element={<ServicesPage />} />
              <Route path="/about"element={<AboutPage />} />
              <Route path="/products"element={<ProductsPage />} />
              <Route path="/contact"element={<ContactSection />} />
              <Route path="/cart"element={<CartPage />} />
              <Route path="/checkout"element={<CheckoutPage />} />
              <Route path="/login"element={<LoginPage />} />
              <Route path="/signup"element={<SignupPage />} />
              <Route path="/orders"element={<MyOrdersPage />} />
              <Route path="/orders/:id"element={<OrderDetailsPage />} />
              <Route path="*"element={<NotFoundPage />} />
            </Routes>
          </RoutedMain>
          <Footer />
        </div>

        <ScrollToTopButton />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </Router>
    </>
  );
}

export default App;
