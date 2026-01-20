import { useState, useEffect } from "react";
import { Sparkles, Star, Quote, User } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { WobbleCard } from "@/components/ui/wobble-card";
import { feedbackService } from "@/services/feedbackService";
import { Feedback } from "@/types/feedback";

export const TestimonialsSection = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await feedbackService.getPublicTestimonials();
        setFeedbacks(data);
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!loading && feedbacks.length === 0) return null;

  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-accent/[0.01]"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/[0.015] rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Testimonials</span>
            </div>
            <TextGenerateEffect words="Student Success Stories" className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Hear directly from our students about their learning journey with SkillMount.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {feedbacks.map((item, index) => (
              <article key={item.id} className="animate-elegant-entrance h-full" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <WobbleCard containerClassName="h-full" className="border border-border/30 rounded-3xl h-full hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm min-h-[300px]">
                  <div className="p-8 flex flex-col h-full relative">
                    {/* Decoration */}
                    <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-all duration-500" />

                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                      ))}
                    </div>

                    {/* Message */}
                    <blockquote className="text-muted-foreground mb-8 text-lg leading-relaxed flex-grow font-light line-clamp-6">
                      "{item.message}"
                    </blockquote>

                    {/* User Info */}
                    <div className="border-t border-border/30 pt-6 mt-auto flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border/50 shrink-0 shadow-sm">
                        {item.studentAvatar ? (
                          <img src={item.studentAvatar} alt={item.studentName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors duration-300">
                          {item.studentName}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-2">
                          <span>Student</span>
                          {item.category && item.category !== 'Other' && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border"></span>
                              <span className="text-primary/80">{item.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </WobbleCard>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};