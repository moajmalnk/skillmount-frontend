import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, ArrowRight, MessageSquare } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { stats } from "@/lib/home-data";

export const CTASection = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(var(--primary) / 0.02) 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 text-center max-w-6xl relative">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 rounded-full px-6 py-3 mb-12">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide">Get Started Today</span>
          </div>
          
          <TextGenerateEffect words="Ready to transform digital future?" className="text-6xl md:text-8xl lg:text-9xl font-bold mb-12 text-foreground leading-[0.9] tracking-tight" duration={2} />
        
          <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground mb-24 max-w-4xl mx-auto leading-relaxed font-light">
            Join {stats.totalStudents} students who have launched successful careers in No-Code and CMS development
          </p>
        
          <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center mb-16">
            <Link to="/contact">
              <Button size="sm" className="rounded-full px-4 sm:px-10 h-10 sm:h-14 text-xs sm:text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Contact Us</span><span className="sm:hidden">Contact</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="sm" variant="outline" className="rounded-full px-4 sm:px-10 h-10 sm:h-14 text-xs sm:text-base font-semibold border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:text-primary" /><span className="hidden sm:inline">Raise a Ticket</span><span className="sm:hidden">Ticket</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
          
          <div>
            <Link to="/students">
              <Button variant="ghost" size="lg" className="rounded-full px-10 h-14 text-base hover:bg-primary/5 transition-all duration-300 group">
                Browse Student Portfolios
                <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};