import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { Loader2 } from "lucide-react";

// Data Services
import { userService } from "@/services/userService";
import { Student } from "@/types/user";

// Import Reusable Sections
import { StudentsHero } from "@/components/students/StudentsHero";
import { StudentsFilter } from "@/components/students/StudentsFilter";
import { StudentsGrid } from "@/components/students/StudentsGrid";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Data State
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch System Settings (for Batches) and Raw Data in parallel
        const [settings, rawData] = await Promise.all([
          import("@/services/systemService").then(m => m.systemService.getSettings()),
          userService.getPublicDirectory() as Promise<Student[]>
        ]);

        setBatches(settings.batches || []);

        // 2. Transform data for the UI
        const validData = rawData.filter((s: any) =>
          s.avatar &&
          s.headline &&
          s.bio &&
          s.bio.trim() !== "" &&
          s.headline.trim() !== ""
        );

        const formattedData = validData.map(s => ({
          ...s,
          // Use raw batch string if possible, or format if needed. 
          // Since we are using system batches now, we rely on the string match.
          batch: s.batch,
          batchId: s.batch,

          domain: s.socials?.website,
          github: s.socials?.github,
          linkedin: s.socials?.linkedin,

          headline: s.headline,
          placement: s.placement,
          projectCount: s.projects ? s.projects.length : 0,
        }));

        setStudents(formattedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
        setIsVisible(true);
      }
    };

    fetchData();
  }, []);

  // Filter Logic
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBatch("all");
    setSelectedSkills([]);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatch === "all" || student.batchId === selectedBatch;
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some((skill: string) => student.skills?.includes(skill));

    return matchesSearch && matchesBatch && matchesSkills;
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "SkillMount Student Directory",
    "description": "Browse portfolios of 1200+ students trained in WordPress and No-Code platforms",
    "url": "https://students.moajmalnk.in/students",
    "numberOfItems": filteredStudents.length,
    "itemListElement": filteredStudents.slice(0, 10).map((student, index) => ({
      "@type": "Person",
      "position": index + 1,
      "name": student.name,
      "description": `Student specializing in ${student.skills?.join(", ") || "Web Development"}`,
      "url": student.domain || student.github
    }))
  };

  return (
    <FollowingPointer>
      <SEO
        title="Student Directory - Browse 1200+ WordPress & No-Code Portfolios"
        description="Explore portfolios of talented students trained in WordPress, Elementor, WooCommerce, and No-Code platforms. Filter by batch, skills, and expertise areas."
        url="https://students.moajmalnk.in/students"
        image="https://moajmalnk.in/assets/img/logo/logo-lightaj.png"
        author="Mohammed Ajmal NK"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <StudentsHero
          isVisible={isVisible}
          filteredCount={filteredStudents.length}
        />

        <StudentsFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          selectedSkills={selectedSkills}
          toggleSkill={toggleSkill}
          clearFilters={clearFilters}
          filteredCount={filteredStudents.length}
          totalCount={students.length}
          batches={batches}
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <StudentsGrid
            students={filteredStudents}
            clearFilters={clearFilters}
          />
        )}
      </div>
    </FollowingPointer>
  );
};

export default Students;