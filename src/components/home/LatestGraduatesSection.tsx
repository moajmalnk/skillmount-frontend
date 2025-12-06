import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2 } from "lucide-react";
import StudentCard from "@/components/StudentCard";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { Student } from "@/types/user";
import { formatBatchForDisplay } from "@/lib/batches";

interface LatestGraduatesSectionProps {
  students: Student[];
  isLoading?: boolean;
}

export const LatestGraduatesSection = ({ students, isLoading }: LatestGraduatesSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const displayStudents = students.map(s => ({
    ...s,
    id: s.id,
    batch: formatBatchForDisplay(s.batch, false),
    domain: s.socials?.website,
    github: s.socials?.github
  }));

  const visibleStudents = showAll ? displayStudents : displayStudents.slice(0, 8);

  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary/8 to-primary/5 border border-primary/15 rounded-full px-5 py-2 mb-8">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-primary tracking-wide">Fresh Graduates</span>
            </div>
            <TextGenerateEffect words="Latest Graduates" className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Meet our newest batch of talented students ready to make their mark in the digital world</p>
          </div>
        
          {isLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : displayStudents.length > 0 ? (
            // Added items-stretch
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 items-stretch">
              {visibleStudents.map((student, index) => (
                <div 
                    key={student.id} 
                    className="animate-elegant-entrance h-full" // Added h-full
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                >
                  {/* @ts-ignore */}
                  <StudentCard {...student} id={student.id as any} />
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
               No graduates to show yet.
             </div>
          )}
          
          {!showAll && displayStudents.length > 8 && (
            <div className="text-center">
              <Button size="lg" variant="outline" className="rounded-full px-12 h-14 border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-primary/10 text-base font-semibold" onClick={() => setShowAll(true)}>
                <span>Load More Students</span>
                <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-y-[-2px] transition-transform duration-300" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};