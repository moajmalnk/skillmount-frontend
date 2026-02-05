import { useState, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StudentCard from "@/components/StudentCard";
import SEO from "@/components/SEO";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { Award, BookOpen, GraduationCap, TrendingUp, ArrowRight, Sparkles, Code2, Palette, Database, Target, Heart, Mail, MessageSquare, Users, ExternalLink } from "lucide-react";
import { BATCHES, formatBatchForDisplay } from "@/lib/batches";

// Import Service & Type
import { userService } from "@/services/userService";
import { Student } from "@/types/user";

// ... [Keep CategoryCard and StatCard components exactly as they were] ...
const CategoryCard = memo(({ to, gradient, icon: Icon, title, count, delay }: any) => (
  <Link to={to} className="group block" style={{ animationDelay: `${delay}ms` }}>
    <WobbleCard className="overflow-hidden border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 h-full hover:-translate-y-2 bg-card/40 backdrop-blur-sm">
      <div className={`aspect-[4/3] ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/15 rounded-3xl blur-3xl group-hover:scale-125 group-hover:opacity-80 transition-all duration-700"></div>
            <Icon className="w-20 h-20 text-white/95 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" strokeWidth={1.2} />
          </div>
        </div>
      </div>
      <div className="p-8 bg-card/50 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{count}</p>
      </div>
    </WobbleCard>
  </Link>
));
CategoryCard.displayName = "CategoryCard";

export const PublicLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allUsers = await userService.getAll();
        // Filter strictly for students
        const studentList = allUsers.filter(u => u.role === 'student') as Student[];
        setStudents(studentList);
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setIsLoading(false);
        setIsVisible(true);
      }
    };
    fetchData();
  }, []);

  // Filter lists based on flags
  const topPerformers = students.filter(s => s.isTopPerformer).map(s => ({
    ...s,
    batch: formatBatchForDisplay(s.batch, false),
    // Ensure numeric ID for StudentCard
    id: parseInt(s.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000)
  }));

  const latestGraduates = students.filter(s => s.isFeatured).slice(0, 8).map(s => ({
    ...s,
    batch: formatBatchForDisplay(s.batch, false),
    id: parseInt(s.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000)
  }));

  // Stats
  const stats = {
    totalStudents: "1000+",
    batchesCompleted: "12+",
    successRate: "95%",
    placementSuccess: "Proven"
  };

  const faqs = [
    { question: "What No-Code and CMS platforms do you teach?", answer: "We specialize in WordPress, Elementor, WooCommerce, Webflow, and Shopify." },
    { question: "Do I need coding experience to join?", answer: "Not at all! Our courses are designed for beginners." },
    { question: "What is the duration of the training program?", answer: "Typically 4-6 weeks with intensive hands-on training." },
    { question: "Do you provide placement assistance?", answer: "Yes! We have a proven track record with a 95% success rate." },
  ];

  return (
    <FollowingPointer>
      <SEO
        title="SkillMount Students - WordPress & No-Code Training Success Stories"
        description="Explore exceptional portfolios from 1000+ talented students trained by Mohammed Ajmal NK."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="min-h-screen bg-background relative">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-[0.03]" style={{ backgroundImage: 'url("/tutor-hero.jpg")' }}></div>
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
          </div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                {/* Content */}
                <div className="space-y-10">
                  <div className="mt-10 flex items-center justify-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 w-fit mx-auto sm:mx-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">No-Code Excellence</span>
                  </div>
                  <div className="space-y-4">
                    <TextGenerateEffect words="Student Success @ SkillMount" className="text-6xl md:text-8xl font-bold leading-tight" />
                    <div className="text-lg text-muted-foreground leading-relaxed">
                      Led by <span className="font-semibold text-primary">Mohammed Ajmal NK</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-8 border-t border-border/20">
                    <div className="space-y-2"><div className="text-4xl font-bold text-primary">{stats.totalStudents}</div><div className="text-sm">Students Trained</div></div>
                    <div className="space-y-2"><div className="text-4xl font-bold text-primary">{stats.batchesCompleted}</div><div className="text-sm">Batches Completed</div></div>
                  </div>

                  <div className="flex gap-4 justify-center sm:justify-start">
                    <Link to="/contact"><Button className="rounded-full px-8 h-12">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
                    <Link to="/students"><Button variant="outline" className="rounded-full px-8 h-12">View Students</Button></Link>
                  </div>
                </div>

                {/* Visual */}
                <div className="relative">
                  <ProfessionalBackground src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp" alt="Hero" className="w-full h-[600px] rounded-2xl shadow-2xl" overlay={true} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP PERFORMERS - Dynamic Data */}
        <ContainerScrollAnimation direction="up" speed="slow">
          <section className="pt-16 pb-16 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-500/15 rounded-full px-5 py-2 mb-6">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600 tracking-wide">Elite Showcase</span>
                </div>
                <TextGenerateEffect words="Top Performers" className="text-5xl font-bold mb-4" />
              </div>

              {topPerformers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {topPerformers.map((student, index) => (
                    <div key={student.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 120}ms` }}>
                      <StudentCard {...student} isTopPerformer={true} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">No top performers featured yet.</div>
              )}
            </div>
          </section>
        </ContainerScrollAnimation>

        {/* LATEST GRADUATES - Dynamic Data */}
        <ContainerScrollAnimation direction="up" speed="normal">
          <section className="pt-16 pb-20 bg-background relative">
            <div className="container mx-auto px-6 max-w-7xl relative">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2.5 bg-primary/10 rounded-full px-5 py-2 mb-6">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary tracking-wide">Latest Graduates</span>
                </div>
                <TextGenerateEffect words="New Talents" className="text-5xl font-bold mb-4" />
              </div>

              {latestGraduates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {latestGraduates.map((student, index) => (
                    <div key={student.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 100}ms` }}>
                      <StudentCard {...student} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">No graduates featured yet.</div>
              )}

              <div className="text-center mt-12">
                <Link to="/students">
                  <Button variant="outline" className="rounded-full px-12 h-14 text-base">View All Students</Button>
                </Link>
              </div>
            </div>
          </section>
        </ContainerScrollAnimation>

        {/* FAQ Section */}
        <ContainerScrollAnimation direction="up" speed="slow">
          <section className="py-20 bg-card/30">
            <div className="container max-w-4xl mx-auto px-6">
              <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border/50 rounded-xl px-6">
                    <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline">{f.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </ContainerScrollAnimation>

      </div>
    </FollowingPointer>
  );
};