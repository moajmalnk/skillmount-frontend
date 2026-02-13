import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Video, PlayCircle, ExternalLink } from "lucide-react";
import { Material } from "@/types/material";
import { YouTubePlayer } from "./YouTubePlayer";

interface VideoGridProps {
  videos: Material[];
  onMaterialClick?: (material: Material) => void;
}

export const VideoGrid = ({ videos, onMaterialClick }: VideoGridProps) => {
  const [selectedVideo, setSelectedVideo] = useState<Material | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedVideo && playerContainerRef.current) {
      // Small timeout to ensure DOM is ready and layout is stabilized
      setTimeout(() => {
        playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedVideo]);

  return (
    <div className="container mx-auto px-6 max-w-7xl">

      {/* --- Active Video Player Section --- */}
      {selectedVideo && (
        <div
          ref={playerContainerRef}
          className="mb-12 border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-top-4 scroll-mt-24"
        >
          <div className="aspect-video w-full">
            <YouTubePlayer
              videoUrl={selectedVideo.embedUrl || selectedVideo.url} // Pass URL, component handles extraction
              title={selectedVideo.title}
              autoplay={true}
            />
          </div>
          <div className="p-6 bg-card/50 backdrop-blur-sm flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVideo(null)}
              className="rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            >
              Close Video
            </Button>
          </div>
        </div>
      )}

      {/* --- Video Cards Grid --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, index) => (
          <div
            id={`material-${video.id}`}
            key={video.id}
            className="animate-elegant-entrance h-full"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <WobbleCard
              containerClassName="h-full"
              className="border border-border/30 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700 group hover:-translate-y-2 bg-card/30 backdrop-blur-sm overflow-hidden h-full flex flex-col justify-between cursor-pointer"
              onClick={() => onMaterialClick ? onMaterialClick(video) : setSelectedVideo(video)}
            >

              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-secondary/50 backdrop-blur-md">
                    {video.category}
                  </Badge>

                  {/* Play Trigger Icon */}
                  {(video.embedUrl || video.url) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(video);
                      }}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      title="Play Video"
                    >
                      <PlayCircle className="w-8 h-8 text-primary hover:text-primary/80 transition-colors drop-shadow-md" />
                    </button>
                  ) : (
                    <div title="No Video Source">
                      <PlayCircle className="w-8 h-8 text-muted-foreground opacity-30 cursor-not-allowed" />
                    </div>
                  )}
                </div>

                <CardTitle className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors duration-300">
                  {video.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3 h-[3.25rem] overflow-hidden">
                  {video.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-0">
                {/* Topics Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array.isArray(video.topics) && video.topics.slice(0, 3).map((topic, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] rounded-full border-border/40 text-muted-foreground">
                      {topic}
                    </Badge>
                  ))}
                  {Array.isArray(video.topics) && video.topics.length > 3 && (
                    <Badge variant="outline" className="text-[10px] rounded-full border-border/40 text-muted-foreground">
                      +{video.topics.length - 3}
                    </Badge>
                  )}
                </div>

                <Separator className="my-6 bg-border/30" />

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {video.duration ? (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        {video.duration}
                      </>
                    ) : (
                      <span className="italic opacity-50">On demand</span>
                    )}
                  </span>

                  <div className="flex gap-2">
                    {/* Watch Button */}
                    {(video.embedUrl || video.url) && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // Prevent the card's click event
                          setSelectedVideo(video);
                        }}
                      >
                        Watch
                      </Button>
                    )}

                    {/* Download/External Link */}
                    {video.is_file && video.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="rounded-full border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-xs px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={video.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1.5" /> Open
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