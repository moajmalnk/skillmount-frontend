import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Users, Award, Sparkles, ExternalLink } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { stats } from "@/lib/home-data";

interface HeroSectionProps {
  isVisible: boolean;
}

export const HeroSection = ({ isVisible }: HeroSectionProps) => {
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
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh]">
            
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <div className="mt-10 flex items-center justify-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 w-fit mx-auto sm:mx-0">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground tracking-wide">No-Code Excellence</span>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <TextGenerateEffect words="Student Success @ SkillMount" className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-foreground tracking-tight max-w-4xl" duration={2} />
                  <div className="text-center">
                    <a href="https://moajmalnk.in" target="_blank" rel="noopener noreferrer" className="relative inline-block cursor-pointer hover:scale-105 transition-transform duration-500">
                      <span className="relative z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent text-2xl md:text-3xl font-semibold">Explore Our Journey</span>
                      <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/8 -rotate-1 rounded"></span>
                    </a>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                    Led by <a href="https://moajmalnk.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary transition-colors duration-300 cursor-pointer">Mohammed Ajmal NK</a>
                  </p>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Discover how 1000+ students transformed their careers through expert training in WordPress, No-Code platforms, and CMS development.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-8 py-8 border-t border-border/20">
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.totalStudents}</div><div className="text-sm text-muted-foreground font-medium">Students Trained</div></div>
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.batchesCompleted}</div><div className="text-sm text-muted-foreground font-medium">Batches Completed</div></div>
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.successRate}</div><div className="text-sm text-muted-foreground font-medium">Success Rate</div></div>
                <div className="space-y-2"><div className="text-4xl md:text-5xl font-bold text-primary">{stats.placementSuccess}</div><div className="text-sm text-muted-foreground font-medium">Placement Success</div></div>
              </div>

              {/* Buttons */}
              <div className="mb-8 sm:mb-12 md:mb-16 flex flex-row gap-2 sm:gap-4 justify-center">
                <Link to="/contact">
                  <Button size="sm" className="rounded-full px-4 sm:px-10 h-10 sm:h-14 text-xs sm:text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Get Started</span><span className="sm:hidden">Start</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/students">
                  <Button size="sm" variant="outline" className="rounded-full px-4 sm:px-10 h-10 sm:h-14 text-xs sm:text-base font-semibold border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:text-primary" /><span className="hidden sm:inline">View Portfolios</span><span className="sm:hidden">View</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:scale-110 group-hover:text-primary transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative">
              <ProfessionalBackground src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp" alt="Hero" className="w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] rounded-2xl shadow-2xl bg-gradient-to-br from-card to-card/50" overlay={true} parallax={false} responsive={true}>
                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
                  <div className="text-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 shadow-xl border border-white/30">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 tracking-wide">Live & Interactive</span>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-500">
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Ready to Transform?</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">Join 1000+ successful students</p>
                      <Link to="/contact">
                        <Button size="sm" className="w-full sm:w-auto rounded-full px-6 sm:px-8 h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl">Start Your Journey</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </ProfessionalBackground>
              <div className="absolute -bottom-3 sm:-bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <a href="https://moajmalnk.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"><div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div></div>
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-xs sm:text-sm md:text-base font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 truncate">Mohammed Ajmal NK</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">Lead Instructor @ SkillMount</div>
                    <div className="text-xs sm:text-sm text-green-600 font-medium">● Available Now</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};