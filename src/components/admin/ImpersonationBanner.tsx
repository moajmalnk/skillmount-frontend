import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
import { useLocation } from "react-router-dom";

export const ImpersonationBanner = () => {
    const isImpersonating = authService.isImpersonating();
    const location = useLocation();
    const currentUser = authService.getSession();

    // Don't show if not impersonating
    if (!isImpersonating) return null;

    // Don't show on login page (edge case)
    if (location.pathname === '/login') return null;

    return (
        <div className="relative z-[100] bg-purple-700 text-white px-4 py-2 shadow-md flex items-center justify-between animate-in slide-in-from-top-full duration-300">
            <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-200 animate-pulse" />
                <span className="text-sm font-medium">
                    Viewing as <span className="font-bold underline">{currentUser?.name || "Student"}</span> (Full Access)
                </span>
            </div>

            <Button
                variant="secondary"
                size="sm"
                onClick={() => authService.exitImpersonation()}
                className="h-8 bg-white text-purple-700 hover:bg-purple-50 border-0 font-semibold shadow-sm"
            >
                <LogOut className="w-4 h-4 mr-2" />
                Exit to Admin
            </Button>
        </div>
    );
};
