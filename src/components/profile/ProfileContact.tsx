import { Mail, Phone, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { Student } from "@/types/user";

interface ProfileContactProps {
  student: Student;
}

export const ProfileContact = ({ student }: ProfileContactProps) => {
  // CONDITIONAL RENDERING: Check if ANY contact info exists
  // Note: 'domain' usually maps to socials.website, but legacy data might have it at root
  const hasContactInfo = 
    student.email || 
    student.phone || 
    student.socials?.website || 
    (student as any).domain;

  if (!hasContactInfo) return null;

  return (
    <ContainerScrollAnimation direction="up" speed="slow">
      <section className="mb-16 sm:mb-20">
        <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/40 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-700">
          <div className="p-6 sm:p-8 md:p-12 lg:p-16 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-primary/8 border border-primary/15 rounded-full px-4 py-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary tracking-wide">Get In Touch</span>
              </div>
              
              <div className="space-y-4">
                <TextGenerateEffect 
                  words="Let's Work Together" 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.95]"
                  duration={1.5}
                />
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                  Ready to collaborate on your next project? Let's discuss how we can bring your vision to life.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {student.email && (
                  <Button size="sm" variant="outline" className="rounded-full px-6 h-10 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group" asChild>
                    <a href={`mailto:${student.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {student.phone && (
                  <Button size="sm" variant="outline" className="rounded-full px-6 h-10 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group" asChild>
                    <a href={`tel:${student.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
                {(student.socials?.website || (student as any).domain) && (
                  <Button size="sm" className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl" asChild>
                    <a href={student.socials?.website || (student as any).domain} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </WobbleCard>
      </section>
    </ContainerScrollAnimation>
  );
};