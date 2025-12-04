import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext"; // <--- IMPORT THIS
import ProfessionalBackground from "@/components/ProfessionalBackground";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- GET LOGIN FUNCTION FROM CONTEXT
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(email, password);
      const user = response.user;
      
      // 1. UPDATE GLOBAL STATE (This fixes the redirect loop/lag)
      login(user); 
      
      toast.success(`Welcome back, ${user.name}`);

      // 2. THE TRAFFIC CONTROLLER LOGIC
      
      // Scenario A: Super Admin -> Always goes to Admin Dashboard
      if (user.role === 'super_admin') {
        navigate('/admin');
        return;
      }

      // Scenario B: Profile Incomplete -> FORCE REDIRECT to Onboarding
      if (!user.isProfileComplete) {
        navigate('/onboarding');
        return;
      }

      // Scenario C: Profile Complete -> Go to Role Specific Dashboard (Home)
      // Since we use conditional rendering, we send them to Home or specific route
      if (user.role === 'tutor') {
         navigate('/tickets/manage'); // Tutors might want to see tickets first
      } else {
         navigate('/');
      }

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
      toast.error("Login failed. Please check your credentials.");
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription>
              Enter the credentials sent to your email/WhatsApp
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <p>
              Don't have an account? <span className="text-foreground font-medium">Contact your administrator.</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;