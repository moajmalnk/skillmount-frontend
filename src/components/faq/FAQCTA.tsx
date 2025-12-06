import { Link } from "react-router-dom";
import { Sparkles, Mail, ArrowRight, MessageSquare, Users } from "lucide-react";
import { ContainerScrollAnimation } from "../ui/container-scroll-animation";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import { Button } from "../ui/button";


export const FAQCTA = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(var(--primary) / 0.02) 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 text-center max-w-6xl relative">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 rounded-full px-6 py-3 mb-12">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide">Need More Help?</span>
          </div>
          
          <TextGenerateEffect words="Still have questions?" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12 text-foreground leading-[0.9] tracking-tight" duration={2} />
        
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Can't find what you're looking for? Our expert team is here to help you succeed!
          </p>
        
          <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center mb-16">
            <Link to="/contact">
              <Button size="sm" className="rounded-full px-4 sm:px-10 h-10 sm:h-14 text-xs sm:text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Contact Support</span><span className="sm:hidden">Contact</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="sm" variant="outline" className="rounded-full px-4 sm:px-10 h-10 sm:h-14 text-xs sm:text-base font-semibold border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:text-primary" /><span className="hidden sm:inline">Live Chat</span><span className="sm:hidden">Chat</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:scale-110 group-hover:text-primary transition-transform duration-300" />
              </Button>
            </Link>
          </div>
          
          <div>
            <Link to="/students">
              <Button variant="ghost" size="lg" className="rounded-full px-10 h-14 text-base hover:bg-primary/5 transition-all duration-300 group">
                Browse Student Success Stories
                <Users className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};