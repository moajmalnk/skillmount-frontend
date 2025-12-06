import { useState, useEffect } from "react";
import { Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import SEO from "@/components/SEO";
import { BlogCard } from "@/components/blog/BlogCard";
import { FeaturedBlog } from "@/components/blog/FeaturedBlog";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";
import { FollowingPointer } from "@/components/ui/following-pointer";

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadBlogs = async () => {
      setIsLoading(true);
      try {
        const data = await blogService.getAll();
        setBlogs(data);
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBlogs();
  }, []);

  // Derived State
  const featuredPost = blogs.find(b => b.isFeatured) || blogs[0];
  const otherPosts = blogs.filter(b => b.id !== featuredPost?.id);
  
  const filteredPosts = otherPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(blogs.map(b => b.category))];

  return (
    <FollowingPointer>
      <SEO title="Blog - Tech Insights & Tutorials | SkillMount" description="Read the latest articles on Web Development, AI, and Career Growth." />
      
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-24">
          
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Our Latest Thoughts</span>
            </div>
            <TextGenerateEffect words="Insights & Stories" className="text-5xl md:text-7xl font-bold text-foreground" />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Expert perspectives on technology, learning, and the future of work.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-16">
              
              {/* Featured Post */}
              {featuredPost && (
                <ContainerScrollAnimation direction="up" speed="slow">
                  <FeaturedBlog post={featuredPost} />
                </ContainerScrollAnimation>
              )}

              {/* Filters & Search */}
              <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-border/40 py-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat)}
                        className="rounded-full whitespace-nowrap"
                        size="sm"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search articles..." 
                      className="pl-9 rounded-full bg-muted/30 border-border/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Blog Grid */}
              <ContainerScrollAnimation direction="up" speed="normal">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post, idx) => (
                    <div key={post.id} className="animate-elegant-entrance" style={{ animationDelay: `${idx * 100}ms` }}>
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
                
                {filteredPosts.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    No articles found matching your criteria.
                  </div>
                )}
              </ContainerScrollAnimation>

            </div>
          )}
        </div>
      </div>
    </FollowingPointer>
  );
};

export default Blog;