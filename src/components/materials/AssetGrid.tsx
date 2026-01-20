import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WobbleCard } from "@/components/ui/wobble-card";
import { FolderOpen, Download, BookOpen, ExternalLink, Layout } from "lucide-react";
import { Material } from "@/types/material";

export const AssetGrid = ({ assets }: { assets: Material[] }) => {
  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset, index) => (
          <div key={asset.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}>
            <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden h-full">
              <CardHeader className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border-0">
                      {asset.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs rounded-full border-border/40 w-fit">{asset.category}</Badge>
                  </div>
                  {asset.type === 'Docs' ? (
                    <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <Layout className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  )}
                </div>
                <CardTitle className="text-lg leading-tight mb-3 group-hover:text-primary transition-colors duration-300">{asset.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">{asset.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {asset.formats?.map((format, i) => (
                      <Badge key={i} variant="outline" className="text-xs rounded-full border-border/40 hover:border-primary/50 transition-colors">{format}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {asset.fileCount ? <span>{asset.fileCount} files</span> : <span></span>}
                    {asset.size && <span>{asset.size}</span>}
                  </div>
                  <Separator className="bg-border/30" />
                  <Button size="sm" className="w-full rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 group-hover:scale-105" asChild>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer">
                      {asset.type === 'Docs' ? (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" /> Read Documentation
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" /> Download Kit
                        </>
                      )}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </WobbleCard>
          </div>
        ))}
      </div>
    </div>
  );
};