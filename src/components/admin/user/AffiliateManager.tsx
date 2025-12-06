import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, RefreshCw, Loader2, Copy } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Import Service & Types
import { userService } from "@/services/userService";
import { Affiliate } from "@/types/user";

const PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "Blog", "Other"];

export const AffiliateManager = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    platform: "",
    couponCode: "" 
  });

  // 1. Fetch Data
  const loadAffiliates = async () => {
    setIsLoading(true);
    try {
      const data = (await userService.getElementsByRole("affiliate")) as Affiliate[];
      setAffiliates(data);
    } catch (error) {
      toast.error("Failed to load affiliates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAffiliates();
  }, []);

  const generateRegId = (count: number) => 
    `AFF-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  
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

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.couponCode) {
      toast.error("All fields are mandatory.");
      return;
    }

    try {
      const newRegId = generateRegId(affiliates.length);

      const newAffiliate: Partial<Affiliate> = {
        regId: newRegId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "affiliate",
        status: "Pending",
        platform: formData.platform || "Other",
        couponCode: formData.couponCode.toUpperCase(),
        isProfileComplete: false
      };

      await userService.create(newAffiliate);
      
      toast.success(`Affiliate Created! Code: ${newAffiliate.couponCode}`, {
        description: "Credentials and Coupon Code sent via email.",
      });

      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", platform: "", couponCode: "" });
      
      loadAffiliates();

    } catch (error) {
      toast.error("Failed to create affiliate");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to remove this partner?")) return;

    try {
      await userService.delete(id);
      toast.success("Affiliate removed");
      loadAffiliates();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  return (
    <>
      <ManagementTable 
        title="Affiliates & Partners" 
        description="Manage partners, referral links, and coupon codes."
        columns={["Reg ID", "Name", "Platform", "Coupon Code", "Status"]}
        onAddNew={() => setIsCreateOpen(true)}
      >
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              <div className="flex justify-center items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading Partners...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : affiliates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              No affiliates found. Add one to get started.
            </TableCell>
          </TableRow>
        ) : (
          affiliates.map((affiliate) => (
            <TableRow key={affiliate.id}>
              <TableCell className="font-medium">{affiliate.regId}</TableCell>
              <TableCell>
                <div className="font-medium">{affiliate.name}</div>
                <div className="text-xs text-muted-foreground">{affiliate.email}</div>
              </TableCell>
              <TableCell>{affiliate.platform}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                    {affiliate.couponCode}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(affiliate.couponCode)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(affiliate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
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