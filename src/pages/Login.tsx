import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Mail, Loader2, Eye, EyeOff, User, Key, Sparkles, AlertCircle, ArrowRight, Chrome } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom Input Component to match specific design
const CustomInput = ({ icon: Icon, rightElement, className, ...props }: any) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    </div>
    <Input
      {...props}
      className={`h-10 bg-slate-50 dark:bg-[#020617]/50 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl pl-3 pr-12 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 shadow-sm dark:shadow-inner shadow-black/5 dark:shadow-black/20 ${className || ""}`}
    />
    {rightElement ? (
      <div className="absolute inset-y-0 right-2 flex items-center">
        {rightElement}
      </div>
    ) : Icon ? (
      <div className="absolute inset-y-0 right-2 flex items-center">
        <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800/80 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    ) : null}
  </div>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("email");
  const [isLoading, setIsLoading] = useState(false);

  // Standard Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [phone, setPhone] = useState("");
  const [otpMethod, setOtpMethod] = useState("whatsapp");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Magic/Reset State
  const [magicEmail, setMagicEmail] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const identifier = otpMethod === 'email' ? email : phone;
      if (!identifier) {
        toast.error(`Please enter your ${otpMethod}`);
        return;
      }
      // If phone, ensure just digits if needed, but backend handles fuzzy match
      await authService.sendOTP(identifier, otpMethod as any);
      setOtpSent(true);
      toast.success(`OTP sent to your ${otpMethod}`);
    } catch (err) {
      toast.error("Failed to send OTP. Account may not exist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const identifier = otpMethod === 'email' ? email : phone;
      const response = await authService.verifyOTP(identifier, otpCode, otpMethod as any);
      const user = response.user;
      login(user);
      toast.success(`Welcome, ${user.name}`);

      if (user.role === 'super_admin') {
        navigate('/admin');
      } else if (['student', 'tutor', 'affiliate'].includes(user.role) && !user.isProfileComplete) {
        navigate('/onboarding');
      } else if (user.role === 'tutor') {
        navigate('/tickets/manage');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const user = response.user;
      login(user);
      toast.success(`Welcome back, ${user.name}`);

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
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotImplemented = (feature: string) => (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.info(`${feature} feature coming soon!`);
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Redirect to Django Backend Google Auth
    window.location.href = "http://localhost:8000/api/auth/google/login/";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(magicEmail);
      toast.success("Password reset link sent to your email!");
      // Optional: switch back to login or show success state
      // For now, clear field
      setMagicEmail("");
    } catch (err: any) {
      // Even if user not found, backend returns 200 for security, so this catch handles mostly network errors
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-full flex items-center justify-center bg-slate-50 dark:bg-[#050b14] py-10 font-sans text-slate-900 dark:text-slate-100 selection:bg-purple-500/30 overflow-hidden">
      {/* Dotted Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-20 pointer-events-none"></div>

      {/* Subtle Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 dark:bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[400px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-[28px] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {/* Project Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 ring-1 ring-white/10 relative group"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png"
                  alt="Logo"
                  className="w-8 h-8 object-contain brightness-0 invert text-white"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </motion.div>
            </div>

            <div className="text-center mb-8 space-y-1.5">
              <motion.h1
                className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back
              </motion.h1>

            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-2 mb-6 px-1">
              {[
                { id: "email", icon: Mail, color: "purple", shadow: "shadow-purple-500/20" },
                { id: "otp", icon: Key, color: "fuchsia", shadow: "shadow-fuchsia-500/20" },
                { id: "reset", icon: Lock, color: "pink", shadow: "shadow-pink-500/20" },
                { id: "google", icon: GoogleIcon, color: "slate", shadow: "shadow-slate-500/20" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'google' ? handleGoogleLogin() : setActiveTab(tab.id)}
                  className={`relative group p-2.5 rounded-xl border transition-all duration-300 ${activeTab === tab.id
                    ? `bg-${tab.color}-600 border-${tab.color}-500 text-white shadow-lg ${tab.shadow} scale-110 z-10`
                    : "bg-slate-100 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1e293b] hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                >
                  {activeTab === tab.id && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 border-2 border-white dark:border-[#0f172a] rounded-full"></span>
                  )}
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Forms Area */}
            <div className="min-h-[180px]">
              <AnimatePresence mode="wait">
                {activeTab === 'email' && (
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleStandardLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 opacity-80">
                        <Mail className="w-3 h-3 text-purple-400" /> Email Address
                      </Label>
                      <CustomInput
                        icon={Mail}
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                          <Lock className="w-3 h-3 text-purple-400" /> Password
                        </Label>
                      </div>
                      <CustomInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        required
                        rightElement={
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="h-7 w-7 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        }
                      />

                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 mt-1"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Sign in"}
                      {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                    </Button>
                  </motion.form>
                )}

                {activeTab === 'otp' && (
                  <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}
                    className="space-y-4"
                  >
                    {!otpSent ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-1">
                          <button
                            type="button"
                            onClick={() => setOtpMethod("email")}
                            className={`h-9 rounded-lg border flex items-center justify-center gap-2 text-xs font-medium transition-all ${otpMethod === "email" ? "bg-slate-900 dark:bg-slate-800 border-purple-500 text-white" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80"}`}
                          >
                            <Mail className="w-3.5 h-3.5" /> Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpMethod("whatsapp")}
                            className={`h-9 rounded-lg border flex items-center justify-center gap-2 text-xs font-medium transition-all ${otpMethod === "whatsapp" ? "bg-slate-900 dark:bg-slate-800 border-purple-500 text-white" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80"}`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[7px] font-bold">W</span> WhatsApp
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 opacity-80">
                            {otpMethod === "email" ? (
                              <>
                                <Mail className="w-3 h-3 text-purple-400" /> Email Address
                              </>
                            ) : (
                              <>
                                <Key className="w-3 h-3 text-fuchsia-400" /> WhatsApp Number
                              </>
                            )}
                          </Label>
                          {otpMethod === "email" ? (
                            <CustomInput
                              icon={Mail}
                              type="email"
                              placeholder="Enter your email address"
                              value={email}
                              onChange={(e: any) => setEmail(e.target.value)}
                              required
                            />
                          ) : (
                            <div className="flex gap-2">
                              <div className="h-10 w-14 bg-slate-100 dark:bg-[#020617]/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-slate-400 font-medium text-xs">
                                +91
                              </div>
                              <div className="flex-1">
                                <CustomInput
                                  type="tel"
                                  placeholder="Enter WhatsApp number"
                                  value={phone}
                                  onChange={(e: any) => setPhone(e.target.value)}
                                  icon={Key}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-10 text-sm font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl shadow-lg shadow-fuchsia-500/25 transition-all duration-300 mt-1"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Send OTP"}
                          {!isLoading && <Sparkles className="ml-2 w-4 h-4" />}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 opacity-80">
                            <Key className="w-3 h-3 text-fuchsia-400" /> Enter OTP Code
                          </Label>
                          <CustomInput
                            type="text"
                            placeholder="XXXXXX"
                            className="text-center tracking-[0.5em] font-bold"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e: any) => setOtpCode(e.target.value)}
                            autoFocus
                            icon={Lock}
                          />
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">
                            Sent to your {otpMethod}. <button type="button" onClick={() => setOtpSent(false)} className="text-fuchsia-400 hover:underline">Change?</button>
                          </p>
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-10 text-sm font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl shadow-lg shadow-fuchsia-500/25 transition-all duration-300 mt-1"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Verify & Login"}
                          {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                      </>
                    )}
                  </motion.form>
                )}

                {activeTab === 'reset' && (
                  <motion.form
                    key="reset-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleResetPassword}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 opacity-80">
                        <Mail className="w-3 h-3 text-pink-400" /> Email Address
                      </Label>
                      <CustomInput
                        type="email"
                        placeholder="Enter your email address"
                        value={magicEmail}
                        onChange={(e: any) => setMagicEmail(e.target.value)}
                        icon={Lock}
                        rightElement={
                          <div className="h-7 w-7 flex items-center justify-center mr-1">
                            <Mail className="w-4 h-4 text-slate-500" />
                          </div>
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 text-sm font-semibold bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-300 mt-1"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Send Reset Link"}
                      {!isLoading && <Lock className="ml-2 w-4 h-4" />}
                    </Button>
                  </motion.form>
                )}


              </AnimatePresence>
            </div>

            {/* Footer Section */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-600"></span> Privacy Policy
                </a>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-600"></span> Terms of Use
                </a>
              </div>
              <div className="text-[9px] text-slate-600 font-medium tracking-wide">
                © 2026 SkillMount Educational
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;