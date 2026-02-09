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
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // If not authenticated and trying to click restricted areas, show dialog
    // Ideally the card itself can be clicked to go to profile if auth
    if (!isAuthenticated) {
      // e.preventDefault();
      // setShowLoginDialog(true);
      // We let the Link inside handle navigation, or show dialog if clicking elsewhere?
      // Let's keep simple: The whole card is clickable but protected routes handle auth, 
      // OR we intercept here.
    }
  };

  const onRestrictedAction = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          "group relative flex flex-col bg-card hover:bg-card/50 border border-border/40 rounded-3xl overflow-hidden transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 h-full",
          !isVisible && "opacity-0",
          isVisible && !isLoaded && "opacity-50",
          isLoaded && "opacity-100"
        )}
      >
        {/* PRO Badge - Absolute Top Right */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
          {isTopPerformer && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/20 animate-in zoom-in duration-300">
              <Star className="w-3 h-3 fill-current" />
              <span>TOP VALUED</span>
            </div>
          )}
          {placement?.company && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-green-500/20 animate-in zoom-in duration-300 delay-100">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="truncate max-w-[100px]">{placement.company}</span>
            </div>
          )}
        </div>

        {/* 1. Header Art / Banner - Cosmic Intelligent Style */}
        <div className="h-24 w-full relative overflow-hidden group-hover:h-28 transition-all duration-500 ease-out">
          {/* Vibrant Professional Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 opacity-90 dark:opacity-80"></div>

          {/* Abstract Shapes for Depth */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {/* Shine Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
        </div>

        {/* 2. Profile Content */}
        <div className="px-5 pb-5 flex flex-col flex-grow items-center -mt-12 relative z-10">

          {/* Avatar */}
          <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
            <div className="w-24 h-24 rounded-2xl rotate-3 overflow-hidden border-4 border-card shadow-xl bg-card">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover -rotate-3 scale-110" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center -rotate-3 text-muted-foreground">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
            {/* Batch Badge on Avatar */}
            <div className="absolute -bottom-2 -right-2 bg-background border border-border text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider text-muted-foreground">
              {batch}
            </div>
          </div>

          {/* Name & Headline */}
          <div className="text-center space-y-1 w-full mb-4">
            <h3 className="text-xl md:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-300 truncate px-2 tracking-tight">
              {isAuthenticated ? (
                <Link to={`/students/${id}`} className="hover:underline decoration-primary/30 underline-offset-4 decoration-2">
                  {name}
                </Link>
              ) : name}
            </h3>
            {headline && (
              <p className="text-xs text-muted-foreground line-clamp-2 px-2 h-8 leading-relaxed">
                {headline}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="w-full flex flex-wrap gap-1.5 justify-center mb-5 h-[52px] content-start overflow-hidden">
            {(skills || []).slice(0, 4).map((skill, i) => (
              <Badge key={i} variant="secondary" className="bg-muted/50 hover:bg-primary/10 text-[10px] font-medium px-2 py-0 transition-colors border-transparent hover:border-primary/20">
                {skill}
              </Badge>
            ))}
            {(skills || []).length > 4 && (
              <Badge variant="secondary" className="bg-muted/30 text-[10px] px-1.5 py-0">+{(skills || []).length - 4}</Badge>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border/40 mb-4"></div>

          {/* Footer / Actions */}
          <div className="w-full flex items-center justify-between gap-2 mt-auto">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-1">
                  {github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()} title="GitHub">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-blue-600 transition-colors" onClick={(e) => e.stopPropagation()} title="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {domain ? (
                  <a href={domain} target="_blank" rel="noopener noreferrer" className="flex-1 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="w-full h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs shadow-none hover:shadow-lg transition-all">
                      Visit Website <ExternalLink className="w-3 h-3 ml-1.5" />
                    </Button>
                  </a>
                ) : (
                  <Button size="sm" variant="ghost" className="flex-1 ml-2 h-9 rounded-full text-xs text-muted-foreground" disabled>
                    No Website
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-full border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 text-xs"
                onClick={() => setShowLoginDialog(true)}
              >
                <Lock className="w-3 h-3 mr-1.5" /> Login to Connect
              </Button>
            )}
          </div>

        </div>
      </article>

      {/* Login Dialog - Preserved */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-xl rounded-3xl">
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