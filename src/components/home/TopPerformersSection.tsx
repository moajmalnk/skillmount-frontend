import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight, Loader2 } from "lucide-react";
import StudentCard from "@/components/StudentCard";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { Student } from "@/types/user";
import { formatBatchForDisplay } from "@/lib/batches";

interface TopPerformersSectionProps {
  students: Student[];
  isLoading?: boolean;
}

export const TopPerformersSection = ({ students, isLoading }: TopPerformersSectionProps) => {
  const displayStudents = students.map(s => ({
    ...s,
    id: s.id, 
    batch: formatBatchForDisplay(s.batch, false),
    domain: s.socials?.website, 
    github: s.socials?.github
  }));

  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-500/15 rounded-full px-5 py-2 mb-8">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-600 tracking-wide">Elite Showcase</span>
            </div>
            <TextGenerateEffect words="Top Performers" className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Exceptional students who have demonstrated outstanding skills, creativity, and dedication to their craft</p>
          </div>
        
          {isLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : displayStudents.length > 0 ? (
            // Added items-stretch to ensure equal height
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 items-stretch">
              {displayStudents.slice(0, 4).map((student, index) => (
                <div 
                    key={student.id} 
                    className="animate-elegant-entrance h-full" // Added h-full here
                    style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
                >
                  {/* @ts-ignore */}
                  <StudentCard {...student} id={student.id as any} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No top performers featured yet.
            </div>
          )}
          
          <div className="text-center">
            <Link to="/students?filter=top-performer">
              <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-border/30 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-amber-500/10 text-base font-semibold">
                <span>View All Top Performers</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};