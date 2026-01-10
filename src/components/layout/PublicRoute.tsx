import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const PublicRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  // SAFETY TRAP: 
  // Normally, if a user is logged in but has an incomplete profile, 
  // we force them to Onboarding so they can't browse the landing page.

  // FIX: We added (user.role !== 'super_admin') condition here.
  // Now, if it's an Admin, we ignore the profile status and let them pass.
  if (
    isAuthenticated &&
    user &&
    user.role !== 'super_admin' &&
    !user.isProfileComplete
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};