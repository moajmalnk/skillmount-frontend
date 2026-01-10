import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/context/AuthContext";

// Route Guards
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollProgressBar from "./components/ScrollProgressBar";
import { ScrollToTop } from "@/components/ScrollToTop"; // <-- Import the new component
import { ChatWidget } from "@/components/chat/ChatWidget";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
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
import StudentTickets from "./pages/tickets/StudentTickets";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Hooks
import { useReferral } from "@/hooks/useReferral";

const queryClient = new QueryClient();

// 1. Inner Component (Inside Router context)
const AppContent = () => {
  // Activate global referral tracking logic
  useReferral();

  return (
    <>
      <ScrollToTop /> {/* <-- Activate ScrollToTop here */}
      <ScrollProgressBar />
      <div className="flex flex-col min-h-screen relative">
        <Navbar />
        <main className="flex-1 relative">
          <Routes>

            {/* === PUBLIC ROUTES (No Guard) === */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/skelui" element={<SkelUI />} />

            {/* Blog Routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* === PROTECTED ROUTES === */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/tickets/manage" element={<TicketInbox />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/affiliate/hub" element={<AffiliateHub />} />
              <Route path="/student/tickets" element={<StudentTickets />} />
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
        <ChatWidget />
      </div>
    </>
  );
};

// 2. Outer Component (Providers)
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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;