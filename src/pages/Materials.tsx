import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2, Video, Palette, Package, FolderOpen, Code, BookOpen } from "lucide-react";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { FollowingPointer } from "@/components/ui/following-pointer";
import SEO from "@/components/SEO";
import { materialService } from "@/services/materialService";
import { Material } from "@/types/material";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [activeTab, setActiveTab] = useState("template-kits");
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
  const materials = Array.isArray(allMaterials) ? allMaterials : [];
  const videos = materials.filter(m => m.type === "Videos");
  const themes = materials.filter(m => m.type === "Themes");
  const plugins = materials.filter(m => m.type === "Plugins");
  const templateKits = materials.filter(m => m.type === "Template Kit");
  const docs = materials.filter(m => m.type === "Docs");
  const snippets = materials.filter(m => m.type === "Snippet");

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
            snippets: snippets.length,
            templateKits: templateKits.length,
            docs: docs.length
          }}
        />

        {isLoading ? (
          <div className="container mx-auto px-6 max-w-7xl mt-12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 p-5 rounded-3xl border border-border/50 bg-card/50">
                  <Skeleton className="w-full aspect-video rounded-2xl" />
                  <Skeleton className="h-7 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            {/* 2. Navigation Tabs */}
            <MaterialsTabs />

            {/* 3. Content Tabs */}
            <ContainerScrollAnimation direction="up" speed="normal">

              <TabsContent value="template-kits" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <FolderOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Template Kits</span>
                  </div>
                  <TextGenerateEffect words="Start with Complete Kits" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <AssetGrid assets={templateKits} />
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
                    <span className="text-xs font-medium text-foreground tracking-wide">Plugins</span>
                  </div>
                  <TextGenerateEffect words="Extend Functionality" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <PluginGrid plugins={plugins} />
              </TabsContent>

              <TabsContent value="docs" className="space-y-6">
                <div className="text-center mb-12 px-6">
                  <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground tracking-wide">Documentation</span>
                  </div>
                  <TextGenerateEffect words="Guides & Docs" className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
                </div>
                <AssetGrid assets={docs} />
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

            </ContainerScrollAnimation>
          </Tabs>
        )}
      </div>
    </FollowingPointer>
  );
};

export default Materials;