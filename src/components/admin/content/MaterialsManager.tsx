import { useState } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Video, Palette, Package, FileCode, FolderOpen, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Material Types
type MaterialType = "Video" | "Theme" | "Plugin" | "Snippet" | "Asset";

interface Material {
  id: string;
  title: string;
  type: MaterialType;
  category: string;
  url: string;
  lastUpdated: string;
}

const MATERIAL_TYPES: MaterialType[] = ["Video", "Theme", "Plugin", "Snippet", "Asset"];

export const MaterialsManager = () => {
  // Mock Data
  const [materials, setMaterials] = useState<Material[]>([
    { id: "MAT-001", title: "Elementor Pro Guide", type: "Video", category: "Elementor", url: "youtube.com/...", lastUpdated: "2025-10-01" },
    { id: "MAT-002", title: "Astra Pro Theme", type: "Theme", category: "WordPress", url: "download_link", lastUpdated: "2025-09-15" },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "" as MaterialType | "",
    category: "",
    url: "",
    description: ""
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "Video": return <Video className="w-4 h-4 text-blue-500" />;
      case "Theme": return <Palette className="w-4 h-4 text-purple-500" />;
      case "Plugin": return <Package className="w-4 h-4 text-orange-500" />;
      case "Snippet": return <FileCode className="w-4 h-4 text-green-500" />;
      default: return <FolderOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreate = () => {
    if (!formData.title || !formData.type || !formData.url) {
      toast.error("Title, Type, and URL are mandatory.");
      return;
    }

    const newMaterial: Material = {
      id: `MAT-${Date.now().toString().slice(-4)}`,
      title: formData.title,
      type: formData.type as MaterialType,
      category: formData.category || "General",
      url: formData.url,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setMaterials([newMaterial, ...materials]);
    toast.success("Material added successfully!");
    setIsCreateOpen(false);
    setFormData({ title: "", type: "", category: "", url: "", description: "" });
  };

  return (
    <>
      <ManagementTable 
        title="Learning Materials" 
        description="Manage resources displayed on the public materials page."
        columns={["Type", "Title", "Category", "Link / Access", "Last Updated"]}
        onAddNew={() => setIsCreateOpen(true)}
      >
        {materials.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {getIconForType(item.type)}
                <span className="text-xs font-medium">{item.type}</span>
              </div>
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.category}</Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
              {item.url}
            </TableCell>
            <TableCell>{item.lastUpdated}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>Add a resource for students to access.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Complete SEO Guide" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val: MaterialType) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g. WordPress" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Resource Link / URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="url" 
                  placeholder="https://youtube.com/... or download link" 
                  className="pl-9"
                  value={formData.url} 
                  onChange={(e) => setFormData({...formData, url: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Textarea 
                id="desc" 
                placeholder="Brief description for the card..." 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};