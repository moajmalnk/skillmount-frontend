import { useState } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
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
import { toast } from "sonner";
import { BATCHES, formatBatchForDisplay } from "@/lib/batches"; 
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Eye } from "lucide-react";
import { UserDetailSheet } from "./UserDetailSheet"; // <--- Import the new sheet

// Updated Interface to include fields we might view
interface Student {
  regId: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  status: "Active" | "Inactive" | "Pending";
  // Add optional fields for the sheet view (mock data)
  isProfileComplete?: boolean;
  address?: string;
  pincode?: string;
  aim?: string;
  mentor?: string;
}

export const StudentManager = () => {
  // Mock Data
  const [students, setStudents] = useState<Student[]>([
    { 
      regId: "STU-2025-001", 
      name: "Alex Johnson", 
      email: "alex@example.com", 
      phone: "9876543210", 
      batch: "0925", 
      status: "Active",
      isProfileComplete: true,
      address: "123 Main St, Tech City",
      aim: "To become a Full Stack Developer",
      mentor: "Dr. Alan Grant"
    },
    { 
      regId: "STU-2025-002", 
      name: "Sarah Williams", 
      email: "sarah@example.com", 
      phone: "9123456789", 
      batch: "0925", 
      status: "Pending",
      isProfileComplete: false
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", batch: "" });
  
  // Sheet State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Helper: Open Sheet
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  };

  const generateRegId = () => `STU-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`;

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.batch) {
      toast.error("All fields are mandatory.");
      return;
    }

    const newStudent: Student = {
      regId: generateRegId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      batch: formData.batch,
      status: "Pending",
      isProfileComplete: false
    };

    setStudents([...students, newStudent]);
    toast.success(`Student Created! Reg ID: ${newStudent.regId}`);
    setIsCreateOpen(false);
    setFormData({ name: "", email: "", phone: "", batch: "" });
  };

  return (
    <>
      <ManagementTable 
        title="Students" 
        description="Manage student enrollments and batch assignments."
        columns={["Reg ID", "Name", "Email", "Phone", "Batch", "Status"]}
        onAddNew={() => setIsCreateOpen(true)}
      >
        {students.map((student) => (
          <TableRow 
            key={student.regId} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleViewDetails(student)} // Click row to view
          >
            <TableCell className="font-mono text-xs">{student.regId}</TableCell>
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.phone}</TableCell>
            <TableCell>{formatBatchForDisplay(student.batch, false)}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {student.status}
              </span>
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => handleViewDetails(student)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
            <DialogDescription>Enter mandatory details.</DialogDescription>
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
    </>
  );
};