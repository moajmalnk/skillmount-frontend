import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Clock, Ticket, Star, Calendar, 
  ArrowRight, Video, FileText, CheckCircle2 
} from "lucide-react";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Link } from "react-router-dom";
import ProfessionalBackground from "@/components/ProfessionalBackground";

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* 1. Welcome Header */}
      <section className="relative rounded-3xl overflow-hidden h-[250px] shadow-2xl">
        <ProfessionalBackground
          src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp"
          alt="Dashboard Header"
          className="w-full h-full"
          overlay={true}
        >
          <div className="absolute inset-0 flex items-center px-10">
            <div className="text-white space-y-2">
              <Badge className="bg-primary/20 hover:bg-primary/30 text-white border-none backdrop-blur-md mb-2">
                Student Portal
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">Welcome back, {user?.name}</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Continue your learning journey. You have <span className="text-green-400 font-bold">2 pending tasks</span> and <span className="text-yellow-400 font-bold">1 active ticket</span>.
              </p>
            </div>
          </div>
        </ProfessionalBackground>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 2. Left Column: Main Stats & Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Current Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Sept 2025</div>
                <div className="text-xs text-muted-foreground">Week 4 of 12</div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-500/5 border-orange-500/10 hover:border-orange-500/30 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-500" /> Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">Dr. Alan Grant</div>
                <div className="text-xs text-muted-foreground">Next Review: Friday</div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-500" /> Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1 Open</div>
                <div className="text-xs text-muted-foreground">Ticket #4821</div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning - Wobble Card */}
          <Link to="/materials">
            <WobbleCard className="bg-card border border-border/50 shadow-lg cursor-pointer">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Continue Learning</h3>
                      <p className="text-sm text-muted-foreground">Resume where you left off</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="rounded-full">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium">Elementor Pro Masterclass</div>
                        <div className="text-xs text-muted-foreground">Module 3 • 45 mins left</div>
                      </div>
                    </div>
                    <Button size="sm">Resume</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">WooCommerce Setup Guide</div>
                        <div className="text-xs text-muted-foreground">Reading • 10 mins left</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Read</Button>
                  </div>
                </div>
              </div>
            </WobbleCard>
          </Link>
          <Link to="/student/tickets"> 
            <Card className="bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-500" /> Support
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">1 Open</div>
                <div className="text-xs text-muted-foreground">View Tickets</div>
                </CardContent>
            </Card>
        </Link>
        </div>

        {/* 3. Right Column: Quick Actions & Status */}
        <div className="space-y-8">
          
          {/* Action Center */}
          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/contact">
                <Button variant="outline" className="w-full justify-start h-12 text-left group">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <Ticket className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="font-medium">Raise a Ticket</div>
                    <div className="text-[10px] text-muted-foreground">Report an issue</div>
                  </div>
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="outline" className="w-full justify-start h-12 text-left group">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium">Submit Feedback</div>
                    <div className="text-[10px] text-muted-foreground">Rate your class</div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile Completion Status (If we want to show it's done) */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-green-700 dark:text-green-400">Profile Complete</div>
                  <div className="text-xs text-green-600/80 dark:text-green-500/80">You are all set!</div>
                </div>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-900/50 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-full" />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};