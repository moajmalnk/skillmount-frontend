import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Code, Download, Copy } from "lucide-react";
import { Material } from "@/types/material";
import { toast } from "sonner";

export const SnippetGrid = ({ snippets }: { snippets: Material[] }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid gap-8">
        {snippets.map((snippet, index) => (
          <div id={`material-${snippet.id}`} key={snippet.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
            <WobbleCard
              className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden cursor-pointer"
              onClick={() => snippet.url && window.open(snippet.url, '_blank')}
            >
              <CardHeader className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">{snippet.category}</Badge>
                      <Badge variant="outline" className="rounded-full border-border/40 text-xs">{snippet.language}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors duration-300">{snippet.title}</CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">{snippet.description}</CardDescription>
                  </div>
                  <Code className="w-6 h-6 text-primary flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-6">
                  <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-6 overflow-x-auto border border-border/30">
                    <pre className="text-sm font-mono text-foreground">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(snippet.code || "");
                      }}
                      className="flex-1 rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy Code
                    </Button>
                    {snippet.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={snippet.url} download>
                          <Download className="w-4 h-4 mr-2" /> Download File
                        </a>
                      </Button>
                    )}
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