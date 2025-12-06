import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, Trash2, Eye, Loader2, Search, Filter, X, 
  Star, GraduationCap, CheckCircle2, AlertCircle, Plus 
} from "lucide-react";
import { toast } from "sonner";
import { BATCHES, formatBatchForDisplay } from "@/lib/batches"; 
import { UserDetailSheet } from "./UserDetailSheet";
import { userService } from "@/services/userService";
import { Student } from "@/types/user";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const StudentManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterProfileStatus, setFilterProfileStatus] = useState("all"); // all, complete, incomplete
  const [filterType, setFilterType] = useState("all"); // all, top, featured

  // --- MODAL STATES ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", batch: "" });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 1. Fetch Data
  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = (await userService.getElementsByRole("student")) as Student[];
      setStudents(data);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // 2. Filter Logic
  const filteredStudents = students.filter(student => {
    // Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.regId?.toLowerCase().includes(searchLower);

    // Batch
    const matchesBatch = filterBatch === "all" || student.batch === filterBatch;

    // Profile Status
    const matchesProfile = 
      filterProfileStatus === "all" ? true :
      filterProfileStatus === "complete" ? student.isProfileComplete :
      !student.isProfileComplete;

    // Type (Top Performer / Graduated)
    const matchesType = 
        filterType === "all" ? true :
        filterType === "top" ? student.isTopPerformer :
        filterType === "featured" ? student.isFeatured : true;

    return matchesSearch && matchesBatch && matchesProfile && matchesType;
  });

  // 3. Quick Actions (Toggles)
  const toggleAttribute = async (student: Student, field: 'isTopPerformer' | 'isFeatured') => {
    const newValue = !student[field];
    
    // Optimistic Update
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, [field]: newValue } : s));

    try {
      await userService.update(student.id, { [field]: newValue });
      toast.success(`Updated ${student.name}`, {
        description: newValue 
          ? (field === 'isTopPerformer' ? "Marked as Top Performer" : "Marked as Featured Graduate")
          : "Status removed"
      });
    } catch (error) {
      // Revert on failure
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, [field]: !newValue } : s));
      toast.error("Failed to update status");
    }
  };

  // 4. Standard Handlers
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  };

  const generateRegId = (count: number) => 
    `STU-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.batch) {
      toast.error("All fields are mandatory.");
      return;
    }

    try {
      const newStudent: Partial<Student> = {
        regId: generateRegId(students.length),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        batch: formData.batch,
        role: "student",
        status: "Pending",
        isProfileComplete: false
      };

      await userService.create(newStudent);
      toast.success(`Student Created!`);
      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", batch: "" });
      loadStudents();
    } catch (error) {
      toast.error("Failed to create student");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!confirm("Are you sure you want to delete this student?")) return;
    try {
      await userService.delete(id);
      toast.success("Student deleted");
      loadStudents();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterBatch("all");
    setFilterProfileStatus("all");
    setFilterType("all");
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students Directory</h2>
          <p className="text-muted-foreground">Manage enrollments, track progress, and highlight achievers.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Enroll Student
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
                placeholder="Search by name, email, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Batch Filter */}
            <div className="w-full md:w-[200px]">
              <Select value={filterBatch} onValueChange={setFilterBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {BATCHES.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>{formatBatchForDisplay(batch.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profile Status Filter */}
            <div className="w-full md:w-[180px]">
              <Select value={filterProfileStatus} onValueChange={setFilterProfileStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Profile Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="complete">✅ Completed</SelectItem>
                  <SelectItem value="incomplete">⚠️ Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Button */}
            {(searchQuery || filterBatch !== 'all' || filterProfileStatus !== 'all' || filterType !== 'all') && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Reset Filters">
                    <X className="w-4 h-4" />
                </Button>
            )}
          </div>
          
          {/* Secondary Filters (Tabs style) */}
          <div className="flex gap-2 mt-4">
             <Badge 
                variant={filterType === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setFilterType('all')}
             >
                All Students
             </Badge>
             <Badge 
                variant={filterType === 'top' ? 'default' : 'outline'} 
                className="cursor-pointer border-amber-200 text-amber-700 hover:bg-amber-100"
                onClick={() => setFilterType('top')}
             >
                <Star className="w-3 h-3 mr-1" /> Top Performers
             </Badge>
             <Badge 
                variant={filterType === 'featured' ? 'default' : 'outline'} 
                className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={() => setFilterType('featured')}
             >
                <GraduationCap className="w-3 h-3 mr-1" /> Graduates
             </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 3. Rich Data Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Student Info</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Profile Status</TableHead>
                  <TableHead>Highlights</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading Students...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No students found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      {/* 1. Student Info */}
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{student.name}</span>
                            <span className="text-xs text-muted-foreground">{student.email}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/70">{student.regId}</span>
                        </div>
                      </TableCell>

                      {/* 2. Batch */}
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                            {formatBatchForDisplay(student.batch, false)}
                        </Badge>
                      </TableCell>

                      {/* 3. Profile Status */}
                      <TableCell>
                        {student.isProfileComplete ? (
                            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md border border-green-100">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Complete</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-md border border-orange-100">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Incomplete</span>
                            </div>
                        )}
                      </TableCell>

                      {/* 4. Highlights (Interactive) */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={(e) => { e.stopPropagation(); toggleAttribute(student, 'isTopPerformer'); }}
                                            className={`h-8 w-8 rounded-full transition-all ${
                                                student.isTopPerformer 
                                                ? 'bg-amber-100 text-amber-500 hover:bg-amber-200' 
                                                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                                            }`}
                                        >
                                            <Star className={`w-4 h-4 ${student.isTopPerformer ? 'fill-current' : ''}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Toggle Top Performer</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={(e) => { e.stopPropagation(); toggleAttribute(student, 'isFeatured'); }}
                                            className={`h-8 w-8 rounded-full transition-all ${
                                                student.isFeatured 
                                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                                                : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                        >
                                            <GraduationCap className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Toggle Graduate / Featured</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                      </TableCell>

                      {/* 5. Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleViewDetails(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDelete(student.id, e)}
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

      {/* Create Dialog (Kept same logic) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
            <DialogDescription>Enter mandatory details. Profile will be marked incomplete.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={formData.batch} onValueChange={(val) => setFormData({...formData, batch: val})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BATCHES.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>{batch.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <UserDetailSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        user={selectedStudent} 
        type="student" 
      />
    </div>
  );
};