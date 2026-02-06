import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { systemService } from "@/services/systemService";
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

interface StudentCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const StudentCreateDialog = ({ isOpen, onClose, onSuccess }: StudentCreateDialogProps) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        batch: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [batches, setBatches] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadOptions();
        }
    }, [isOpen]);

    const loadOptions = async () => {
        setIsLoadingOptions(true);
        try {
            const settings = await systemService.getSettings();
            setBatches(settings.batches || []);
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
            const response = await userService.create({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: "student",
                status: "Active",
                batch: formData.batch,
                isProfileComplete: false
            });

            // Parse Notification Status
            const meta = (response as any).meta || {};
            const notifyStatus = meta.notification_status || {};

            const validStatuses = ['ok', 'success', 'queued'];
            const emailStatus = validStatuses.includes((notifyStatus.email || '').toLowerCase());

            const waStatusRaw = (notifyStatus.whatsapp || 'error').toLowerCase();
            const waStatus = validStatuses.includes(waStatusRaw);
            const waSkipped = waStatusRaw.includes('skipped');

            toast.success(
                <div className="flex flex-col gap-2">
                    <span className="font-semibold">Enrollment Complete</span>
                    <div className="text-xs text-muted-foreground">
                        Student created successfully.
                    </div>
                    <div className="space-y-1 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="opacity-70 w-16">Email:</span>
                            {emailStatus ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    Sent <CheckCircle2 className="w-3 h-3" />
                                </span>
                            ) : (
                                <span className="text-red-500 flex items-center gap-1">
                                    Failed <AlertCircle className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="opacity-70 w-16">WhatsApp:</span>
                            {waStatus ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    Sent <CheckCircle2 className="w-3 h-3" />
                                </span>
                            ) : waSkipped ? (
                                <span className="text-yellow-600 flex items-center gap-1">
                                    Skipped <AlertTriangle className="w-3 h-3" />
                                </span>
                            ) : (
                                <span className="text-red-500 flex items-center gap-1">
                                    Failed <AlertCircle className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            );

            setFormData({ name: "", email: "", phone: "", batch: "" });
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
            <DialogContent className="modal-admin-uniform">
                <DialogHeader className="modal-header-standard">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle>Enroll New Student</DialogTitle>
                            <DialogDescription>
                                Enter mandatory details. Profile will be marked incomplete.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="modal-body-standard">
                    {isLoadingOptions ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                    ) : (
                        <div className="grid gap-6">
                            {/* 1. Full Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter student's full name"
                                />
                            </div>

                            {/* 2. Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="student@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* 3. Phone */}
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ""); // Remove all non-digits
                                            setFormData({ ...formData, phone: val });
                                        }}
                                        placeholder="Numbers only"
                                    />
                                </div>

                                {/* 4. Batch */}
                                <div className="grid gap-2">
                                    <Label htmlFor="batch">Assign Batch</Label>
                                    <Select value={formData.batch} onValueChange={(val) => setFormData({ ...formData, batch: val })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {batches.map((batch) => (
                                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="modal-footer-standard">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isSubmitting || isLoadingOptions} className="px-8">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};