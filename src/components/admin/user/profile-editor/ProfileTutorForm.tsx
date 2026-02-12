import { Tutor } from "@/types/user";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

interface ProfileTutorFormProps {
    data: Partial<Tutor>;
    onChange: (updates: Partial<Tutor>) => void;
}

export const ProfileTutorForm = ({ data, onChange }: ProfileTutorFormProps) => {
    // Helper for Topics (Array <-> Comma separated string)
    const handleTopicsChange = (value: string) => {
        const topicsArray = value.split(',').map(s => s.trim()).filter(Boolean);
        onChange({ topics: topicsArray });
    };

    return (
        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2">

            {/* 1. Tutor Specifics */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Tutor Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="regId">Tutor ID</Label>
                        <Input
                            id="regId"
                            value={data.regId || ""}
                            onChange={(e) => onChange({ regId: e.target.value })}
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="topics">Topics (Comma Separated)</Label>
                        <Input
                            id="topics"
                            placeholder="e.g. React, Python, Math"
                            value={data.topics?.join(", ") || ""}
                            onChange={(e) => handleTopicsChange(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground">Used for matching students.</p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* 2. Personal Details (New) */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="qualification">Qualification</Label>
                        <Input
                            id="qualification"
                            value={data.qualification || ""}
                            onChange={(e) => onChange({ qualification: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>Date of Birth</Label>
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
                                    fromYear={1900}
                                    toYear={new Date().getFullYear()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={data.address || ""}
                            onChange={(e) => onChange({ address: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                            id="pincode"
                            value={data.pincode || ""}
                            onChange={(e) => onChange({ pincode: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* 3. Account Information */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Account Information
                </h4>
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
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email || ""}
                            onChange={(e) => onChange({ email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                        <Input
                            id="phone"
                            value={data.phone || ""}
                            onChange={(e) => onChange({ phone: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
