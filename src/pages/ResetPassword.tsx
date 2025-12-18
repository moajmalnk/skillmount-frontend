import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import ProfessionalBackground from "@/components/ProfessionalBackground";

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            if (!uid || !token) {
                throw new Error("Invalid reset link");
            }

            await authService.resetPassword(uid, token, password);
            setSuccess(true);
            toast.success("Password reset successfully!");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to reset password. Link may be expired.");
            toast.error("Password reset failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-background overflow-hidden">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <ProfessionalBackground
                    src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp"
                    alt="Background"
                    className="w-full h-full opacity-5"
                    overlay={true}
                />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                            {success ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                                <Lock className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {success ? "Password Reset Complete" : "Set New Password"}
                        </CardTitle>
                        <CardDescription>
                            {success
                                ? "Your password has been successfully updated. Redirecting to login..."
                                : "Enter your new password below."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!success ? (
                            <form onSubmit={handleReset} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => navigate("/login")}
                            >
                                Go to Login
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
