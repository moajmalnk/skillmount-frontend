import { Palette, ExternalLink, ArrowRight, Star, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { StudentProject } from "@/types/user";

interface ProfileProjectsProps {
  projects?: StudentProject[];
}

export const ProfileProjects = ({ projects }: ProfileProjectsProps) => {
  // CONDITIONAL RENDERING: Hide entire section if no projects exist
  if (!projects || projects.length === 0) return null;

  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="mb-16 sm:mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-6">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground tracking-wide">Portfolio</span>
          </div>
          <TextGenerateEffect 
            words="Featured Projects" 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[0.95]"
            duration={1.5}
          />
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Showcasing exceptional work and innovative solutions
          </p>
        </div>

        <div className="space-y-8">
          {projects.map((project, idx) => (
            <div 
              key={idx}
              className="animate-elegant-entrance"
              style={{ 
                animationDelay: `${idx * 200}ms`,
                animationFillMode: 'both'
              }}
            >
              <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 bg-card/30 backdrop-blur-sm group hover:-translate-y-2">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Project Image */}
                  <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px]">
                    <ProfessionalBackground
                      src={project.imageUrl || "/placeholder.svg"}
                      alt={`${project.title} - Project Screenshot`}
                      className="w-full h-full"
                      overlay={true}
                      parallax={false}
                      responsive={true}
                    />
                    {project.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-primary/90 to-primary/70 text-white px-3 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
          
                  {/* Project Content */}
                  <div className="p-6 sm:p-8 md:p-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                            {project.title}
                          </h3>
                          <div className="flex gap-2">
                            {project.repoUrl && (
                                <Button size="sm" variant="ghost" className="rounded-full p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300" asChild>
                                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="w-4 h-4" />
                                </a>
                                </Button>
                            )}
                            {project.demoUrl && (
                                <Button size="sm" variant="ghost" className="rounded-full p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300" asChild>
                                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                          {project.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies?.map((tech, techIdx) => (
                            <Badge 
                              key={techIdx} 
                              variant="outline" 
                              className="text-xs px-3 py-1 border-border/30 hover:border-primary/30 hover:text-primary transition-colors duration-300"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>

                        {project.demoUrl && (
                          <Button 
                            size="sm" 
                            className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl"
                            asChild
                          >
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                              View Project
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </WobbleCard>
            </div>
          ))}
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};