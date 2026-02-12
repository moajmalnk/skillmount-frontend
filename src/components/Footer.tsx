import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Instagram, Youtube, MessageCircle, Palette, Bookmark, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await api.post('/newsletter/subscribe/', { email });
      if (response.data.message && response.data.message.toLowerCase().includes("already")) {
        toast.info(response.data.message);
      } else {
        setIsSubmitted(true);
        toast.success("Successfully subscribed!");
        setEmail("");

        // Celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Failed to subscribe.";
      if (msg.toLowerCase().includes("already subscribed")) {
        toast.info(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigation = {
    learn: [
      { name: "Home", href: "/" },
      { name: "Students", href: "/students" },
      { name: "Materials", href: "/materials" },
      { name: "Documentation", href: "/materials" },
      { name: "FAQ", href: "/faq" },
    ],
    resources: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Use", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Admin Portal", href: "/admin" },
      { name: "Blog", href: "/blog" },
    ],
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/moajmalnk/",
      icon: Linkedin,
      ariaLabel: "Follow us on LinkedIn",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/moajmalnk",
      icon: Twitter,
      ariaLabel: "Follow us on Twitter",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/moajmalnk",
      icon: Instagram,
      ariaLabel: "Follow us on Instagram",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@moajmalnk",
      icon: Youtube,
      ariaLabel: "Subscribe to our YouTube channel",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/918848676627",
      icon: MessageCircle,
      ariaLabel: "Contact us on WhatsApp",
    },
    {
      name: "Behance",
      href: "https://behance.net/moajmalnk",
      icon: Palette,
      ariaLabel: "View our work on Behance",
    },
    {
      name: "Pinterest",
      href: "https://pinterest.com/moajmalnk",
      icon: Bookmark,
      ariaLabel: "Follow us on Pinterest",
    },
    {
      name: "GitHub",
      href: "https://github.com/moajmalnk",
      icon: Github,
      ariaLabel: "Follow us on GitHub",
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "moajmalnk@gmail.com",
      href: "mailto:moajmalnk@gmail.com",
      ariaLabel: "Email Mohammed Ajmal NK",
    },
    {
      icon: Phone,
      text: "+91 8848676627",
      href: "tel:+918848676627",
      ariaLabel: "Call Mohammed Ajmal NK",
    },
    {
      icon: MapPin,
      text: "Malappuram, Kerala, 676507, India",
      href: "https://maps.app.goo.gl/xXXk5xmhdcvLfB2m9",
      ariaLabel: "Visit our location",
    },
  ];

  return (
    <footer
      className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-20"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Schema.org Organization markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "moajmalnk.in",
            description: "Empowering students to build exceptional web development skills",
            url: "https://moajmalnk.in",
            logo: "https://moajmalnk.in/assets/img/logo/logo-lightaj.png",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91 8848676627",
              contactType: "Customer Service",
              email: "moajmalnk@gmail.com",
            },
            sameAs: [
              "https://www.linkedin.com/in/moajmalnk/",
              "https://x.com/moajmalnk",
              "https://instagram.com/moajmalnk",
              "https://youtube.com/@moajmalnk",
              "https://wa.me/918848676627",
              "https://github.com/moajmalnk",
              "https://www.behance.net/moajmalnk",
              "https://pinterest.com/moajmalnk",
            ],
          }),
        }}
      />

      <div className="container mx-auto px-4 py-12 sm:py-16 lg:px-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-12">
          {/* Brand Section - Card Style */}
          <div className="xl:col-span-5 lg:col-span-6">
            <div className="group">
              <Link
                to="/"
                className="inline-block mb-6 transition-transform duration-300 hover:scale-105"
                aria-label="moajmalnk.in home"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  moajmalnk.in
                </h2>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-lg">
                Empowering the next generation of developers through innovative learning,
                collaborative projects, and real-world experience.
              </p>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {contactInfo.map((item) => (
                  <a
                    key={item.text}
                    href={item.href}
                    className="flex items-center gap-3 group/contact p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-md"
                    aria-label={item.ariaLabel}
                  >
                    <div className="flex-shrink-0">
                      <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-500 group-hover/contact:text-primary transition-colors" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover/contact:text-gray-900 dark:group-hover/contact:text-gray-200 transition-colors">
                      {item.text}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Grid - Card Style */}
          <div className="xl:col-span-7 lg:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* Learn Section - Responsive columns */}
              <div className="col-span-1 lg:col-span-3 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Learn
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {navigation.learn.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="group/link inline-flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                      >
                        <span className="group-hover/link:translate-x-1 transition-transform duration-200">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Section - Responsive columns */}
              <div className="col-span-1 lg:col-span-3 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="group/link inline-flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                      >
                        <span className="group-hover/link:translate-x-1 transition-transform duration-200">
                          {item.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community Card - Responsive columns */}
              <div className="col-span-2 lg:col-span-6 p-1 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg relative overflow-hidden group/newsletter">
                <div className="absolute inset-0 bg-white dark:bg-gray-900 m-[1px] rounded-[11px] z-0" />
                <div className="relative z-10 p-5 sm:p-6 flex flex-col h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl">
                  <div className="flex-1 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Stay ahead of the curve
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Join our newsletter for exclusive coding tips, new course announcements, and tech insights delivered to your inbox.
                    </p>
                  </div>

                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || isSubmitted}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || isSubmitted}
                      className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitted
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/25 text-white dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:to-gray-200"
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isSubmitted ? (
                        <>
                          <span>Subscribed</span>
                          <Check className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Subscribe Now</span>
                          <ArrowRight className="w-4 h-4 group-hover/newsletter:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-[10px] text-gray-500 mt-3 text-center">
                    No spam, unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Copyright */}
            <div className="lg:col-span-6 text-sm text-gray-600 dark:text-gray-400">
              <p>
                &copy; {currentYear}{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  SkillMount Educational - moajmalnk.in
                </span>
                . All rights reserved.
              </p>
              <p className="mt-1 text-xs">
                Crafted with passion for learning and innovation.
              </p>
            </div>

            {/* Social Links */}
            <div className="lg:col-span-6 flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-300"
                  aria-label={social.ariaLabel}
                >
                  <social.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </footer>
  );
};

export default Footer;
