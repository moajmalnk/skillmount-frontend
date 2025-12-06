import { useState, useEffect } from "react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter 
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  ShieldAlert, Save, Loader2, Star, UserCircle, Briefcase, Trophy
} from "lucide-react";
import { toast } from "sonner";
import { User, Student } from "@/types/user";
import { userService } from "@/services/userService";

// Import Editor Components
import { ProfileBasicForm } from "./profile-editor/ProfileBasicForm";
import { ProfileProjectsManager } from "./profile-editor/ProfileProjectsManager";

interface UserDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  type: "student" | "tutor" | "affiliate";
}

export const UserDetailSheet = ({ isOpen, onClose, user, type }: UserDetailSheetProps) => {
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    if (user && type === 'student') {
        setFormData(user as Student);
    }
  }, [user, type]);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await userService.update(user.id, formData);
        toast.success("Profile Updated Successfully");
        onClose(); // Optional: close on save or keep open
    } catch (error) {
        toast.error("Failed to save changes");
    } finally {
        setIsSaving(false);
    }
  };

  const handleUpdate = (updates: Partial<Student>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <SheetHeader className="flex flex-row items-start gap-4 space-y-0">
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <SheetTitle className="text-xl">{user.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{user.regId}</span>
                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] h-5">
                  {user.status}
                </Badge>
              </SheetDescription>
            </div>
            {/* Quick Save Button in Header */}
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Save Changes</span>
            </Button>
          </SheetHeader>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
            <Tabs defaultValue="overview" className="w-full">
                <div className="px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-6">
                    {/* TAB 1: OVERVIEW & ADMIN CONTROLS */}
                    <TabsContent value="overview" className="space-y-6 mt-0">
                        {type === 'student' && (
                            <div className="space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30">
                                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                    <Star className="w-4 h-4" /> Showcase Settings
                                </h4>
                                
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Top Performer</Label>
                                        <p className="text-xs text-muted-foreground">Highlight in "Elite Showcase"</p>
                                    </div>
                                    <Switch 
                                        checked={formData.isTopPerformer}
                                        onCheckedChange={(val) => handleUpdate({ isTopPerformer: val })}
                                    />
                                </div>
                                <Separator className="bg-amber-200/30" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Featured Graduate</Label>
                                        <p className="text-xs text-muted-foreground">Show in "Latest Graduates"</p>
                                    </div>
                                    <Switch 
                                        checked={formData.isFeatured}
                                        onCheckedChange={(val) => handleUpdate({ isFeatured: val })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Email</span>
                                <p className="text-sm font-medium">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Phone</span>
                                <p className="text-sm font-medium">{user.phone}</p>
                            </div>
                            {(user as Student).batch && (
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Batch</span>
                                    <p className="text-sm font-medium">{(user as Student).batch}</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* TAB 2: PROFILE EDITOR */}
                    <TabsContent value="profile" className="mt-0">
                        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                            <UserCircle className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wide font-semibold">Basic Information</span>
                        </div>
                        <ProfileBasicForm 
                            data={formData} 
                            onChange={handleUpdate} 
                        />
                    </TabsContent>

                    {/* TAB 3: PROJECTS */}
                    <TabsContent value="projects" className="mt-0">
                        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wide font-semibold">Portfolio Projects</span>
                        </div>
                        <ProfileProjectsManager 
                            projects={formData.projects || []} 
                            onChange={(projects) => handleUpdate({ projects })} 
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="p-6 border-t border-border/50 bg-background flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button variant="outline" className="text-destructive border-destructive/30">
            <ShieldAlert className="w-4 h-4 mr-2" /> Block User
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};