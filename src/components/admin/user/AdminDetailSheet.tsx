import { useState, useEffect } from "react";
import {
    Dialog as ModalDialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    ShieldAlert, ShieldCheck, Save, Loader2, KeyRound, Copy, Eye, EyeOff,
    Mail, Phone, Calendar, CheckCircle2, AlertCircle,
    X, AlertTriangle, UserCircle, RefreshCw
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { BaseUser } from "@/types/user";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

interface AdminDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    admin: BaseUser | null;
    onUpdate?: () => void;
}

export const AdminDetailSheet = ({ isOpen, onClose, admin, onUpdate }: AdminDetailSheetProps) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState<Partial<BaseUser>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [customPassword, setCustomPassword] = useState("");
    const [showCustomPassword, setShowCustomPassword] = useState(false);
    const [resetResult, setResetResult] = useState<{
        password?: string;
        notification_status?: Record<string, string>;
    } | null>(null);

    // Local status tracking
    const [currentStatus, setCurrentStatus] = useState<string>(admin?.status || "Active");

    const isSelf = currentUser?.id === admin?.id;

    // Reset form when admin changes
    useEffect(() => {
        if (admin) {
            setFormData(admin);
            setCurrentStatus(admin.status);
            setResetResult(null);
            setCustomPassword("");
        }
    }, [admin]);

    if (!admin) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData = formData as any;

    // --- SAVE PROFILE HANDLER ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Direct PATCH with only editable fields — bypass buildUserJsonPayload
            const { default: api } = await import("@/lib/api");
            await api.patch(`/users/${admin.id}/`, {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
            });
            toast.success("Admin Profile Updated Successfully");
            if (onUpdate) onUpdate();
        } catch (error: unknown) {
            const err = error as { response?: { data?: Record<string, string[]> } };
            const detail = err?.response?.data;
            if (detail) {
                // Show the actual backend error for debugging
                const messages = Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
                toast.error("Validation Error", { description: messages });
            } else {
                toast.error("Failed to save changes");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // --- FORM UPDATE HELPER ---
    const handleUpdate = (updates: Partial<BaseUser>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // --- SUSPEND / ACTIVATE ---
    const handleStatusChange = async (newStatus: "Active" | "Suspended") => {
        try {
            await userService.update(admin.id, { status: newStatus });
            setCurrentStatus(newStatus);
            setIsSuspendDialogOpen(false);

            if (newStatus === 'Suspended') {
                toast.error("Admin Suspended", { description: "Access has been revoked." });
            } else {
                toast.success("Admin Activated", { description: "Access restored successfully." });
            }

            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // --- RESET PASSWORD ---
    const handleResetPassword = async () => {
        setIsResettingPassword(true);
        try {
            const result = await userService.adminResetPassword(admin.id, customPassword || undefined);
            setResetResult({
                password: result.temp_password,
                notification_status: result.notification_status
            });
            toast.success("Password reset successfully");
        } catch (error) {
            toast.error("Failed to reset password");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <>
            <ModalDialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="modal-admin-uniform">

                    {/* --- CUSTOM HEADER --- */}
                    <div className="modal-header-standard border-b">
                        <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex flex-row items-center gap-5">
                                <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                    <AvatarImage src={admin.avatar} />
                                    <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                                        {admin.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1.5">
                                    <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                        {admin.name}
                                        {isSelf && (
                                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-normal">You</Badge>
                                        )}
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">Admin profile details and management</DialogDescription>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant={currentStatus === 'Active' ? 'default' : 'destructive'}
                                            className={currentStatus === 'Active' ? 'bg-green-600 shadow-sm' : 'shadow-sm'}
                                        >
                                            {currentStatus}
                                        </Badge>
                                        <Badge variant="outline" className="capitalize text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 border-primary/20">
                                            <ShieldCheck className="w-3 h-3 mr-1" />
                                            Super Admin
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 hover:bg-muted/80">
                                <X className="w-5 h-5 opacity-60" />
                            </Button>
                        </div>
                    </div>

                    {/* --- CONTENT AREA --- */}
                    <div className="flex-1 overflow-hidden bg-background/50">
                        <Tabs defaultValue="overview" className="h-full flex flex-col">
                            <div className="px-8 pt-4 border-b bg-muted/20">
                                <TabsList className="grid w-full max-w-[400px] mx-auto grid-cols-2">
                                    <TabsTrigger value="overview" className="text-[10px] uppercase font-bold tracking-tight">Overview</TabsTrigger>
                                    <TabsTrigger value="edit" className="text-[10px] uppercase font-bold tracking-tight">Edit</TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="modal-body-standard !p-8 space-y-8">
                                    {/* === TAB 1: OVERVIEW === */}
                                    <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                        {/* Admin Privileges Card */}
                                        <Card className="bg-primary/5 border-primary/20 shadow-sm">
                                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm">Administrative Privileges</h4>
                                                        <p className="text-xs text-muted-foreground">Full platform access & user management</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="text-[10px]">is_staff</Badge>
                                                    <Badge variant="secondary" className="text-[10px]">is_superuser</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Profile Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <UserCircle className="w-4 h-4" /> Contact Information
                                            </h4>
                                            <Card>
                                                <CardContent className="p-0 text-sm">
                                                    <div className="divide-y divide-border/40">
                                                        <div className="flex justify-between items-center p-3">
                                                            <span className="flex items-center text-muted-foreground gap-2">
                                                                <Mail className="w-3.5 h-3.5 text-primary/70" /> Email
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{userData.email}</span>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(userData.email, 'Email')}>
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center p-3">
                                                            <span className="flex items-center text-muted-foreground gap-2">
                                                                <Phone className="w-3.5 h-3.5 text-primary/70" /> Phone
                                                            </span>
                                                            <span className="font-medium">{userData.phone || "N/A"}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center p-3">
                                                            <span className="flex items-center text-muted-foreground gap-2">
                                                                <Calendar className="w-3.5 h-3.5 text-primary/70" /> Joined On
                                                            </span>
                                                            <span className="font-medium">
                                                                {userData.date_joined
                                                                    ? new Date(userData.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                                                    : "N/A"
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between items-center p-3">
                                                            <span className="flex items-center text-muted-foreground gap-2">
                                                                <ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> User ID
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium font-mono text-xs truncate max-w-[200px]">{userData.id}</span>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(userData.id, 'User ID')}>
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <KeyRound className="w-4 h-4" /> Security Actions
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="h-auto py-4 flex flex-col items-start gap-1 border-amber-200/50 hover:bg-amber-50/50 dark:border-amber-900/30 dark:hover:bg-amber-950/20"
                                                    onClick={() => { setResetResult(null); setCustomPassword(""); setIsResetPasswordOpen(true); }}
                                                >
                                                    <div className="flex items-center gap-2 text-amber-600">
                                                        <KeyRound className="w-4 h-4" />
                                                        <span className="font-semibold text-sm">Reset Password</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-normal">Generate new password & notify</span>
                                                </Button>

                                                {!isSelf && (
                                                    currentStatus === 'Active' ? (
                                                        <Button
                                                            variant="outline"
                                                            className="h-auto py-4 flex flex-col items-start gap-1 border-destructive/20 hover:bg-destructive/5"
                                                            onClick={() => setIsSuspendDialogOpen(true)}
                                                        >
                                                            <div className="flex items-center gap-2 text-destructive">
                                                                <ShieldAlert className="w-4 h-4" />
                                                                <span className="font-semibold text-sm">Suspend Account</span>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-normal">Revoke admin access</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            className="h-auto py-4 flex flex-col items-start gap-1 border-green-200/50 hover:bg-green-50/50 dark:border-green-900/30 dark:hover:bg-green-950/20"
                                                            onClick={() => handleStatusChange("Active")}
                                                        >
                                                            <div className="flex items-center gap-2 text-green-600">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span className="font-semibold text-sm">Activate Account</span>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-normal">Restore admin access</span>
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* === TAB 2: EDIT PROFILE === */}
                                    <TabsContent value="edit" className="mt-0">
                                        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                                            <UserCircle className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-wide font-semibold">Update Admin Information</span>
                                        </div>

                                        <div className="space-y-8 py-2 animate-in fade-in slide-in-from-bottom-2">
                                            {/* Account Information */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Account Details
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="admin-name">Full Name <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="admin-name"
                                                            value={userData.name || ""}
                                                            onChange={(e) => handleUpdate({ name: e.target.value })}
                                                            placeholder="Admin name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="admin-email">Email <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="admin-email"
                                                            type="email"
                                                            value={userData.email || ""}
                                                            onChange={(e) => handleUpdate({ email: e.target.value })}
                                                            placeholder="admin@example.com"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="admin-phone">Phone <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="admin-phone"
                                                            value={userData.phone || ""}
                                                            onChange={(e) => handleUpdate({ phone: e.target.value.replace(/\D/g, "") })}
                                                            placeholder="Phone number"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Status</Label>
                                                        <div className="flex items-center h-10 px-3 bg-muted/50 rounded-md border border-border/50">
                                                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${currentStatus === 'Active' ? 'text-green-600' : 'text-destructive'}`}>
                                                                <div className={`w-2 h-2 rounded-full ${currentStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                                                {currentStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Security Info */}
                                            <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-sm">Security Notice</p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            This account has <strong>Super Admin</strong> privileges with full access to the platform.
                                                            Changes to email or name will take effect immediately. To change this user's password,
                                                            use the <strong>Reset Password</strong> option in the Overview tab.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </div>

                    {/* --- FOOTER --- */}
                    <DialogFooter className="modal-footer-standard px-8 py-4 bg-muted/5 flex flex-col sm:flex-row gap-4 sm:justify-between items-center">
                        {!isSelf && (
                            currentStatus === 'Active' ? (
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10 w-full sm:w-auto font-medium"
                                    onClick={() => setIsSuspendDialogOpen(true)}
                                >
                                    <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                                </Button>
                            ) : (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto font-medium shadow-md shadow-green-500/20"
                                    onClick={() => handleStatusChange("Active")}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Activate
                                </Button>
                            )
                        )}
                        {isSelf && <div />}

                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none font-medium">Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none font-semibold shadow-lg shadow-primary/20 px-8">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </ModalDialog>

            {/* --- SUSPENSION CONFIRMATION DIALOG --- */}
            <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
                <AlertDialogContent className="modal-layout-standard modal-sm">
                    <AlertDialogHeader className="modal-header-standard">
                        <AlertDialogTitle className="flex items-center gap-3 text-destructive text-xl font-bold">
                            <div className="p-2 bg-destructive/10 rounded-lg">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            Suspend Admin?
                        </AlertDialogTitle>
                        <div className="modal-body-standard !p-0 mt-4">
                            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                                Are you sure you want to suspend <span className="font-bold text-foreground">{admin.name}</span>?
                                This is a critical action for an administrator account.
                            </AlertDialogDescription>

                            <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-xl mt-6">
                                <h5 className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-2">Effects:</h5>
                                <ul className="space-y-2">
                                    {[
                                        "Immediately revoke all admin privileges",
                                        "Block access to admin dashboard",
                                        "Prevent login until reactivated",
                                        "Invalidate active session tokens"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-destructive/80">
                                            <div className="w-1 h-1 rounded-full bg-destructive/40 mt-1.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="modal-footer-standard px-6 py-4 bg-muted/5">
                        <AlertDialogCancel className="font-medium">Keep Active</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleStatusChange("Suspended")}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-8 shadow-lg shadow-destructive/20"
                        >
                            Suspend Admin
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* --- RESET PASSWORD DIALOG --- */}
            <AlertDialog open={isResetPasswordOpen} onOpenChange={(open) => { setIsResetPasswordOpen(open); if (!open) setResetResult(null); }}>
                <AlertDialogContent className="modal-layout-standard modal-sm">
                    <AlertDialogHeader className="modal-header-standard">
                        <AlertDialogTitle className="flex items-center gap-3 text-amber-600 text-xl font-bold">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            Reset Password
                        </AlertDialogTitle>
                        <div className="modal-body-standard !p-0 mt-4 space-y-4">
                            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                                Reset password for <span className="font-bold text-foreground">{admin.name}</span>.
                                New credentials will be sent via Email & WhatsApp.
                            </AlertDialogDescription>

                            {!resetResult ? (
                                <>
                                    {/* Custom Password Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-pw" className="text-xs text-muted-foreground">
                                            Custom Password <span className="text-muted-foreground/60">(optional — leave empty to auto-generate)</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="custom-pw"
                                                type={showCustomPassword ? "text" : "password"}
                                                placeholder="Leave empty for auto-generated"
                                                value={customPassword}
                                                onChange={(e) => setCustomPassword(e.target.value)}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 z-10 text-muted-foreground transition-colors hover:text-foreground"
                                                onClick={() => setShowCustomPassword(!showCustomPassword)}
                                            >
                                                {showCustomPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        {customPassword && customPassword.length < 6 && (
                                            <p className="text-[10px] text-destructive">Password must be at least 6 characters</p>
                                        )}
                                    </div>

                                    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-3 rounded-lg">
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            <strong>Note:</strong> The new password will be sent to the user via Email and WhatsApp notification.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                /* Reset Result */
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-200/50 dark:border-green-900/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span className="font-semibold text-sm text-green-700 dark:text-green-400">Password Reset Successful</span>
                                        </div>

                                        <div className="flex items-center justify-between bg-background/80 p-2.5 rounded-md border border-border/50 mb-2">
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">New Password: </span>
                                                <code className="font-mono font-bold text-foreground">{resetResult.password}</code>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(resetResult.password!, 'Password')}>
                                                <Copy className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Notification Status */}
                                    {resetResult.notification_status && (
                                        <div className="space-y-1.5 pt-2">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notification Status</p>
                                            <div className="flex flex-col gap-1">
                                                {(() => {
                                                    const ns = resetResult.notification_status!;
                                                    const emailOk = ns.email === 'ok';
                                                    const waRaw = ns.whatsapp || 'error';
                                                    const waOk = waRaw === 'ok';
                                                    const waSkipped = waRaw.includes('skipped');
                                                    return (
                                                        <>
                                                            <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-muted/30 rounded">
                                                                <span className="text-muted-foreground">Email</span>
                                                                {emailOk
                                                                    ? <span className="text-green-600 flex items-center gap-1">Sent <CheckCircle2 className="w-3 h-3" /></span>
                                                                    : <span className="text-red-500 flex items-center gap-1">Failed <AlertCircle className="w-3 h-3" /></span>
                                                                }
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-muted/30 rounded">
                                                                <span className="text-muted-foreground">WhatsApp</span>
                                                                {waOk
                                                                    ? <span className="text-green-600 flex items-center gap-1">Sent <CheckCircle2 className="w-3 h-3" /></span>
                                                                    : waSkipped
                                                                        ? <span className="text-yellow-600 flex items-center gap-1">Skipped <AlertCircle className="w-3 h-3" /></span>
                                                                        : <span className="text-red-500 flex items-center gap-1">Failed <AlertCircle className="w-3 h-3" /></span>
                                                                }
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="modal-footer-standard px-6 py-4 bg-muted/5">
                        {resetResult ? (
                            <AlertDialogAction className="font-medium px-8" onClick={() => { setIsResetPasswordOpen(false); setResetResult(null); }}>
                                Done
                            </AlertDialogAction>
                        ) : (
                            <>
                                <AlertDialogCancel className="font-medium" onClick={() => setResetResult(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleResetPassword}
                                    disabled={isResettingPassword || (!!customPassword && customPassword.length < 6)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 shadow-lg shadow-amber-500/20"
                                >
                                    {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                    Reset Password
                                </AlertDialogAction>
                            </>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
