import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const PublicRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  // SAFETY TRAP: 
  // If user is logged in BUT has an incomplete profile, 
  // they are NOT allowed to browse public pages (Home, Students, etc).
  // They must go to Onboarding first.
  if (isAuthenticated && user && !user.isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};