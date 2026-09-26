import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      } catch {
        window.scrollTo(0, 0);
      }
    };

    scrollToTop();
  }, [location.pathname]);

  return null;
}
