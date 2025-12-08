import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/types/user";
import { Separator } from "@/components/ui/separator";

interface ProfileBasicFormProps {
  data: Partial<Student>;
  onChange: (updates: Partial<Student>) => void;
}

export const ProfileBasicForm = ({ data, onChange }: ProfileBasicFormProps) => {
  
  // Helper for Skills (Array <-> Comma separated string)
  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ skills: skillsArray });
  };

  // Helper for Achievements (Array <-> Newline separated string)
  const handleAchievementsChange = (value: string) => {
    const achArray = value.split('\n').filter(s => s.trim().length > 0);
    onChange({ achievements: achArray });
  };

  return (
    <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2">
      
      {/* 1. Personal Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          Personal Details
        </h4>
        
        {/* Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                    id="name"
                    value={data.name || ""}
                    onChange={(e) => onChange({ name: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number <span className="text-red-500">*</span></Label>
                <Input 
                    id="whatsapp"
                    placeholder="+91..."
                    value={data.phone || ""}
                    onChange={(e) => onChange({ phone: e.target.value })}
                />
            </div>
        </div>

        {/* DOB & Pincode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !data.dob && "text-muted-foreground"
                            )}
                        >
                            {data.dob ? (
                                format(new Date(data.dob), "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={data.dob ? new Date(data.dob) : undefined}
                            onSelect={(date) => date && onChange({ dob: format(date, "yyyy-MM-dd") })}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                <Input 
                    id="pincode"
                    placeholder="676505"
                    value={data.pincode || ""} 
                    onChange={(e) => onChange({ pincode: e.target.value })}
                />
            </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
            <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
            <Textarea 
                id="address"
                placeholder="Full residential address..."
                className="min-h-[80px] resize-none"
                value={data.address || ""}
                onChange={(e) => onChange({ address: e.target.value })}
            />
        </div>
      </div>

      <Separator />

      {/* 2. Professional / Academic */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Professional Profile
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input 
                    id="headline"
                    placeholder="e.g. Frontend Developer | React Enthusiast"
                    value={data.headline || ""}
                    onChange={(e) => onChange({ headline: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="qualification">Qualification <span className="text-red-500">*</span></Label>
                <Input 
                    id="qualification"
                    placeholder="e.g. BCA, B.Tech"
                    value={data.qualification || ""}
                    onChange={(e) => onChange({ qualification: e.target.value })}
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="aim">Professional Aim / Goal</Label>
            <Input 
                id="aim"
                placeholder="e.g. To become a Full Stack Developer at a top product company"
                value={data.aim || ""}
                onChange={(e) => onChange({ aim: e.target.value })}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="bio">Bio / About Me</Label>
            <Textarea 
                id="bio"
                placeholder="Write a compelling bio about yourself..."
                className="min-h-[100px] resize-none"
                value={data.bio || ""}
                onChange={(e) => onChange({ bio: e.target.value })}
            />
        </div>
      </div>

      <Separator />

      {/* 3. Skills & Achievements */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Skills & Awards
        </h4>
        
        <div className="space-y-2">
            <Label htmlFor="skills">Technical Skills <span className="text-xs text-muted-foreground font-normal">(Comma separated)</span></Label>
            <Input 
                id="skills"
                placeholder="React, Node.js, Figma, WordPress..."
                value={data.skills?.join(", ") || ""}
                onChange={(e) => handleSkillsChange(e.target.value)}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="achievements">Achievements <span className="text-xs text-muted-foreground font-normal">(One per line)</span></Label>
            <Textarea 
                id="achievements"
                placeholder="Best Project Award 2024&#10;Hackathon Winner"
                className="min-h-[100px] resize-none"
                value={data.achievements?.join("\n") || ""}
                onChange={(e) => handleAchievementsChange(e.target.value)}
            />
        </div>
      </div>
      
      <Separator />

      {/* 4. Social Links */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Social Presence
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-xs font-medium">LinkedIn URL</Label>
                <Input 
                    id="linkedin"
                    placeholder="https://linkedin.com/in/..."
                    value={data.socials?.linkedin || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, linkedin: e.target.value } })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="github" className="text-xs font-medium">GitHub URL</Label>
                <Input 
                    id="github"
                    placeholder="https://github.com/..."
                    value={data.socials?.github || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, github: e.target.value } })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="website" className="text-xs font-medium">Portfolio Website</Label>
                <Input 
                    id="website"
                    placeholder="https://myportfolio.com"
                    value={data.socials?.website || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, website: e.target.value } })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="behance" className="text-xs font-medium">Behance URL</Label>
                <Input 
                    id="behance"
                    placeholder="https://behance.net/..."
                    value={data.socials?.behance || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, behance: e.target.value } })}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="twitter" className="text-xs font-medium">Twitter / X URL</Label>
                <Input 
                    id="twitter"
                    placeholder="https://twitter.com/..."
                    value={data.socials?.twitter || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, twitter: e.target.value } })}
                />
            </div>
        </div>
      </div>
    </div>
  );
};