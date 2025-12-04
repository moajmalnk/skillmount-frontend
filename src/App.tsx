import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/context/AuthContext";

// Route Guards
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PublicRoute } from "@/components/layout/PublicRoute";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollProgressBar from "./components/ScrollProgressBar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import FAQ from "./pages/FAQ";
import Materials from "./pages/Materials";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import SkelUI from "./pages/SkelUI";
import NotFound from "./pages/NotFound";
import TicketInbox from "./pages/tickets/TicketInbox";
import AffiliateHub from "./pages/affiliate/AffiliateHub";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ScrollProgressBar />
            <div className="flex flex-col min-h-screen relative">
              <Navbar />
              <main className="flex-1 relative">
                <Routes>
                  
                  {/* === PUBLIC ROUTES (With Safety Trap) === */}
                  {/* Accessible by Guests AND Completed Users. 
                      Incomplete Users are redirected to Onboarding. */}
                  <Route element={<PublicRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentProfile />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/skelui" element={<SkelUI />} />
                  </Route>

                  {/* === PROTECTED ROUTES === */}
                  {/* Only for Logged In Users. 
                      Incomplete Users are forced to Onboarding. */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/tickets/manage" element={<TicketInbox />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/affiliate/hub" element={<AffiliateHub />} />
                  </Route>

                  {/* === REDIRECTS === */}
                  <Route path="/student/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/tutor/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/affiliate/dashboard" element={<Navigate to="/" replace />} />
                  
                  {/* === 404 === */}
                  <Route path="*" element={<NotFound />} />
                  
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;