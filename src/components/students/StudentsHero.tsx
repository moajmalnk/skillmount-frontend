import { Sparkles, Users } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { WobbleCard } from "@/components/ui/wobble-card";
import { stats } from "@/lib/home-data";

interface StudentsHeroProps {
  isVisible: boolean;
  filteredCount: number;
}

export const StudentsHero = ({ isVisible, filteredCount }: StudentsHeroProps) => {
  return (
    <section className="py-10 md:py-12 bg-background relative">
      {/* Background Layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.02]" style={{ backgroundImage: 'url("/tutor-hero.jpg")', backgroundAttachment: 'fixed' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>
        <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="mt-4 md:mt-6 flex items-center justify-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 w-fit mx-auto sm:mx-0">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground tracking-wide">Student Directory</span>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <TextGenerateEffect 
                    words="Student Directory" 
                    className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-foreground tracking-tight max-w-4xl"
                    duration={2}
                  />
                  <div className="text-center">
                    <a href="https://moajmalnk.in" target="_blank" rel="noopener noreferrer" className="relative inline-block cursor-pointer hover:scale-105 transition-transform duration-500">
                      <span className="relative z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent text-2xl md:text-3xl font-semibold">Explore Portfolios</span>
                      <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/8 -rotate-1 rounded"></span>
                    </a>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                    Browse <span className="font-semibold text-foreground">{stats.totalStudents}</span> talented students.
                  </p>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Discover exceptional portfolios from students trained in WordPress, No-Code platforms, and CMS development by Mohammed Ajmal NK.
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 py-6 border-t border-border/20">
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.totalStudents}</div><div className="text-sm text-muted-foreground font-medium">Total Students</div></div>
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.batchesCompleted}</div><div className="text-sm text-muted-foreground font-medium">Batches Completed</div></div>
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.successRate}</div><div className="text-sm text-muted-foreground font-medium">Success Rate</div></div>
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{filteredCount}</div><div className="text-sm text-muted-foreground font-medium">Filtered Results</div></div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-8">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/10">
                        <Users className="w-16 h-16 text-primary" strokeWidth={1.2} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-foreground">Filter & Explore</h3>
                        <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                          Use our advanced filters to find students by batch, skills, and expertise areas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </WobbleCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};