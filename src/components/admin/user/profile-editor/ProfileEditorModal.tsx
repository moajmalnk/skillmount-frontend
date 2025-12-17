import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Save } from "lucide-react";
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
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Student Profile</DialogTitle>
              <DialogDescription>
                Updating profile for <span className="font-medium text-foreground">{student.name}</span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${student.isProfileComplete ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                {student.isProfileComplete ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4 border-b bg-muted/20">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="basic">Personal & Academic</TabsTrigger>
                <TabsTrigger value="projects">Projects & Portfolio</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <ProfileBasicForm
                  data={formData}
                  onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                />
              </TabsContent>

              <TabsContent value="projects" className="mt-0 h-full">
                <ProfileProjectsManager
                  projects={formData.projects || []}
                  onChange={(updatedProjects) => setFormData(prev => ({ ...prev, projects: updatedProjects }))}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-32">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};