import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inquiryService, Inquiry } from "@/services/inquiryService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"; // Import the delete dialog

export const InquiryManager = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Filter Logic
  const [filter, setFilter] = useState<'All' | 'New' | 'Read' | 'Replied'>('All');

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === 'All') return true;
    if (filter === 'New') return inq.status === 'New';
    if (filter === 'Replied') return inq.status === 'Replied';
    // 'Read' is essentially anything not New or Replied (assuming explicit Read status or default)
    if (filter === 'Read') return inq.status !== 'New' && inq.status !== 'Replied';
    return true;
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
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border w-fit">
          {(['All', 'New', 'Read', 'Replied'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              className={`h-8 px-3 text-xs ${filter === f ? 'bg-white shadow-sm dark:bg-zinc-800' : 'text-muted-foreground'}`}
            >
              {f === 'New' ? 'Unread' : f}
              {f === 'New' && inquiries.some(i => i.status === 'New') && (
                <span className="ml-1.5 flex h-1.5 w-1.5 rounded-full bg-red-500" />
              )}
            </Button>
          ))}
        </div>

        <ManagementTable
          title="General Inquiries"
          description="Messages from the public contact form."
          columns={["Date", "Name", "Subject", "Message", "Status"]}
        >
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
          ) : filteredInquiries.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              {filter === 'All' ? "No inquiries yet." : `No ${filter.toLowerCase()} inquiries.`}
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
        </ManagementTable>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Inquiry Details</span>
              {selectedInquiry && getStatusBadge(selectedInquiry.status)}
            </DialogTitle>
            <DialogDescription>Received on {selectedInquiry?.date}</DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Name</span>
                  <span className="font-medium">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Phone</span>
                  <span className="font-medium">{selectedInquiry.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs block">Email</span>
                  <span className="font-medium">{selectedInquiry.email}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <span className="text-muted-foreground text-xs block mb-1">Message</span>
                <p className="text-sm leading-relaxed">{selectedInquiry.message}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Close</Button>
                <Button onClick={() => window.location.href = `mailto:${selectedInquiry.email}`}>
                  <Mail className="w-4 h-4 mr-2" /> Reply via Email
                </Button>
              </div>
            </div>
          )}
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