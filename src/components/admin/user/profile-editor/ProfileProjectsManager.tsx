import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Save, X, AlertTriangle, Upload, Image as ImageIcon } from "lucide-react";
import { StudentProject } from "@/types/user";
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

interface ProfileProjectsManagerProps {
  projects: StudentProject[];
  onChange: (projects: StudentProject[]) => void;
}

export const ProfileProjectsManager = ({ projects = [], onChange }: ProfileProjectsManagerProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or ID
  const [editForm, setEditForm] = useState<Partial<StudentProject>>({});
  const [projectImages, setProjectImages] = useState<string[]>([]); // Local state for images
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New state for cancel confirmation
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const startEdit = (project?: StudentProject) => {
    if (project) {
      setIsEditing(project.id);
      setEditForm(project);
      // Initialize images from project data, or fallback to single imageUrl if array doesn't exist
      setProjectImages(project.images || (project.imageUrl ? [project.imageUrl] : []));
    } else {
      setIsEditing('new');
      setEditForm({
        id: `PRJ-${Date.now()}`,
        title: "",
        description: "",
        technologies: [],
        imageUrl: "",
        featured: false
      });
      setProjectImages([]);
    }
  };

  // Handle File Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload these to a server here.
      // For this demo, we create local object URLs.
      const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      const updatedImages = [...projectImages, ...newImageUrls];
      
      setProjectImages(updatedImages);
      
      // Auto-set the first image as the main cover image if not set
      if (!editForm.imageUrl && updatedImages.length > 0) {
        setEditForm(prev => ({ ...prev, imageUrl: updatedImages[0] }));
      }
      
      toast.success(`${newImageUrls.length} image(s) added`);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = projectImages.filter((_, i) => i !== index);
    setProjectImages(updatedImages);
    
    // If we deleted the main cover image, update it to the next available one
    if (editForm.imageUrl === projectImages[index]) {
        setEditForm(prev => ({ ...prev, imageUrl: updatedImages[0] || "" }));
    }
  };

  const saveProject = () => {
    if (!editForm.title) {
        toast.error("Project title is required");
        return;
    }
    
    // Use the first image as cover if imageUrl is empty
    const finalCoverImage = editForm.imageUrl || projectImages[0] || "";
    
    if (!finalCoverImage) {
        toast.error("Please upload at least one image");
        return;
    }

    const finalProjectData: StudentProject = {
        ...(editForm as StudentProject),
        images: projectImages,
        imageUrl: finalCoverImage
    };

    let updatedProjects;
    if (isEditing === 'new') {
        updatedProjects = [...projects, finalProjectData];
    } else {
        updatedProjects = projects.map(p => p.id === isEditing ? finalProjectData : p);
    }
    
    onChange(updatedProjects);
    setIsEditing(null);
    setEditForm({});
    setProjectImages([]);
    toast.success("Project saved successfully");
  };

  const deleteProject = (id: string) => {
    if(confirm("Delete this project?")) {
        onChange(projects.filter(p => p.id !== id));
        toast.success("Project deleted");
    }
  };

  // Helper to handle tech stack input (comma separated)
  const handleTechChange = (val: string) => {
    setEditForm({ ...editForm, technologies: val.split(',').map(s => s.trim()) });
  };

  // Handle Discard Action
  const handleDiscardChanges = () => {
    setIsEditing(null);
    setEditForm({});
    setProjectImages([]);
    setShowCancelAlert(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/20 animate-in fade-in zoom-in-95 duration-200">
        <h4 className="font-semibold text-sm flex items-center gap-2">
            {isEditing === 'new' ? <Plus className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>}
            {isEditing === 'new' ? 'Add New Project' : 'Edit Project'}
        </h4>
        
        <div className="space-y-2">
            <Label>Project Title <span className="text-red-500">*</span></Label>
            <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="e.g. E-Commerce Platform" />
        </div>
        
        <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
                value={editForm.description} 
                onChange={e => setEditForm({...editForm, description: e.target.value})} 
                placeholder="Briefly describe the project..."
                className="resize-none"
            />
        </div>

        {/* --- MULTI-IMAGE UPLOAD SECTION --- */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>Project Gallery <span className="text-red-500">*</span></Label>
                <span className="text-xs text-muted-foreground">{projectImages.length} images selected</span>
            </div>
            
            {/* Upload Area */}
            <div 
                className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer gap-2"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="p-3 bg-background rounded-full shadow-sm">
                    <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Image Preview Grid */}
            {projectImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {projectImages.map((img, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-md overflow-hidden border border-border">
                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                    onClick={() => removeImage(idx)}
                                    className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                    title="Remove Image"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                {editForm.imageUrl === img && (
                                    <span className="absolute bottom-1 left-0 right-0 text-[10px] text-center text-white bg-black/60 py-0.5">Cover</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Demo Link</Label>
                <Input value={editForm.demoUrl} onChange={e => setEditForm({...editForm, demoUrl: e.target.value})} placeholder="Optional" />
            </div>
            <div className="space-y-2">
                <Label>GitHub Link</Label>
                <Input value={editForm.repoUrl} onChange={e => setEditForm({...editForm, repoUrl: e.target.value})} placeholder="Optional" />
            </div>
        </div>

        <div className="space-y-2">
            <Label>Technologies (Comma separated)</Label>
            <Input 
                value={editForm.technologies?.join(', ')} 
                onChange={e => handleTechChange(e.target.value)} 
                placeholder="React, Tailwind, Node.js"
            />
        </div>

        <div className="flex items-center space-x-2 bg-background/50 p-3 rounded-md border border-border/50">
            <Checkbox 
                id="featured" 
                checked={editForm.featured} 
                onCheckedChange={(checked) => setEditForm({...editForm, featured: checked as boolean})} 
            />
            <Label htmlFor="featured" className="cursor-pointer">Feature this project on profile?</Label>
        </div>

        <div className="flex gap-2 pt-2">
            <Button onClick={saveProject} size="sm" className="w-24">
                <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCancelAlert(true)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
                <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
        </div>

        {/* Confirmation Popup */}
        <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Discard Changes?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel? Any unsaved changes to this project will be lost.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDiscardChanges}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        Discard Changes
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8 opacity-50" />
            <p>No projects added yet.</p>
        </div>
      )}
      
      {projects.map(project => (
        <Card key={project.id} className="bg-card hover:bg-muted/10 transition-colors group">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                    <img 
                        src={project.imageUrl || "/placeholder.svg"} 
                        alt={project.title} 
                        className="w-full h-full object-cover rounded-md bg-muted border border-border/50" 
                    />
                    {project.images && project.images.length > 1 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                            +{project.images.length - 1}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate flex items-center gap-2">
                        {project.title}
                        {project.featured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded border border-yellow-200">Featured</span>}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mb-1">{project.description}</p>
                    <div className="flex gap-1 flex-wrap">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                            <span key={i} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{tech}</span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(project)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </CardContent>
        </Card>
      ))}
      
      <Button variant="outline" className="w-full border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary" onClick={() => startEdit()}>
        <Plus className="w-4 h-4 mr-2" /> Add Project
      </Button>
    </div>
  );
};