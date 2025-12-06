import { Award } from "lucide-react";
import { WobbleCard } from "../../components/ui/wobble-card";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "../../components/ui/container-scroll-animation";

interface ProfileAchievementsProps {
  achievements?: string[];
}

export const ProfileAchievements = ({ achievements }: ProfileAchievementsProps) => {
  // HIDE IF EMPTY
  if (!achievements || achievements.length === 0) return null;

  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="mb-16 sm:mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-500/15 rounded-full px-5 py-2 mb-6">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-600 tracking-wide">Achievements</span>
          </div>
          <TextGenerateEffect 
            words="Recognition & Awards" 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[0.95]"
            duration={1.5}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {achievements.map((achievement, idx) => (
            <div 
              key={idx}
              className="animate-elegant-entrance"
              style={{ 
                animationDelay: `${idx * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <WobbleCard className="border border-border/30 rounded-3xl hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-700 bg-card/30 backdrop-blur-sm p-6 sm:p-8 group hover:-translate-y-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500/8 to-amber-500/4 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                      {achievement}
                    </p>
                  </div>
                </div>
              </WobbleCard>
            </div>
          ))}
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};