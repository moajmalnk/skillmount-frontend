import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter 
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, Phone, MapPin, Calendar, BookOpen, Award, 
  ShieldAlert, KeyRound, ExternalLink, MessageSquare 
} from "lucide-react";
import { toast } from "sonner";

interface UserDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null; // In a real app, define a proper User interface
  type: "student" | "tutor" | "affiliate";
}

export const UserDetailSheet = ({ isOpen, onClose, user, type }: UserDetailSheetProps) => {
  if (!user) return null;

  const handleResetPassword = () => {
    toast.success("Password Reset Email Sent", {
      description: `Instructions sent to ${user.email}`,
    });
  };

  const handleBlockUser = () => {
    toast.error("User Blocked", {
      description: `${user.name} has been suspended.`,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col">
        {/* Header Section */}
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
                  {user.status || "Active"}
                </Badge>
              </SheetDescription>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            
            {/* 1. Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Details</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/50">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/50">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                {user.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/50">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{user.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">Pin: {user.pincode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 2. Academic / Professional Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {type === 'student' ? 'Academic Profile' : 'Professional Profile'}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Student Fields */}
                {type === 'student' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Batch</p>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {user.batch}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mentor</p>
                      <div className="font-medium">{user.mentor || "Not Assigned"}</div>
                    </div>
                  </>
                )}

                {/* Tutor Fields */}
                {type === 'tutor' && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Expertise Topics</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.topic?.split(',').map((t: string) => (
                        <Badge key={t} variant="secondary">{t.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affiliate Fields */}
                {type === 'affiliate' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Platform</p>
                      <div className="font-medium">{user.platform || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Coupon Code</p>
                      <Badge variant="outline" className="font-mono">{user.couponCode || "N/A"}</Badge>
                    </div>
                  </>
                )}
              </div>

              {/* Extended Details (Aim, Bio, etc) */}
              {user.aim && (
                <div className="space-y-1 bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Professional Aim</p>
                  <p className="text-sm italic">"{user.aim}"</p>
                </div>
              )}
              
              {user.domain && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  <a href={user.domain} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                    View Portfolio / Website
                  </a>
                </div>
              )}
            </div>

            <Separator />

            {/* 3. System Data */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Stats</h4>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Profile Status</span>
                  <Badge variant={user.isProfileComplete ? "default" : "destructive"}>
                    {user.isProfileComplete ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Joined</span>
                  <span className="font-medium">Oct 12, 2025</span>
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <SheetFooter className="p-6 border-t border-border/50 bg-background flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button variant="outline" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 border-destructive/30" onClick={handleBlockUser}>
            <ShieldAlert className="w-4 h-4 mr-2" />
            Block User
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleResetPassword}>
              <KeyRound className="w-4 h-4 mr-2" />
              Reset Pass
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={onClose}>Close</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};