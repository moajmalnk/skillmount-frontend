import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Affiliate } from "@/types/user";
import { Separator } from "@/components/ui/separator";
import { systemService } from "@/services/systemService";

interface ProfileAffiliateFormProps {
    data: Partial<Affiliate>;
    onChange: (updates: Partial<Affiliate>) => void;
}

export const ProfileAffiliateForm = ({ data, onChange }: ProfileAffiliateFormProps) => {
    const [platforms, setPlatforms] = useState<string[]>([]);

    useEffect(() => {
        // Fetch Dropdown Options on Mount
        const fetchData = async () => {
            try {
                const settings = await systemService.getSettings();
                setPlatforms(settings.platforms || ["Other"]);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2">

            {/* 1. Account Details */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Affiliate Account
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="couponCode">Coupon Code</Label>
                        <Input
                            id="couponCode"
                            value={data.couponCode || ""}
                            onChange={(e) => onChange({ couponCode: e.target.value.toUpperCase() })}
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="platform">Primary Platform</Label>
                        <Select value={data.platform} onValueChange={(val) => onChange({ platform: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="domain">Domain / Website URL</Label>
                    <Input
                        id="domain"
                        placeholder="https://example.com"
                        value={data.domain || ""}
                        onChange={(e) => onChange({ domain: e.target.value })}
                    />
                </div>
            </div>

            <Separator />

            {/* 2. Personal Information */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Personal Information
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
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                        <Input
                            id="whatsapp"
                            value={data.whatsappNumber || ""}
                            onChange={(e) => onChange({ whatsappNumber: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* 3. Address & Details */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Address & Other Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                />
                            </PopoverContent>
                        </Popover>
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

                <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                        id="qualification"
                        value={data.qualification || ""}
                        onChange={(e) => onChange({ qualification: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                        id="address"
                        className="min-h-[80px] resize-none"
                        value={data.address || ""}
                        onChange={(e) => onChange({ address: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};
