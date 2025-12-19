import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Loader2, Eye, CheckCircle2, AlertCircle, Copy } from "lucide-react";
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
      const notifStatus = result?.meta?.notification_status || {};
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
    <>
      <ManagementTable
        title="Tutors"
        description="Manage faculty and assigned topics."
        columns={["Reg ID", "Name", "Email", "Phone", "Topic", "Status"]}
        onAddNew={() => setIsCreateOpen(true)}
      >
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex justify-center items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading Tutors...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : tutors.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
              No tutors found. Add one to get started.
            </TableCell>
          </TableRow>
        ) : (
          tutors.map((tutor) => (
            <TableRow
              key={tutor.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewDetails(tutor)}
            >
              <TableCell className="font-medium">{tutor.regId}</TableCell>
              <TableCell>{tutor.name}</TableCell>
              <TableCell>{tutor.email}</TableCell>
              <TableCell>{tutor.phone}</TableCell>
              <TableCell>
                {tutor.topics && tutor.topics.length > 0 ? tutor.topics[0] : "General"}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tutor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {tutor.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); handleViewDetails(tutor); }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
      </ManagementTable>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Tutor</DialogTitle>
            <DialogDescription>Enter mandatory details. ID and Password will be auto-generated.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Primary Topic</Label>
              <Select value={formData.topic} onValueChange={(val) => setFormData({ ...formData, topic: val })}>
                <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                <SelectContent>
                  {topics.length > 0 ? (
                    topics.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)
                  ) : (
                    <SelectItem value="General">General (No topics found)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
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
    </>
  );
};