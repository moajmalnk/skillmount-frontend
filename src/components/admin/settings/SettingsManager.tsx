import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Settings, Database, Users, BookOpen, 
  Share2, Save, CheckCircle2, HelpCircle, Pencil, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

// Import Service & Type
import { systemService, SystemSettings } from "@/services/systemService";

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
  
  // State for Edit/Delete Modals
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (items.includes(newItem.trim())) {
      toast.error("This item already exists.");
      return;
    }
    onAdd(newItem.trim());
    setNewItem("");
  };

  const initiateEdit = (item: string) => {
    setItemToEdit(item);
    setEditValue(item);
  };

  const confirmEdit = () => {
    if (itemToEdit && editValue.trim()) {
      if (items.includes(editValue.trim()) && editValue.trim() !== itemToEdit) {
        toast.error("This item name already exists.");
        return;
      }
      onEdit(itemToEdit, editValue.trim());
      setItemToEdit(null);
      setEditValue("");
      toast.success("Item updated successfully");
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onRemove(itemToDelete);
      setItemToDelete(null);
      toast.success("Item deleted");
    }
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
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="bg-muted/30"
            />
            <Button onClick={handleAdd} size="icon" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator />
          
          <ScrollArea className="h-[200px] pr-4">
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
                            onClick={() => setItemToDelete(item)}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>"{itemToDelete}"</strong> from the list? 
              This action cannot be undone and may affect users currently using this option.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* EDIT ITEM DIALOG */}
      <Dialog open={!!itemToEdit} onOpenChange={() => setItemToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Make changes to the item below. Click save when you're done.
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
            <Button onClick={confirmEdit}>Save changes</Button>
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

  // 2. Generic Update Handler
  const updateList = async (key: keyof SystemSettings, newList: string[]) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: newList };
    setSettings(newSettings); // Optimistic UI update

    // Save to backend (silent save)
    try {
      await systemService.updateSettings(newSettings);
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  // Helper wrappers
  const createHandlers = (key: keyof SystemSettings) => ({
    onAdd: (item: string) => {
      if (!settings) return;
      const currentList = settings[key] || [];
      updateList(key, [item, ...currentList]);
    },
    onRemove: (item: string) => {
      if (!settings) return;
      const currentList = settings[key] || [];
      updateList(key, currentList.filter(i => i !== item));
    },
    onEdit: (oldItem: string, newItem: string) => {
        if (!settings) return;
        const currentList = settings[key] || [];
        const updatedList = currentList.map(i => i === oldItem ? newItem : i);
        updateList(key, updatedList);
    }
  });

  const handleSaveAll = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await systemService.updateSettings(settings);
      toast.success("All settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* <Loader2 className="w-8 h-8 animate-spin text-primary" /> */}
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Configurations</h2>
          <p className="text-muted-foreground">Manage global dropdown options and system values.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90" 
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? <span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"/> : <Save className="w-4 h-4 mr-2" />} 
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="px-6">General Data</TabsTrigger>
          <TabsTrigger value="tickets" className="px-6">Ticketing & Support</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingCard 
              title="Ticket Macros" 
              description="Pre-defined replies for faster support."
              icon={Settings} // Changed icon to Settings generic or MessageSquare
              items={settings.macros || []}
              {...createHandlers('macros')}
              placeholder="e.g. Please check your internet..."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};