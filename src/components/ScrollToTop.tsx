import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // When the route path changes, scroll the window to the top-left (0,0)
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency on pathname ensures this runs on every route change

  return null;
};