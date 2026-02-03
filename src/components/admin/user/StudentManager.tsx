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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil, Trash2, EyeIcon, Loader2, Search, X,
  Star, GraduationCap, CheckCircle2, AlertCircle, Plus
} from "lucide-react";
import { toast } from "sonner";
import { UserDetailSheet } from "./UserDetailSheet";
import { userService } from "@/services/userService";
import { systemService } from "@/services/systemService"; // Added System Service
import { Student } from "@/types/user";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActionConfirmationDialog } from "../ActionConfirmationDialog";
import { StudentCreateDialog } from "./dialogs/StudentCreateDialog";
import { Copy } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


export const StudentManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [batches, setBatches] = useState<string[]>([]); // Dynamic Batches State

  // --- FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterProfileStatus, setFilterProfileStatus] = useState("all"); // all, complete, incomplete
  const [filterType, setFilterType] = useState("all"); // all, top, featured

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // --- MODAL STATES ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Unified Action State
  type PendingAction = {
    type: 'delete' | 'toggleTop' | 'toggleFeatured';
    student: Student;
  } | null;
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterBatch, filterProfileStatus, filterType]);

  // 1. Fetch Data (Students + Batches)
  const loadData = async () => {
    setIsLoading(true);

    try {
      // Fetch Students with Pagination & Filters
      const data = await userService.getAdminStudents(
        currentPage,
        pageSize,
        debouncedSearch,
        filterBatch,
        filterProfileStatus, // Pass status directly (Note: backend filtering for complete/incomplete might depend on status field)
        filterType
      );

      const rawResults = data.results || [];
      setTotalCount(data.count || 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedStudents: Student[] = rawResults.map((u: any) => ({
        ...u,
        createdAt: u.date_joined || u.created_at || new Date().toISOString(),
        role: "student",
        // Prioritize top-level fields (Robust Backend) -> Fallback to nested
        batch: u.batch || u.student_profile?.batch_id || "Unassigned",
        regId: u.regId || u.student_profile?.reg_id || "PENDING",

        mentor: u.mentor || u.student_profile?.mentor || "Not Assigned",
        coordinator: u.coordinator || u.student_profile?.coordinator || "Not Assigned",

        headline: u.student_profile?.headline || "",
        bio: u.student_profile?.bio || "",
        skills: u.student_profile?.skills || [],

        dob: u.student_profile?.dob || "",
        address: u.student_profile?.address || "",
        pincode: u.student_profile?.pincode || "",
        qualification: u.student_profile?.qualification || "",
        aim: u.student_profile?.aim || "",
        socials: u.student_profile?.socials || {},

        isTopPerformer: u.student_profile?.is_top_performer || false,
        isFeatured: u.student_profile?.is_featured_graduate || false,
        isProfileComplete: u.is_profile_complete,
        status: u.status || "Active",
        projects: u.student_profile?.projects || [],
      }));

      // Client-side filtering for attributes NOT supported by backend yet (e.g., Profile Status computed field)
      // Since backend doesn't fully support 'isProfileComplete' filter in basic search, we might need to filter manually if backend returned mixed results.
      // However, for pagination to work correctly, backend MUST handle filtering.
      // For now, we assume backend handles what it can, and we display what we get. 
      // If we filter client-side here after pagination, the page size will be inconsistent (e.g. only 2 items on page 1).
      // So we use the results as is.

      setStudents(formattedStudents);
    } catch (error) {
      console.error("Failed to load students", error);
      toast.error("Failed to load students");
    }

    // Load Settings (Batches) - only once
    if (batches.length === 0) {
      try {
        const settingsData = await systemService.getSettings();
        setBatches(settingsData.batches || []);
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, filterBatch, filterProfileStatus, filterType]);

  // 3. Quick Actions (Requests)
  const requestToggle = (e: React.MouseEvent, student: Student, field: 'isTopPerformer' | 'isFeatured') => {
    e.stopPropagation();
    setPendingAction({
      type: field === 'isTopPerformer' ? 'toggleTop' : 'toggleFeatured',
      student
    });
  };

  const requestDelete = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setPendingAction({ type: 'delete', student });
  };

  // 4. Execution Handler
  const executePendingAction = async () => {
    if (!pendingAction) return;
    const { type, student } = pendingAction;

    try {
      if (type === 'delete') {
        await userService.delete(student.id);
        toast.success("Student deleted successfully");
        // Refetch to maintain pagination state
        loadData();
      } else {
        // Toggles
        const field = type === 'toggleTop' ? 'isTopPerformer' : 'isFeatured';
        const newValue = !student[field];

        // Backend update
        await userService.update(student.id, {
          role: 'student',
          [field]: newValue
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Local update
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, [field]: newValue } : s));

        toast.success("Updated successfully", {
          description: newValue
            ? `Added to ${type === 'toggleTop' ? 'Top Performers' : 'Featured Graduates'}`
            : `Removed from ${type === 'toggleTop' ? 'Top Performers' : 'Featured Graduates'}`
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Action failed", { description: "Please try again later." });
    } finally {
      setPendingAction(null);
    }
  };

  // 4. Standard Handlers
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterBatch("all");
    setFilterProfileStatus("all");
    setFilterType("all");
    // This will trigger effect -> loadData
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">



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

            {/* Student Type Filter (Moved from Tabs) */}
            <div className="w-full md:w-[170px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="top">Top Performers</SelectItem>
                  <SelectItem value="featured">Graduates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Batch Filter */}
            <div className="w-full md:w-[200px]">
              <Select value={filterBatch} onValueChange={setFilterBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Enroll Student
            </Button>

            {/* Clear Button */}
            {(searchQuery || filterBatch !== 'all' || filterProfileStatus !== 'all' || filterType !== 'all') && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Reset Filters">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Secondary Filters (Tabs style) */}

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
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No students found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow
                      key={student.id}
                      className="group hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(student)}
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
                          {student.batch}
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
                                  onClick={(e) => requestToggle(e, student, 'isTopPerformer')}
                                  className={`h-8 w-8 rounded-full transition-all ${student.isTopPerformer
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
                                  onClick={(e) => requestToggle(e, student, 'isFeatured')}
                                  className={`h-8 w-8 rounded-full transition-all ${student.isFeatured
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
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => requestDelete(e, student)}
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

          {/* PAGINATION FOOTER */}
          {totalCount > 0 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {students.length} of {totalCount} students
              </div>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <span className="flex h-9 min-w-9 items-center justify-center text-sm font-medium px-4">
                      Page {currentPage} of {Math.max(1, totalPages)}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

        </CardContent>
      </Card>

      {/* 4. Action Confirmation Dialog */}
      {
        pendingAction && (
          <ActionConfirmationDialog
            open={!!pendingAction}
            onOpenChange={(open) => !open && setPendingAction(null)}
            onConfirm={executePendingAction}
            itemName={pendingAction.student.name}
            title={
              pendingAction.type === 'delete' ? "Delete Student?" :
                pendingAction.type === 'toggleTop' ? "Update Top Performer Status?" :
                  "Update Featured Status?"
            }
            description={
              pendingAction.type === 'delete'
                ? "This will permanently delete the student and all associated data. This action cannot be undone."
                : pendingAction.type === 'toggleTop'
                  ? `Are you sure you want to ${pendingAction.student.isTopPerformer ? 'remove' : 'mark'} this student as a Top Performer?`
                  : `Are you sure you want to ${pendingAction.student.isFeatured ? 'remove' : 'mark'} this student as a Featured Graduate?`
            }
            variant={pendingAction.type === 'delete' ? "destructive" : "default"}
            confirmLabel={
              pendingAction.type === 'delete' ? "Delete Permanently" :
                pendingAction.type === 'toggleTop'
                  ? (pendingAction.student.isTopPerformer ? "Remove Status" : "Mark as Top Performer")
                  : (pendingAction.student.isFeatured ? "Remove Status" : "Mark as Graduate")
            }
          />
        )
      }

      {/* Create Dialog - Uses dedicated component with Loader */}
      <StudentCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { loadData(); setIsCreateOpen(false); }}
      />

      {/* Detail Sheet */}
      <UserDetailSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        user={selectedStudent}
        type="student"
        onUpdate={loadData}
      />
    </div>
  );
};