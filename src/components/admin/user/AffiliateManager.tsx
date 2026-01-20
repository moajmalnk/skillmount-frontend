import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow, TableHead, TableHeader, TableBody, Table } from "@/components/ui/table";
import { Pencil, Trash2, RefreshCw, Loader2, Copy, CheckCircle2, AlertCircle, Search, X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { UserDetailSheet } from "./UserDetailSheet";

// Import Service & Types
import { userService } from "@/services/userService";
import { systemService } from "@/services/systemService";
import { Affiliate } from "@/types/user";

// const PLATFORMS = ... (Removed in favor of dynamic settings)

export const AffiliateManager = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredAffiliates = affiliates.filter(a => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = a.name.toLowerCase().includes(searchLower) ||
      a.email.toLowerCase().includes(searchLower) ||
      (a.regId && a.regId.toLowerCase().includes(searchLower)) ||
      (a.couponCode && a.couponCode.toLowerCase().includes(searchLower));

    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Dialog & Form State
  // Dialog & Form State (Create Only)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    couponCode: ""
  });

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. Fetch Data (Initial Load)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [affiliatesData, settings] = await Promise.all([
        userService.getElementsByRole("affiliate") as Promise<Affiliate[]>,
        systemService.getSettings()
      ]);
      setAffiliates(affiliatesData);
      setPlatforms(settings.platforms || ["Other"]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for just refreshing the list after updates
  const loadAffiliates = async () => {
    try {
      const data = (await userService.getElementsByRole("affiliate")) as Affiliate[];
      setAffiliates(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateRegId = () => {
    if (affiliates.length === 0) {
      return `AFF-${new Date().getFullYear()}-001`;
    }

    // Extract max numeric ID
    const maxId = affiliates.reduce((max, affiliate) => {
      const parts = affiliate.regId?.split('-') || [];
      const num = parseInt(parts[2] || '0', 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return `AFF-${new Date().getFullYear()}-${String(maxId + 1).padStart(3, '0')}`;
  };

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
      // Only auto-generate if NOT editing or if coupon is empty
      couponCode: !prev.couponCode ? generateCoupon(val) : prev.couponCode
    }));
  };

  // --- ACTIONS: OPEN/RESET ---
  const openCreateDialog = () => {
    setFormData({ name: "", email: "", phone: "", couponCode: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsSheetOpen(true);
  };

  // --- SUBMIT HANDLER (Create Only) ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.couponCode) {
      toast.error("All fields are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newRegId = generateRegId();
      const tempPassword = `${formData.email.substring(0, 3).toLowerCase()}@${formData.phone.slice(-4)}`;

      const newAffiliate: Partial<Affiliate> = {
        regId: newRegId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "affiliate",
        status: "Pending",
        couponCode: formData.couponCode.toUpperCase(),
        password: tempPassword,
        isProfileComplete: false
      };

      const result = await userService.create(newAffiliate);

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
          <span className="font-semibold">Affiliate Created!</span>

          <div className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
            <span>Code: <code className="font-mono font-bold">{newAffiliate.couponCode}</code></span>
            <button onClick={() => navigator.clipboard.writeText(newAffiliate.couponCode!)} title="Copy Code" className="hover:bg-background p-1 rounded">
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

      setIsDialogOpen(false);
      loadAffiliates(); // Refresh list

    } catch (error) {
      toast.error("Failed to create affiliate");
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
      toast.success("Affiliate removed successfully");
      loadAffiliates();
    } catch (error) {
      toast.error("Failed to delete affiliate");
    } finally {
      setDeleteId(null);
    }
  };

  const affiliateToDelete = affiliates.find(a => a.id === deleteId);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
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
                placeholder="Search by name, email, or coupon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-[180px]">
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

            <Button onClick={openCreateDialog} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Partner
            </Button>

            {/* Clear Button */}
            {(searchQuery || filterStatus !== 'all') && (
              <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }} title="Reset Filters">
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
                  <TableHead>Partner Details</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading Partners...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAffiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No affiliates found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAffiliates.map((affiliate) => (
                    <TableRow
                      key={affiliate.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEdit(affiliate)}
                    >
                      <TableCell className="font-medium font-mono text-xs">{affiliate.regId}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); copyCode(affiliate.couponCode || ""); }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${affiliate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {affiliate.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => initiateDelete(affiliate.id, e)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Affiliate</DialogTitle>
            <DialogDescription>
              Create a partner account and assign a unique coupon code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name / Entity</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
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
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  className="font-mono uppercase"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, couponCode: generateCoupon(prev.name) }))}
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>


          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailSheet
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); loadAffiliates(); }}
        user={selectedAffiliate}
        type="affiliate"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        itemName={affiliateToDelete?.name}
        description="This will permanently delete the affiliate account and deactivate their coupon code."
      />
    </div>
  );
};