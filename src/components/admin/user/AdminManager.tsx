import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow, TableHead, TableHeader, TableBody, Table } from "@/components/ui/table";
import { Trash2, Loader2, CheckCircle2, AlertCircle, Copy, Search, X, Plus, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";

// Import Service & Types
import { userService } from "@/services/userService";
import { BaseUser } from "@/types/user";
import { useAuth } from "@/context/AuthContext";

export const AdminManager = () => {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState<BaseUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredAdmins = admins.filter(a => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = a.name.toLowerCase().includes(searchLower) ||
            a.email.toLowerCase().includes(searchLower);

        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // 1. Fetch Data
    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getElementsByRole("super_admin") as BaseUser[];
            setAdmins(data);
        } catch (error) {
            toast.error("Failed to load admins");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const generateTempPassword = (email: string, phone: string) => {
        return `${email.substring(0, 3).toLowerCase()}@${phone.slice(-4)}`;
    };

    // --- ACTIONS ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("All fields are mandatory.");
            return;
        }

        // Basic email validation
        if (!formData.email.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        try {
            const tempPassword = generateTempPassword(formData.email, formData.phone);

            const newAdmin: Partial<BaseUser> = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: "super_admin",
                status: "Active",
                password: tempPassword,
                isProfileComplete: true
            };

            const result = await userService.create(newAdmin);

            // Parse Notification Status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const notifStatus = (result as any)?.meta?.notification_status || {};
            const emailStatus = notifStatus.email === 'ok';
            const waStatusRaw = notifStatus.whatsapp || 'error';
            const waStatus = waStatusRaw === 'ok';
            const waSkipped = waStatusRaw.includes('skipped');

            toast.success(
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className="font-semibold">Admin Created!</span>

                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
                        <span>Email: <code className="font-mono font-bold">{formData.email}</code></span>
                        <button onClick={() => navigator.clipboard.writeText(formData.email)} title="Copy Email" className="hover:bg-background p-1 rounded">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        Pass: {tempPassword}
                    </div>

                    {/* Notification Status */}
                    <div className="space-y-1 pt-1 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                            <span className="opacity-70">Email:</span>
                            {emailStatus
                                ? <span className="text-green-600 flex items-center gap-1">Sent <CheckCircle2 className="w-3 h-3" /></span>
                                : <span className="text-red-500 flex items-center gap-1">Failed <AlertCircle className="w-3 h-3" /></span>
                            }
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="opacity-70">WhatsApp:</span>
                            {waStatus
                                ? <span className="text-green-600 flex items-center gap-1">Sent <CheckCircle2 className="w-3 h-3" /></span>
                                : (waSkipped
                                    ? <span className="text-yellow-600 flex items-center gap-1">Skipped <AlertCircle className="w-3 h-3" /></span>
                                    : <span className="text-red-500 flex items-center gap-1">Failed <AlertCircle className="w-3 h-3" /></span>
                                )
                            }
                        </div>
                    </div>
                </div>
            );

            setIsCreateOpen(false);
            setFormData({ name: "", email: "", phone: "" });

            loadData();

        } catch (error) {
            toast.error("Failed to create admin");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DELETE HANDLERS ---
    const initiateDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Prevent self-deletion
        if (currentUser?.id === id) {
            toast.error("You cannot delete your own account.");
            return;
        }
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await userService.delete(deleteId);
            toast.success("Admin removed successfully");
            loadData();
        } catch (error) {
            toast.error("Failed to delete admin");
        } finally {
            setDeleteId(null);
        }
    };

    const adminToDelete = admins.find(a => a.id === deleteId);

    return (
        <div className="space-y-4">

            {/* Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-[150px]">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
                            <Plus className="w-4 h-4 mr-2" /> Add Admin
                        </Button>

                        {/* Clear Button */}
                        {(searchQuery || filterStatus !== 'all') && (
                            <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }} title="Reset Filters">
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-40 mb-1" />
                                                <Skeleton className="h-3 w-28" />
                                            </TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredAdmins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No admins found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAdmins.map((admin) => (
                                        <TableRow
                                            key={admin.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{admin.name}</div>
                                                        {currentUser?.id === admin.id && (
                                                            <Badge variant="outline" className="text-[10px] mt-0.5 border-primary/30 text-primary">You</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs text-muted-foreground">
                                                    <span>{admin.email}</span>
                                                    <span>{admin.phone || "—"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                                    Super Admin
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${admin.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : admin.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {admin.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {admin.date_joined ? new Date(admin.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {currentUser?.id !== admin.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => initiateDelete(admin.id, e)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="modal-admin-uniform">
                    <DialogHeader className="modal-header-standard">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <DialogTitle>Add New Admin</DialogTitle>
                                <DialogDescription>Create a new Super Admin account. Login credentials will be sent via Email & WhatsApp.</DialogDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8 text-muted-foreground">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="modal-body-standard">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="a-name">Full Name</Label>
                                <Input id="a-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter admin's full name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="a-email">Email Address</Label>
                                <Input id="a-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="a-phone">Phone Number</Label>
                                <Input
                                    id="a-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, ""); // Remove all non-digits
                                        setFormData({ ...formData, phone: val });
                                    }}
                                    placeholder="Phone number (digits only)"
                                />
                            </div>

                            {/* Info Banner */}
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground mb-1">Account Details</p>
                                        <ul className="space-y-1 list-disc list-inside">
                                            <li>Password will be auto-generated from email & phone</li>
                                            <li>Credentials will be sent via Email & WhatsApp</li>
                                            <li>This user will have full Super Admin access</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="modal-footer-standard">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isSubmitting} className="px-8">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={confirmDelete}
                itemName={adminToDelete?.name}
                description="This will permanently remove this admin account and revoke all administrative privileges."
            />
        </div>
    );
};
