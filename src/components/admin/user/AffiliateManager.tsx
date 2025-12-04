import { useState } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Copy, RefreshCw } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Blog", "Other"];

interface Affiliate {
  regId: string;
  name: string;
  email: string;
  phone: string;
  platform: string;
  couponCode: string; // New Field
  status: "Active" | "Inactive" | "Pending";
}

export const AffiliateManager = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([
    { 
      regId: "AFF-2025-001", 
      name: "Marketing Pro Agency", 
      email: "contact@marketpro.com", 
      phone: "9988776655", 
      platform: "Instagram",
      couponCode: "MARKET20", 
      status: "Active" 
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    platform: "",
    couponCode: "" 
  });

  const generateRegId = () => `AFF-${new Date().getFullYear()}-${String(affiliates.length + 1).padStart(3, '0')}`;
  
  // Auto-generate coupon from name (e.g., "John Doe" -> "JOHN20")
  const generateCoupon = (name: string) => {
    if (!name) return "";
    const cleanName = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase();
    const randomNum = Math.floor(Math.random() * 90) + 10;
    return `${cleanName}${randomNum}`; // e.g. MARK20
  };

  const handleNameChange = (val: string) => {
    setFormData(prev => ({ 
      ...prev, 
      name: val,
      // Only auto-generate if coupon is empty or matches previous auto-gen pattern
      couponCode: !prev.couponCode ? generateCoupon(val) : prev.couponCode
    }));
  };

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.couponCode) {
      toast.error("All fields are mandatory.");
      return;
    }

    const newAffiliate: Affiliate = {
      regId: generateRegId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      platform: formData.platform || "Other",
      couponCode: formData.couponCode.toUpperCase(),
      status: "Pending"
    };

    setAffiliates([...affiliates, newAffiliate]);
    
    toast.success(`Affiliate Created! Code: ${newAffiliate.couponCode}`, {
      description: "Credentials and Coupon Code sent via email.",
    });

    setIsCreateOpen(false);
    setFormData({ name: "", email: "", phone: "", platform: "", couponCode: "" });
  };

  return (
    <>
      <ManagementTable 
        title="Affiliates & Partners" 
        description="Manage partners, referral links, and coupon codes."
        columns={["Reg ID", "Name", "Platform", "Coupon Code", "Status"]}
        onAddNew={() => setIsCreateOpen(true)}
      >
        {affiliates.map((affiliate) => (
          <TableRow key={affiliate.regId}>
            <TableCell className="font-medium">{affiliate.regId}</TableCell>
            <TableCell>
              <div className="font-medium">{affiliate.name}</div>
              <div className="text-xs text-muted-foreground">{affiliate.email}</div>
            </TableCell>
            <TableCell>{affiliate.platform}</TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                {affiliate.couponCode}
              </Badge>
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                affiliate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {affiliate.status}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Affiliate</DialogTitle>
            <DialogDescription>Create a partner account and assign a unique coupon code.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name / Entity</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Primary Platform</Label>
                <Select value={formData.platform} onValueChange={(val) => setFormData({...formData, platform: val})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon" className="flex items-center gap-2">
                  Coupon Code
                  <span className="text-xs text-muted-foreground font-normal">(Auto-generated)</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="coupon" 
                    value={formData.couponCode} 
                    onChange={(e) => setFormData({...formData, couponCode: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({...prev, couponCode: generateCoupon(prev.name)}))}
                    title="Regenerate"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Partner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};