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
    <div className="space-y-6 py-4">
      
      {/* 1. Personal Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input 
                    id="whatsapp"
                    placeholder="+91..."
                    value={data.phone || ""}
                    onChange={(e) => onChange({ phone: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input 
                    id="dob"
                    type="date"
                    value={(data as any).dob || ""} 
                    onChange={(e) => onChange({ dob: e.target.value } as any)}
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea 
                id="address"
                placeholder="Full address..."
                className="min-h-[80px]"
                value={data.address || ""}
                onChange={(e) => onChange({ address: e.target.value })}
            />
        </div>
      </div>

      <Separator />

      {/* 2. Professional / Academic */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Professional Profile</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input 
                    id="headline"
                    placeholder="e.g. Frontend Developer"
                    value={data.headline || ""}
                    onChange={(e) => onChange({ headline: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input 
                    id="qualification"
                    placeholder="e.g. BCA, B.Tech"
                    value={(data as any).qualification || ""}
                    onChange={(e) => onChange({ qualification: e.target.value } as any)}
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="aim">Professional Aim / Goal</Label>
            <Input 
                id="aim"
                placeholder="e.g. To become a Full Stack Developer"
                value={(data as any).aim || ""}
                onChange={(e) => onChange({ aim: e.target.value } as any)}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="bio">Bio / About Me</Label>
            <Textarea 
                id="bio"
                placeholder="Tell a story about the student..."
                className="min-h-[100px]"
                value={data.bio || ""}
                onChange={(e) => onChange({ bio: e.target.value })}
            />
        </div>
      </div>

      <Separator />

      {/* 3. Skills & Achievements (CRITICAL UPDATE) */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Skills & Awards</h4>
        
        <div className="space-y-2">
            <Label htmlFor="skills">Technical Skills (Comma separated)</Label>
            <Input 
                id="skills"
                placeholder="React, Node.js, Figma, WordPress..."
                value={data.skills?.join(", ") || ""}
                onChange={(e) => handleSkillsChange(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">Clear this field to hide the Skills section on profile.</p>
        </div>

        <div className="space-y-2">
            <Label htmlFor="achievements">Achievements (One per line)</Label>
            <Textarea 
                id="achievements"
                placeholder="Best Project Award 2024&#10;Hackathon Winner"
                className="min-h-[100px]"
                value={data.achievements?.join("\n") || ""}
                onChange={(e) => handleAchievementsChange(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">Clear this field to hide the Achievements section on profile.</p>
        </div>
      </div>
      
      <Separator />

      {/* 4. Social Links */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Social Presence</h4>
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label className="text-xs">LinkedIn</Label>
                <Input 
                    value={data.socials?.linkedin || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, linkedin: e.target.value } })}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">GitHub</Label>
                <Input 
                    value={data.socials?.github || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, github: e.target.value } })}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Portfolio URL</Label>
                <Input 
                    value={data.socials?.website || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, website: e.target.value } })}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Behance</Label>
                <Input 
                    value={data.socials?.behance || ""}
                    onChange={(e) => onChange({ socials: { ...data.socials, behance: e.target.value } })}
                />
            </div>
        </div>
      </div>
    </div>
  );
};