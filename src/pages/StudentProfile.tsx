import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle, Pencil } from "lucide-react";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { Student } from "@/types/user";

// Import Modular Components
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileSkills } from "@/components/profile/ProfileSkills";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileProjects } from "@/components/profile/ProfileProjects";
import { ProfileContact } from "@/components/profile/ProfileContact";
import { ProfileExperience } from "@/components/profile/ProfileExperience";
// Import Editor Modal (reuse admin component)
import { ProfileEditorModal } from "@/components/admin/user/profile-editor/ProfileEditorModal";
import { ChangePasswordDialog } from "@/components/common/ChangePasswordDialog";

const StudentProfile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Enhanced Auth Check
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);



  const fetchStudent = async () => {
    // Keep loading state minimal for re-fetches
    if (!student) setIsLoading(true);
    try {
      if (!id) return;
      const user = await userService.getById(id);
      if (user && user.role === 'student') {
        setStudent(user as Student);
      }
    } catch (error) {
      console.error("Failed to load student", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);



  const canEdit = currentUser && student && (currentUser.id === student.id || currentUser.role === 'super_admin');

  if (isLoading && !student) { // Only show full loader if no student data yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Student Not Found</h1>
        <p className="text-muted-foreground">The student profile you are looking for does not exist.</p>
        <Link to="/students" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  // SEO Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": student.name,
    "description": student.bio || `Portfolio of ${student.name}`,
    "url": student.socials?.website || window.location.href,
    "jobTitle": student.headline || "Student",
    "worksFor": {
      "@type": "Organization",
      "name": "SkillMount"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "SkillMount Training Institute"
    }
  };

  return (
    <FollowingPointer>
      <SEO
        title={`${student.name} - Student Portfolio | SkillMount`}
        description={student.bio || `Check out ${student.name}'s portfolio on SkillMount.`}
        url={window.location.href}
        image={student.avatar || "https://moajmalnk.in/assets/img/logo/logo-lightaj.png"}
        author={student.name}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background relative">
        {/* Professional Background Layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.02]" style={{ backgroundImage: 'url("/tutor-hero.jpg")', backgroundAttachment: 'fixed' }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-background/95"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/70"></div>
          <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          {/* Navigation & Actions */}
          <div className="pt-18 sm:pt-24 mb-4 flex flex-row items-center justify-between gap-2 max-w-6xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
            <Link
              to="/students"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm sm:text-base font-medium">Back to Students</span>
            </Link>

            {canEdit && (
              <div className="flex gap-2">
                <ChangePasswordDialog />
                <Button onClick={() => setIsEditModalOpen(true)} className="shadow-lg">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Sections - Each handles its own visibility */}
          <ProfileHero student={student} />
          <ProfileExperience experience={student.experience} />
          <ProfileSkills skills={student.skills} />
          <ProfileAchievements achievements={student.achievements} />
          <ProfileProjects projects={student.projects} />
          <ProfileContact student={student} />

        </div>
      </div>

      {/* Profile Editor Modal */}
      {canEdit && (
        <ProfileEditorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            fetchStudent(); // Refresh data on close
          }}
          student={student}
        />
      )}
    </FollowingPointer>
  );
};

export default StudentProfile;