import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FAQ } from "@/types/faq";

interface FAQListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredFaqs: { category: string; questions: FAQ[] }[];
  isLoading: boolean;
}

export const FAQList = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  filteredFaqs,
  isLoading
}: FAQListProps) => {
  return (
    <section className="pt-4 sm:pt-16 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative">
        
        {/* Search Area & Header */}
        <div className="max-w-md mx-auto mb-12 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search specific questions..." 
            className="pl-10 h-12 rounded-full border-border/50 bg-card/50 backdrop-blur-sm focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary/8 to-primary/5 border border-primary/15 rounded-full px-5 py-2 mb-8">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide">{selectedCategory === "all" ? "All Categories" : selectedCategory}</span>
          </div>
          <TextGenerateEffect words={selectedCategory === "all" ? "All Questions" : selectedCategory} className="text-4xl md:text-6xl font-bold text-foreground mb-8 tracking-tight leading-[0.95]" duration={1.5} />
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            {filteredFaqs.length > 0 
              ? `Found ${filteredFaqs.reduce((total, cat) => total + cat.questions.length, 0)} questions in ${filteredFaqs.length} ${filteredFaqs.length === 1 ? 'category' : 'categories'}`
              : 'No questions found matching your search'
            }
          </p>
        </div>

        {/* List or Empty State */}
        {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading FAQs...</div>
        ) : filteredFaqs.length > 0 ? (
          <div className="space-y-12">
            {filteredFaqs.map((category, categoryIdx) => (
              <div key={categoryIdx} className="animate-elegant-entrance" style={{ animationDelay: `${categoryIdx * 150}ms`, animationFillMode: 'both' }}>
                <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-1">
                  <div className="p-8 md:p-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/8 to-primary/4 rounded-2xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.2} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category.category}</h2>
                      </div>
                      <Badge variant="outline" className="text-sm font-medium border-primary/20 text-primary bg-primary/5">
                        {category.questions.length} {category.questions.length === 1 ? 'Question' : 'Questions'}
                      </Badge>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                      {category.questions.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="border border-border/30 rounded-2xl px-6 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
                          <AccordionTrigger className="text-left hover:no-underline py-6 [&[data-state=open]]:text-primary transition-colors duration-300">
                            <span className="font-semibold pr-4 text-lg leading-relaxed">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} className="prose prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-muted" />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </WobbleCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-elegant-entrance" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <WobbleCard className="text-center py-16 border border-border/30 rounded-3xl bg-card/30 backdrop-blur-sm">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground opacity-50" strokeWidth={1.2} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">No Questions Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">We couldn't find any questions matching your search criteria.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-full px-6 h-10 border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                  Clear Search
                </Button>
                <Button variant="outline" onClick={() => setSelectedCategory("all")} className="rounded-full px-6 h-10 border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                  View All Questions
                </Button>
              </div>
            </WobbleCard>
          </div>
        )}
      </div>
    </section>
  );
};