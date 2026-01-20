import { Mail, Phone, MapPin, Linkedin, Twitter, Github, ArrowUpRight, Instagram, Youtube, MessageCircle, Palette, Bookmark, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import emailjs from '@emailjs/browser';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Initialize EmailJS with your public key
      emailjs.init("XnkADMxHCOVMe5hAR");

      // Template parameters for EmailJS
      const currentDate = new Date();
      const templateParams = {
        to_email: "moajmalnk@gmail.com",
        from_email: email,
        reply_to: email,
        subject: "🎉 New Newsletter Subscription - moajmalnk.in",
        current_date: currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timestamp: currentDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        website_url: "https://moajmalnk.in",
        source_location: "Footer Newsletter Subscription"
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        'service_p8dpik5',
        'template_fmcrx97',
        templateParams
      );

      if (response.status === 200) {
        setIsSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSuccess(false);
          setEmail("");
        }, 3000);
      } else {
        throw new Error('Failed to send email');
      }

    } catch (err) {
      console.error('EmailJS Error:', err);
      setError("Failed to send subscription request. Please try again or contact us directly at moajmalnk@gmail.com");
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setError("");
    setIsSuccess(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail("");
    setError("");
    setIsSuccess(false);
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

              {/* Newsletter Card - Responsive columns */}
              <div className="col-span-2 lg:col-span-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Newsletter
                </h3>
                <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Stay Updated
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Get the latest updates on new courses and features.
                      </p>
                    </div>
                    <button
                      onClick={openModal}
                      className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 text-xs sm:text-sm font-medium flex-shrink-0"
                      aria-label="Subscribe to newsletter"
                    >
                      <span>Subscribe</span>
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
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

      {/* Newsletter Subscription Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Subscribe to Newsletter
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get updates on new courses and features
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Successfully Subscribed!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your subscription request has been sent to moajmalnk@gmail.com. You'll be added to our newsletter list soon!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-colors"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Subscribe
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Your email will be sent to{" "}
                      <span className="font-medium text-primary">moajmalnk@gmail.com</span>{" "}
                      for subscription processing.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )
      }
    </footer >
  );
};

export default Footer;
