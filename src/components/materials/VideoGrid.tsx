import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Video, PlayCircle, ExternalLink } from "lucide-react";
import { Material } from "@/types/material";

interface VideoGridProps {
  videos: Material[];
}

export const VideoGrid = ({ videos }: VideoGridProps) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      {/* Video Player Modal/Area */}
      {selectedVideo && (
        <WobbleCard className="mb-12 border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700">
          <div className="aspect-video w-full">
            <iframe
              src={selectedVideo}
              title="Tutorial Video"
              className="w-full h-full rounded-t-3xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6 bg-card/50 backdrop-blur-sm">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedVideo(null)}
              className="rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            >
              Close Video
            </Button>
          </div>
        </WobbleCard>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, index) => (
          <div key={video.id} className="animate-elegant-entrance" style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}>
            <WobbleCard className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden h-full">
              <CardHeader className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">{video.category}</Badge>
                  <PlayCircle className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors group-hover:scale-110" />
                </div>
                <CardTitle className="text-lg leading-tight mb-3 group-hover:text-primary transition-colors duration-300">{video.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">{video.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="flex flex-wrap gap-2 mb-6">
                  {video.topics?.map((topic, i) => (
                    <Badge key={i} variant="outline" className="text-xs rounded-full border-border/40 hover:border-primary/50 transition-colors">{topic}</Badge>
                  ))}
                </div>
                <Separator className="my-6 bg-border/30" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {video.duration || "N/A"}
                  </span>
                  <div className="flex gap-2">
                    {video.embedUrl && (
                      <Button size="sm" onClick={() => setSelectedVideo(video.embedUrl!)} className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 group-hover:scale-105">
                        Watch
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild className="rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300">
                      <a href={video.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
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