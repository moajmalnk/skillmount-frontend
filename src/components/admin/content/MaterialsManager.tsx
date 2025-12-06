import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { 
  Pencil, Trash2, Video, Palette, Package, FileCode, FolderOpen, 
  Link as LinkIcon, Loader2, Code as CodeIcon, Plus, Search, Filter, X 
} from "lucide-react";
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

// Import Service & Types
import { materialService } from "@/services/materialService";
import { Material, MaterialType } from "@/types/material";

const MATERIAL_TYPES: MaterialType[] = ["Video", "Theme", "Plugin", "Snippet", "Asset"];

export const MaterialsManager = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // --- MODAL STATE ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Extended Form State
  const [formData, setFormData] = useState<Partial<Material>>({
    title: "",
    type: "Video",
    category: "",
    url: "",
    description: "",
    embedUrl: "",
    code: "",
    language: "PHP",
    version: "",
    size: ""
  });

  // 1. Load Data
  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const data = await materialService.getAll();
      setMaterials(data);
    } catch (error) {
      toast.error("Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // 2. Computed Data (Categories)
  const availableCategories = ["all", ...new Set(materials.map(m => m.category))];

  // 3. Filter Logic
  const filteredMaterials = materials.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower);
    
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterCategory("all");
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "Video": return <Video className="w-4 h-4 text-blue-500" />;
      case "Theme": return <Palette className="w-4 h-4 text-purple-500" />;
      case "Plugin": return <Package className="w-4 h-4 text-orange-500" />;
      case "Snippet": return <FileCode className="w-4 h-4 text-green-500" />;
      default: return <FolderOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.type || !formData.url) {
      toast.error("Title, Type, and Main URL are mandatory.");
      return;
    }

    if (formData.type === 'Snippet' && !formData.code) {
        toast.error("Code content is required for Snippets");
        return;
    }

    try {
      const payload: any = {
        title: formData.title,
        type: formData.type as MaterialType,
        category: formData.category || "General",
        url: formData.url,
        description: formData.description,
        ...(formData.type === 'Video' && { embedUrl: formData.embedUrl || formData.url }),
        ...(formData.type === 'Snippet' && { code: formData.code, language: formData.language }),
        ...((formData.type === 'Theme' || formData.type === 'Plugin' || formData.type === 'Asset') && { 
            version: formData.version, 
            size: formData.size 
        }),
      };

      await materialService.create(payload);

      toast.success("Material added successfully!");
      setIsCreateOpen(false);
      setFormData({ 
        title: "", type: "Video", category: "", url: "", description: "", 
        embedUrl: "", code: "", language: "PHP", version: "", size: "" 
      });
      loadMaterials();

    } catch (error) {
      toast.error("Failed to add material");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await materialService.delete(id);
      toast.success("Material deleted");
      loadMaterials();
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Learning Materials</h2>
          <p className="text-muted-foreground">Manage resources, videos, and downloads.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Material
        </Button>
      </div>

      {/* 2. Advanced Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title or description..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <div className="w-full md:w-[180px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {MATERIAL_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-[180px]">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c === 'all' ? 'All Categories' : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Button */}
            {(searchQuery || filterType !== 'all' || filterCategory !== 'all') && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Reset Filters">
                    <X className="w-4 h-4" />
                </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Type</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading Resources...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No materials found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIconForType(item.type)}
                          <span className="text-xs font-medium">{item.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[250px]" title={item.title}>{item.title}</div>
                        {item.description && <div className="text-[10px] text-muted-foreground truncate max-w-[250px]">{item.description}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.type === 'Video' && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Video</span>}
                        {item.type === 'Snippet' && <span className="flex items-center gap-1"><CodeIcon className="w-3 h-3"/> {item.language}</span>}
                        {(item.type === 'Theme' || item.type === 'Plugin') && <span>v{item.version || '1.0'} • {item.size || 'N/A'}</span>}
                        {item.type === 'Asset' && <span>{item.size || 'N/A'}</span>}
                      </TableCell>
                      <TableCell className="text-xs">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>Add a resource for students. Fields change based on type.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val: MaterialType) => setFormData({...formData, type: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MATERIAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g. WordPress" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Resource Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Main URL (Download/View)</Label>
              <Input placeholder="https://..." value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
            </div>

            {/* --- CONDITIONAL FIELDS BASED ON TYPE --- */}
            
            {/* 1. Video Specific */}
            {formData.type === 'Video' && (
                <div className="space-y-2 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                    <Label className="text-blue-700">Embed URL (For Player)</Label>
                    <Input 
                        placeholder="https://www.youtube.com/embed/..." 
                        value={formData.embedUrl} 
                        onChange={(e) => setFormData({...formData, embedUrl: e.target.value})} 
                    />
                    <p className="text-[10px] text-muted-foreground">The link used inside the iframe player.</p>
                </div>
            )}

            {/* 2. Snippet Specific */}
            {formData.type === 'Snippet' && (
                <div className="space-y-3 bg-slate-50/50 p-3 rounded-md border border-slate-100">
                    <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PHP">PHP</SelectItem>
                                <SelectItem value="CSS">CSS</SelectItem>
                                <SelectItem value="JavaScript">JavaScript</SelectItem>
                                <SelectItem value="HTML">HTML</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Code Content</Label>
                        <Textarea 
                            className="font-mono text-xs h-32" 
                            placeholder="Paste code here..."
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                        />
                    </div>
                </div>
            )}

            {/* 3. Theme/Plugin/Asset Specific */}
            {(formData.type === 'Theme' || formData.type === 'Plugin' || formData.type === 'Asset') && (
                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-3 rounded-md border border-orange-100">
                    <div className="space-y-2">
                        <Label>Version</Label>
                        <Input placeholder="e.g. 1.0.4" value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Size</Label>
                        <Input placeholder="e.g. 12 MB" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} />
                    </div>
                </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};