import { Sparkles } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";

interface MaterialsHeroProps {
  isVisible: boolean;
  counts: {
    videos: number;
    themes: number;
    plugins: number;
    snippets: number;
  };
}

export const MaterialsHero = ({ isVisible, counts }: MaterialsHeroProps) => {
  return (
    <section className="min-h-screen bg-background relative">
      {/* Background Layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03]" style={{ backgroundImage: 'url("/tutor-hero.jpg")', backgroundAttachment: 'fixed' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center pt-20 pb-16">
            {/* Badge */}
            <div className="mt-10 flex items-center justify-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 w-fit mx-auto mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Learning Resources</span>
            </div>
            
            <div className="space-y-8 mb-16">
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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-border/20 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">{counts.videos}</div>
                <div className="text-sm text-muted-foreground font-medium">Video Tutorials</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">{counts.themes}</div>
                <div className="text-sm text-muted-foreground font-medium">Themes & Templates</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">{counts.plugins}</div>
                <div className="text-sm text-muted-foreground font-medium">Plugin Guides</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">{counts.snippets}</div>
                <div className="text-sm text-muted-foreground font-medium">Code Snippets</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};