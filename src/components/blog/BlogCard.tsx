import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight, Star } from "lucide-react";
import { BlogPost } from "@/types/blog";
import { WobbleCard } from "@/components/ui/wobble-card";

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <WobbleCard containerClassName="h-full" className="bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-background/90 text-foreground hover:bg-background backdrop-blur-md border-none shadow-sm">
              {post.categories?.[0] || "General"}
            </Badge>
            {post.isEditorsPick && (
              <Badge className="bg-green-500 text-white border-none shadow-sm gap-1">
                <Star className="w-3 h-3 fill-current" /> Editor's Pick
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">{post.author.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{post.publishedDate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary group/btn">
              Read Story <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </WobbleCard>
    </Link>
  );
};