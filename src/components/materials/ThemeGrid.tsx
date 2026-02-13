import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Palette, Download, Eye } from "lucide-react";
import { Material } from "@/types/material";

export const ThemeGrid = ({
  themes,
  onMaterialClick
}: {
  themes: Material[],
  onMaterialClick?: (material: Material) => void
}) => {
  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid md:grid-cols-2 gap-8">
        {themes.map((theme, index) => (
          <div id={`material-${theme.id}`} key={theme.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
            <WobbleCard
              className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden h-full cursor-pointer"
              onClick={() => onMaterialClick ? onMaterialClick(theme) : (theme.previewUrl || theme.url) && window.open(theme.previewUrl || theme.url, '_blank')}
            >
              <CardHeader className="p-5 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    <Badge className="rounded-full px-3 py-1 text-xs font-medium">Theme</Badge>
                    {theme.version && (
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-border/40">v{theme.version}</Badge>
                    )}
                  </div>
                  <Palette className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors duration-300">{theme.title}</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed line-clamp-2 h-[3.25rem] overflow-hidden">{theme.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 pt-0">
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {theme.features?.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs rounded-full border-border/40 hover:border-primary/50 transition-colors">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex items-center justify-between">
                    {theme.size && <span className="text-sm text-muted-foreground">Size: {theme.size}</span>}
                    <div className="flex gap-2">
                      {(theme.previewUrl) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={theme.previewUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" /> Preview
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full border-border/40 opacity-50 cursor-not-allowed" disabled>
                          <Eye className="w-4 h-4 mr-2" /> Preview
                        </Button>
                      )}

                      <Button
                        size="sm"
                        asChild
                        className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 group-hover:scale-105"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={theme.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                      </Button>
                    </div>
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