import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

// Import the sub-components we built earlier
import { ProfileBasicForm } from "./ProfileBasicForm";
import { ProfileProjectsManager } from "./ProfileProjectsManager";

// Services & Types
import { userService } from "@/services/userService";
import { Student } from "@/types/user";

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const ProfileEditorModal = ({ isOpen, onClose, student }: ProfileEditorModalProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  // Extended State to hold File objects
  const [formData, setFormData] = useState<Partial<Student> & { resumeFile?: File }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load student data when modal opens
  useEffect(() => {
    if (student) {
      setFormData(JSON.parse(JSON.stringify(student))); // Deep copy to avoid direct mutation
    }
  }, [student, isOpen]);

  const handleSave = async () => {
    if (!student || !formData) return;

    setIsSaving(true);
    try {
      // Pass the extended form data (including resumeFile) to userService
      await userService.update(student.id, formData);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-admin-uniform">

        {/* Header */}
        <DialogHeader className="modal-header-standard border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">Edit Student Profile</DialogTitle>
              <DialogDescription>
                Updating profile for <span className="font-semibold text-foreground">{student.name}</span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={student.isProfileComplete ? "default" : "secondary"} className={student.isProfileComplete ? "bg-green-600" : ""}>
                {student.isProfileComplete ? "Profile Complete" : "Profile Incomplete"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 pt-4 border-b bg-muted/20">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="basic" className="text-xs uppercase font-bold tracking-tight">Basic Info</TabsTrigger>
                <TabsTrigger value="projects" className="text-xs uppercase font-bold tracking-tight">Portfolio</TabsTrigger>
              </TabsList>
            </div>

            <div className="modal-body-standard !p-8">
              <TabsContent value="basic" className="mt-0 space-y-6">
                <ProfileBasicForm
                  data={formData}
                  onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                />
              </TabsContent>

              <TabsContent value="projects" className="mt-0 space-y-6">
                <ProfileProjectsManager
                  projects={formData.projects || []}
                  onChange={(updatedProjects) => setFormData(prev => ({ ...prev, projects: updatedProjects }))}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <DialogFooter className="modal-footer-standard px-6 py-4 bg-muted/5">
          <Button variant="ghost" onClick={onClose} disabled={isSaving} className="px-8 font-medium">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="px-10 font-semibold shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};