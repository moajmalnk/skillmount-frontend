import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, MapPin, Briefcase, Camera, CheckCircle2, 
  ArrowRight, ArrowLeft, Upload, Loader2, BookOpen, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// --- MOCK DATA FOR DROPDOWNS (Should come from API/Settings) ---
const MENTORS = ["Dr. Smith", "Prof. Jane Doe", "Mr. Alex Johnson"];
const COORDINATORS = ["Sarah Wilson", "Mike Ross", "Rachel Green"];
const TOPICS = ["WordPress Development", "Full Stack Dev", "Digital Marketing", "UI/UX Design"];
const REFERRING_PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Blog", "Word of Mouth"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(33);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Comprehensive Form State matching your Requirements Document
  const [formData, setFormData] = useState({
    // --- 1. First Login (Mandatory) Common Fields ---
    whatsapp: "",
    dob: "",
    address: "",
    pincode: "",
    
    // --- 2. Role Specific Fields ---
    // Common Professional
    qualification: "",
    domain: "", // Portfolio/Website URL
    
    // Student Specific
    mentor: "",
    coordinator: "",
    aim: "", // Professional/Academic goal
    skills: "", // Text/Tags
    awards: "", // Awards, Projects
    socialMedia: "",
    
    // Tutor Specific
    topics: "",
    
    // Affiliate Specific
    referringPlatform: "",
    
    // --- 3. File Upload ---
    photo: null as File | null
  });

  // Redirect if already completed
  useEffect(() => {
    if (user?.isProfileComplete) {
      navigate("/");
    }
  }, [user, navigate]);

  // VALIDATION LOGIC
  const isStepValid = () => {
    // Step 1: Personal Details (Common)
    if (step === 1) {
      return (
        formData.whatsapp.trim() !== "" &&
        formData.dob.trim() !== "" &&
        formData.address.trim() !== "" &&
        formData.pincode.trim() !== ""
      );
    }

    // Step 2: Professional Details (Role Specific)
    if (step === 2) {
      const commonProfessional = 
        formData.qualification.trim() !== "" && 
        formData.domain.trim() !== "";

      if (!commonProfessional) return false;

      if (user?.role === 'student') {
        return (
          formData.mentor.trim() !== "" &&
          formData.coordinator.trim() !== "" &&
          formData.aim.trim() !== "" &&
          formData.skills.trim() !== "" &&
          formData.awards.trim() !== "" &&
          formData.socialMedia.trim() !== ""
        );
      }

      if (user?.role === 'tutor') {
        return formData.topics.trim() !== "";
      }

      if (user?.role === 'affiliate') {
        return formData.referringPlatform.trim() !== "";
      }

      return true;
    }

    // Step 3: Photo Upload
    if (step === 3) {
      return !!photoPreview; 
    }

    return false;
  };

  const handleNext = () => {
    if (isStepValid()) {
      if (step < 3) {
        const nextStep = step + 1;
        setStep(nextStep);
        setProgress((nextStep / 3) * 100);
      } else {
        handleSubmit();
      }
    } else {
      toast.error("Please fill in all mandatory fields to proceed.");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      setProgress((prevStep / 3) * 100);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API submission delay
    setTimeout(() => {
      if (user) {
        const updatedUser = { 
          ...user, 
          isProfileComplete: true,
          ...formData,
          avatar: photoPreview || user.avatar 
        };
        
        login(updatedUser);
        
        toast.success("Profile Setup Complete!", {
          description: `Welcome to SkillMount, ${user.name}!`,
        });

        if (user.role === 'tutor') navigate('/tickets/manage');
        else navigate('/');
      }
      setIsLoading(false);
    }, 1500);
  };

  // --- RENDER STEPS ---

  const renderStep1_Personal = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-primary mb-1">Verify Personal Details</h3>
        <p className="text-xs text-muted-foreground">
          Some fields are pre-filled by the Admin. Please complete the missing mandatory fields.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Read Only Admin Fields */}
        <div className="space-y-2">
          <Label>Full Name (Admin Set)</Label>
          <Input value={user?.name || ""} disabled className="bg-muted/50 font-medium" />
        </div>
        <div className="space-y-2">
          <Label>Email Address (Admin Set)</Label>
          <Input value={user?.email || ""} disabled className="bg-muted/50 font-medium" />
        </div>

        {/* Mandatory User Fields */}
        <div className="space-y-2">
          <Label className="flex gap-1">WhatsApp Number <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="+91 98765 43210" 
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex gap-1">Date of Birth <span className="text-red-500">*</span></Label>
          <Input 
            type="date" 
            value={formData.dob}
            onChange={(e) => setFormData({...formData, dob: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex gap-1">Full Address <span className="text-red-500">*</span></Label>
        <Textarea 
          placeholder="House No, Street, City, State..." 
          className="resize-none"
          rows={3}
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex gap-1">Pincode <span className="text-red-500">*</span></Label>
          <Input 
            placeholder="676507" 
            value={formData.pincode}
            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2_RoleSpecific = () => {
    if (!user) return null;
    const role = user.role;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Badge variant="outline" className="text-sm px-3 py-1 capitalize">
            {role} Profile
          </Badge>
          <span className="text-sm text-muted-foreground">Complete your professional details</span>
        </div>

        {/* --- COMMON PROFESSIONAL FIELDS (All Roles) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex gap-1">Qualification <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="e.g. BCA, B.Tech, MBA" 
              value={formData.qualification}
              onChange={(e) => setFormData({...formData, qualification: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex gap-1">Domain / Website URL <span className="text-red-500">*</span></Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-9"
                placeholder="https://your-portfolio.com" 
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* --- STUDENT SPECIFIC FIELDS --- */}
        {role === 'student' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex gap-1">Assign Mentor <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFormData({...formData, mentor: val})} value={formData.mentor}>
                  <SelectTrigger><SelectValue placeholder="Select Mentor" /></SelectTrigger>
                  <SelectContent>
                    {MENTORS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex gap-1">Assign Coordinator <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFormData({...formData, coordinator: val})} value={formData.coordinator}>
                  <SelectTrigger><SelectValue placeholder="Select Coordinator" /></SelectTrigger>
                  <SelectContent>
                    {COORDINATORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex gap-1">Professional Aim <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="What is your career goal? (e.g. To become a Full Stack Developer)"
                value={formData.aim}
                onChange={(e) => setFormData({...formData, aim: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex gap-1">Skills & Expertise <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="Java, Python, React (Comma separated)" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex gap-1">Social Media Profiles <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="LinkedIn / GitHub URL" 
                  value={formData.socialMedia}
                  onChange={(e) => setFormData({...formData, socialMedia: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex gap-1">Awards & Projects <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="List any major projects or awards..."
                value={formData.awards}
                onChange={(e) => setFormData({...formData, awards: e.target.value})}
              />
            </div>
          </>
        )}

        {/* --- TUTOR SPECIFIC FIELDS --- */}
        {role === 'tutor' && (
          <div className="space-y-2">
            <Label className="flex gap-1">Subject Expertise (Topics) <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setFormData({...formData, topics: val})} value={formData.topics}>
              <SelectTrigger><SelectValue placeholder="Select Primary Topic" /></SelectTrigger>
              <SelectContent>
                {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* --- AFFILIATE SPECIFIC FIELDS --- */}
        {role === 'affiliate' && (
          <div className="space-y-2">
            <Label className="flex gap-1">Referring Platform <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setFormData({...formData, referringPlatform: val})} value={formData.referringPlatform}>
              <SelectTrigger><SelectValue placeholder="Select Platform" /></SelectTrigger>
              <SelectContent>
                {REFERRING_PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  const renderStep3_Photo = () => (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in space-y-6">
      <div className="relative group cursor-pointer">
        <div className={cn(
          "w-40 h-40 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden transition-all",
          photoPreview ? "border-primary" : "hover:border-primary/50 hover:bg-muted/50"
        )}>
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">Click to upload</span>
            </div>
          )}
        </div>
        
        {/* Hidden Input */}
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handlePhotoChange}
        />
        
        {photoPreview && (
          <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg">
            <Upload className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">Upload Profile Photo</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Please upload a professional photo. This will be used for your ID card and profile page.
        </p>
        <Badge variant="outline" className="mt-2">Mandatory</Badge>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

      <div className="w-full max-w-3xl">
        <div className="text-center mb-8 space-y-2">
          <Badge variant="secondary" className="px-4 py-1 text-primary mb-4 border-primary/20">
            One-Time Setup
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Before you access the dashboard, we need to complete your profile with some mandatory information required for the {user.role} role.
          </p>
        </div>

        <Card className="border-border shadow-2xl relative overflow-hidden backdrop-blur-sm bg-card/95">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-colors",
                  "border-primary bg-primary text-primary-foreground"
                )}>
                  {step}
                </span>
                {step === 1 && "Personal Information"}
                {step === 2 && "Professional Details"}
                {step === 3 && "Profile Identification"}
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 min-h-[400px]">
            {step === 1 && renderStep1_Personal()}
            {step === 2 && renderStep2_RoleSpecific()}
            {step === 3 && renderStep3_Photo()}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/50 bg-muted/20 p-6">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={step === 1 || isLoading}
              className="w-32"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={isLoading || !isStepValid()} 
              className="w-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : step === 3 ? (
                <>Complete <CheckCircle2 className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8 opacity-70">
          Need help? Contact support at <a href="#" className="underline hover:text-primary">support@skillmount.com</a>
        </p>
      </div>
    </div>
  );
}