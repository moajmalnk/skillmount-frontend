import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Code2, Award, ArrowRight } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { WobbleCard } from "@/components/ui/wobble-card";

export const MaterialsPreviewSection = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Resources</span>
            </div>
            <TextGenerateEffect words="Learning Resources" className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Access our comprehensive library of curated learning materials</p>
          </div>
        
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {[
              { icon: BookOpen, title: "Video Tutorials", desc: "WordPress, Elementor, and No-Code platform tutorials", delay: 0 },
              { icon: Code2, title: "Theme & Plugin Files", desc: "Ready-to-use WordPress themes and essential plugins", delay: 100 },
              { icon: Award, title: "Resource Library", desc: "E-books, cheat sheets, and design assets", delay: 200 }
            ].map((item, index) => (
              <article key={index} className="animate-elegant-entrance" style={{ animationDelay: `${item.delay}ms`, animationFillMode: 'both' }}>
                <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 transition-all duration-700 h-full group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 bg-card/30 backdrop-blur-sm">
                  <div className="p-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary/8 to-primary/4 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/5">
                      <item.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.2} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">{item.desc}</p>
                  </div>
                </WobbleCard>
              </article>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/materials">
              <Button size="lg" className="rounded-full px-12 h-16 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-105 group">
                Browse All Materials 
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};