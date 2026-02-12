import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Package, Download, ExternalLink } from "lucide-react";
import { Material } from "@/types/material";

export const PluginGrid = ({ plugins }: { plugins: Material[] }) => {
  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plugins.map((plugin, index) => (
          <div id={`material-${plugin.id}`} key={plugin.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
            <WobbleCard
              className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden h-full cursor-pointer"
              onClick={() => {
                const targetUrl = plugin.previewUrl || plugin.url;
                if (targetUrl) window.open(targetUrl, '_blank');
              }}
            >
              <CardHeader className="p-5 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">{plugin.category}</Badge>
                  </div>
                  <Package className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg leading-tight mb-3 group-hover:text-primary transition-colors duration-300">{plugin.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2 h-[3.25rem] overflow-hidden" title={plugin.description}>
                  {plugin.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground h-6">
                    {plugin.version ? <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">v{plugin.version}</span> : <span />}
                    {plugin.size && <span>{plugin.size}</span>}
                  </div>

                  <Separator className="bg-border/30" />

                  <div className="grid gap-2">
                    {plugin.previewUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-300"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={plugin.previewUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> Live Demo / Details
                        </a>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      className="w-full rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 group-hover:scale-105"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={plugin.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Download Plugin
                      </a>
                    </Button>
                  </div>

                  <div className="text-[10px] text-muted-foreground text-center pt-1">
                    Updated: {plugin.lastUpdated}
                  </div>
                </div>
              </CardContent>
            </WobbleCard>
          </div>
        ))}
      </div>
    </div>
  );
};