import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Loader2, Eye } from "lucide-react";
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

export const TutorManager = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
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
  const loadTutors = async () => {
    setIsLoading(true);
    try {
      const data = (await userService.getElementsByRole("tutor")) as Tutor[];
      setTutors(data);
    } catch (error) {
      toast.error("Failed to load tutors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
  }, []);

  const handleViewDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsSheetOpen(true);
  };

  const generateRegId = (count: number) => 
    `TUT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const generateTempPassword = (email: string, phone: string) => {
    return `${email.substring(0, 3).toLowerCase()}@${phone.slice(-4)}`;
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.topic) {
      toast.error("All fields are mandatory.");
      return;
    }

    try {
      const newRegId = generateRegId(tutors.length);
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

      await userService.create(newTutor);
      
      toast.success(`Tutor Created! Reg ID: ${newRegId}`, {
        description: `Credentials sent. Temp Password: ${tempPassword}`,
      });

      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", topic: "" });
      
      loadTutors(); 

    } catch (error) {
      toast.error("Failed to create tutor");
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
      loadTutors();
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tutor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Primary Topic</Label>
              <Select value={formData.topic} onValueChange={(val) => setFormData({...formData, topic: val})}>
                <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                <SelectContent>
                  {TOPICS.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Account</Button>
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