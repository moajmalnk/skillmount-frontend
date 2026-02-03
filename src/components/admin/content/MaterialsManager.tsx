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
import { Skeleton } from "@/components/ui/skeleton";

// Import Service & Types
import { materialService } from "@/services/materialService";
import { Material, MaterialType } from "@/types/material";

const MATERIAL_TYPES: MaterialType[] = ["Template Kit", "Themes", "Plugins", "Docs", "Snippet", "Videos"];

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
    type: "Videos",
    category: "",
    url: "",
    description: "",
    embedUrl: "",
    code: "",
    language: "PHP",
    version: "",
    size: "",
    previewUrl: "",
    duration: "",
    topics: [] as string[]
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DELETE STATE ---
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- EDIT STATE ---
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- DETAIL VIEW STATE ---
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

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
  const availableCategories = ["all", ...new Set((Array.isArray(materials) ? materials : []).map(m => m.category))];

  // 3. Filter Logic
  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter((item) => {
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
      case "Videos": return <Video className="w-4 h-4 text-blue-500" />;
      case "Themes": return <Palette className="w-4 h-4 text-purple-500" />;
      case "Plugins": return <Package className="w-4 h-4 text-orange-500" />;
      case "Snippet": return <FileCode className="w-4 h-4 text-green-500" />;
      case "Template Kit": return <FolderOpen className="w-4 h-4 text-pink-500" />;
      case "Docs": return <FileText className="w-4 h-4 text-gray-500" />;
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
      title: "", type: "Videos", category: "", url: "", description: "",
      embedUrl: "", code: "", language: "PHP", version: "", size: "", previewUrl: "",
      duration: "", topics: []
    });
    setSelectedFile(null);
    setEditingId(null);
    setIsCreateOpen(false);
  };

  const initiateEdit = (material: Material) => {
    setEditingId(material.id);

    // For Videos, we map embedUrl -> url so it shows in the main input
    const initialUrl = material.type === 'Videos'
      ? (material.embedUrl || material.externalUrl || "")
      : (material.is_file ? "" : (material.externalUrl || ""));

    setFormData({
      title: material.title || "",
      type: material.type || "Videos",
      category: material.category || "",
      description: material.description || "",

      embedUrl: material.embedUrl || "",
      previewUrl: material.previewUrl || "",

      url: initialUrl,

      code: material.code || "",
      language: material.language || "PHP",
      version: material.version || "",
      size: material.size || "",
      duration: material.duration || "",
      topics: Array.isArray(material.topics) ? material.topics : []
    });

    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.type) {
      toast.error("Title and Type are mandatory.");
      return;
    }

    // 1. MANDATORY THEME CHECK: Ensure both links exist
    if (formData.type === 'Themes' || formData.type === 'Template Kit') {
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
      if (formData.type === 'Videos') {
        // Use the common 'url' field which the user edits
        payload.embedUrl = ensureProtocol(formData.url);
        payload.duration = formData.duration;
        payload.topics = formData.topics; // Array of strings
      }

      if (formData.type === 'Snippet') {
        payload.code = formData.code;
        payload.language = formData.language;
      }

      if (['Themes', 'Plugins', 'Template Kit'].includes(formData.type || "")) {
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

            <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Material
            </Button>

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
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No materials found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedMaterial(item)}
                    >
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
                        {item.type === 'Videos' && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Video</span>}
                        {item.type === 'Snippet' && <span className="flex items-center gap-1"><CodeIcon className="w-3 h-3" /> {item.language}</span>}
                        {(item.type === 'Themes' || item.type === 'Plugins' || item.type === 'Template Kit') && <span>v{item.version || '1.0'} • {item.size || 'N/A'}</span>}
                        {item.type === 'Docs' && <span>{item.size || 'N/A'}</span>}
                      </TableCell>
                      <TableCell className="text-xs">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); initiateEdit(item); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); initiateDelete(item.id); }}
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
        <DialogContent className="modal-admin-uniform">
          <DialogHeader className="modal-header-standard">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle>{editingId ? "Edit Material" : "Add New Material"}</DialogTitle>
                <DialogDescription>{editingId ? "Update material details." : "Add a resource for students. Fields change based on type."}</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="modal-body-standard">
            <div className="grid gap-6">
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
                  <Input placeholder="e.g. WordPress, React" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Resource Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              {/* Dynamic Source Input: URL vs File */}
              <div className="space-y-2">
                <Label>
                  {formData.type === 'Videos' ? "Video URL" :
                    formData.type === 'Docs' ? "Documentation URL" :
                      formData.type === 'Themes' ? "Theme Download URL" :
                        formData.type === 'Template Kit' ? "Template Kit URL" :
                          formData.type === 'Plugins' ? "Plugin Download URL" :
                            "Resource URL"}
                </Label>
                <Input
                  placeholder={formData.type === 'Videos' ? "https://www.youtube.com/watch?v=..." : "https://example.com/..."}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>

              {/* 1. Video Specific */}
              {formData.type === 'Videos' && (
                <div className="grid grid-cols-2 gap-4 bg-blue-50/10 p-4 rounded-lg border border-blue-500/10 transition-all">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g. 10:05"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Topics (Comma separated)</Label>
                    <Input
                      placeholder="e.g. Marketing, Setup"
                      value={Array.isArray(formData.topics) ? formData.topics.join(", ") : ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        topics: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                      })}
                    />
                  </div>
                </div>
              )}

              {/* 2. Snippet Specific */}
              {formData.type === 'Snippet' && (
                <div className="space-y-4 bg-slate-50/10 p-4 rounded-lg border border-slate-500/10 transition-all">
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
                      className="font-mono text-xs h-40 bg-slate-900/50 text-slate-100"
                      placeholder="Paste code here..."
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* 3. Theme/Plugin Specific */}
              {(formData.type === 'Themes' || formData.type === 'Plugins' || formData.type === 'Template Kit') && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-purple-500/10 bg-purple-50/10 transition-all">
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input placeholder="e.g. 1.0.4" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input placeholder="e.g. 12 MB" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      Live Preview / Demo URL
                      <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Input
                      placeholder="https://preview.example.com/..."
                      value={formData.previewUrl || ""}
                      onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Briefly describe what this resource is for..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[100px]" />
              </div>
            </div>
          </div>

          <DialogFooter className="modal-footer-standard">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} className="px-8">{editingId ? "Update Material" : "Add Material"}</Button>
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

      {/* Material Detail Dialog */}
      <Dialog open={!!selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
        <DialogContent className="modal-admin-uniform">
          <DialogHeader className="modal-header-standard">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    {selectedMaterial?.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    {selectedMaterial?.type}
                  </span>
                </div>
                <DialogTitle className="text-2xl pt-2 leading-tight">{selectedMaterial?.title}</DialogTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMaterial(null)} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="modal-body-standard">
            <div className="grid gap-8">
              {/* Main Content Area */}
              <div className="space-y-6">
                {/* Description Card */}
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">About this resource</Label>
                  <div className="bg-muted/5 p-6 rounded-2xl border border-border/50 shadow-inner text-sm leading-relaxed text-foreground/90">
                    {selectedMaterial?.description || "No description provided."}
                  </div>
                </div>

                {/* Dynamic Content Based on Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TECHNICAL DETAILS */}
                  <div className="space-y-4">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Specifications</Label>
                    <div className="grid gap-3">
                      {selectedMaterial?.version && (
                        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl border border-border/40">
                          <span className="text-xs text-muted-foreground">Version</span>
                          <span className="text-sm font-semibold">v{selectedMaterial.version}</span>
                        </div>
                      )}
                      {selectedMaterial?.size && (
                        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl border border-border/40">
                          <span className="text-xs text-muted-foreground">File Size</span>
                          <span className="text-sm font-semibold">{selectedMaterial.size}</span>
                        </div>
                      )}
                      {selectedMaterial?.type === 'Videos' && selectedMaterial.duration && (
                        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl border border-border/40">
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <span className="text-sm font-semibold">{selectedMaterial.duration}</span>
                        </div>
                      )}
                      {selectedMaterial?.type === 'Snippet' && selectedMaterial.language && (
                        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl border border-border/40">
                          <span className="text-xs text-muted-foreground">Language</span>
                          <span className="text-sm font-semibold">{selectedMaterial.language}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUICK LINKS */}
                  <div className="space-y-4">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Access Links</Label>
                    <div className="flex flex-col gap-2">
                      {selectedMaterial?.previewUrl && (
                        <Button variant="outline" className="justify-between group" asChild>
                          <a href={selectedMaterial.previewUrl} target="_blank" rel="noopener noreferrer">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="w-4 h-4 text-primary" />
                              <span>Live Preview</span>
                            </div>
                            <Plus className="w-3 h-3 opacity-50 group-hover:rotate-45 transition-transform" />
                          </a>
                        </Button>
                      )}

                      {/* Video Button */}
                      {selectedMaterial?.type === 'Videos' && (selectedMaterial.embedUrl || selectedMaterial.externalUrl) && (
                        <Button className="justify-between group" asChild>
                          <a href={selectedMaterial.embedUrl || selectedMaterial.externalUrl} target="_blank" rel="noopener noreferrer">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              <span>Watch Video</span>
                            </div>
                            <Plus className="w-3 h-3 opacity-50 group-hover:rotate-45 transition-transform" />
                          </a>
                        </Button>
                      )}

                      {/* Download Button (for themes/plugins/docs) */}
                      {['Themes', 'Plugins', 'Template Kit', 'Docs'].includes(selectedMaterial?.type || "") && (selectedMaterial?.url || selectedMaterial?.externalUrl) && (
                        <Button className="justify-between group" asChild>
                          <a href={selectedMaterial?.url || selectedMaterial?.externalUrl} target="_blank" rel="noopener noreferrer">
                            <div className="flex items-center gap-2">
                              {selectedMaterial?.is_file ? <Upload className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                              <span>{selectedMaterial?.is_file ? "Download File" : "Access Resource"}</span>
                            </div>
                            <Plus className="w-3 h-3 opacity-50 group-hover:rotate-45 transition-transform" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Topics (Videos) */}
                {selectedMaterial?.type === 'Videos' && Array.isArray(selectedMaterial.topics) && selectedMaterial.topics.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Topics Covered</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMaterial.topics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="bg-muted/10 font-normal px-3 py-1 text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Snippet Box */}
                {selectedMaterial?.type === 'Snippet' && selectedMaterial.code && (
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Code Content</Label>
                    <div className="relative group">
                      <pre className="p-6 bg-slate-950 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto shadow-2xl border border-slate-800">
                        <code>{selectedMaterial.code}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMaterial.code || "");
                          toast.success("Code copied to clipboard");
                        }}
                      >
                        Copy Code
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer-standard px-6 py-4 bg-muted/5 flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
              Last Updated: {selectedMaterial?.lastUpdated}
            </span>
            <Button onClick={() => setSelectedMaterial(null)} className="px-8 font-medium">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};