import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { ticketService } from "@/services/ticketService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { User } from "@/types/user";

interface TicketCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const CATEGORIES = ["General", "Technical", "Billing", "Academic", "Other"];

export const TicketCreateDialog = ({ isOpen, onClose, onSuccess }: TicketCreateDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Form State
    const [studentId, setStudentId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("General");

    // Data State
    const [students, setStudents] = useState<User[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadStudents();
        }
    }, [isOpen]);

    const loadStudents = async () => {
        setLoadingStudents(true);
        try {
            const data = await userService.getElementsByRole("student");
            setStudents(data);
        } catch (error) {
            toast.error("Failed to load student list");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSubmit = async () => {
        if (!studentId) {
            toast.error("Please select a student");
            return;
        }
        if (!title.trim() || !description.trim()) {
            toast.error("Please fill in title and description");
            return;
        }

        setLoading(true);
        try {
            await ticketService.create({
                student_id: studentId,
                title,
                description,
                priority,
                category,
            });
            toast.success("Ticket raised successfully");
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error("Failed to raise ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset form after delay
        setTimeout(() => {
            setStudentId("");
            setTitle("");
            setDescription("");
            setPriority("Medium");
            setCategory("General");
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="modal-admin-uniform">
                <DialogHeader className="modal-header-standard">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle>Raise Ticket</DialogTitle>
                            <DialogDescription>
                                Create a new support ticket on behalf of a student.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 text-muted-foreground">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="modal-body-standard">
                    <div className="grid gap-6">

                        {/* Student Selection */}
                        <div className="space-y-2">
                            <Label>Student</Label>
                            <Select value={studentId} onValueChange={setStudentId} disabled={loadingStudents}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingStudents ? "Loading students..." : "Select Student"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((student) => (
                                        <SelectItem key={student.id} value={student.id.toString()}>
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">{student.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{student.regId || student.id}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label>Title / Subject</Label>
                            <Input
                                placeholder="Brief summary of the issue"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Priority & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Detailed explanation of the issue..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                    </div>
                </div>

                <DialogFooter className="modal-footer-standard">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="px-8">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Raise Ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
