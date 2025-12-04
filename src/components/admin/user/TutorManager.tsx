import { useState } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
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

// Mock Topics Data (In real app, this comes from Settings)
const TOPICS = [
  "WordPress Development",
  "React & Node.js",
  "Digital Marketing",
  "UI/UX Design",
  "SEO Optimization"
];

interface Tutor {
  regId: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  status: "Active" | "Inactive" | "Pending";
}

export const TutorManager = () => {
  const [tutors, setTutors] = useState<Tutor[]>([
    { regId: "TUT-2025-001", name: "Dr. Alan Grant", email: "alan@skillmount.com", phone: "9876543210", topic: "WordPress Development", status: "Active" },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", topic: "" });

  const generateTempPassword = (email: string, phone: string) => {
    return `${email.substring(0, 3).toLowerCase()}@${phone.slice(-4)}`;
  };

  const generateRegId = () => `TUT-${new Date().getFullYear()}-${String(tutors.length + 1).padStart(3, '0')}`;

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.topic) {
      toast.error("All fields are mandatory.");
      return;
    }

    const newRegId = generateRegId();
    const tempPassword = generateTempPassword(formData.email, formData.phone);

    const newTutor: Tutor = {
      regId: newRegId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      topic: formData.topic,
      status: "Pending"
    };

    setTutors([...tutors, newTutor]);
    
    toast.success(`Tutor Created! Reg ID: ${newRegId}`, {
      description: `Credentials sent. Temp Password: ${tempPassword}`,
    });

    setIsCreateOpen(false);
    setFormData({ name: "", email: "", phone: "", topic: "" });
  };

  return (
    <>
      <ManagementTable 
        title="Tutors" 
        description="Manage faculty and assigned topics."
        columns={["Reg ID", "Name", "Email", "Phone", "Topic", "Status"]}
        onAddNew={() => setIsCreateOpen(true)}
      >
        {tutors.map((tutor) => (
          <TableRow key={tutor.regId}>
            <TableCell className="font-medium">{tutor.regId}</TableCell>
            <TableCell>{tutor.name}</TableCell>
            <TableCell>{tutor.email}</TableCell>
            <TableCell>{tutor.phone}</TableCell>
            <TableCell>{tutor.topic}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tutor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tutor.status}
              </span>
            </TableCell>
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
    </>
  );
};