import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, TrendingUp, Users, DollarSign, ExternalLink, Share2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import ProfessionalBackground from "@/components/ProfessionalBackground";

export default function AffiliateHub() {
  const { user } = useAuth();
  
  // Mock Data (Ideally comes from user object or API)
  const couponCode = "SKILL20"; // This would be dynamic: user?.couponCode
  const referralLink = `https://skillmount.com/?ref=${couponCode}`;
  
  const stats = [
    { label: "Total Earnings", value: "$1,250", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Referrals", value: "42", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Conversion Rate", value: "12.5%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} Copied!`, {
      description: "Ready to share with your audience.",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <ProfessionalBackground
          src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp" 
          alt="Background"
          className="w-full h-full opacity-[0.02]"
          overlay={true}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Partner Program</span>
          </div>
          <TextGenerateEffect 
            words={`Welcome, ${user?.name}`} 
            className="text-4xl md:text-5xl font-bold mb-4"
          />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your referrals, track your earnings, and access your unique promotional tools.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Quick Stats */}
          <div className="lg:col-span-2 space-y-8">
            <ContainerScrollAnimation direction="up" speed="fast">
              <div className="grid sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ContainerScrollAnimation>

            {/* Referral Tools Card */}
            <ContainerScrollAnimation direction="up" speed="normal">
              <WobbleCard containerClassName="w-full" className="bg-primary text-primary-foreground">
                <div className="p-2">
                  <h3 className="text-2xl font-bold mb-2">Your Power Tools</h3>
                  <p className="text-primary-foreground/80 mb-8 max-w-lg">
                    Share your unique code. When students use it, they get 10% off and you earn 15% commission.
                  </p>

                  <div className="grid gap-6">
                    {/* Coupon Code Section */}
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
                      <div className="text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">Your Coupon Code</div>
                      <div className="flex items-center gap-4 justify-between">
                        <div className="font-mono text-3xl font-bold tracking-widest">{couponCode}</div>
                        <Button variant="secondary" onClick={() => copyToClipboard(couponCode, "Coupon")}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                      </div>
                    </div>

                    {/* Referral Link Section */}
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
                      <div className="text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">Direct Referral Link</div>
                      <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                        <div className="flex-1 truncate text-sm font-mono text-white/90 px-2">
                          {referralLink}
                        </div>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => copyToClipboard(referralLink, "Link")}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </WobbleCard>
            </ContainerScrollAnimation>
          </div>

          {/* Right: Recent Activity / Payout */}
          <div className="lg:col-span-1 space-y-8">
            <ContainerScrollAnimation direction="up" speed="slow">
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest signups using your code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            S{i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium">New Student Signup</div>
                            <div className="text-xs text-muted-foreground">2 hours ago</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-green-500">+$25.00</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" /> View Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ContainerScrollAnimation>
          </div>

        </div>
      </div>
    </div>
  );
}