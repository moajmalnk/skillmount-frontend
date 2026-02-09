import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MapPin, Send, AlertCircle, ArrowRight, Sparkles, MessageSquare, Clock, Users, ExternalLink, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";
import { TicketForm } from "@/components/tickets/TicketForm";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { inquiryService } from "@/services/inquiryService";

import { useNavigate } from "react-router-dom";

const Contact = () => {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);



  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: "",
    message: ""
  });

  // Auto-fill form when user data loads
  useEffect(() => {
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    subject: "",
    priority: "medium",
    description: ""
  });

  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    rating: 5,
    feedback: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inquiryService.create({
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        subject: contactForm.subject,
        message: contactForm.message
      });

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      // Don't clear name/email/phone if user is logged in
      setContactForm(prev => ({
        ...prev,
        subject: "",
        message: ""
      }));
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Ticket Created!",
      description: "Your support ticket has been submitted. Ticket ID: #" + Math.floor(Math.random() * 10000),
    });
    setTicketForm({ name: "", email: "", subject: "", priority: "medium", description: "" });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feedback Received!",
      description: "Thank you for your valuable feedback. We appreciate it!",
    });
    setFeedbackForm({ name: "", email: "", rating: 5, feedback: "" });
  };

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact SkillMount",
    "description": "Get in touch with SkillMount for WordPress and No-Code training inquiries",
    "url": "https://students.moajmalnk.in/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "SkillMount",
      "founder": {
        "@type": "Person",
        "name": "Mohammed Ajmal NK",
        "url": "https://moajmalnk.in"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8848676627",
        "contactType": "Customer Service",
        "email": "moajmalnk@gmail.com",
        "availableLanguage": "English"
      }
    }
  };

  const isStudent = user?.role === 'student';
  const canRaiseTicket = isAuthenticated && (isStudent || user?.role === 'super_admin') && user?.isProfileComplete;

  return (
    <FollowingPointer>
      {/* Advanced SEO Meta Tags */}
      <SEO
        title="Contact SkillMount - WordPress & No-Code Training Support"
        description="Get in touch with SkillMount for WordPress, Elementor, WooCommerce training inquiries. Expert support from Mohammed Ajmal NK. Response within 24 hours."
        keywords="contact SkillMount, WordPress training support, No-Code training inquiry, Mohammed Ajmal NK contact, web development training, customer support"
        url="https://students.moajmalnk.in/contact"
        image="https://moajmalnk.in/assets/img/logo/logo-lightaj.png"
        author="Mohammed Ajmal NK"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section - Modern Design */}
        <section className="min-h-screen bg-background relative">
          {/* Professional Background Layers */}
          <div className="absolute inset-0">
            {/* Primary Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03]"
              style={{
                backgroundImage: 'url("/tutor-hero.jpg")',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed'
              }}
            ></div>

            {/* Professional Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>

            {/* Ultra-subtle professional texture */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh]">
                {/* Left Column - Content */}
                <div className="space-y-6 sm:space-y-8 md:space-y-10">
                  {/* Ultra-minimal badge */}
                  <div className="mt-10 flex items-center justify-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 w-fit mx-auto sm:mx-0">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Get Support</span>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <TextGenerateEffect
                        words="Get In Touch"
                        className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-foreground tracking-tight max-w-4xl"
                        duration={2}
                      />
                      <div className="text-center">
                        <a
                          href="https://moajmalnk.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative inline-block cursor-pointer hover:scale-105 transition-transform duration-500"
                        >
                          <span className="relative z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent text-2xl md:text-3xl font-semibold">
                            Expert Support Available
                          </span>
                          <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/8 -rotate-1 rounded"></span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                        Led by <a
                          href="https://moajmalnk.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
                        >
                          Mohammed Ajmal NK
                        </a>
                      </p>

                      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        We're here to help! Reach out for WordPress, No-Code training inquiries, or any support you need.
                      </p>
                    </div>
                  </div>

                  {/* Response Time Stats */}
                  <div className="grid grid-cols-2 gap-8 py-8 border-t border-border/20">
                    <div className="space-y-2">
                      <div className="text-4xl md:text-5xl font-bold text-primary">24hrs</div>
                      <div className="text-sm text-muted-foreground font-medium">Response Time</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl md:text-5xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground font-medium">Support Coverage</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl md:text-5xl font-bold text-primary">Expert</div>
                      <div className="text-sm text-muted-foreground font-medium">Guidance</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl md:text-5xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground font-medium">Available</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Professional Contact Card */}
                <div className="relative">
                  <ProfessionalBackground
                    src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp"
                    alt="Mohammed Ajmal NK - Contact Support"
                    className="w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] rounded-2xl shadow-2xl bg-gradient-to-br from-card to-card/50"
                    overlay={true}
                    parallax={false}
                    responsive={true}
                  >
                    {/* Professional Contact Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
                      <div className="text-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                        {/* Professional Status Badge */}
                        <div className="inline-flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 shadow-xl border border-border/50">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs sm:text-sm font-medium text-foreground tracking-wide">Available Now</span>
                        </div>

                        {/* Professional Contact Card */}
                        <div className="bg-card/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-border/40 hover:shadow-3xl transition-all duration-500">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 sm:mb-3">Quick Contact</h3>
                          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">Get instant support</p>
                          <a
                            href="mailto:moajmalnk@gmail.com"
                            className="inline-block"
                          >
                            <Button size="sm" className="w-full sm:w-auto rounded-full px-6 sm:px-8 h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                              Send Email
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </ProfessionalBackground>

                  {/* Professional Floating Contact Card */}
                  <div className="absolute -bottom-3 sm:-bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                    <a
                      href="https://moajmalnk.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer"
                    >
                      {/* Professional Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                        </div>
                        {/* Online Status Indicator */}
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="text-xs sm:text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">Mohammed Ajmal NK</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">Lead Instructor @ SkillMount</div>
                        <div className="text-xs sm:text-sm text-green-600 font-medium">● Ready to Help</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods Section - Enhanced with Scroll Animation */}
        <ContainerScrollAnimation direction="up" speed="normal">
          <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
            {/* Minimal ambient lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-7xl relative">
              <div className="text-center mb-24">
                <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground tracking-wide">Contact Methods</span>
                </div>
                <TextGenerateEffect
                  words="Get In Touch"
                  className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]"
                  duration={1.5}
                />
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  Multiple ways to reach us for support and inquiries
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                {/* Email Contact Card */}
                <div
                  className="animate-elegant-entrance"
                  style={{
                    animationDelay: '0ms',
                    animationFillMode: 'both'
                  }}
                >
                  <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden">
                    <div className="p-8 text-center">
                      <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary/8 to-primary/4 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/5">
                        <Mail className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.2} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                        Email Us
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light mb-6">
                        We'll respond within 24 hours
                      </p>
                      <a
                        href="mailto:moajmalnk@gmail.com"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 font-semibold group/link"
                      >
                        <span>moajmalnk@gmail.com</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </a>
                    </div>
                  </WobbleCard>
                </div>

                {/* Phone Contact Card */}
                <div
                  className="animate-elegant-entrance"
                  style={{
                    animationDelay: '100ms',
                    animationFillMode: 'both'
                  }}
                >
                  <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden">
                    <div className="p-8 text-center">
                      <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary/8 to-primary/4 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/5">
                        <Phone className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.2} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                        Call Us
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light mb-6">
                        Mon-Fri from 9am to 6pm
                      </p>
                      <a
                        href="tel:+918848676627"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 font-semibold group/link"
                      >
                        <span>+91 8848676627</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </a>
                    </div>
                  </WobbleCard>
                </div>

                {/* Location Contact Card */}
                <div
                  className="animate-elegant-entrance"
                  style={{
                    animationDelay: '200ms',
                    animationFillMode: 'both'
                  }}
                >
                  <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden">
                    <div className="p-8 text-center">
                      <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary/8 to-primary/4 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/5">
                        <MapPin className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.2} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                        Visit Us
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light mb-6">
                        Come say hello at our office
                      </p>
                      <address className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300 font-semibold group/link not-italic">
                        <span>Malappuram, Kerala, India, 676507</span>
                        <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                      </address>
                    </div>
                  </WobbleCard>
                </div>
              </div>
            </div>
          </section>
        </ContainerScrollAnimation>

        {/* Forms Section - Enhanced with Scroll Animation */}
        <ContainerScrollAnimation direction="up" speed="slow">
          <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-[0.008]" style={{
              backgroundImage: 'linear-gradient(45deg, transparent 25%, currentColor 25%, currentColor 50%, transparent 50%, transparent 75%, currentColor 75%)',
              backgroundSize: '30px 30px'
            }}></div>

            <div className="container mx-auto px-6 max-w-4xl relative">
              <div className="text-center mb-24">
                <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground tracking-wide">Contact Forms</span>
                </div>
                <TextGenerateEffect
                  words="Send Us Message"
                  className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]"
                  duration={1.5}
                />
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  {canRaiseTicket
                    ? "Choose the best way to get in touch with us"
                    : "Have a question? Send us a general inquiry below."}
                </p>
              </div>

              <Tabs defaultValue="contact" className="w-full">
                {canRaiseTicket ? (
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-1">
                    <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                      General Inquiry
                    </TabsTrigger>
                    <TabsTrigger value="ticket" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                      Raise a Ticket
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                      Feedbacks
                    </TabsTrigger>
                  </TabsList>
                ) : null}

                {/* Contact Form */}
                <TabsContent value="contact">
                  <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 bg-card/30 backdrop-blur-sm overflow-hidden">
                    <div className="p-8 md:p-10">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/8 to-primary/4 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
                          <Mail className="w-8 h-8 text-primary" strokeWidth={1.2} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Send us a message</h3>
                        <p className="text-muted-foreground">We'll get back to you within 24 hours</p>
                      </div>

                      <form onSubmit={handleContactSubmit} className="space-y-6">
                        {!isAuthenticated && (
                          <>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label htmlFor="contact-name" className="text-sm font-semibold text-foreground">Full Name *</Label>
                                <Input
                                  id="contact-name"
                                  placeholder="John Doe"
                                  value={contactForm.name}
                                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                  required
                                  className="h-12 rounded-xl border-border/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                                />
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor="contact-email" className="text-sm font-semibold text-foreground">Email *</Label>
                                <Input
                                  id="contact-email"
                                  type="email"
                                  placeholder="john@example.com"
                                  value={contactForm.email}
                                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                  required
                                  className="h-12 rounded-xl border-border/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="contact-phone" className="text-sm font-semibold text-foreground">Phone Number</Label>
                              <Input
                                id="contact-phone"
                                type="tel"
                                placeholder="+91 8848676627"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                className="h-12 rounded-xl border-border/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-3">
                          <Label htmlFor="contact-subject" className="text-sm font-semibold text-foreground">Subject</Label>
                          <Input
                            id="contact-subject"
                            placeholder="Course details / Partnership / Other"
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            className="h-12 rounded-xl border-border/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="contact-message" className="text-sm font-semibold text-foreground">Message *</Label>
                          <Textarea
                            id="contact-message"
                            placeholder="Tell us how we can help you..."
                            rows={6}
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            required
                            className="rounded-xl border-border/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-primary/20"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                          )}
                          {isSubmitting ? "Sending..." : "Send Message"}
                          {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />}
                        </Button>
                      </form>
                    </div>
                  </WobbleCard>
                </TabsContent>

                {/* Ticket Form */}
                {canRaiseTicket && (
                  <TabsContent value="ticket">
                    <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 bg-card/30 backdrop-blur-sm overflow-hidden">
                      <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/8 to-primary/4 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
                            <AlertCircle className="w-8 h-8 text-primary" strokeWidth={1.2} />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Create a Support Ticket</h3>
                          <p className="text-muted-foreground">Get priority support for technical issues</p>
                        </div>

                        <TicketForm />

                      </div>
                    </WobbleCard>
                  </TabsContent>
                )}

                {/* Feedback Form */}
                {canRaiseTicket && (
                  <TabsContent value="feedback">
                    <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 bg-card/30 backdrop-blur-sm overflow-hidden">
                      <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/8 to-primary/4 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
                            <Star className="w-8 h-8 text-primary" strokeWidth={1.2} />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Share Your Feedback</h3>
                          <p className="text-muted-foreground">Help us improve by sharing your experience</p>
                        </div>

                        <FeedbackForm />

                      </div>
                    </WobbleCard>
                  </TabsContent>
                )}

              </Tabs>
            </div>
          </section>
        </ContainerScrollAnimation>

        {/* FAQ CTA Section - Enhanced with Scroll Animation */}
        <ContainerScrollAnimation direction="up" speed="normal">
          <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
            {/* Minimal ambient lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-4xl relative">
              <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700">
                <div className="p-8 sm:p-12 md:p-16 text-center">
                  <div className="inline-flex items-center gap-3 bg-primary/8 border border-primary/15 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-primary tracking-wide">Quick Help</span>
                  </div>

                  <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 sm:mb-8 tracking-tight leading-[0.9]">
                    <TextGenerateEffect
                      words="Looking for Quick"
                      className="block"
                      duration={1.5}
                    />
                    <TextGenerateEffect
                      words="Answers?"
                      className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent"
                      duration={1.5}
                    />
                  </div>

                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 md:mb-12 font-light px-4 sm:px-0">
                    Check out our FAQ section for instant answers to common questions about WordPress, No-Code training, and our programs.
                  </p>

                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 sm:px-10 md:px-12 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-semibold border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-primary/10"
                    asChild
                  >
                    <a href="/faq" className="flex items-center gap-2">
                      <span>Visit FAQ</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </Button>
                </div>
              </WobbleCard>
            </div>
          </section>
        </ContainerScrollAnimation>
      </div>
    </FollowingPointer>
  );
};

export default Contact;
