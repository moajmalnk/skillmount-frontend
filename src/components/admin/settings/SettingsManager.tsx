import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Settings, Database, Users, BookOpen, 
  Share2, Save, RotateCcw, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- REUSABLE SUB-COMPONENT FOR LIST MANAGEMENT ---
interface SettingCardProps {
  title: string;
  description: string;
  icon: any;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
}

const SettingCard = ({ title, description, icon: Icon, items, onAdd, onRemove, placeholder }: SettingCardProps) => {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (items.includes(newItem.trim())) {
      toast.error("This item already exists.");
      return;
    }
    onAdd(newItem.trim());
    setNewItem("");
    toast.success(`${title} Updated`, { description: `Added "${newItem}" to the list.` });
  };

  return (
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
              {items.map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <Badge 
                    variant="secondary" 
                    className="pl-3 pr-1 py-1.5 flex items-center gap-2 text-sm hover:bg-muted transition-colors border border-border/50"
                  >
                    {item}
                    <button 
                      onClick={() => onRemove(item)}
                      className="p-0.5 hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground italic w-full text-center py-8">
                No items added yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// --- MAIN SETTINGS COMPONENT ---
export const SettingsManager = () => {
  // Initial State (Mock Data)
  const [batches, setBatches] = useState(["Sep 2025", "Aug 2025", "July 2025"]);
  const [mentors, setMentors] = useState(["Dr. Smith", "Prof. Jane Doe", "Mr. Alex Johnson"]);
  const [topics, setTopics] = useState(["WordPress", "React", "Digital Marketing", "SEO"]);
  const [platforms, setPlatforms] = useState(["YouTube", "Instagram", "LinkedIn", "Blog"]);
  const [coordinators, setCoordinators] = useState(["Sarah Wilson", "Mike Ross"]);

  // Generic Handlers
  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (item: string) => {
    setter(prev => [item, ...prev]);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (item: string) => {
    setter(prev => prev.filter(i => i !== item));
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Configurations</h2>
          <p className="text-muted-foreground">Manage global dropdown options and system defaults.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Changes
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> Save All Changes
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general">General Data</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <SettingCard 
              title="Batches" 
              description="Active student batches available for enrollment."
              icon={Database}
              items={batches}
              onAdd={addItem(setBatches)}
              onRemove={removeItem(setBatches)}
              placeholder="e.g. Oct 2025"
            />
            
            <SettingCard 
              title="Mentors" 
              description="Faculty members assignable to students."
              icon={Users}
              items={mentors}
              onAdd={addItem(setMentors)}
              onRemove={removeItem(setMentors)}
              placeholder="e.g. Dr. Alan Grant"
            />

            <SettingCard 
              title="Coordinators" 
              description="Staff managing batch operations."
              icon={CheckCircle2}
              items={coordinators}
              onAdd={addItem(setCoordinators)}
              onRemove={removeItem(setCoordinators)}
              placeholder="e.g. Sarah Connor"
            />

            <SettingCard 
              title="Expertise Topics" 
              description="Subjects for Tutor specialization."
              icon={BookOpen}
              items={topics}
              onAdd={addItem(setTopics)}
              onRemove={removeItem(setTopics)}
              placeholder="e.g. Python"
            />

            <SettingCard 
              title="Referral Platforms" 
              description="Sources for Affiliate tracking."
              icon={Share2}
              items={platforms}
              onAdd={addItem(setPlatforms)}
              onRemove={removeItem(setPlatforms)}
              placeholder="e.g. TikTok"
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>System Policies</CardTitle>
              <CardDescription>Configure global system behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                Advanced Policy Settings (Privacy, Terms, Refunds) Coming Soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
