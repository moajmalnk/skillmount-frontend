import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, ArrowLeft, Upload, Loader2, CheckCircle2, Camera, Link as LinkIcon 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Label } from "recharts";

// --- MOCK DATA ---
const MENTORS = ["Dr. Smith", "Prof. Jane Doe", "Mr. Alex Johnson"];
const COORDINATORS = ["Sarah Wilson", "Mike Ross", "Rachel Green"];
const TOPICS = ["WordPress Development", "Full Stack Dev", "Digital Marketing", "UI/UX Design"];
const REFERRING_PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Blog", "Word of Mouth"];

// --- ZOD SCHEMA DEFINITION ---
const onboardingSchema = z.object({
  // Step 1: Personal
  whatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(10, "Address is too short"),
  pincode: z.string().length(6, "Pincode must be exactly 6 digits"),

  // Step 2: Professional (Common)
  qualification: z.string().min(2, "Qualification is required"),
  domain: z.string().url("Please enter a valid URL").or(z.literal("")), // Optional but verified if present

  // Step 2: Student Specific
  mentor: z.string().optional(),
  coordinator: z.string().optional(),
  aim: z.string().optional(),
  skills: z.string().optional(),
  socialMedia: z.string().optional(),
  awards: z.string().optional(),

  // Step 2: Tutor Specific
  topic: z.string().optional(),

  // Step 2: Affiliate Specific
  referringPlatform: z.string().optional(),

  // Step 3: Photo
  // Note: File validation is tricky in Zod/RHF, usually handled manually in the render or via custom check
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Form
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      whatsapp: "", dob: "", address: "", pincode: "",
      qualification: "", domain: "", mentor: "", coordinator: "",
      aim: "", skills: "", socialMedia: "", awards: "",
      topic: "", referringPlatform: ""
    },
    mode: "onChange" 
  });

  // Redirect if already completed
  useEffect(() => {
    if (user?.isProfileComplete) navigate("/");
  }, [user, navigate]);

  // --- NAVIGATION HANDLERS ---

  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["whatsapp", "dob", "address", "pincode"];
    } else if (step === 2) {
      fieldsToValidate = ["qualification", "domain"]; // Common
      
      if (user?.role === "student") {
        fieldsToValidate.push("mentor", "coordinator", "aim", "skills", "socialMedia");
      } else if (user?.role === "tutor") {
        fieldsToValidate.push("topic");
      } else if (user?.role === "affiliate") {
        fieldsToValidate.push("referringPlatform");
      }
    }

    // Trigger validation only for current step fields
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (step < 3) {
        setStep(s => s + 1);
        setProgress(((step + 1) / 3) * 100);
      } else {
        form.handleSubmit(onSubmit)();
      }
    } else {
      toast.error("Please fix errors before proceeding");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      setProgress(((step - 1) / 3) * 100);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!photoPreview) {
      toast.error("Please upload a profile photo to complete registration.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      if (user) {
        const updatedUser = { 
          ...user, 
          isProfileComplete: true,
          ...data,
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

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-primary mb-1">Personal Details</h3>
        <p className="text-xs text-muted-foreground">Admin-set fields are read-only.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={user?.name || ""} disabled className="bg-muted/50" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted/50" />
        </div>

        <FormField control={form.control} name="whatsapp" render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp Number <span className="text-red-500">*</span></FormLabel>
            <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="dob" render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
            <FormControl><Input type="date" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <FormField control={form.control} name="address" render={({ field }) => (
        <FormItem>
          <FormLabel>Full Address <span className="text-red-500">*</span></FormLabel>
          <FormControl><Textarea placeholder="House No, Street..." className="resize-none" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="pincode" render={({ field }) => (
        <FormItem>
          <FormLabel>Pincode <span className="text-red-500">*</span></FormLabel>
          <FormControl><Input placeholder="676507" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="outline" className="capitalize">{user?.role} Profile</Badge>
        <span className="text-sm text-muted-foreground">Professional details</span>
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={form.control} name="qualification" render={({ field }) => (
          <FormItem>
            <FormLabel>Qualification <span className="text-red-500">*</span></FormLabel>
            <FormControl><Input placeholder="e.g. BCA, B.Tech" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="domain" render={({ field }) => (
          <FormItem>
            <FormLabel>Portfolio URL</FormLabel>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <FormControl><Input className="pl-9" placeholder="https://..." {...field} /></FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      {/* Role Specific */}
      {user?.role === 'student' && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="mentor" render={({ field }) => (
              <FormItem>
                <FormLabel>Mentor <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                  <SelectContent>{MENTORS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="coordinator" render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinator <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                  <SelectContent>{COORDINATORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="aim" render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Aim <span className="text-red-500">*</span></FormLabel>
              <FormControl><Textarea placeholder="Career goals..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="skills" render={({ field }) => (
            <FormItem>
              <FormLabel>Skills <span className="text-red-500">*</span></FormLabel>
              <FormControl><Input placeholder="Java, React..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="socialMedia" render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn/GitHub <span className="text-red-500">*</span></FormLabel>
              <FormControl><Input placeholder="Profile URL" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>
      )}

      {user?.role === 'tutor' && (
        <FormField control={form.control} name="topic" render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Topic <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger></FormControl>
              <SelectContent>{TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      )}

      {user?.role === 'affiliate' && (
        <FormField control={form.control} name="referringPlatform" render={({ field }) => (
          <FormItem>
            <FormLabel>Platform <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select Platform" /></SelectTrigger></FormControl>
              <SelectContent>{REFERRING_PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      )}
    </div>
  );

  const renderStep3 = () => (
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
        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
        {photoPreview && <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg"><Upload className="w-4 h-4" /></div>}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">Upload Profile Photo</h3>
        <p className="text-xs text-muted-foreground mt-1">Required for ID Card generation.</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="px-4 py-1 text-primary mb-4 border-primary/20">One-Time Setup</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-muted-foreground mt-2">Complete your profile to access the dashboard.</p>
        </div>

        <Card className="border-border shadow-2xl relative overflow-hidden backdrop-blur-sm bg-card/95">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary">
            <div className="h-full bg-primary transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }} />
          </div>

          <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                  {step}
                </span>
                {step === 1 && "Personal Info"}
                {step === 2 && "Professional Info"}
                {step === 3 && "Profile Photo"}
              </CardTitle>
              <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <CardContent className="p-6 md:p-8 min-h-[400px]">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </CardContent>

              <CardFooter className="flex justify-between border-t border-border/50 bg-muted/20 p-6">
                <Button variant="outline" onClick={handleBack} disabled={step === 1 || isLoading} className="w-32">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                
                <Button onClick={handleNext} disabled={isLoading} className="w-40">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
                   step === 3 ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Finish</> : 
                   <><ArrowRight className="w-4 h-4 mr-2" /> Next</>}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}