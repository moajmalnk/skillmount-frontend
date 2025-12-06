import { Link } from "react-router-dom";
import { Sparkles, Award, Code2, Palette, Database } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { WobbleCard } from "@/components/ui/wobble-card";

const CategoryCard = ({ to, gradient, icon: Icon, title, count, delay }: any) => (
  <Link to={to} className="group block" style={{ animationDelay: `${delay}ms` }}>
    <WobbleCard className="overflow-hidden border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 h-full hover:-translate-y-2 bg-card/40 backdrop-blur-sm">
      <div className={`aspect-[4/3] ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/15 rounded-3xl blur-3xl group-hover:scale-125 group-hover:opacity-80 transition-all duration-700"></div>
            <Icon className="w-20 h-20 text-white/95 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" strokeWidth={1.2} />
          </div>
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>
      <div className="p-8 bg-card/50 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{count}</p>
      </div>
    </WobbleCard>
  </Link>
);

export const CategorySection = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Student Categories</span>
            </div>
            <TextGenerateEffect words="Browse by Expertise" className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Explore student portfolios organized by specialization and skill set</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <CategoryCard to="/students?category=top-performers" gradient="bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500" icon={Award} title="Top Performers @ SkillMount" count="Elite Portfolio Showcase" delay={0} />
            <CategoryCard to="/students?category=wordpress" gradient="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" icon={Code2} title="WordPress Masters" count="Theme & Plugin Developers" delay={100} />
            <CategoryCard to="/students?category=ecommerce" gradient="bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400" icon={Palette} title="E-commerce Builders" count="WooCommerce & Shopify" delay={200} />
            <CategoryCard to="/students?category=optimization" gradient="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500" icon={Database} title="SEO & Performance" count="Speed & Optimization" delay={300} />
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};