import { Users, Search, X, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentCard from "@/components/StudentCard";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Student } from "@/types/user";

interface StudentsGridProps {
  students: Student[];
  clearFilters: () => void;
  totalCount?: number;
}

export const StudentsGrid = ({ students, clearFilters, totalCount }: StudentsGridProps) => {
  return (
    <section className="pt-0 sm:pt-2 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-6">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground tracking-wide">Student Showcase</span>
          </div>
          <TextGenerateEffect
            words="Student Portfolios"
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[0.95]"
            duration={1.5}
          />
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            {students.length > 0
              ? `Discover ${totalCount || students.length} talented students and their exceptional work`
              : "No students match your current filters"
            }
          </p>
        </div>

        {/* Grid */}
        {students.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
            {students.map((student, index) => (
              <div key={student.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}>
                <StudentCard {...student} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-muted/20 to-muted/10 rounded-3xl flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">No students found</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Try adjusting your filters to discover more talented students
            </p>
            <Button variant="outline" size="lg" onClick={clearFilters} className="rounded-full px-8 h-12 border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
              <X className="w-4 h-4 mr-2" /> Clear All Filters
            </Button>
          </div>
        )}

        {/* Footer CTA */}
        {students.length > 0 && (
          <div className="text-center pt-8 border-t border-border/20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">Ready to Connect?</span>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed font-light">
              Found a student whose work inspires you? Reach out and start a conversation.
            </p>
            <div className="flex flex-row gap-4 justify-center items-center">
              <a href="https://moajmalnk.in" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 group">
                  <ExternalLink className="w-5 h-5 mr-2" /> Visit moajmalnk.in
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};