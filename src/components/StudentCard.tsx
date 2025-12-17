import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Github, ExternalLink, Star, Sparkles, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface StudentCardProps {
  id: string | number;
  name: string;
  batch: string;
  domain?: string;
  github?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  isTopPerformer?: boolean;
  avatar?: string; // Added Avatar Prop
}

const StudentCard = ({
  id,
  name,
  batch,
  domain,
  github,
  email,
  phone,
  skills = [],
  isTopPerformer = false,
  avatar
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
      {/* Top Performer Badge */}
      {isTopPerformer && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm animate-badge-pulse">
          <Star className="w-3 h-3 fill-current" />
          <span>Top Performer</span>
        </div>
      )}

      {/* Portfolio Preview / Cover Section */}
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

      {/* Content Section - Flex Grow to push footer down */}
      <CardContent className="flex flex-col flex-grow p-5">
        {/* Name & Batch */}
        <div className="mb-4">
          <Link to={`/students/${id}`} className="group/link block">
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover/link:text-primary transition-colors duration-300 line-clamp-1">
              {name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            {batch}
          </p>
        </div>

        {/* Skills Tags - Fixed height area or fluid */}
        <div className="flex-grow">
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {skills.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 hover:bg-muted transition-colors duration-300 font-medium"
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
        <div className="mt-4 pt-4 border-t border-border/40">
          {isAuthenticated ? (
            // LOGGED IN VIEW: Show Socials & Contact
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
          ) : (
            // PUBLIC VIEW: Hide Personal Data, Show CTA
            <Button asChild className="w-full h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-none border-0">
              <Link to={`/students/${id}`}>
                View Full Profile
              </Link>
            </Button>
          )}
        </div>
      </CardContent>

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>
    </article>
  );
};

export default StudentCard;