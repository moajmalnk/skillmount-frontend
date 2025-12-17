import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldAlert, Save, Loader2, Star, UserCircle, Briefcase, Trophy,
  Mail, Phone, MapPin, Calendar, GraduationCap, Globe, Github, Linkedin,
  X, CheckCircle2, AlertTriangle,
  UserIcon
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User, Student } from "@/types/user";
import { userService } from "@/services/userService";
import { formatBatchForDisplay } from "@/lib/batches";

// Import Editor Components
import { ProfileBasicForm } from "./profile-editor/ProfileBasicForm";
import { ProfileProjectsManager } from "./profile-editor/ProfileProjectsManager";
import { ProfileAffiliateForm } from "./profile-editor/ProfileAffiliateForm";
import { ProfileTutorForm } from "./profile-editor/ProfileTutorForm";

interface UserDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  type: "student" | "tutor" | "affiliate";
}

export const UserDetailSheet = ({ isOpen, onClose, user, type }: UserDetailSheetProps) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  // Local state to track status changes instantly without refetching parent
  const [currentStatus, setCurrentStatus] = useState<string>(user?.status || "Active");

  // Reset form and status when user changes
  useEffect(() => {
    if (user) {
      setFormData(user);
      setCurrentStatus(user.status as any);
    }
  }, [user, type]);

  if (!user) return null;

  const userData = formData as any;

  // --- SAVE PROFILE HANDLER ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userService.update(user.id, formData);
      toast.success("Profile Updated Successfully");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // --- FORM UPDATE HELPER ---
  const handleUpdate = (updates: Partial<User>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // --- SUSPEND / ACTIVATE LOGIC ---
  const handleStatusChange = async (newStatus: "Active" | "Suspended") => {
    try {
      // API Call
      await userService.update(user.id, { status: newStatus });

      // Update Local State
      setCurrentStatus(newStatus as any);
      setIsSuspendDialogOpen(false);

      // Feedback
      if (newStatus === 'Suspended') {
        toast.error("User Suspended", { description: "Access has been revoked." });
      } else {
        toast.success("User Activated", { description: "Access restored successfully." });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        {/* Added [&>button]:hidden to hide the default X close button provided by SheetPrimitive */}
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col [&>button]:hidden">

          {/* --- CUSTOM HEADER --- */}
          <div className="bg-muted/30 p-6 border-b border-border/50">
            <SheetHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex flex-row items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5">
                  <SheetTitle className="text-xl leading-none">{user.name}</SheetTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="font-mono text-xs bg-background">
                      {user.regId || user.id}
                    </Badge>
                    <Badge
                      variant={currentStatus === 'Active' ? 'default' : 'destructive'}
                      className={currentStatus === 'Active' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {currentStatus}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-muted-foreground">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons Group (Save & Close) */}
              <div className="flex items-center gap-2">
                {/* <Button size="sm" onClick={handleSave} disabled={isSaving} className="hidden sm:flex">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="ml-2">Save</span>
                </Button> */}
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </SheetHeader>
          </div>

          {/* --- CONTENT AREA --- */}
          <ScrollArea className="flex-1 bg-background/50">
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 pt-4 sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border/40">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                  {type === 'student' && <TabsTrigger value="projects">Projects</TabsTrigger>}
                </TabsList>
              </div>

              <div className="p-6 space-y-6">
                {/* === TAB 1: OVERVIEW === */}
                <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {type === 'student' && (
                    <Card className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30 shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">Showcase Status</h4>
                            <p className="text-xs text-amber-700/80 dark:text-amber-400">Manage public visibility</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <Switch
                              checked={(formData as any).isTopPerformer}
                              onCheckedChange={(val) => handleUpdate({ isTopPerformer: val } as any)}
                            />
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Top Performer</Label>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <Switch
                              checked={(formData as any).isFeatured}
                              onCheckedChange={(val) => handleUpdate({ isFeatured: val } as any)}
                            />
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Graduate</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {type === 'student' ? (
                        <>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Academic Info
                          </h4>
                          <Card>
                            <CardContent className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Batch</div>
                                <div className="font-medium text-right">{formatBatchForDisplay(userData.batch)}</div>
                                <div className="text-muted-foreground">Mentor</div>
                                <div className="font-medium text-right">{userData.mentor || "Not Assigned"}</div>
                                <div className="text-muted-foreground">Coordinator</div>
                                <div className="font-medium text-right">{userData.coordinator || "Not Assigned"}</div>
                                <div className="text-muted-foreground">Joined On</div>
                                <div className="font-medium text-right">{new Date(userData.createdAt).toLocaleDateString()}</div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      ) : type === 'affiliate' ? (
                        <>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Affiliate Stats
                          </h4>
                          <Card className="bg-emerald-50/10 border-emerald-200 shadow-sm">
                            <CardContent className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                                  <p className="text-lg font-bold font-mono text-emerald-600">₹{userData.totalEarnings || "0.00"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Referrals</p>
                                  <p className="text-lg font-bold font-mono text-emerald-600">{userData.totalReferrals || 0}</p>
                                </div>
                                <div className="col-span-2 p-2 bg-background rounded border">
                                  <p className="text-xs text-muted-foreground">Coupon Code</p>
                                  <p className="text-sm font-mono font-bold tracking-wider">{userData.couponCode || "N/A"}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <UserIcon className="w-4 h-4" /> Personal Details
                      </h4>
                      <Card>
                        <CardContent className="p-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-muted-foreground"><Mail className="w-3 h-3 mr-2" /> Email</span>
                            <span className="font-medium">{userData.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-muted-foreground"><Phone className="w-3 h-3 mr-2" /> Phone</span>
                            <span className="font-medium">{userData.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-muted-foreground"><Calendar className="w-3 h-3 mr-2" /> DOB</span>
                            <span className="font-medium">{userData.dob || "N/A"}</span>
                          </div>
                          <div className="flex items-start justify-between">
                            <span className="flex items-center text-muted-foreground mt-0.5"><MapPin className="w-3 h-3 mr-2" /> Address</span>
                            <span className="font-medium text-right max-w-[150px] leading-tight text-xs">
                              {userData.address} {userData.pincode ? `- ${userData.pincode}` : ""}
                            </span>
                          </div>
                          {type === 'affiliate' && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-muted-foreground"><Phone className="w-3 h-3 mr-2" /> WhatsApp</span>
                              <span className="font-medium">{userData.whatsappNumber || "N/A"}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {type === 'student' ? (
                      <>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Professional Profile
                        </h4>
                        <Card>
                          <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Headline</p>
                                <p className="text-sm font-medium">{userData.headline || "Not set"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Qualification</p>
                                <p className="text-sm font-medium">{userData.qualification || "Not set"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Professional Aim</p>
                              <p className="text-sm italic text-foreground/80">{userData.aim || "No goal set yet."}</p>
                            </div>
                            {userData.skills && userData.skills.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {userData.skills.map((skill: any) => (
                                    <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5 border border-border/50">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    ) : type === 'affiliate' ? (
                      <>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Globe className="w-4 h-4" /> Onboarding Details
                        </h4>
                        <Card>
                          <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Affiliate ID</p>
                                <p className="text-sm font-medium font-mono">{userData.regId || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Qualification</p>
                                <p className="text-sm font-medium">{userData.qualification || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Platform</p>
                                <p className="text-sm font-medium">{userData.platform || "N/A"}</p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">Domain / Website</p>
                                {userData.domain ? (
                                  <a href={userData.domain} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
                                    {userData.domain}
                                  </a>
                                ) : (
                                  <p className="text-sm font-medium text-muted-foreground">N/A</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : null}
                  </div>

                  {userData.socials && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {userData.socials.website && (
                        <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                          <a href={userData.socials.website} target="_blank" rel="noreferrer">
                            <Globe className="w-3.5 h-3.5" /> Portfolio
                          </a>
                        </Button>
                      )}
                      {userData.socials.linkedin && (
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-blue-600 hover:text-blue-700" asChild>
                          <a href={userData.socials.linkedin} target="_blank" rel="noreferrer">
                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                        </Button>
                      )}
                      {userData.socials.github && (
                        <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                          <a href={userData.socials.github} target="_blank" rel="noreferrer">
                            <Github className="w-3.5 h-3.5" /> GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* === TAB 2: EDIT PROFILE === */}
                <TabsContent value="profile" className="mt-0">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <UserCircle className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide font-semibold">Update Information</span>
                  </div>
                  {type === 'student' ? (
                    <ProfileBasicForm
                      data={formData as any}
                      onChange={(u) => handleUpdate(u as any)}
                    />
                  ) : type === 'affiliate' ? (
                    <ProfileAffiliateForm
                      data={formData as any}
                      onChange={(u) => handleUpdate(u as any)}
                    />
                  ) : type === 'tutor' ? (
                    <ProfileTutorForm
                      data={formData as any}
                      onChange={(u) => handleUpdate(u as any)}
                    />
                  ) : null}
                </TabsContent>

                {/* === TAB 3: PROJECTS === */}
                {type === 'student' && (
                  <TabsContent value="projects" className="mt-0">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide font-semibold">Manage Portfolio Projects</span>
                    </div>
                    <ProfileProjectsManager
                      projects={userData.projects || []}
                      onChange={(projects) => handleUpdate({ projects } as any)}
                    />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </ScrollArea>

          {/* --- FOOTER (Actions) --- */}
          <SheetFooter className="p-6 border-t border-border/50 bg-background flex flex-col sm:flex-row gap-3 sm:justify-between items-center">

            {/* Functional Suspend/Activate Button */}
            {currentStatus === 'Active' ? (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
                onClick={() => setIsSuspendDialogOpen(true)}
              >
                <ShieldAlert className="w-4 h-4 mr-2" /> Suspend User
              </Button>
            ) : (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                onClick={() => handleStatusChange("Active")}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Activate User
              </Button>
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">Close</Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* --- SUSPENSION CONFIRMATION DIALOG --- */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirm Suspension
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend <strong>{user.name}</strong>?
              <br /><br />
              This will immediately:
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                <li>Block access to their dashboard</li>
                <li>Hide their public portfolio</li>
                <li>Prevent them from logging in</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusChange("Suspended")}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};