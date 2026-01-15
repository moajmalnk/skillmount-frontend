import { useState, useEffect, useRef } from "react";
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
  Link as LinkIcon, Loader2, Code as CodeIcon, Plus, Search, Filter, X,
  Upload, FileText
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
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";

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
    size: "",
    previewUrl: ""
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DELETE STATE ---
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, url: "" })); // Clear URL as File takes precedence
      // Auto-fill size if empty
      if (!formData.size) {
        const sizeInMB = (e.target.files[0].size / (1024 * 1024)).toFixed(2);
        setFormData(prev => ({ ...prev, size: `${sizeInMB} MB` }));
      }
    }
  };

  // Helper to ensure https://
  const ensureProtocol = (link: string | undefined | null) => {
    if (!link) return "";
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    return `https://${link}`;
  };

  const handleEmbedUrlBlur = () => {
    setFormData(prev => {
      const url = prev.embedUrl || "";
      let newUrl = url;

      // Ensure we use the standard watch URL for ReactPlayer compatibility
      if (url.includes("youtu.be/")) {
        try {
          const vId = url.split("youtu.be/")[1].split("?")[0];
          newUrl = `https://www.youtube.com/watch?v=${vId}`;
        } catch (e) {
          // Keep original if parse fails
        }
      } else if (url.includes("youtube.com/embed/")) {
        try {
          const vId = url.split("embed/")[1].split("?")[0];
          newUrl = `https://www.youtube.com/watch?v=${vId}`;
        } catch (e) {
          // Keep original
        }
      }

      if (newUrl !== url) {
        return { ...prev, embedUrl: newUrl };
      }
      return prev;
    });
  };

  const resetForm = () => {
    setFormData({
      title: "", type: "Video", category: "", url: "", description: "",
      embedUrl: "", code: "", language: "PHP", version: "", size: "", previewUrl: ""
    });
    setSelectedFile(null);
    setEditingId(null);
    setIsCreateOpen(false);
  };

  const initiateEdit = (material: Material) => {
    setEditingId(material.id);

    setFormData({
      title: material.title || "",
      type: material.type || "Video",
      category: material.category || "",
      description: material.description || "",

      embedUrl: material.embedUrl || "",
      previewUrl: material.previewUrl || "",

      url: material.is_file ? "" : (material.externalUrl || ""),

      code: material.code || "",
      language: material.language || "PHP",
      version: material.version || "",
      size: material.size || ""
    });

    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.type) {
      toast.error("Title and Type are mandatory.");
      return;
    }

    // 1. MANDATORY THEME CHECK: Ensure both links exist
    if (formData.type === 'Theme') {
      if (!formData.url && !selectedFile && !editingId) {
        toast.error("Download source (File or URL) is mandatory for Themes.");
        return;
      }
      if (!formData.previewUrl) {
        toast.error("Live Preview URL is mandatory for Themes.");
        return;
      }
    }

    // Validation: Require either URL OR File (Only allow skip if editing existing and URL is present or if Snippet)
    if (!formData.url && !selectedFile && formData.type !== 'Snippet' && !editingId) {
      toast.error("Please provide a URL or upload a file.");
      return;
    }

    if (formData.type === 'Snippet' && !formData.code) {
      toast.error("Code content is required for Snippets");
      return;
    }

    try {
      // 2. CONSTRUCT PAYLOAD (POJO)
      const payload: any = {
        title: formData.title,
        type: formData.type as MaterialType,
        category: formData.category || "General",
        externalUrl: ensureProtocol(formData.url) || "",
        description: formData.description,
      };

      // Conditional Fields
      if (formData.type === 'Video') {
        payload.embedUrl = ensureProtocol(formData.embedUrl) || ensureProtocol(formData.url);
      }

      if (formData.type === 'Snippet') {
        payload.code = formData.code;
        payload.language = formData.language;
      }

      if (['Theme', 'Plugin', 'Asset'].includes(formData.type || "")) {
        payload.version = formData.version;
        payload.size = formData.size;
        payload.previewUrl = ensureProtocol(formData.previewUrl);
      }

      if (selectedFile) {
        payload.file = selectedFile;
      }

      if (editingId) {
        await materialService.update(editingId, payload);
        toast.success("Material updated successfully!");
      } else {
        await materialService.create(payload);
        toast.success("Material added successfully!");
      }

      resetForm();
      loadMaterials();

    } catch (error: any) {
      console.error(error);
      const serverError = error.response?.data;
      let errorMsg = editingId ? "Failed to update material" : "Failed to add material";

      if (serverError) {
        const details = Object.entries(serverError)
          .map(([key, msgs]) => `${key}: ${(msgs as any).join(", ")}`)
          .join(" | ");
        if (details) errorMsg += `: ${details}`;
      }

      toast.error(errorMsg);
    }
  };

  // --- DELETE HANDLERS ---
  const initiateDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await materialService.delete(deleteId);
      toast.success("Material deleted successfully");
      loadMaterials();
    } catch (error) {
      toast.error("Failed to delete material");
    } finally {
      setDeleteId(null);
    }
  };

  const materialToDelete = materials.find(m => m.id === deleteId);

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
                        {item.type === 'Video' && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Video</span>}
                        {item.type === 'Snippet' && <span className="flex items-center gap-1"><CodeIcon className="w-3 h-3" /> {item.language}</span>}
                        {(item.type === 'Theme' || item.type === 'Plugin') && <span>v{item.version || '1.0'} • {item.size || 'N/A'}</span>}
                        {item.type === 'Asset' && <span>{item.size || 'N/A'}</span>}
                      </TableCell>
                      <TableCell className="text-xs">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => initiateEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => initiateDelete(item.id)}
                          >
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
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Material" : "Add New Material"}</DialogTitle>
            <DialogDescription>{editingId ? "Update material details." : "Add a resource for students. Fields change based on type."}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val: MaterialType) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MATERIAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g. WordPress" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Resource Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            {/* Dynamic Source Input: URL vs File */}
            <div className="space-y-2">
              <Label>Source (File or URL)</Label>
              <div className="flex flex-col gap-3">
                {/* Option 1: File Upload */}
                {['Theme', 'Plugin', 'Asset'].includes(formData.type as string) && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      {selectedFile ? selectedFile.name : (editingId && formData.url ? "Replace existing file" : "Click to upload file")}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}

                {/* Option 2: External URL */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">OR</span>
                  <Input
                    placeholder="https://example.com/download"
                    className="pl-10"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    disabled={!!selectedFile}
                  />
                </div>
              </div>
            </div>

            {/* --- CONDITIONAL FIELDS BASED ON TYPE --- */}

            {/* 1. Video Specific */}
            {formData.type === 'Video' && (
              <div className="space-y-2">
                <Label> Video URL</Label>
                <Input
                  placeholder="Paste YouTube link here..."
                  value={formData.embedUrl || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, embedUrl: val }));
                  }}
                />
                <p className="text-[10px] text-muted-foreground">
                  Paste standard links like https://www.youtube.com/watch?v=ID
                </p>
              </div>
            )}

            {/* 2. Snippet Specific */}
            {formData.type === 'Snippet' && (
              <div className="space-y-3 bg-slate-50/50 p-3 rounded-md border border-slate-100">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(val) => setFormData({ ...formData, language: val })}>
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
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* 3. Theme/Plugin/Asset Specific */}
            {(formData.type === 'Theme' || formData.type === 'Plugin' || formData.type === 'Asset') && (
              <div className={`grid grid-cols-2 gap-4 p-3 rounded-md border ${formData.type === 'Theme' ? 'bg-purple-50/50 border-purple-100' : formData.type === 'Plugin' ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input placeholder="e.g. 1.0.4" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input placeholder="e.g. 12 MB" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>
                    {formData.type === 'Theme' && "Live Preview URL (Optional)"}
                    {formData.type === 'Plugin' && "Plugin Homepage / Demo URL (Optional)"}
                    {formData.type === 'Asset' && "External Details URL (Optional)"}
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={formData.previewUrl || ""}
                    onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Update Material" : "Add Material"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        itemName={materialToDelete?.title}
        description="This will permanently delete the resource. Students will no longer be able to access or download it."
      />
    </div>
  );
};