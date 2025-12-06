import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react"; // Added Loader2
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { WobbleCard } from "@/components/ui/wobble-card";

interface BatchesSummarySectionProps {
  totalStudents: number;
  totalBatches: number;
  latestBatch: string;
  oldestBatch: string;
  isLoading?: boolean; // New optional prop
}

export const BatchesSummarySection = ({ 
  totalStudents, 
  totalBatches,
  latestBatch,
  oldestBatch,
  isLoading = false
}: BatchesSummarySectionProps) => {
  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.01] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-6xl relative">
          <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700">
            <div className="p-6 sm:p-8 md:p-12 lg:p-16 text-center">
              <div className="inline-flex items-center gap-3 bg-primary/8 border border-primary/15 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 md:mb-12">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary tracking-wide">Our Journey</span>
              </div>
              
              <div className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight leading-[0.9]">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-4 py-2">
                    <Loader2 className="w-12 h-12 animate-spin text-primary/50" />
                  </div>
                ) : (
                  <>
                    <TextGenerateEffect words={`${totalBatches} Monthly`} className="block" duration={2} />
                    <TextGenerateEffect words="Batches" className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent" duration={2} />
                  </>
                )}
              </div>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 md:mb-12 font-light px-4 sm:px-0">
                {isLoading ? (
                   "Loading batch details..."
                ) : (
                   `From ${oldestBatch} to ${latestBatch}, we've nurtured over ${totalStudents} students across diverse specializations in WordPress, No-Code tools, and CMS platforms.`
                )}
              </p>

              <Link to="/students">
                <Button size="sm" className="rounded-full px-6 sm:px-8 md:px-12 h-10 sm:h-12 md:h-16 text-xs sm:text-sm md:text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 group">
                  <span className="hidden sm:inline">Explore All Batches</span><span className="sm:hidden">Explore Batches</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </WobbleCard>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};