import { useState } from "react";
import {
    Plus, X, MessageSquare, Pencil, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { MacroItem } from "@/services/systemService";
import { ActionConfirmationDialog } from "@/components/admin/ActionConfirmationDialog";

// --- MACRO MANAGER COMPONENT ---
interface MacroManagerProps {
    macros: MacroItem[];
    onUpdate: (macros: MacroItem[]) => void;
}

export const MacroManager = ({ macros, onUpdate }: MacroManagerProps) => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMacro, setEditingMacro] = useState<{ index: number; macro: MacroItem } | null>(null);

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // View State
    const [viewingMacro, setViewingMacro] = useState<MacroItem | null>(null);

    // Confirmation State
    type PendingAction =
        | { type: 'add' }
        | { type: 'edit' }
        | { type: 'delete', index: number };
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setIsAddOpen(false);
        setEditingMacro(null);
    };

    const handleAddRequest = () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Both title and description are required.");
            return;
        }
        setPendingAction({ type: 'add' });
    };

    const handleEditRequest = () => {
        if (!editingMacro) return;
        if (!title.trim() || !description.trim()) return;
        setPendingAction({ type: 'edit' });
    };

    const handleDeleteRequest = (index: number) => {
        setPendingAction({ type: 'delete', index });
    };

    const executeConfirm = () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'add') {
            onUpdate([...macros, {
                title: title.trim(),
                description: description.trim(),
                dateAdded: new Date().toISOString()
            }]);
            toast.success("Macro added successfully");
            resetForm();
        } else if (pendingAction.type === 'edit') {
            if (editingMacro) {
                const updatedList = [...macros];
                updatedList[editingMacro.index] = {
                    ...updatedList[editingMacro.index],
                    title: title.trim(),
                    description: description.trim()
                };
                onUpdate(updatedList);
                toast.success("Macro updated successfully");
                resetForm();
            }
        } else if (pendingAction.type === 'delete') {
            const updatedList = macros.filter((_, i) => i !== pendingAction.index);
            onUpdate(updatedList);
            toast.success("Macro deleted");
        }

        setPendingAction(null);
    };

    const openEdit = (macro: MacroItem, index: number) => {
        setTitle(macro.title);
        setDescription(macro.description);
        setEditingMacro({ index, macro });
        setIsAddOpen(true);
    };

    // Helper to normalize legacy string macros if any exist
    const normalizedMacros = macros.map(m => {
        if (typeof m === 'string') {
            return { title: 'Legacy Macro', description: m as string, dateAdded: undefined };
        }
        return m;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleView = (macro: MacroItem) => {
        setViewingMacro(macro);
    };

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Ticket Macros</CardTitle>
                    </div>
                    <CardDescription className="mt-2">Pre-defined replies for faster support.</CardDescription>
                </div>
                <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Macro
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Date Added</TableHead>
                                <TableHead className="w-[200px]">Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {normalizedMacros.length > 0 ? (
                                normalizedMacros.map((macro, index) => (
                                    <TableRow
                                        key={index}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleView(macro)}
                                    >
                                        <TableCell className="font-medium text-muted-foreground">
                                            {formatDate(macro.dateAdded)}
                                        </TableCell>
                                        <TableCell className="font-semibold">{macro.title}</TableCell>
                                        <TableCell>
                                            <p className="line-clamp-2 text-muted-foreground" title={macro.description}>
                                                {macro.description}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(macro, index); }}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(index); }}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No macros defined. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* ADD/EDIT DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={(val) => !val && resetForm()}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{editingMacro ? "Edit Macro" : "Create New Macro"}</DialogTitle>
                        <DialogDescription>
                            Define quick replies for your support team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="macro-title">Title</Label>
                            <Input
                                id="macro-title"
                                placeholder="e.g. Internet Check"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="macro-desc">Content</Label>
                            <Textarea
                                id="macro-desc"
                                placeholder="The full text response..."
                                className="min-h-[150px] custom-scrollbar"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => resetForm()}>Cancel</Button>
                        <Button onClick={editingMacro ? handleEditRequest : handleAddRequest}>
                            {editingMacro ? "Save Changes" : "Create Macro"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* VIEW DETAILS DIALOG */}
            <Dialog open={!!viewingMacro} onOpenChange={(open) => !open && setViewingMacro(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{viewingMacro?.title}</DialogTitle>
                        <DialogDescription>
                            Created on {formatDate(viewingMacro?.dateAdded)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {viewingMacro?.description}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setViewingMacro(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONFIRMATION DIALOG */}
            {pendingAction && (
                <ActionConfirmationDialog
                    open={!!pendingAction}
                    onOpenChange={(open) => !open && setPendingAction(null)}
                    onConfirm={executeConfirm}
                    title={
                        pendingAction.type === 'add' ? "Confirm Creation" :
                            pendingAction.type === 'edit' ? "Confirm Changes" :
                                "Confirm Deletion"
                    }
                    itemName={
                        pendingAction.type === 'add' ? title :
                            pendingAction.type === 'edit' ? title :
                                pendingAction.type === 'delete' ? macros[pendingAction.index]?.title : undefined
                    }
                    description={
                        pendingAction.type === 'add'
                            ? "Are you sure you want to add this new macro? It will be available immediately."
                            : pendingAction.type === 'edit'
                                ? "Are you sure you want to save the changes to this macro?"
                                : "Are you sure you want to delete this macro? This action cannot be undone."
                    }
                    variant={
                        pendingAction.type === 'delete' ? 'destructive' : 'default'
                    }
                    confirmLabel={
                        pendingAction.type === 'add' ? "Create Macro" :
                            pendingAction.type === 'edit' ? "Save Changes" :
                                "Delete Macro"
                    }
                />
            )}
        </Card>
    );
};
