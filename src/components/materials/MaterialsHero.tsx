import { Sparkles } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

interface MaterialsHeroProps {
  isVisible: boolean;
  counts: {
    videos: number;
    themes: number;
    plugins: number;
    snippets: number;
    templateKits: number;
    docs: number;
  };
}

const AnimatedCounter = ({ value, isVisible }: { value: number; isVisible: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    if (isVisible) {
      spring.set(value);
    }
  }, [isVisible, value, spring]);

  return <motion.span ref={ref} className="tabular-nums">{display}</motion.span>;
};

const StatsCard = ({ value, label, isVisible, delay }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay + 0.2 }}
      className="relative group p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-md hover:bg-primary/5 transition-all duration-500 overflow-hidden flex flex-col justify-center items-center text-center"
    >
      <div className="relative z-10 flex flex-col gap-2">
        <div>
          <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-foreground">
            <AnimatedCounter value={value} isVisible={isVisible} />
          </div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  );
};

export const MaterialsHero = ({ isVisible, counts }: MaterialsHeroProps) => {
  const stats = [
    { label: "Template Kits", value: counts.templateKits },
    { label: "Themes", value: counts.themes },
    { label: "Plugins", value: counts.plugins },
    { label: "Docs", value: counts.docs },
    { label: "Snippets", value: counts.snippets },
    { label: "Videos", value: counts.videos },
  ];

  return (
    <section className="min-h-[60vh] bg-background relative overflow-hidden flex items-center">
      {/* Background Layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03]" style={{ backgroundImage: 'url("/tutor-hero.jpg")', backgroundAttachment: 'fixed' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center pt-20 pb-8">
            {/* Badge */}
            <div className="mt-10 flex items-center justify-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 w-fit mx-auto mb-8 cursor-default hover:bg-primary/5 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Learning Resources</span>
            </div>

            <div className="space-y-8 mb-20">
              <TextGenerateEffect
                words="Learning Materials & Resources"
                className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-foreground tracking-tight max-w-6xl mx-auto"
                duration={2}
              />
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light">
                Access comprehensive WordPress, Elementor, and WooCommerce resources.
                Everything you need to build professional websites and launch your career.
              </p>
            </div>

            {/* Quick Stats - Cards Style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-7xl mx-auto">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  {...stat}
                  delay={index * 0.1}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};