import { Sparkles } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { WobbleCard } from "@/components/ui/wobble-card";
import { testimonials } from "@/lib/home-data";

export const TestimonialsSection = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-accent/[0.01]"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Testimonials</span>
            </div>
            <TextGenerateEffect words="Success Stories" className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Hear from students who transformed their careers with SkillMount</p>
          </div>
        
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <article key={index} className="animate-elegant-entrance" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <WobbleCard className="border border-border/30 rounded-3xl h-full hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm">
                  <div className="p-10 flex flex-col h-full">
                    <div className="mb-8 text-primary/15 group-hover:text-primary/25 transition-colors duration-500">
                      <svg className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <blockquote className="text-muted-foreground mb-8 text-lg leading-relaxed flex-grow font-light">"{testimonial.quote}"</blockquote>
                    <div className="border-t border-border/30 pt-8 mt-auto">
                      <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors duration-300">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground mt-2 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </WobbleCard>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};