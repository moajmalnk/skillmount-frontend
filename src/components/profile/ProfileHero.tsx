import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Globe, Github, ArrowRight, Mail, Linkedin, Twitter, Briefcase } from "lucide-react";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { Student } from "@/types/user";
import { formatBatchForDisplay } from "@/lib/batches";

interface ProfileHeroProps {
  student: Student;
}

export const ProfileHero = ({ student }: ProfileHeroProps) => {
  return (
    <section className="mb-12 sm:mb-16">
      <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/40 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-700">
        <div className="p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            {/* Left Column - Profile Info */}
            <div className="space-y-6 sm:space-y-8 flex flex-col h-full justify-between">
              {/* Status Badge */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2.5 bg-primary/[0.05] border border-primary/10 rounded-full px-4 py-2 w-fit">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-primary tracking-wide">
                    {student.placement ? "Placed" : "Active Student"}
                  </span>
                </div>
                {student.placement && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Hired by {student.placement.company} {student.placement.role ? `as ${student.placement.role}` : ''}
                  </Badge>
                )}
                {student.regId && (
                  <Badge variant="outline" className="border-primary/20 text-primary/80 font-mono text-[10px] tracking-wider">
                    {student.regId}
                  </Badge>
                )}
              </div>

              {/* Name and Title */}
              <div className="space-y-4">
                <TextGenerateEffect
                  words={student.name}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[0.9]"
                  duration={2}
                />
                <div className="space-y-2">
                  {student.headline && (
                    <p className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {student.headline}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-lg text-muted-foreground font-medium">
                    <span>{formatBatchForDisplay(student.batch)}</span>
                    {student.qualification && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                        <span className="text-foreground/80">{student.qualification}</span>
                      </>
                    )}
                  </div>

                  {(student.mentor || student.coordinator) && (
                    <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground/80">
                      {student.mentor && (
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded textxs font-semibold uppercase tracking-wider">Mentor</span>
                          <span>{student.mentor}</span>
                        </div>
                      )}
                      {student.coordinator && (
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded textxs font-semibold uppercase tracking-wider">Coordinator</span>
                          <span>{student.coordinator}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {student.isTopPerformer && (
                    <Badge className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 px-4 py-2 mt-2">
                      <Award className="w-4 h-4 mr-2" />
                      Top Performer
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bio & Aim */}
              <div className="space-y-6">
                {student.aim && (
                  <div className="bg-primary/5 border-l-2 border-primary/40 pl-4 py-3 rounded-r-lg">
                    <p className="text-xs uppercase tracking-widest text-primary/80 font-bold mb-1">Career Objective</p>
                    <p className="text-foreground/90 font-medium italic">"{student.aim}"</p>
                  </div>
                )}

                {student.bio ? (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                    {student.bio}
                  </p>
                ) : (
                  // Fallback for empty bio to fill space aesthetically
                  <p className="text-base text-muted-foreground/60 italic leading-relaxed">
                    {student.role === 'student' ? 'Student at SkillMount Data Analytics.' : 'No bio available.'}
                  </p>
                )}

                {/* New Details Grid to Fill Space */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reg ID</p>
                    <p className="font-mono text-sm font-medium text-foreground">{student.regId || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Batch</p>
                    <p className="text-sm font-medium text-foreground">{formatBatchForDisplay(student.batch)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {student.location || (student.address ? student.address.split(',').pop()?.trim() : "Remote / Unspecified")}
                    </p>
                  </div>
                  {student.date_joined && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(student.date_joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats - Only show if relevant data exists */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-t border-border/20 mt-auto">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{student.experience || "Fresher"}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{student.projects?.length || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Projects</div>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{student.skills?.length || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Skills</div>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="flex flex-wrap gap-3">
                {student.resume && (
                  <Button size="sm" className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl">
                    <a href={student.resume} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Download CV
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </Button>
                )}
                {student.socials?.website && (
                  <Button size="sm" variant="outline" className="rounded-full px-6 h-10 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300">
                    <a href={student.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
                {student.socials?.github && (
                  <Button size="sm" variant="outline" className="rounded-full px-4 h-10 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300">
                    <a href={student.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Github className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {student.socials?.linkedin && (
                  <Button size="sm" variant="outline" className="rounded-full px-4 h-10 border-border/40 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-600 transition-all duration-300">
                    <a href={student.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {student.socials?.twitter && (
                  <Button size="sm" variant="outline" className="rounded-full px-4 h-10 border-border/40 hover:border-sky-500/50 hover:bg-sky-500/5 hover:text-sky-600 transition-all duration-300">
                    <a href={student.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Profile Image */}
            <div className="relative">
              <ProfessionalBackground
                src={student.avatar || "https://moajmalnk.in/assets/img/hero/moajmalnk.webp"}
                alt={`${student.name}`}
                className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl shadow-2xl bg-gradient-to-br from-card to-card/50"
                overlay={true}
                parallax={false}
                responsive={true}
              >
                <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-bold text-gray-800">{student.name}</div>
                      <div className="text-xs text-gray-600">
                        {student.location || (student.address ? student.address.split(',').pop()?.trim() : "Available for Hire")}
                      </div>
                    </div>
                  </div>
                </div>
              </ProfessionalBackground>
            </div>
          </div>
        </div>
      </WobbleCard>
    </section>
  );
};