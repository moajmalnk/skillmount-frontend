import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Github, ExternalLink, Star, Sparkles, User, Linkedin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface StudentCardProps {
  id: string | number;
  name: string;
  batch: string;
  domain?: string;
  github?: string;
  linkedin?: string; // Added LinkedIn
  email?: string;
  phone?: string;
  skills?: string[];
  isTopPerformer?: boolean;
  avatar?: string;
  headline?: string; // Added Headline
  projectCount?: number; // Added Project Count
  placement?: any; // Added Placement Data
}

const StudentCard = ({
  id,
  name,
  batch,
  domain,
  github,
  linkedin,
  email,
  phone,
  skills = [],
  isTopPerformer = false,
  avatar,
  headline,
  projectCount = 0,
  placement
}: StudentCardProps) => {
  const { isAuthenticated } = useAuth(); // Check login status
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Progressive loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setIsLoaded(true), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 portfolio-card h-full",
        !isVisible && "opacity-0",
        isVisible && !isLoaded && "opacity-50",
        isLoaded && "opacity-100"
      )}
    >
      {/* Badges Container */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
        {/* Top Performer Badge */}
        {isTopPerformer && (
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-sm animate-badge-pulse">
            <Star className="w-3 h-3 fill-current" />
            <span>Top Performer</span>
          </div>
        )}

        {/* Placement Badge */}
        {placement?.company && (
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>Placed at {placement.company}</span>
          </div>
        )}
      </div>

      {/* Portfolio Preview / Cover Section */}
      {isAuthenticated ? (
        <Link
          to={`/students/${id}`}
          className="relative block w-full aspect-[4/3] bg-gradient-to-br from-muted via-muted/80 to-muted/60 overflow-hidden group/preview"
        >
          {/* Overlay Text */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
            <span className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold transform translate-y-4 group-hover/preview:translate-y-0 transition-transform duration-300">
              View Profile
            </span>
          </div>

          {/* Avatar Image or Fallback */}
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>
              <div className="relative z-10 text-center p-4">
                <div className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <User className="w-8 h-8 text-primary/40" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{batch}</p>
              </div>
            </div>
          )}
        </Link>
      ) : (
        <div className="relative block w-full aspect-[4/3] bg-gradient-to-br from-muted via-muted/80 to-muted/60 overflow-hidden group/preview cursor-default">
          {/* Avatar Image or Fallback (No Overlay for non-auth) */}
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>
              <div className="relative z-10 text-center p-4">
                <div className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <User className="w-8 h-8 text-primary/40" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{batch}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Section - Flex Grow to push footer down */}
      <CardContent className="flex flex-col flex-grow p-5">
        {/* Name & Headline */}
        <div className="mb-4">
          {isAuthenticated ? (
            <Link to={`/students/${id}`} className="group/link block">
              <h3 className="text-lg font-bold text-foreground mb-0.5 group-hover/link:text-primary transition-colors duration-300 line-clamp-1">
                {name}
              </h3>
            </Link>
          ) : (
            <div className="block cursor-default">
              <h3 className="text-lg font-bold text-foreground mb-0.5 transition-colors duration-300 line-clamp-1">
                {name}
              </h3>
            </div>
          )}

          {/* Headline - NEW */}
          {headline && (
            <p className="text-sm text-foreground/80 font-medium mb-1 line-clamp-1" title={headline}>
              {headline}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase bg-muted px-2 py-0.5 rounded">
              {batch}
            </p>
            {/* Project Count Badge */}
            {projectCount > 0 && (
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                {projectCount} Project{projectCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Skills Tags - Fixed height area or fluid */}
        <div className="flex-grow">
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {skills.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 hover:bg-muted transition-colors duration-300 font-medium border border-transparent hover:border-border"
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50">
                  +{skills.length - 3}
                </Badge>
              )}
            </div>
          ) : (
            <div className="h-6 mb-4 text-xs text-muted-foreground italic">No skills listed</div>
          )}
        </div>

        {/* ACTIONS / CONTACT INFO */}
        {isAuthenticated && (
          <div className="mt-4 pt-4 border-t border-border/40">
            {/* LOGGED IN VIEW: Show Socials & Contact */}
            <div className="space-y-3">
              <div className="flex gap-2">
                {domain && (
                  <Button size="sm" variant="outline" asChild className="h-8 flex-1 text-xs rounded-lg hover:bg-primary/5 hover:text-primary">
                    <a href={domain} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1.5" /> Website
                    </a>
                  </Button>
                )}
                {github && (
                  <Button size="sm" variant="outline" asChild className="h-8 flex-1 text-xs rounded-lg hover:bg-primary/5 hover:text-primary">
                    <a href={github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-3 h-3 mr-1.5" /> GitHub
                    </a>
                  </Button>
                )}
                {linkedin && (
                  <Button size="sm" variant="outline" asChild className="h-8 flex-1 text-xs rounded-lg hover:bg-blue-600/10 hover:text-blue-600 border-dashed hover:border-solid hover:border-blue-600/30">
                    <a href={linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-3 h-3 mr-1.5" /> LinkedIn
                    </a>
                  </Button>
                )}
              </div>
              {(email || phone) && (
                <div className="space-y-1.5">
                  {email && (
                    <a href={`mailto:${email}`} className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors truncate">
                      <Mail className="w-3 h-3 mr-2 flex-shrink-0" /> {email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>
    </article>
  );
};

export default StudentCard;