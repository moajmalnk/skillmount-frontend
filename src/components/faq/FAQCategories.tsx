import { Filter, HelpCircle } from "lucide-react";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "../../components/ui/container-scroll-animation";
import { WobbleCard } from "../../components/ui/wobble-card";
import { memo } from "react";

// Memoized Badge Component
const CategoryBadge = memo(({ category, count, isActive, onClick, delay }: any) => (
  <div 
    className={`inline-block cursor-pointer animate-elegant-entrance w-full h-full`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    onClick={onClick}
  >
    <WobbleCard containerClassName="h-full" className={`h-full overflow-hidden border rounded-2xl transition-all duration-500 hover:shadow-lg hover:-translate-y-1 bg-card/30 backdrop-blur-sm ${
      isActive 
        ? 'border-primary/30 bg-primary/5 shadow-lg shadow-primary/10' 
        : 'border-border/30 hover:border-primary/20 hover:shadow-primary/5'
    }`}>
      <div className="p-4 sm:p-6 flex flex-col justify-center h-full">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
            isActive ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-primary/10'
          }`}>
            <HelpCircle className={`w-4 h-4 transition-colors duration-300 ${
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
            }`} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm sm:text-base font-semibold transition-colors duration-300 truncate ${
              isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
            }`}>
              {category}
            </h3>
            <p className="text-xs text-muted-foreground">{count} questions</p>
          </div>
        </div>
      </div>
    </WobbleCard>
  </div>
));

CategoryBadge.displayName = "CategoryBadge";

interface FAQCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categoryStats: { category: string; count: number }[];
  totalFAQs: number;
}

export const FAQCategories = ({ 
  selectedCategory, 
  setSelectedCategory, 
  categoryStats, 
  totalFAQs 
}: FAQCategoriesProps) => {
  return (
    <ContainerScrollAnimation direction="up" speed="normal">
      <section className="pt-4 sm:pt-16 pb-0 sm:pb-0 bg-background relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-6">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tracking-wide">Browse Categories</span>
            </div>
            <TextGenerateEffect words="Expert Categories" className="text-4xl md:text-6xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Explore questions organized by expertise areas and skill levels
            </p>
          </div>
          
          {/* Reduced bottom margin from mb-16 to mb-8 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-2">
            <CategoryBadge
              category="All Questions"
              count={totalFAQs}
              isActive={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              delay={0}
            />
            {categoryStats.map((stat, index) => (
              <CategoryBadge
                key={stat.category}
                category={stat.category}
                count={stat.count}
                isActive={selectedCategory === stat.category}
                onClick={() => setSelectedCategory(stat.category)}
                delay={(index + 1) * 100}
              />
            ))}
          </div>
        </div>
      </section>
    </ContainerScrollAnimation>
  );
};