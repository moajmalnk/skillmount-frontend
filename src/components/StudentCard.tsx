import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Github, ExternalLink, Star, Sparkles, User, Linkedin, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlacementData } from "@/types/user";

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
  placement?: PlacementData; // Added Placement Data
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

  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Handle Card Click
  const handleCardClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginDialog(true);
    }
  };

  return (
    <>
      <article
        ref={cardRef}
        className={cn(
          "group relative flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 portfolio-card h-full cursor-pointer",
          !isVisible && "opacity-0",
          isVisible && !isLoaded && "opacity-50",
          isLoaded && "opacity-100"
        )}
        onClick={handleCardClick}
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
        <div className="relative block w-full aspect-[4/3] bg-gradient-to-br from-muted via-muted/80 to-muted/60 overflow-hidden group/preview">

          {isAuthenticated ? (
            <Link to={`/students/${id}`} className="absolute inset-0 z-10" />
          ) : null}

          {/* Overlay Text */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center pointer-events-none">
            <span className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <ExternalLink className="w-4 h-4" /> View Profile
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Login to View
                </>
              )}
            </span>
          </div>

          {/* Avatar Image or Fallback */}
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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

        {/* Content Section - Flex Grow to push footer down */}
        <CardContent className="flex flex-col flex-grow p-5 pointer-events-none"> {/* Added pointer-events-none to prevent double clicks */}
          {/* Name & Headline */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {name}
            </h3>

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
                    className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 font-medium border border-transparent"
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
            {/* LOGGED IN VIEW: Show Socials & Contact */}
            {isAuthenticated ? (
              <div className="space-y-3 pointer-events-auto"> {/* Re-enable pointer events for buttons */}
                <div className="flex gap-2">
                  {domain && (
                    <Button size="sm" variant="outline" asChild className="h-8 flex-1 text-xs rounded-lg hover:bg-primary/5 hover:text-primary z-20 relative" onClick={(e) => e.stopPropagation()}>
                      <a href={domain} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1.5" /> Website
                      </a>
                    </Button>
                  )}
                  {github && (
                    <Button size="sm" variant="outline" asChild className="h-8 flex-1 text-xs rounded-lg hover:bg-primary/5 hover:text-primary z-20 relative" onClick={(e) => e.stopPropagation()}>
                      <a href={github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3 h-3 mr-1.5" /> GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" /> Login to view contact info
                </span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        </div>
      </article>

      {/* Login Required Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Unlock Student Profiles</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              Sign in to view full portfolios, contact details, and connect with our talented students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
            <AlertDialogCancel className="rounded-full border-border/50 w-full sm:w-auto mt-2 sm:mt-0">
              Maybe Later
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full w-full sm:w-auto bg-primary hover:bg-primary/90"
              onClick={() => navigate('/login')}
            >
              Login Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudentCard;