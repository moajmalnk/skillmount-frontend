import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Data Services
import { userService } from "@/services/userService";
import { Student } from "@/types/user";

// Import Reusable Sections
import { StudentsHero } from "@/components/students/StudentsHero";
import { StudentsFilter } from "@/components/students/StudentsFilter";
import { StudentsGrid } from "@/components/students/StudentsGrid";

// Extended type for UI display
type StudentDisplay = Student & {
  domain?: string;
  github?: string;
  linkedin?: string;
  projectCount: number;
};

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // Debounced search state to prevent excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Data State
  const [students, setStudents] = useState<StudentDisplay[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBatch, selectedSkills]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load settings only once if not loaded
        if (batches.length === 0) {
          import("@/services/systemService").then(async (m) => {
            const settings = await m.systemService.getSettings();
            setBatches(settings.batches || []);
          });
        }

        const data = await userService.getPublicDirectory(
          currentPage,
          pageSize,
          debouncedSearch,
          selectedBatch,
          selectedSkills
        );

        // Handle response format (support both paginated and flat responses)
        let rawResults: Student[] = [];
        let count = 0;

        if (Array.isArray(data)) {
          rawResults = data;
          count = data.length;
        } else if (data && data.results) {
          rawResults = data.results;
          count = data.count || 0;
        }

        setTotalCount(count);

        const formattedData = rawResults.map((s: Student) => ({
          ...s,
          // Ensure skills is always an array to prevent UI crashes
          skills: s.skills || [],
          // batch is already in Student
          // batchId removed as it was for client-side filtering
          domain: s.socials?.website,
          github: s.socials?.github,
          linkedin: s.socials?.linkedin,
          // headline already in Student
          // placement already in Student
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, selectedBatch, selectedSkills.length]); // Trigged when these change

  // Filter Logic Handlers
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedBatch("all");
    setSelectedSkills([]);
    setCurrentPage(1);
  };

  // Pagination Handlers
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "SkillMount Student Directory",
    "description": "Browse portfolios of 1200+ students trained in WordPress and No-Code platforms",
    "url": "https://students.moajmalnk.in/students",
    "numberOfItems": totalCount,
    "itemListElement": students.map((student, index) => ({
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

      <div className="min-h-screen bg-background pb-20">
        <StudentsHero
          isVisible={isVisible}
          filteredCount={totalCount}
        />

        <StudentsFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery} // Updates local state, debounce triggers fetch
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          selectedSkills={selectedSkills}
          toggleSkill={toggleSkill}
          clearFilters={clearFilters}
          filteredCount={students.length} // Showing count on current page (or total filtered?) -> Design usually implies total results found
          totalCount={totalCount} // Total in DB matching queries
          batches={batches}
        />

        {isLoading ? (
          <div className="container mx-auto px-6 max-w-7xl mt-12 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 p-4 rounded-3xl border border-border/50 bg-card/50">
                  <Skeleton className="w-full aspect-square rounded-2xl" />
                  <Skeleton className="h-6 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <StudentsGrid
              students={students}
              clearFilters={clearFilters}
              totalCount={totalCount}
            />

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="container mx-auto px-6 max-w-7xl mt-8 pb-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <span className="flex h-9 min-w-9 items-center justify-center text-sm font-medium px-4">
                        Page {currentPage} of {Math.max(1, totalPages)}
                      </span>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </FollowingPointer>
  );
};

export default Students;