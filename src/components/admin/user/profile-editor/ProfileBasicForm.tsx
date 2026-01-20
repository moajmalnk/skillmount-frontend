import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types/user";
import { Separator } from "@/components/ui/separator";

// Services to fetch dropdown data
import { systemService } from "@/services/systemService";
import { userService } from "@/services/userService";

interface ProfileBasicFormProps {
    data: Partial<Student> & { resumeFile?: File };
    onChange: (updates: Partial<Student> & { resumeFile?: File }) => void;
}

export const ProfileBasicForm = ({ data, onChange }: ProfileBasicFormProps) => {
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [batches, setBatches] = useState<string[]>([]);

    // Store full objects for rich display
    const [mentorOptions, setMentorOptions] = useState<{ id: string, name: string, identifier: string }[]>([]);
    const [coordinatorOptions, setCoordinatorOptions] = useState<{ id: string, name: string, identifier: string }[]>([]);

    // Fetch Dropdown Options on Mount
    useEffect(() => {
        const fetchData = async () => {
            setLoadingOptions(true);
            try {
                // Fetch Settings and ALL users for best matching chance
                // This ensures we find the Mentor/Coordinator phonenumber regardless of their role
                const [settings, allUsers] = await Promise.all([
                    systemService.getSettings(),
                    userService.getAll()
                ]);

                // Create a map for faster lookup (though we need fuzzy matching too)
                const staffMembers = allUsers;

                setBatches(settings.batches || []);

                const getMatchIdentifier = (name: string, index: number, prefix: string) => {
                    if (!name) return "";
                    const normalize = (s: string) => s.toLowerCase().trim();
                    const target = normalize(name);

                    // 1. Exact Match
                    let match = staffMembers.find((u: any) => normalize(u.name) === target);

                    // 2. Starts With Match
                    if (!match) {
                        match = staffMembers.find((u: any) => normalize(u.name).startsWith(target));
                    }

                    // 3. Includes Match
                    if (!match && target.length > 3) {
                        match = staffMembers.find((u: any) => normalize(u.name).includes(target));
                    }

                    // 4. Return Real ID if found (Phone Match Priority)
                    if (match) {
                        if (match.phone) return `${match.phone}`;
                        if (match.regId) return `ID: ${match.regId}`;
                    }

                    // 5. Fallback: Generate "Simple ID" if no account found
                    // Format: M-01, M-02, C-01 etc.
                    const paddedId = String(index + 1).padStart(2, '0');
                    return `ID: ${prefix}-${paddedId}`;
                };

                // 1. Process Mentors (Prefix: M)
                const manualMentors = (settings.mentors || []).map((name: string, idx: number) => ({
                    id: `men-${idx}`,
                    name: name,
                    identifier: getMatchIdentifier(name, idx, 'M')
                }));
                setMentorOptions(manualMentors);

                // 2. Process Coordinators (Prefix: C)
                const manualCoordinators = (settings.coordinators || []).map((name: string, idx: number) => ({
                    id: `co-${idx}`,
                    name: name,
                    identifier: getMatchIdentifier(name, idx, 'C')
                }));
                setCoordinatorOptions(manualCoordinators);

            } catch (error) {
                console.error("Failed to fetch academic options", error);
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchData();
    }, []);

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
        <div className="space-y-8 py-2 md:py-4 px-1 animate-in fade-in slide-in-from-bottom-2">

            {/* 0. Academic Details */}
            <div className="bg-muted/10 p-4 rounded-lg border border-border/40 space-y-4">
                <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wide flex items-center gap-2 border-b pb-2">
                    Academic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="regId">Register ID / Roll No</Label>
                        <Input
                            id="regId"
                            value={data.regId || ""}
                            onChange={(e) => onChange({ regId: e.target.value })}
                            placeholder="STU-2024-001"
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="batch">Batch</Label>
                        <Select value={data.batch || ""} onValueChange={(val) => onChange({ batch: val })}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={loadingOptions ? "Loading..." : "Select Batch"} />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ENHANCED MENTOR SELECT */}
                    <div className="space-y-2">
                        <Label htmlFor="mentor">Mentor</Label>
                        <Select value={data.mentor || ""} onValueChange={(val) => onChange({ mentor: val })}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={loadingOptions ? "Loading..." : "Select Mentor"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                                {mentorOptions.map(m => (
                                    <SelectItem key={m.id} value={m.name}>
                                        <span className="font-medium">{m.name}</span>
                                        {m.identifier && <span className="text-xs text-muted-foreground ml-2">({m.identifier})</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ENHANCED COORDINATOR SELECT */}
                    <div className="space-y-2">
                        <Label htmlFor="coordinator">Coordinator</Label>
                        <Select value={data.coordinator || ""} onValueChange={(val) => onChange({ coordinator: val })}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={loadingOptions ? "Loading..." : "Select Coordinator"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                                {coordinatorOptions.map(c => (
                                    <SelectItem key={c.id} value={c.name}>
                                        <span className="font-medium">{c.name}</span>
                                        {c.identifier && <span className="text-xs text-muted-foreground ml-2">({c.identifier})</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* 1. Personal Details */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    Personal Details
                </h4>

                {/* Name, Email, Phone & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name || ""}
                            onChange={(e) => onChange({ name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email || ""}
                            onChange={(e) => onChange({ email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                            id="phone"
                            placeholder="+91..."
                            value={data.phone || ""}
                            onChange={(e) => onChange({ phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="address"
                            placeholder="Full residential address..."
                            className="min-h-[38px] h-10 py-2 resize-none overflow-hidden leading-tight"
                            value={data.address || ""}
                            onChange={(e) => onChange({ address: e.target.value })}
                        />
                    </div>
                </div>

                {/* DOB & Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-2 flex flex-col">
                        <Label className="mb-2">Date of Birth <span className="text-red-500">*</span></Label>
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
                                    captionLayout="dropdown-buttons"
                                    fromYear={1960}
                                    toYear={new Date().getFullYear()}
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
            </div>

            <Separator />

            {/* 2. Professional Profile */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Professional Profile
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
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
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
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

            {/* 3.5. Career & Resume */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Career & Resume
                </h4>

                <div className="space-y-2">
                    <Label htmlFor="experience">Experience Summary</Label>
                    <Textarea
                        id="experience"
                        placeholder="e.g. 2 years experience in React Development at Tech Corp..."
                        className="min-h-[80px]"
                        value={data.experience || ""}
                        onChange={(e) => onChange({ experience: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="resume">Resume / CV</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="resume"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="cursor-pointer file:text-foreground"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onChange({ resumeFile: file });
                                }}
                            />
                            {data.resume && !data.resumeFile && (
                                <Button variant="secondary" size="sm" asChild className="shrink-0">
                                    <a href={data.resume} target="_blank" rel="noopener noreferrer">View</a>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Company Name <span className="text-xs text-muted-foreground font-normal">(if placed)</span></Label>
                        <Input
                            placeholder="e.g. Google"
                            value={data.placement?.company || ""}
                            onChange={(e) => onChange({ placement: { ...data.placement, company: e.target.value } as any })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Job Role</Label>
                        <Input
                            placeholder="e.g. Software Engineer"
                            value={data.placement?.role || ""}
                            onChange={(e) => onChange({ placement: { ...data.placement, role: e.target.value } as any })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Package (LPA)</Label>
                        <Input
                            placeholder="e.g. 24.5"
                            value={data.placement?.package || ""}
                            onChange={(e) => onChange({ placement: { ...data.placement, package: e.target.value } as any })}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* 4. Social Links */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Social Presence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
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
                        <Label htmlFor="instagram" className="text-xs font-medium">Instagram URL</Label>
                        <Input
                            id="instagram"
                            placeholder="https://instagram.com/..."
                            value={data.socials?.instagram || ""}
                            onChange={(e) => onChange({ socials: { ...data.socials, instagram: e.target.value } })}
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