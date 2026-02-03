import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Mail, CheckCircle2, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { inquiryService, Inquiry } from "@/services/inquiryService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"; // Import the delete dialog

export const InquiryManager = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'All' | 'New' | 'Read' | 'Replied'>('All');

  // View Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inquiryService.getAll();
      setInquiries(data);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- DELETE HANDLERS ---
  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await inquiryService.delete(deleteId);
      toast.success("Inquiry deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete inquiry");
    } finally {
      setDeleteId(null);
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await inquiryService.markAsRead(id);
    toast.success("Marked as read");
    loadData();
  };

  const handleView = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (inq.status === 'New') {
      inquiryService.markAsRead(inq.id).then(loadData);
    }
  };

  const filteredInquiries = (Array.isArray(inquiries) ? inquiries : []).filter((inq) => {
    // Search Filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      inq.name.toLowerCase().includes(searchLower) ||
      inq.email.toLowerCase().includes(searchLower) ||
      (inq.subject && inq.subject.toLowerCase().includes(searchLower)) ||
      inq.message.toLowerCase().includes(searchLower);

    // Status Filter
    let matchesStatus = true;
    if (filter === 'New') matchesStatus = inq.status === 'New';
    else if (filter === 'Replied') matchesStatus = inq.status === 'Replied';
    else if (filter === 'Read') matchesStatus = inq.status !== 'New' && inq.status !== 'Replied';

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return <Badge variant="destructive" className="animate-pulse">New</Badge>;
      case 'Replied': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Replied</Badge>;
      default: return <Badge variant="secondary">Read</Badge>;
    }
  };

  const inquiryToDelete = inquiries.find(i => i.id === deleteId);

  return (
    <>

      <div className="space-y-4">
        {/* 1. Filter Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-[180px]">
                <Select value={filter} onValueChange={(val: any) => setFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Inquiries</SelectItem>
                    <SelectItem value="New">Unread / New</SelectItem>
                    <SelectItem value="Read">Read</SelectItem>
                    <SelectItem value="Replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || filter !== 'All') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearchQuery(""); setFilter("All"); }}
                  title="Reset Filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Data Card */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-3 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInquiries.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No inquiries match your search." : "No inquiries found."}
                  </TableCell></TableRow>
                ) : (
                  filteredInquiries.map((inq) => (
                    <TableRow
                      key={inq.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleView(inq)}
                    >
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">{inq.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{inq.name}</div>
                        <div className="text-[10px] text-muted-foreground">{inq.email}</div>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-primary">{inq.subject || "General Inquiry"}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-muted-foreground">{inq.message}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(inq.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${inq.email}`; }}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>

                          {inq.status === 'New' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                              onClick={(e) => handleMarkRead(inq.id, e)}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => initiateDelete(inq.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="modal-admin-uniform">
          <DialogHeader className="modal-header-standard">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="flex items-center gap-3">
                  <span>Inquiry Details</span>
                  {selectedInquiry && getStatusBadge(selectedInquiry.status)}
                </DialogTitle>
                <DialogDescription>Received on {selectedInquiry?.date}</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedInquiry(null)} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="modal-body-standard">
            {selectedInquiry && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Sender Name</span>
                    <span className="font-semibold text-foreground">{selectedInquiry.name}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Phone Number</span>
                    <span className="font-semibold text-foreground">{selectedInquiry.phone}</span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Email Address</span>
                    <span className="font-semibold text-primary underline underline-offset-4 cursor-pointer" onClick={() => window.location.href = `mailto:${selectedInquiry.email}`}>
                      {selectedInquiry.email}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border/50 shadow-inner">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-2">Message Content</span>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="modal-footer-standard">
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Close</Button>
            {selectedInquiry && (
              <Button onClick={() => window.location.href = `mailto:${selectedInquiry.email}`} className="px-6">
                <Mail className="w-4 h-4 mr-2" /> Reply via Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        itemName={`Message from ${inquiryToDelete?.name}`}
        description="This will permanently delete this inquiry message."
      />
    </>
  );
};