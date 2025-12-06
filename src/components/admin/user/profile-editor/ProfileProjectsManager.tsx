import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { StudentProject } from "@/types/user";

interface ProfileProjectsManagerProps {
  projects: StudentProject[];
  onChange: (projects: StudentProject[]) => void;
}

export const ProfileProjectsManager = ({ projects = [], onChange }: ProfileProjectsManagerProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or ID
  const [editForm, setEditForm] = useState<Partial<StudentProject>>({});

  const startEdit = (project?: StudentProject) => {
    if (project) {
      setIsEditing(project.id);
      setEditForm(project);
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
    }
  };

  const saveProject = () => {
    if (!editForm.title || !editForm.imageUrl) return; // Simple validation

    let updatedProjects;
    if (isEditing === 'new') {
        updatedProjects = [...projects, editForm as StudentProject];
    } else {
        updatedProjects = projects.map(p => p.id === isEditing ? (editForm as StudentProject) : p);
    }
    
    onChange(updatedProjects);
    setIsEditing(null);
    setEditForm({});
  };

  const deleteProject = (id: string) => {
    if(confirm("Delete this project?")) {
        onChange(projects.filter(p => p.id !== id));
    }
  };

  // Helper to handle tech stack input (comma separated)
  const handleTechChange = (val: string) => {
    setEditForm({ ...editForm, technologies: val.split(',').map(s => s.trim()) });
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <h4 className="font-semibold text-sm">{isEditing === 'new' ? 'Add New Project' : 'Edit Project'}</h4>
        
        <div className="space-y-2">
            <Label>Project Title</Label>
            <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
        </div>
        
        <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
        </div>

        <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={editForm.imageUrl} onChange={e => setEditForm({...editForm, imageUrl: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Demo Link</Label>
                <Input value={editForm.demoUrl} onChange={e => setEditForm({...editForm, demoUrl: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label>GitHub Link</Label>
                <Input value={editForm.repoUrl} onChange={e => setEditForm({...editForm, repoUrl: e.target.value})} />
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

        <div className="flex items-center space-x-2">
            <Checkbox 
                id="featured" 
                checked={editForm.featured} 
                onCheckedChange={(checked) => setEditForm({...editForm, featured: checked as boolean})} 
            />
            <Label htmlFor="featured">Feature this project on profile?</Label>
        </div>

        <div className="flex gap-2 pt-2">
            <Button onClick={saveProject} size="sm"><Save className="w-4 h-4 mr-2" /> Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}><X className="w-4 h-4 mr-2" /> Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <Card key={project.id} className="bg-card">
            <CardContent className="p-4 flex items-center gap-4">
                <img src={project.imageUrl} alt={project.title} className="w-16 h-16 object-cover rounded-md bg-muted" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{project.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                    <div className="flex gap-1 mt-1">
                        {project.featured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded">Featured</span>}
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(project)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProject(project.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
            </CardContent>
        </Card>
      ))}
      
      <Button variant="outline" className="w-full border-dashed" onClick={() => startEdit()}>
        <Plus className="w-4 h-4 mr-2" /> Add Project
      </Button>
    </div>
  );
};