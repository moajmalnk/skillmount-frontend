import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, Loader2, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { blogService } from "@/services/blogService";
import { BlogPost as BlogPostType } from "@/types/blog";
import SEO from "@/components/SEO";
import { FollowingPointer } from "@/components/ui/following-pointer";
import ProfessionalBackground from "@/components/ProfessionalBackground";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      if (slug) {
        const data = await blogService.getBySlug(slug);
        setPost(data || null);
      }
      setIsLoading(false);
    };
    loadPost();
  }, [slug]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center">Post not found</div>;

  return (
    <FollowingPointer>
      <SEO title={post.title} description={post.excerpt} image={post.coverImage} type="article" />
      
      <article className="min-h-screen bg-background pb-20">
        {/* Hero Header */}
        <div className="relative h-[60vh] min-h-[400px]">
          <div className="absolute inset-0">
             <img src={post.coverImage} className="w-full h-full object-cover" alt={post.title} />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/30" />
          </div>

          <div className="container mx-auto px-6 max-w-4xl relative z-10 h-full flex flex-col justify-end pb-12">
            <Link to="/blog">
                <Button variant="secondary" size="sm" className="mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                </Button>
            </Link>
            
            <div className="space-y-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
                <Badge className="bg-primary text-primary-foreground border-none px-4 py-1.5">{post.category}</Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                    {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground pt-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{post.author.name}</span>
                            <span className="text-xs">{post.author.role}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" /> {post.publishedDate}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" /> {post.readTime}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="container mx-auto px-6 max-w-3xl mt-12">
           <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl prose-img:shadow-xl">
             <div dangerouslySetInnerHTML={{ __html: post.content }} />
           </div>

           <Separator className="my-12" />

           {/* Footer Meta */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="rounded-full px-4 py-1">
                        <Tag className="w-3 h-3 mr-2" /> {tag}
                    </Badge>
                ))}
             </div>
             
             <Button variant="outline" className="rounded-full" onClick={() => navigator.share({ title: post.title, url: window.location.href })}>
                <Share2 className="w-4 h-4 mr-2" /> Share Article
             </Button>
           </div>
        </div>
      </article>
    </FollowingPointer>
  );
};

export default BlogPost;