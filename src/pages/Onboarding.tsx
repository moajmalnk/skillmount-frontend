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
  ArrowRight, ArrowLeft, Upload, Loader2, CheckCircle2, Camera, Link as LinkIcon, CalendarIcon, X
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileInput } from "@/components/ui/file-input"; // Assuming user meant a custom file input or we style the existing one nicely
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// API Services
import { userService } from "@/services/userService";
import { systemService } from "@/services/systemService";
import { Label } from "@/components/ui/label";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "@/lib/imageUtils";

// --- ZOD SCHEMA (Kept mostly same, adjusted optionality) ---
const onboardingSchema = z.object({
  // Step 1: Personal
  whatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  address: z.string().min(10, "Address is too short"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),

  // Step 2: Professional
  qualification: z.string().min(2, "Qualification is required"),
  domain: z.string().optional().or(z.literal("")),

  // Role Specifics (All optional as they depend on role)
  mentor: z.string().optional(),
  coordinator: z.string().optional(),
  aim: z.string().optional(),
  skills: z.string().optional(),
  socialMedia: z.string().optional(),
  awards: z.string().optional(),
  topic: z.string().optional(),
  referringPlatform: z.string().optional(),
  couponCode: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
}

function CustomDatePicker({ value, onChange }: DatePickerProps) {
  // Initialize with value or default to 2000-01-01
  const [date, setDate] = useState<Date>(value ? new Date(value) : new Date("2000-01-01"));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) setDate(new Date(value));
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => 1960 + i).reverse();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleYearChange = (year: string) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(year));
    setDate(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(date);
    newDate.setMonth(months.indexOf(month));
    setDate(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full px-3 text-left font-normal text-base md:text-sm",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              format(new Date(value), "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center gap-2 p-3 border-b border-border/50">
          <Select value={date.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[300px]">
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={months[date.getMonth()]} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[300px]">
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          month={date}
          onMonthChange={setDate}
          selected={value ? new Date(value) : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setIsOpen(false);
            }
          }}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function SkillsInput({ value, onChange }: { value?: string, onChange: (val: string) => void }) {
  const [inputValue, setInputValue] = useState("");
  // Don't modify the source value directly, just parse it for display
  const tags = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        // Enforce unique tags
        onChange([...tags, newTag].join(", "));
        setInputValue("");
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags.join(", "));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove).join(", "));
  };

  return (
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-secondary/20 rounded-md border border-border/50 min-h-[40px]">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="pl-2.5 pr-1 py-1 text-sm bg-background border-border/50 shadow-sm flex items-center gap-1 hover:bg-background">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <FormControl>
        <Input
          placeholder={tags.length === 0 ? "Type skills (e.g. React, Java) and press Enter..." : "Add another skill..."}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-background"
          onBlur={() => {
            if (inputValue.trim()) {
              if (!tags.includes(inputValue.trim())) {
                onChange([...tags, inputValue.trim()].join(", "));
              }
              setInputValue("");
            }
          }}
        />
      </FormControl>
      <p className="text-[0.8rem] text-muted-foreground">
        Press <strong>Enter</strong> or <strong>Comma</strong> to add a tag.
      </p>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);

  // File State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // To send to backend

  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Data State
  const [mentors, setMentors] = useState<string[]>([]);
  const [coordinators, setCoordinators] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  // Initialize Form
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      whatsapp: "", dob: "", address: "", pincode: "",
      qualification: "", domain: "", mentor: "", coordinator: "",
      aim: "", skills: "", socialMedia: "", awards: "",
      topic: "", referringPlatform: "", couponCode: ""
    },
    mode: "onChange"
  });

  // 1. Redirect if already completed
  useEffect(() => {
    if (user?.isProfileComplete) navigate("/");
  }, [user, navigate]);

  // 2. Fetch Data (Settings & Tutors)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settings, tutorsData] = await Promise.all([
          systemService.getSettings(),
          userService.getElementsByRole('tutor') // Fetch real tutors
        ]);

        const realTutorNames = tutorsData.map((t: any) => t.name);
        const manualMentors = settings.mentors || [];
        setMentors([...new Set([...realTutorNames, ...manualMentors])]);

        setCoordinators(settings.coordinators || []);

        setTopics(settings.topics || []);
        setPlatforms(settings.platforms || []);

      } catch (error) {
        console.error("Failed to load onboarding data", error);
        setMentors([]);
        setCoordinators([]);
      }
    };
    loadData();
  }, []);


  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["whatsapp", "dob", "address", "pincode"];
    } else if (step === 2) {
      fieldsToValidate = ["qualification", "domain"];
      if (user?.role === "student") {
        fieldsToValidate.push("mentor", "coordinator", "aim", "skills");
        // Note: socialMedia is optional, so not validating it
      } else if (user?.role === "tutor") {
        fieldsToValidate.push("topic");
      } else if (user?.role === "affiliate") {
        fieldsToValidate.push("referringPlatform");
      }
    }

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
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setIsCropping(true);
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
    // Clear input value to allow re-selecting same file
    e.target.value = '';
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    try {
      if (!tempImageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels,
        rotation
      );

      if (croppedImage) {
        setPhotoFile(croppedImage);
        setPhotoPreview(URL.createObjectURL(croppedImage));
        setIsCropping(false);
        setTempImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setTempImageSrc(null);
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) return;

    // Validate Photo
    if (!photoFile) {
      toast.error("Please upload a profile photo.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        role: user.role,
        phone: data.whatsapp,

        // Direct Mapping
        dob: data.dob,
        address: data.address,
        pincode: data.pincode,
        qualification: data.qualification,
        aim: data.aim, // Now maps to 'aim' column, not headline

        // Keep headline/bio for display
        headline: data.aim || data.qualification,
        bio: `Professional Goal: ${data.aim}`,

        isProfileComplete: true,
        avatarFile: photoFile
      };

      // Preserve batch information from the existing user profile
      // The backend expects batch_id, but the frontend uses batch
      if (user.role === 'student') {
        // Check for batch in different possible locations
        const batchId = (user as any).batch || (user as any).batch_id ||
          ((user as any).student_profile?.batch_id);
        if (batchId) {
          payload.batch_id = batchId;
        }
      }

      if (user.role === 'student') {
        payload.skills = data.skills ? data.skills.split(',').map(s => s.trim()) : [];
        if (data.mentor) payload.mentor = data.mentor;
        if (data.coordinator) payload.coordinator = data.coordinator;

        // Construct Socials JSON
        payload.socials = JSON.stringify({
          linkedin: data.socialMedia || ''
        });

        if (data.couponCode) payload.coupon_code = data.couponCode;
      }

      if (user.role === 'tutor' && data.topic) {
        payload.topics = [data.topic];
      }

      if (user.role === 'affiliate' && data.referringPlatform) {
        payload.platform = data.referringPlatform;
      }

      // Send data to backend
      const response = await userService.update(user.id, payload);

      // Update user in context
      const updatedUser = { ...user, isProfileComplete: true };
      login(updatedUser);

      toast.success("Profile completed successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-primary mb-1">Personal Details</h3>
        <p className="text-xs text-muted-foreground">Confirm your contact information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
            <FormControl><Input placeholder="+91..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="dob" render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
            <CustomDatePicker
              value={field.value}
              onChange={(date) => field.onChange(date)}
            />
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <FormField control={form.control} name="address" render={({ field }) => (
        <FormItem>
          <FormLabel>Address</FormLabel>
          <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="pincode" render={({ field }) => (
        <FormItem>
          <FormLabel>Pincode</FormLabel>
          <FormControl><Input {...field} maxLength={6} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Common Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField control={form.control} name="qualification" render={({ field }) => (
          <FormItem>
            <FormLabel>Qualification <span className="text-red-500">*</span></FormLabel>
            <FormControl><Input placeholder="e.g. B.Tech" {...field} /></FormControl>
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

      {/* Student Specifics - Using Dynamic Data */}
      {user?.role === 'student' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField control={form.control} name="mentor" render={({ field }) => (
              <FormItem>
                <FormLabel>Mentor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {mentors.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="coordinator" render={({ field }) => (
              <FormItem>
                <FormLabel>Coordinator</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {coordinators.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="aim" render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Aim</FormLabel>
              <FormControl><Textarea className="min-h-[100px]" placeholder="What are your career goals?" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="skills" render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <SkillsInput value={field.value} onChange={field.onChange} />
            </FormItem>
          )} />

          <FormField control={form.control} name="couponCode" render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code (Optional)</FormLabel>
              <FormControl><Input placeholder="Enter coupon code if you have one" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>
      )}

      {/* Tutor Specifics */}
      {user?.role === 'tutor' && (
        <FormField control={form.control} name="topic" render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Topic</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger></FormControl>
              <SelectContent>
                {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      )}

      {/* Affiliate Specifics */}
      {user?.role === 'affiliate' && (
        <FormField control={form.control} name="referringPlatform" render={({ field }) => (
          <FormItem>
            <FormLabel>Platform</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select Platform" /></SelectTrigger></FormControl>
              <SelectContent>
                {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 animate-fade-in space-y-6 w-full">

      {isCropping && tempImageSrc ? (
        <div className="w-full h-full flex flex-col items-center space-y-4">
          <div className="relative w-full h-[300px] sm:h-[400px] bg-black/5 rounded-lg overflow-hidden border border-border">
            <Cropper
              image={tempImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          </div>

          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zoom</span>
              <span>{(zoom * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(val) => setZoom(val[0])}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={cancelCrop}>Cancel</Button>
            <Button onClick={showCroppedImage}>Save Photo</Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-6 mb-6">
            <div className={cn(
              "w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] border-background shadow-xl flex items-center justify-center overflow-hidden transition-all relative group",
              photoPreview ? "ring-4 ring-primary/20" : "bg-muted"
            )}>
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-medium">Change Photo</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground/50">
                  <Camera className="w-12 h-12 mb-2" />
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">Profile Photo</h3>
              <p className="text-sm text-muted-foreground">Upload a professional photo for your ID card.</p>
            </div>
          </div>

          <div className="flex justify-center">
            <input
              type="file"
              id="photo-upload-hidden"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              variant={photoPreview ? "outline" : "default"}
              onClick={() => document.getElementById('photo-upload-hidden')?.click()}
              className="w-full sm:w-auto min-w-[200px]"
            >
              <Upload className="w-4 h-4 mr-2" />
              {photoPreview ? "Change Photo" : "Upload Photo"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

      <div className="w-full max-w-3xl">
        <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-0">
          <Badge variant="secondary" className="px-4 py-1 text-primary mb-4 border-primary/20">One-Time Setup</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">Complete your profile to access the dashboard.</p>
        </div>

        <Card className="border-border shadow-2xl relative overflow-hidden backdrop-blur-sm bg-card/95">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary">
            <div className="h-full bg-primary transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }} />
          </div>

          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 pt-5 px-4 sm:p-6 sm:pb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-primary text-primary-foreground shrink-0">
                  {step}
                </span>
                {step === 1 && "Personal Info"}
                {step === 2 && "Professional Info"}
                {step === 3 && "Profile Photo"}
              </CardTitle>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground text-right">Step {step} of 3</span>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <CardContent className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </CardContent>

              <CardFooter className="flex justify-between border-t border-border/50 bg-muted/20 p-4 sm:p-6">
                <Button variant="outline" onClick={handleBack} disabled={step === 1 || isLoading} className="w-28 sm:w-32">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Button onClick={handleNext} disabled={isLoading} className="w-32 sm:w-40">
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