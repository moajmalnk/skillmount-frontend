import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2, Video, Palette, Package, FolderOpen, Code } from "lucide-react";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { FollowingPointer } from "@/components/ui/following-pointer";
import SEO from "@/components/SEO";
import { materialService } from "@/services/materialService";
import { Material } from "@/types/material";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

// Import Reusable Components
import { MaterialsHero } from "@/components/materials/MaterialsHero";
import { MaterialsTabs } from "@/components/materials/MaterialsTabs";
import { VideoGrid } from "@/components/materials/VideoGrid";
import { ThemeGrid } from "@/components/materials/ThemeGrid";
import { PluginGrid } from "@/components/materials/PluginGrid";
import { AssetGrid } from "@/components/materials/AssetGrid";
import { SnippetGrid } from "@/components/materials/SnippetGrid";

const Materials = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [isVisible, setIsVisible] = useState(false);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await materialService.getAll();
        setAllMaterials(data);
      } catch (error) {
        console.error("Failed to load materials", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    setIsVisible(true);
  }, []);

  // Filter Data
  const videos = allMaterials.filter(m => m.type === "Video");
  const themes = allMaterials.filter(m => m.type === "Theme");
  const plugins = allMaterials.filter(m => m.type === "Plugin");
  const assets = allMaterials.filter(m => m.type === "Asset");
  const snippets = allMaterials.filter(m => m.type === "Snippet");

  return (
    <FollowingPointer>
      <SEO 
        title="Learning Materials - WordPress & No-Code Resources | SkillMount" 
        url="https://students.moajmalnk.in/materials"
        description="Access comprehensive learning materials including video tutorials, themes, plugins, and code snippets."
      />

      <div className="min-h-screen bg-background">
        
        {/* 1. Hero Section with Stats */}
        <MaterialsHero 
          isVisible={isVisible} 
          counts={{
            videos: videos.length,
            themes: themes.length,
            plugins: plugins.length,
            snippets: snippets.length
          }}
        />
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* 2. Navigation Tabs */}
            <MaterialsTabs />

            {/* 3. Content Tabs */}
            <ContainerScrollAnimation direction="up" speed="normal">
              
              <TabsContent value="videos" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <Video className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Video Tutorials</span>
                  </div>
                  <TextGenerateEffect words="Master with Video Learning" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <VideoGrid videos={videos} />
              </TabsContent>

              <TabsContent value="themes" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Themes & Templates</span>
                  </div>
                  <TextGenerateEffect words="Professional Themes" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <ThemeGrid themes={themes} />
              </TabsContent>

              <TabsContent value="plugins" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Plugin Guides</span>
                  </div>
                  <TextGenerateEffect words="Essential Documentation" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <PluginGrid plugins={plugins} />
              </TabsContent>

              <TabsContent value="assets" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <FolderOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Project Assets</span>
                  </div>
                  <TextGenerateEffect words="Design Assets & Resources" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <AssetGrid assets={assets} />
              </TabsContent>

              <TabsContent value="snippets" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <Code className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Code Snippets</span>
                  </div>
                  <TextGenerateEffect words="Ready-to-Use Code" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <SnippetGrid snippets={snippets} />
              </TabsContent>

            </ContainerScrollAnimation>
          </Tabs>
        )}
      </div>
    </FollowingPointer>
  );
};

export default Materials;