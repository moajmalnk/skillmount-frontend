import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow, TableHead, TableHeader, TableBody, Table } from "@/components/ui/table";
import { Pencil, Trash2, Loader2, Eye, CheckCircle2, AlertCircle, Copy, Search, X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { UserDetailSheet } from "./UserDetailSheet";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog"; // Import the delete dialog

// Import Service & Types
import { userService } from "@/services/userService";
import { Tutor } from "@/types/user";

// Mock Topics (Move to settings/constants in production)
const TOPICS = [
  "WordPress Development",
  "React & Node.js",
  "Digital Marketing",
  "UI/UX Design",
  "SEO Optimization"
];

import { systemService } from "@/services/systemService";

export const TutorManager = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [topics, setTopics] = useState<string[]>([]); // Dynamic topics
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTutors = tutors.filter(t => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(searchLower) ||
      t.email.toLowerCase().includes(searchLower) ||
      (t.regId && t.regId.toLowerCase().includes(searchLower));

    const matchesTopic = filterTopic === 'all' || (t.topics && t.topics.includes(filterTopic));
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

    return matchesSearch && matchesTopic && matchesStatus;
  });

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", topic: "" });

  // Detail Sheet State
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. Fetch Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tutorsData, settings] = await Promise.all([
        userService.getElementsByRole("tutor") as Promise<Tutor[]>,
        systemService.getSettings()
      ]);
      setTutors(tutorsData);
      // Use system topics if available, else fallback
      if (settings.topics && settings.topics.length > 0) {
        setTopics(settings.topics);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsSheetOpen(true);
  };

  const generateRegId = () => {
    if (tutors.length === 0) {
      return `TUT-${new Date().getFullYear()}-001`;
    }

    // Extract max numeric ID
    const maxId = tutors.reduce((max, tutor) => {
      const parts = tutor.regId?.split('-') || [];
      const num = parseInt(parts[2] || '0', 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return `TUT-${new Date().getFullYear()}-${String(maxId + 1).padStart(3, '0')}`;
  };

  const generateTempPassword = (email: string, phone: string) => {
    return `${email.substring(0, 3).toLowerCase()}@${phone.slice(-4)}`;
  };

  // --- ACTIONS ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.topic) {
      toast.error("All fields are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newRegId = generateRegId();
      const tempPassword = generateTempPassword(formData.email, formData.phone);

      const newTutor: Partial<Tutor> = {
        regId: newRegId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "tutor",
        status: "Pending",
        topics: [formData.topic],
        isProfileComplete: false
      };

      const result = await userService.create(newTutor);

      // Parse Notification Status
      // Parse Notification Status
      const notifStatus = (result as any)?.meta?.notification_status || {};
      const emailStatus = notifStatus.email === 'ok';
      // WhatsApp status might be 'ok', 'skipped...', or 'error...'
      const waStatusRaw = notifStatus.whatsapp || 'error';
      const waStatus = waStatusRaw === 'ok';
      const waSkipped = waStatusRaw.includes('skipped');

      toast.success(
        <div className="flex flex-col gap-2 min-w-[200px]">
          <span className="font-semibold">Tutor Created!</span>

          <div className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
            <span>Reg ID: <code className="font-mono font-bold">{newRegId}</code></span>
            <button onClick={() => navigator.clipboard.writeText(newRegId)} title="Copy ID" className="hover:bg-background p-1 rounded">
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            Pass: {tempPassword}
          </div>

          {/* Notification Status */}
          <div className="space-y-1 pt-1 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Email:</span>
              {emailStatus
                ? <span className="text-green-600 flex items-center gap-1">Sent <CheckCircle2 className="w-3 h-3" /></span>
                : <span className="text-red-500 flex items-center gap-1">Failed <AlertCircle className="w-3 h-3" /></span>
              }
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">WhatsApp:</span>
              {waStatus
                ? <span className="text-green-600 flex items-center gap-1">Sent <CheckCircle2 className="w-3 h-3" /></span>
                : (waSkipped
                  ? <span className="text-yellow-600 flex items-center gap-1">Skipped <AlertCircle className="w-3 h-3" /></span>
                  : <span className="text-red-500 flex items-center gap-1">Failed <AlertCircle className="w-3 h-3" /></span>
                )
              }
            </div>
          </div>
        </div>
      );

      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", topic: "" });

      loadData();

    } catch (error) {
      toast.error("Failed to create tutor");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE HANDLERS ---
  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await userService.delete(deleteId);
      toast.success("Tutor removed successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete tutor");
    } finally {
      setDeleteId(null);
    }
  };

  const tutorToDelete = tutors.find(t => t.id === deleteId);

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

            {/* Topic Filter */}
            <div className="w-full md:w-[200px]">
              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-[150px]">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Tutor
            </Button>

            {/* Clear Button */}
            {(searchQuery || filterTopic !== 'all' || filterStatus !== 'all') && (
              <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setFilterTopic("all"); setFilterStatus("all"); }} title="Reset Filters">
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
                  <TableHead className="w-[150px]">Reg ID</TableHead>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No tutors found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTutors.map((tutor) => (
                    <TableRow
                      key={tutor.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(tutor)}
                    >
                      <TableCell className="font-medium font-mono text-xs">{tutor.regId}</TableCell>
                      <TableCell className="font-medium">{tutor.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>{tutor.email}</span>
                          <span>{tutor.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tutor.topics && tutor.topics.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {tutor.topics.slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                            {tutor.topics.length > 2 && <Badge variant="outline" className="text-[10px]">+{tutor.topics.length - 2}</Badge>}
                          </div>
                        ) : <span className="text-muted-foreground text-xs">General</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${tutor.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                          {tutor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => initiateDelete(tutor.id, e)}
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
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="modal-admin-uniform">
          <DialogHeader className="modal-header-standard">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle>Add New Tutor</DialogTitle>
                <DialogDescription>Enter mandatory details. ID and Password will be auto-generated.</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="modal-body-standard">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="t-name">Full Name</Label>
                <Input id="t-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter tutor's full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-email">Email Address</Label>
                <Input id="t-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tutor@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="t-phone">Phone Number</Label>
                  <Input
                    id="t-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Remove all non-digits
                      setFormData({ ...formData, phone: val });
                    }}
                    placeholder="Numbers only"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="t-topic">Primary Topic</Label>
                  <Select value={formData.topic} onValueChange={(val) => setFormData({ ...formData, topic: val })}>
                    <SelectTrigger id="t-topic"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {topics.length > 0 ? (
                        topics.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)
                      ) : (
                        <SelectItem value="General">General</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="modal-footer-standard">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting} className="px-8">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <UserDetailSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        user={selectedTutor}
        type="tutor"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        itemName={tutorToDelete?.name}
        description="This will permanently remove the tutor account and revoke their access to the platform."
      />
    </div>
  );
};