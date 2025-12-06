import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { Loader2 } from "lucide-react";

// Data Services
import { userService } from "@/services/userService";
import { Student } from "@/types/user";
import { formatBatchForDisplay } from "@/lib/batches";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch raw student data from service
        const rawData = await userService.getElementsByRole("student") as Student[];
        
        // 2. Transform data for the UI (StudentCard expects specific props)
        const formattedData = rawData.map(s => ({
          ...s,
          // Map technical batch ID (e.g., "0925") to Display Name (e.g., "Sep 2025")
          batch: formatBatchForDisplay(s.batch, true),
          batchId: s.batch, // Keep original ID for filtering
          // Map nested socials to top-level for Card if needed, or just ensure Card handles it
          domain: s.socials?.website, 
          github: s.socials?.github,
        }));

        setStudents(formattedData);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setIsLoading(false);
        setIsVisible(true);
      }
    };

    fetchStudents();
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