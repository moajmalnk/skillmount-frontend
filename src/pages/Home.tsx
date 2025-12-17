import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { userService } from "@/services/userService";
import { systemService } from "@/services/systemService";
import { Student } from "@/types/user";

// Import Sections
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { TopPerformersSection } from "@/components/home/TopPerformersSection";
import { LatestGraduatesSection } from "@/components/home/LatestGraduatesSection";
import { BatchesSummarySection } from "@/components/home/BatchesSummarySection";
import { FAQSection } from "@/components/home/FAQSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { MaterialsPreviewSection } from "@/components/home/MaterialsPreviewSection";
import { CTASection } from "@/components/home/CTASection";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [topPerformers, setTopPerformers] = useState<Student[]>([]);
  const [latestGraduates, setLatestGraduates] = useState<Student[]>([]);
  const [totalStudentCount, setTotalStudentCount] = useState(0);

  // FIXED: State for Batch Data
  const [batchData, setBatchData] = useState({
    count: 0,
    latestBatch: "",
    oldestBatch: ""
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [publicUsers, settings] = await Promise.all([
          userService.getPublicDirectory(),
          systemService.getSettings()
        ]);

        // Mapping is now simpler as PublicStudentSerializer returns flattened structure
        const students = publicUsers.map((u: any) => ({
          ...u,
          id: u.id,
          name: u.name,
          email: "hidden", // Public endpoint hides this
          avatar: u.avatar,

          // Backend Public Serializer returns these flattened:
          batch: u.batch || "Unassigned",
          isTopPerformer: u.is_top_performer || false,
          isFeatured: u.is_featured_graduate || false,
          skills: u.skills || [],
          socials: u.socials || {},

          createdAt: u.date_joined || new Date().toISOString()
        })) as Student[];

        setTotalStudentCount(students.length);

        // --- FIXED BATCH COUNT LOGIC ---
        // Ensure we get the array from settings, default to empty if undefined
        const batches = settings.batches || [];

        setBatchData({
          count: batches.length, // This comes directly from systemService
          latestBatch: batches[0] || "Present",
          oldestBatch: batches[batches.length - 1] || "Start"
        });

        // Filter Top Performers
        const top = students.filter(s => s.isTopPerformer);
        setTopPerformers(top);

        // Filter Latest Graduates
        const latest = students.filter(s => s.isFeatured);
        const finalLatest = latest.length > 0
          ? latest
          : students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

        setLatestGraduates(finalLatest);

      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setIsLoading(false);
        setIsVisible(true);
      }
    };

    fetchData();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "SkillMount",
    "description": "Professional WordPress and No-Code training institute led by Mohammed Ajmal NK",
    "url": "https://students.moajmalnk.in",
    "logo": "https://moajmalnk.in/assets/img/logo/logo-lightaj.png",
    "founder": {
      "@type": "Person",
      "name": "Mohammed Ajmal NK",
      "url": "https://moajmalnk.in"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1000"
    }
  };

  return (
    <FollowingPointer>
      <SEO
        title="SkillMount Students - WordPress & No-Code Training Success Stories"
        description="Explore success stories of 1000+ students trained in WordPress, Elementor, WooCommerce, and No-Code platforms."
        url="https://moajmalnk.in"
        image="https://moajmalnk.in/assets/img/logo/logo-lightaj.png"
        author="Mohammed Ajmal NK"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <HeroSection isVisible={isVisible} />
        <CategorySection />

        <TopPerformersSection
          students={topPerformers}
          isLoading={isLoading}
        />

        <LatestGraduatesSection
          students={latestGraduates}
          isLoading={isLoading}
        />

        {/* Pass isLoading to handle the '0' flash */}
        <BatchesSummarySection
          totalStudents={totalStudentCount}
          totalBatches={batchData.count}
          latestBatch={batchData.latestBatch}
          oldestBatch={batchData.oldestBatch}
          isLoading={isLoading} // Added prop
        />

        <FAQSection />
        <TestimonialsSection />
        <MaterialsPreviewSection />
        <CTASection />
      </div>
    </FollowingPointer>
  );
};

export default Home;