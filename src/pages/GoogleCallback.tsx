import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const processLogin = async () => {
            const accessToken = searchParams.get("access");
            const refreshToken = searchParams.get("refresh");
            const error = searchParams.get("error");

            if (error) {
                toast.error("Google Login Failed: " + error);
                navigate("/login");
                return;
            }

            if (accessToken && refreshToken) {
                try {
                    // 1. Storage
                    localStorage.setItem("access_token", accessToken);
                    localStorage.setItem("refresh_token", refreshToken);

                    // 2. Fetch User Profile
                    const userResponse = await authService.getMe();
                    const user = userResponse;

                    login(user);
                    toast.success(`Welcome back, ${user.name}`);

                    // 3. Redirect
                    if (user.role === 'super_admin') {
                        navigate('/admin');
                    } else if (['student', 'tutor', 'affiliate'].includes(user.role) && !user.isProfileComplete) {
                        navigate('/onboarding');
                    } else if (user.role === 'tutor') {
                        navigate('/tickets/manage');
                    } else {
                        navigate('/');
                    }
                } catch (err) {
                    console.error("Callback Error", err);
                    toast.error("Failed to retrieve user data.");
                    navigate("/login");
                }
            } else {
                // No tokens found
                navigate("/login");
            }
        };

        processLogin();
    }, [searchParams, navigate, login]);

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-[#050b14] font-sans text-slate-100 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center gap-6 p-8 bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800/60 rounded-3xl shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
                    <img
                        src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png"
                        alt="Skillmount"
                        className="w-8 h-8 object-contain brightness-0 invert"
                        style={{ filter: "brightness(0) invert(1)" }}
                    />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    <h2 className="text-lg font-medium text-white">Completing secure login...</h2>
                    <p className="text-sm text-slate-400">Please wait while we verify your credentials.</p>
                </div>
            </div>
        </div>
    );
};

export default GoogleCallback;
