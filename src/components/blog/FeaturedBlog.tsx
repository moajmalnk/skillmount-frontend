import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight, Star, TrendingUp } from "lucide-react";
import { BlogPost } from "@/types/blog";
import { WobbleCard } from "@/components/ui/wobble-card";

export const FeaturedBlog = ({ post }: { post: BlogPost }) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group block w-full">
      <WobbleCard className="relative overflow-hidden rounded-3xl bg-card border-0 shadow-2xl h-[500px] md:h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={post.coverImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Floating Badges */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 flex gap-3">
          <Badge className="bg-primary text-primary-foreground border-none px-4 py-1.5 text-sm">
            <TrendingUp className="w-4 h-4 mr-2" /> Featured
          </Badge>
          {post.isEditorsPick && (
            <Badge className="bg-green-500 text-white border-none px-4 py-1.5 text-sm">
              <Star className="w-4 h-4 mr-2 fill-current" /> Editor's Choice
            </Badge>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 lg:p-12">
          <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">{post.categories?.[0] || "General"}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {post.title}
              </h2>

              <p className="text-lg text-white/80 line-clamp-2 max-w-2xl">
                {post.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-full pl-2 pr-4 py-2 border border-white/10">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-white">{post.author.name}</span>
              </div>

              <Button size="lg" className="rounded-full px-8 h-14 bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 group/btn">
                Read Article <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </WobbleCard>
    </Link>
  );
};