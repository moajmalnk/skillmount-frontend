import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, ArrowRight } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { faqs } from "@/lib/home-data";

export const FAQSection = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.008]" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, currentColor 25%, currentColor 50%, transparent 50%, transparent 75%, currentColor 75%)', backgroundSize: '30px 30px' }}></div>
        
        <div className="container mx-auto px-6 max-w-4xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">FAQ</span>
            </div>
            <div className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight leading-tight">
              <TextGenerateEffect words="Frequently Asked" className="block" duration={1.5} />
              <TextGenerateEffect words="Questions" className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent" duration={1.5} />
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Everything you need to know about our program and services</p>
          </div>
        
          <Accordion type="single" collapsible className="mb-20 space-y-6">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-border/30 rounded-3xl px-8 md:px-10 bg-card/30 backdrop-blur-sm hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group">
                <AccordionTrigger className="text-left hover:no-underline py-8 md:py-10 [&[data-state=open]]:text-primary transition-colors duration-300">
                  <span className="text-lg md:text-xl font-bold pr-4 group-hover:text-primary transition-colors duration-300">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-8 md:pb-10 text-base md:text-lg leading-relaxed font-light">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center">
            <Link to="/faq">
              <Button variant="outline" size="lg" className="rounded-full px-12 h-14 border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-primary/10 text-base font-semibold">
                View All FAQs <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};