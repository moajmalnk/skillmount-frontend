import { formatBatchForDisplay } from "@/lib/batches";

export const stats = {
  totalStudents: "1000+",
  batchesCompleted: "12+",
  successRate: "95%",
  placementSuccess: "Proven"
};

export const topPerformers = [
  {
    id: 1,
    name: "Alex Johnson",
    batchId: "0925",
    domain: "https://moajmalnk.in",
    github: "https://github.com/alexj",
    email: "alex@example.com",
    phone: "+1234567890",
    skills: ["WordPress", "Elementor", "WooCommerce"],
    isTopPerformer: true
  },
  {
    id: 2,
    name: "Sarah Williams",
    batchId: "0925",
    domain: "https://moajmalnk.in",
    github: "https://github.com/sarahw",
    email: "sarah@example.com",
    phone: "+1234567890",
    skills: ["Custom Theme Design", "SEO Optimization", "Speed Optimization"],
    isTopPerformer: true
  },
  {
    id: 3,
    name: "Michael Chen",
    batchId: "0825",
    domain: "https://moajmalnk.in",
    email: "michael@example.com",
    phone: "+1234567890",
    skills: ["Gutenberg", "E-commerce", "Security & Backup"],
    isTopPerformer: true
  },
  {
    id: 4,
    name: "Emma Davis",
    batchId: "0925",
    domain: "https://moajmalnk.in",
    github: "https://github.com/emmad",
    email: "emma@example.com",
    phone: "+1234567890",
    skills: ["WordPress", "Accessibility", "E-commerce"],
    isTopPerformer: true
  },
].map(student => ({
  ...student,
  batch: formatBatchForDisplay(student.batchId)
}));

export const latestBatchStudents = [
  {
    id: 5,
    name: "John Doe",
    batchId: "0925",
    domain: "https://moajmalnk.in",
    skills: ["WordPress", "WooCommerce"]
  },
  {
    id: 6,
    name: "Jane Smith",
    batchId: "0925",
    domain: "https://moajmalnk.in",
    skills: ["WordPress", "SEO Optimization"]
  },
  {
    id: 7,
    name: "Jane Smith",
    batchId: "0925",
    domain: "https://moajmalnk.in",
    skills: ["WordPress", "SEO Optimization"]
  },
  {
    id: 8,
    name: "Jane Smith",
    batchId: "0925",
    skills: ["WordPress", "Elementor", "SEO Optimization"]
  }
].map(student => ({
  ...student,
  batch: formatBatchForDisplay(student.batchId)
}));

export const faqs = [
  {
    question: "What No-Code and CMS platforms do you teach?",
    answer: "We specialize in WordPress, Elementor, WooCommerce, Webflow, Shopify, and other popular No-Code platforms. Our curriculum focuses on practical, job-ready skills."
  },
  {
    question: "Do I need coding experience to join?",
    answer: "Not at all! Our courses are designed for beginners. We start with the basics and progressively build your skills to professional levels."
  },
  {
    question: "What is the duration of the training program?",
    answer: "Our monthly batch programs typically run for 4-6 weeks, with intensive hands-on training and real-world project work."
  },
  {
    question: "Do you provide placement assistance?",
    answer: "Yes! We have a proven track record of successful placements with a 95% success rate. We also guide students in freelancing and entrepreneurship opportunities."
  },
  {
    question: "Is the course online or offline?",
    answer: "We offer flexible learning modes including online live classes and hybrid options to suit different learning preferences and schedules."
  },
  {
    question: "Will I get hands-on project experience?",
    answer: "Absolutely! Every student works on multiple real-world projects and builds a professional portfolio website to showcase their skills."
  },
  {
    question: "What support is available after course completion?",
    answer: "We provide lifetime access to course materials, ongoing mentorship, community support, and assistance with portfolio updates and job applications."
  }
];

export const testimonials = [
  {
    quote: "SkillMount's WordPress training was exceptional. Mohammed Ajmal's teaching style made complex concepts easy to understand. Now I'm running my own web development agency!",
    name: "Mubarak",
    role: "Founder @Mac Ads"
  },
  {
    quote: "From zero coding knowledge to building professional e-commerce sites in just 6 weeks! The hands-on approach and project-based learning were game-changers for me.",
    name: "Rashida",
    role: "Digital Marketing Specialist @ SkillMount"
  },
  {
    quote: "The No-Code curriculum and personalized mentorship helped me land my dream job within 2 weeks of completing the course. Forever grateful to SkillMount! Mohammed Ajmal NK",
    name: "Murshid paravath",
    role: "CEO @ InMark Media"
  }
];