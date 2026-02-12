import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { userService } from "@/services/userService";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ChangePasswordDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function ChangePasswordDialog({ open: controlledOpen, onOpenChange: setControlledOpen, trigger }: ChangePasswordDialogProps = {}) {
    // Internal state for when uncontrolled
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

    const [loading, setLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleUpdate = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        // Prevent using the same password
        if (oldPassword === newPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        setLoading(true);
        try {
            console.log("[Password Change] Attempting password change...");
            await userService.changePassword(oldPassword, newPassword);
            console.log("[Password Change] Success!");

            toast.success("Password updated successfully");
            setOpen(false);

            // Reset form
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("[Password Change] Error details:", error);
            console.error("[Password Change] Response data:", error?.response?.data);

            // Error is handled by service or toast, mostly we want to catch specific messages here if API returns them
            const msg = error?.response?.data?.detail || error?.message || "Failed to update password";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger !== undefined ? trigger : (
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <KeyRound className="w-4 h-4" />
                        Change Password
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="modal-layout-standard modal-sm">
                <DialogHeader className="modal-header-standard">
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Enter your current password and a new secure password.
                    </DialogDescription>
                </DialogHeader>
                <div className="modal-body-standard">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="old-pass">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="old-pass"
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="••••••"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="pr-10" // Add padding for icon
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 z-10 text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2 pt-2 border-t border-border/40">
                            <div className="grid gap-2">
                                <Label htmlFor="new-pass">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-pass"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 z-10 text-muted-foreground transition-colors hover:text-foreground"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-pass">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-pass"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 z-10 text-muted-foreground transition-colors hover:text-foreground"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        <span className="sr-only">Toggle password visibility</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="modal-footer-standard">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading} className="px-8">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
