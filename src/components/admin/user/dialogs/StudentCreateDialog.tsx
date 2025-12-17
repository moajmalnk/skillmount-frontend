import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { systemService } from "@/services/systemService";
import { Loader2 } from "lucide-react";

// Ideally import UserRole from your types if available
// import { UserRole } from "@/types/user"; 

interface StudentCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface SelectOption {
    id: number | string;
    name: string;
}

export const StudentCreateDialog = ({ isOpen, onClose, onSuccess }: StudentCreateDialogProps) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        batch: "",
        mentor: "",
        coordinator: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    const [batches, setBatches] = useState<string[]>([]);
    const [mentors, setMentors] = useState<SelectOption[]>([]);
    const [coordinators, setCoordinators] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadOptions();
        }
    }, [isOpen]);

    const loadOptions = async () => {
        setIsLoadingOptions(true);
        try {
            // FIX: Cast roles to 'any' for consistent backend communication
            const [settings, mentorsData, adminsData] = await Promise.all([
                systemService.getSettings(),
                userService.getElementsByRole('tutor' as any), // Use 'tutor' as mentors are typically tutors
                userService.getElementsByRole('super_admin' as any) // Assuming coordinators might be admins
            ]);

            setBatches(settings.batches || []);

            setMentors(mentorsData.map((u: any) => ({ id: u.id, name: u.name })));
            setCoordinators(adminsData.map((u: any) => ({ id: u.id, name: u.name })));

        } catch (error) {
            console.error("Failed to load options", error);
            toast.error("Could not load form options.");
        } finally {
            setIsLoadingOptions(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.batch) {
            toast.error("Name, Email, Phone, and Batch are mandatory.");
            return;
        }

        setIsSubmitting(true);
        try {
            // --- FIX: FLATTENED PAYLOAD AND REMOVED NESTED OBJECTS ---
            // Sending profile fields (batch_id, mentor, coordinator) directly, 
            // which the backend serializer is configured to handle for creation.

            await userService.create({
                name: formData.name,
                email: formData.email,
                phone: formData.phone, // 'phone' matches the top-level User model field
                role: "student",
                status: "Active",

                // ✅ ADDED FLATTENED FIELDS (P1.2 Fix)
                batch: formData.batch, // Use 'batch' to match Student interface, userService converts to batch_id
                mentor: formData.mentor || "", // 🛑 SENDING STRING NAME (P1.3 Fix)
                coordinator: formData.coordinator || "", // 🛑 SENDING STRING NAME (P1.3 Fix)
                isProfileComplete: false
            });

            toast.success("Student Enrolled Successfully", {
                description: "Login credentials have been emailed.",
            });

            setFormData({ name: "", email: "", phone: "", batch: "", mentor: "", coordinator: "" });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.email ? "Email already exists." : "Failed to create student.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Enroll New Student</DialogTitle>
                    <DialogDescription>
                        Enter details below. A secure password will be generated and emailed.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingOptions ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="batch">Batch *</Label>
                                <Select value={formData.batch} onValueChange={(val) => setFormData({ ...formData, batch: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mentor">Assign Mentor</Label>
                                <Select value={formData.mentor} onValueChange={(val) => setFormData({ ...formData, mentor: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Mentor" /></SelectTrigger>
                                    <SelectContent>
                                        {mentors.map((m) => (
                                            // 🛑 FIX: Use m.name (string) as value instead of m.id (P1.3 Fix)
                                            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="coordinator">Assign Coordinator</Label>
                                <Select value={formData.coordinator} onValueChange={(val) => setFormData({ ...formData, coordinator: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Coordinator" /></SelectTrigger>
                                    <SelectContent>
                                        {coordinators.map((c) => (
                                            // 🛑 FIX: Use c.name (string) as value instead of c.id (P1.3 Fix)
                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isSubmitting || isLoadingOptions}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Enroll Student
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};