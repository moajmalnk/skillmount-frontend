import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Settings, Database, Users, BookOpen,
  Share2, Save, CheckCircle2, HelpCircle, Pencil, AlertTriangle, MessageSquare, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionConfirmationDialog } from "@/components/admin/ActionConfirmationDialog";
import { Label } from "@/components/ui/label";

// Import Service & Type
import { systemService, SystemSettings, MacroItem } from "@/services/systemService";
import { MacroManager } from "./MacroManager";

// --- REUSABLE SUB-COMPONENT ---
interface SettingCardProps {
  title: string;
  description: string;
  icon: any;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  onEdit: (oldItem: string, newItem: string) => void;
  placeholder: string;
}

const SettingCard = ({ title, description, icon: Icon, items = [], onAdd, onRemove, onEdit, placeholder }: SettingCardProps) => {
  const [newItem, setNewItem] = useState("");



  // State for Edit
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Pending Action State
  type PendingAction =
    | { type: 'add', value: string }
    | { type: 'edit', oldValue: string, newValue: string }
    | { type: 'delete', value: string };

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleAddRequest = () => {
    if (!newItem.trim()) return;
    if (items.includes(newItem.trim())) {
      toast.error("This item already exists.");
      return;
    }
    setPendingAction({ type: 'add', value: newItem.trim() });
  };

  const initiateEdit = (item: string) => {
    setItemToEdit(item);
    setEditValue(item);
  };

  const handleEditRequest = () => {
    if (itemToEdit && editValue.trim()) {
      if (items.includes(editValue.trim()) && editValue.trim() !== itemToEdit) {
        toast.error("This item already exists.");
        return;
      }
      setPendingAction({ type: 'edit', oldValue: itemToEdit, newValue: editValue.trim() });
      setItemToEdit(null); // Close the edit input modal first
    }
  };

  const handleDeleteRequest = (item: string) => {
    setPendingAction({ type: 'delete', value: item });
  };

  const executePendingAction = () => {
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case 'add':
        onAdd(pendingAction.value);
        setNewItem("");
        toast.success(`Added "${pendingAction.value}" to ${title}`);
        break;
      case 'edit':
        onEdit(pendingAction.oldValue, pendingAction.newValue);
        toast.success("Updated successfully");
        break;
      case 'delete':
        onRemove(pendingAction.value);
        toast.success("Deleted successfully");
        break;
    }
    setPendingAction(null);
  };

  return (
    <>
      <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRequest()}
              className="bg-muted/30"
            />
            <Button onClick={handleAddRequest} size="icon" className="shrink-0" disabled={!newItem.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          <ScrollArea className="h-auto max-h-[240px] min-h-[80px] pr-4">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {items.length > 0 ? (
                  items.map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <Badge
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 flex items-center gap-2 text-sm hover:bg-muted transition-colors border border-border/50 group"
                      >
                        {item}
                        <div className="flex items-center border-l border-border/50 ml-1 pl-1 gap-0.5">
                          <button
                            onClick={() => initiateEdit(item)}
                            className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(item)}
                            className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors text-muted-foreground"
                            title="Delete"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center py-8 text-muted-foreground text-sm italic">
                    No items yet. Add one above.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* UNIFIED CONFIRMATION DIALOG */}
      {pendingAction && (
        <ActionConfirmationDialog
          open={!!pendingAction}
          onOpenChange={(open) => !open && setPendingAction(null)}
          onConfirm={executePendingAction}
          title={
            pendingAction.type === 'add' ? "Confirm Addition" :
              pendingAction.type === 'edit' ? "Confirm Changes" :
                "Confirm Deletion"
          }
          itemName={
            pendingAction.type === 'add' ? pendingAction.value :
              pendingAction.type === 'edit' ? pendingAction.oldValue :
                pendingAction.value
          }
          description={
            pendingAction.type === 'add'
              ? `Are you sure you want to add this to ${title}?`
              : pendingAction.type === 'edit'
                ? <span>Change to <strong>"{pendingAction.newValue}"</strong>?</span>
                : `Are you sure you want to remove this from ${title}? Use caution as this might affect existing users.`
          }
          variant={
            pendingAction.type === 'delete' ? 'destructive' :
              pendingAction.type === 'add' ? 'success' : 'default'
          }
          confirmLabel={
            pendingAction.type === 'add' ? "Add Item" :
              pendingAction.type === 'edit' ? "Save Changes" :
                "Delete"
          }
        />
      )}

      {/* EDIT ITEM DIALOG */}
      <Dialog open={!!itemToEdit} onOpenChange={() => setItemToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the name of this configuration option.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToEdit(null)}>Cancel</Button>
            <Button onClick={handleEditRequest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- MAIN SETTINGS COMPONENT ---
export const SettingsManager = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Settings on Load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await systemService.getSettings();
        setSettings(data);
      } catch (error) {
        toast.error("Failed to load system settings");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 2. Generic Update Handler (Backend Integrated)
  const updateList = async <K extends keyof SystemSettings>(key: K, newList: SystemSettings[K]) => {
    if (!settings) return;

    // A. Optimistic Update (Instant UI feedback)
    const previousSettings = { ...settings };
    const newSettings = { ...settings, [key]: newList };
    setSettings(newSettings);

    // B. Save to Backend (Silent Sync)
    try {
      await systemService.updateSettings(newSettings);
      // Optional: toast.success("Saved"); // Keeping it silent for better UX on small edits
    } catch (error) {
      // C. Revert on Failure
      setSettings(previousSettings);
      toast.error("Failed to save changes. Reverting...");
    }
  };

  // Helper wrappers for SettingCard checks
  const createHandlers = (key: keyof SystemSettings) => ({
    onAdd: (item: string) => {
      if (!settings) return;
      // We assume this is only used for string[] lists
      const currentList = (settings[key] || []) as string[];
      // @ts-ignore - dynamic key access with specific type assumption
      updateList(key, [item, ...currentList]);
    },
    onRemove: (item: string) => {
      if (!settings) return;
      const currentList = (settings[key] || []) as string[];
      // @ts-ignore
      updateList(key, currentList.filter(i => i !== item));
    },
    onEdit: (oldItem: string, newItem: string) => {
      if (!settings) return;
      const currentList = (settings[key] || []) as string[];
      // @ts-ignore
      const updatedList = currentList.map(i => i === oldItem ? newItem : i);
      // @ts-ignore
      updateList(key, updatedList);
    }
  });

  // Manual "Save All" (Force Sync)
  const handleSaveAll = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await systemService.updateSettings(settings);
      toast.success("All settings synced successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-muted-foreground animate-pulse">Loading configurations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <SettingCard
            title="Batches"
            description="Active student batches."
            icon={Database}
            items={settings.batches || []}
            {...createHandlers('batches')}
            placeholder="e.g. Oct 2025"
          />
          <SettingCard
            title="Mentors"
            description="Faculty members."
            icon={Users}
            items={settings.mentors || []}
            {...createHandlers('mentors')}
            placeholder="e.g. Dr. Alan Grant"
          />
          <SettingCard
            title="Coordinators"
            description="Batch staff."
            icon={CheckCircle2}
            items={settings.coordinators || []}
            {...createHandlers('coordinators')}
            placeholder="e.g. Sarah"
          />
          <SettingCard
            title="Topics"
            description="Tutor specializations."
            icon={BookOpen}
            items={settings.topics || []}
            {...createHandlers('topics')}
            placeholder="e.g. Python"
          />
          <SettingCard
            title="Platforms"
            description="Affiliate sources."
            icon={Share2}
            items={settings.platforms || []}
            {...createHandlers('platforms')}
            placeholder="e.g. TikTok"
          />
          <SettingCard
            title="FAQ Categories"
            description="Categories for Help Center."
            icon={HelpCircle}
            items={settings.faqCategories || []}
            {...createHandlers('faqCategories')}
            placeholder="e.g. Hosting"
          />
          <SettingCard
            title="Ticket Categories"
            description="Categories for Support Tickets."
            icon={MessageSquare}
            items={settings.ticketCategories || []}
            {...createHandlers('ticketCategories')}
            placeholder="e.g. Billing, Technical"
          />
          <SettingCard
            title="Blog Categories"
            description="Categories for Blog Posts."
            icon={Pencil}
            items={settings.blogCategories || []}
            {...createHandlers('blogCategories')}
            placeholder="e.g. Tech, News"
          />
          <SettingCard
            title="Feedback Categories"
            description="Categories for Student Feedback."
            icon={MessageCircle}
            items={settings.feedbackCategories || []}
            {...createHandlers('feedbackCategories')}
            placeholder="e.g. Bug Report, Feature Request"
          />
        </div>

        <div className="w-full">
          <MacroManager
            macros={settings.macros || []}
            onUpdate={(newMacros) => updateList('macros', newMacros)}
          />
        </div>
      </div>
    </div>
  );
};