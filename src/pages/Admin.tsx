import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, LogOut, GraduationCap, Users, Share2,
  FileText, MessageSquare, Ticket, Star, BookOpen,
  Settings, Newspaper
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 1. Import Auth Context
import { useAuth } from "@/context/AuthContext";

// 2. Import Components
import { DashboardStats } from "@/components/admin/DashboardStats";
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
import { ChangePasswordDialog } from "@/components/common/ChangePasswordDialog";

const Admin = () => {
  // 3. Use Global Auth State
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // 4. Protect the Route
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
    }
    /* 
    else if (user?.role !== "super_admin") {
      toast.error("Access Denied: Super Admin privileges required.");
      navigate("/");
    } 
    */
  }, [isAuthenticated, isLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      console.log("Admin Page User State:", user);
      console.log("Role Check:", user.role === 'super_admin');
    }
  }, [user]);

  // Handle Tab State via URL Params
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabConfig.some(t => t.value === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      // Default to stats if no param
      setActiveTab("stats");
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutDialogOpen(false);
    navigate('/login');
    toast.info("Logged out successfully");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p>Debug Information:</p>
        <pre className="bg-gray-100 p-4 rounded text-xs text-black">
          {JSON.stringify(user, null, 2)}
        </pre>
        <p className="text-muted-foreground">Required Role: super_admin</p>
        <Button onClick={() => logout()}>Logout</Button>
        <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
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
    { value: "tickets", icon: Ticket, label: "Tickets", component: <TicketManager /> },
    { value: "feedbacks", icon: Star, label: "Feedbacks", component: <FeedbackManager /> },
    { value: "faqs", icon: BookOpen, label: "FAQs", component: <FAQManager /> },
    { value: "blog", icon: Newspaper, label: "Blog", component: <BlogManager /> },
    { value: "settings", icon: Settings, label: "Settings", component: <SettingsManager /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">Admin Dashboard</h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">User & Content Management Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-sm text-right hidden md:block">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">Super Admin</div>
              </div>

              <div className="hidden sm:flex gap-2">
                <ChangePasswordDialog />
                <Button variant="outline" onClick={() => setIsLogoutDialogOpen(true)}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="text-muted-foreground sm:hidden" onClick={() => setIsLogoutDialogOpen(true)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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


          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="modal-layout-standard modal-sm">
          <AlertDialogHeader className="modal-header-standard">
            <AlertDialogTitle className="flex items-center gap-3 text-destructive text-xl font-bold">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <LogOut className="w-5 h-5" />
              </div>
              End Session?
            </AlertDialogTitle>
            <div className="modal-body-standard !p-0 mt-4">
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Are you sure you want to log out? You will need to sign in again to access the administrative panel.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="modal-footer-standard px-6 py-4 bg-muted/5">
            <AlertDialogCancel className="font-medium">Stay Logged In</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-8 shadow-lg shadow-destructive/20">
              Logout Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;