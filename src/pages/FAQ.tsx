import { useState, useEffect, useRef } from "react";
import { faqService } from "@/services/faqService";
import { FAQ } from "@/types/faq";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";

// Import Reusable Sections with alias paths
import { FAQHero } from "@/components/faq/FAQHero";
import { FAQCategories } from "@/components/faq/FAQCategories";
import { FAQList } from "@/components/faq/FAQList";
import { FAQCTA } from "@/components/faq/FAQCTA";

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to target the FAQ List section for scrolling
  const faqListRef = useRef<HTMLDivElement>(null);

  // Fetch Data from Service
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        const data = await faqService.getAll();
        setFaqs(data);
      } catch (error) {
        console.error("Failed to fetch FAQs", error);
      } finally {
        setIsLoading(false);
        setIsVisible(true);
      }
    };

    fetchFaqs();
  }, []);

  // Handler for category selection with smooth scrolling
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Add a small delay to ensure state updates and DOM settles before scrolling
    setTimeout(() => {
      if (faqListRef.current) {
        const headerOffset = 100; // Adjust based on your Navbar height (approx 80px + padding)
        const elementPosition = faqListRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 50);
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  // Filter FAQs based on search and category
  const filteredFaqs = Object.entries(groupedFaqs)
    .map(([category, questions]) => ({
      category,
      questions: questions.filter(
        faq =>
          (selectedCategory === "all" || category === selectedCategory) &&
          (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter(category => category.questions.length > 0);

  // Category statistics for the badge grid
  const categoryStats = Object.entries(groupedFaqs).map(([category, questions]) => ({
    category,
    count: questions.length
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>/g, '')
      }
    }))
  };

  return (
    <FollowingPointer>
      <SEO
        title="FAQ - WordPress & No-Code Development Questions | SkillMount"
        description="Find answers to common questions about WordPress, Elementor, Divi, WooCommerce, and No-Code development. Expert guidance for beginners and professionals."
        keywords="WordPress FAQ, Elementor questions, Divi help, WooCommerce setup, No-Code development, CMS training, web development help, SkillMount support"
        url="https://moajmalnk.in/faq"
        image="https://moajmalnk.in/assets/img/logo/logo-lightaj.png"
        author="Mohammed Ajmal NK"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        
        {/* 1. Hero Section */}
        <FAQHero 
          isVisible={isVisible} 
          totalFAQs={faqs.length} 
          categoryCount={categoryStats.length} 
        />

        {/* 2. Category Navigation */}
        {/* We pass handleCategoryChange instead of setSelectedCategory directly */}
        <FAQCategories 
          selectedCategory={selectedCategory} 
          setSelectedCategory={handleCategoryChange} 
          categoryStats={categoryStats}
          totalFAQs={faqs.length}
        />

        {/* 3. FAQ Content List */}
        {/* Wrapped in a div with ref to serve as scroll target */}
        <div ref={faqListRef} className="scroll-mt-24">
          <FAQList 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange} // Also pass here if the list has internal category switching
            filteredFaqs={filteredFaqs}
            isLoading={isLoading}
          />
        </div>

        {/* 4. Bottom CTA */}
        <FAQCTA />

      </div>
    </FollowingPointer>
  );
};

export default FAQPage;