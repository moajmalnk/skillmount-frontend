import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket } from "@/types/ticket";
import { ticketService } from "@/services/ticketService";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

interface EditTicketDialogProps {
    ticket: Ticket;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTicket: Ticket) => void;
}

export const EditTicketDialog = ({ ticket, isOpen, onClose, onUpdate }: EditTicketDialogProps) => {
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        priority: "Medium",
        description: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (ticket) {
            setFormData({
                title: ticket.title || "",
                category: ticket.category || "",
                priority: ticket.priority || "Medium",
                description: ticket.description || ""
            });
        }
    }, [ticket, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // @ts-ignore - 'update' method being added to service
            const updated = await ticketService.update(ticket.id, formData);
            toast.success("Ticket updated successfully");
            onUpdate(updated);
            onClose();
        } catch (error) {
            toast.error("Failed to update ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="modal-admin-uniform">
                <DialogHeader className="modal-header-standard">
                    <div className="flex items-start justify-between">
                        <DialogTitle>Edit Ticket Details</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="modal-body-standard">
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Brief subject of the ticket"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Technical">Technical</SelectItem>
                                            <SelectItem value="Billing">Billing</SelectItem>
                                            <SelectItem value="Course Content">Course Content</SelectItem>
                                            <SelectItem value="Platform">Platform</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Message Body</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[150px] resize-none"
                                    required
                                    placeholder="Describe the issue in detail..."
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="modal-footer-standard">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="px-8">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
