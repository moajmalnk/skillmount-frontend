import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { Video, Palette, Package, FolderOpen, Code, BookOpen } from "lucide-react";

export const MaterialsTabs = () => {
  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-8">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Browse Materials</span>
            </div>
            <TextGenerateEffect 
              words="Choose Your Learning Path" 
              className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]"
              duration={1.5}
            />
          </div>
          
          <div className="flex justify-center mb-12">
            <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700">
              <TabsList className="grid grid-cols-5 h-auto bg-transparent p-2 gap-2">
                <TabsTrigger value="videos" className="flex flex-col items-center gap-2 py-4 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-primary/10 group">
                  <Video className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs md:text-sm font-medium">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="themes" className="flex flex-col items-center gap-2 py-4 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-primary/10 group">
                  <Palette className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs md:text-sm font-medium">Themes</span>
                </TabsTrigger>
                <TabsTrigger value="plugins" className="flex flex-col items-center gap-2 py-4 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-primary/10 group">
                  <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs md:text-sm font-medium">Plugins</span>
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex flex-col items-center gap-2 py-4 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-primary/10 group">
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs md:text-sm font-medium">Assets</span>
                </TabsTrigger>
                <TabsTrigger value="snippets" className="flex flex-col items-center gap-2 py-4 px-6 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-primary/10 group">
                  <Code className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs md:text-sm font-medium">Code</span>
                </TabsTrigger>
              </TabsList>
            </WobbleCard>
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};