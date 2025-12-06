import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, LogOut, GraduationCap, Users, Share2, 
  FileText, MessageSquare, Ticket, Star, BookOpen, 
  Settings,
  Newspaper
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// 1. Import Auth Context
import { useAuth } from "@/context/AuthContext";

// 2. Import Components
// Note: Ensure these paths match your folder structure (user vs users)
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ManagementTable } from "@/components/admin/ManagementTable";

import { MaterialsManager } from "@/components/admin/content/MaterialsManager";
import { StudentManager } from "@/components/admin/user/StudentManager";
import { TutorManager } from "@/components/admin/user/TutorManager";
import { AffiliateManager } from "@/components/admin/user/AffiliateManager";
import { SettingsManager } from "@/components/admin/settings/SettingsManager";
import { TicketManager } from "@/components/admin/tickets/TicketManager";
import { FAQManager } from "@/components/admin/FAQManager";
import { InquiryManager } from "@/components/admin/InquiryManager";
import { FeedbackManager } from "@/components/admin/FeedbackManager";
import { BlogManager } from "@/components/admin/blog/BlogManager";

const Admin = () => {
  // 3. Use Global Auth State
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // 4. Protect the Route
  useEffect(() => {
    // Wait for auth check to finish
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not logged in -> Go to Login Page
      navigate("/login");
    } else if (user?.role !== "super_admin") {
      // Logged in but not Admin -> Kick out
      toast.error("Access Denied: Super Admin privileges required.");
      navigate("/");
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info("Logged out successfully");
  };

  // 5. Loading State (Prevents flashing the dashboard before redirect)
  if (isLoading || !isAuthenticated || user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // Define tab configuration
  const tabConfig = [
    { value: "stats", icon: LayoutDashboard, label: "Statistics", component: <DashboardStats /> },
    { value: "students", icon: GraduationCap, label: "Students", component: <StudentManager /> },
    { value: "tutors", icon: Users, label: "Tutors", component: <TutorManager /> },
    { value: "affiliates", icon: Share2, label: "Affiliates", component: <AffiliateManager /> },
    { value: "materials", icon: FileText, label: "Materials", component: <MaterialsManager /> },
    { value: "inquiries", icon: MessageSquare, label: "Inquiries", component: <InquiryManager /> },
    {  value: "tickets", icon: Ticket, label: "Tickets", component: <TicketManager />  },
    { value: "feedbacks", icon: Star, label: "Feedbacks", component: <FeedbackManager /> },
    { value: "faqs", icon: BookOpen, label: "FAQs", component: <FAQManager /> },
    { value: "blog", icon: Newspaper, label: "Blog", component: <BlogManager /> },
    { value: "settings", icon: Settings, label: "Settings", component: <SettingsManager />  },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">User & Content Management Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-right hidden md:block">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">Super Admin</div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stats" className="space-y-6">
          {/* Dynamic Scrollable Tab List */}
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex h-auto w-auto gap-2 bg-transparent p-0 justify-start">
              {tabConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border px-4 py-2"
                >
                  <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Render Tab Content */}
          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;