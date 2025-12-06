import { Code2, Palette, Database, TrendingUp, Globe, Heart, Target } from "lucide-react";
import { WobbleCard } from "../../components/ui/wobble-card";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "../../components/ui/container-scroll-animation";

interface ProfileSkillsProps {
  skills?: string[];
}

export const ProfileSkills = ({ skills }: ProfileSkillsProps) => {
  // HIDE IF EMPTY
  if (!skills || skills.length === 0) return null;

  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="mb-16 sm:mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-6">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground tracking-wide">Technical Skills</span>
          </div>
          <TextGenerateEffect 
            words="Skills & Expertise" 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[0.95]"
            duration={1.5}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {skills.map((skill, idx) => (
            <div 
              key={idx}
              className="animate-elegant-entrance"
              style={{ 
                animationDelay: `${idx * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <WobbleCard className="border border-border/30 rounded-2xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 bg-card/30 backdrop-blur-sm p-4 text-center group hover:-translate-y-2">
                <div className="space-y-3">
                  <div className="w-8 h-8 mx-auto bg-gradient-to-br from-primary/8 to-primary/4 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {skill.includes('WordPress') && <Code2 className="w-4 h-4 text-primary" />}
                    {skill.includes('Elementor') && <Palette className="w-4 h-4 text-primary" />}
                    {skill.includes('WooCommerce') && <Database className="w-4 h-4 text-primary" />}
                    {skill.includes('SEO') && <TrendingUp className="w-4 h-4 text-primary" />}
                    {skill.includes('E-commerce') && <Globe className="w-4 h-4 text-primary" />}
                    {skill.includes('Accessibility') && <Heart className="w-4 h-4 text-primary" />}
                    {skill.includes('Security') && <Target className="w-4 h-4 text-primary" />}
                    {!skill.match(/WordPress|Elementor|WooCommerce|SEO|E-commerce|Accessibility|Security/) && <Code2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                    {skill}
                  </p>
                </div>
              </WobbleCard>
            </div>
          ))}
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};