import { Search, Filter, X, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WobbleCard } from "@/components/ui/wobble-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ALL_SKILLS } from "@/lib/students-data";

interface StudentsFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBatch: string;
  setSelectedBatch: (batch: string) => void;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
  batches: string[];
}

export const StudentsFilter = ({
  searchQuery,
  setSearchQuery,
  selectedBatch,
  setSelectedBatch,
  selectedSkills,
  toggleSkill,
  clearFilters,
  filteredCount,
  totalCount,
  batches
}: StudentsFilterProps) => {
  return (
    <section className="pt-0 sm:pt-2 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.008]" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, currentColor 25%, currentColor 50%, transparent 50%, transparent 75%, currentColor 75%)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 bg-primary/[0.03] border border-primary/10 rounded-full px-5 py-2 mb-6">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground tracking-wide">Advanced Filters</span>
          </div>
          <TextGenerateEffect words="Filter & Discover" className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[0.95]" duration={1.5} />
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">Find the perfect match using our advanced filtering system</p>
        </div>

        <WobbleCard className="border border-border/30 rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 mb-4">
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-12 gap-6 mb-6">
              {/* Search */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-border/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                />
              </div>

              {/* Batch Select */}
              <div className="md:col-span-3">
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="rounded-xl border-border/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="md:col-span-4 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">{filteredCount} of {totalCount} students</span>
                </div>
                {(searchQuery || selectedBatch !== "all" || selectedSkills.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Skills Filter */}
            <div className="border-t border-border/20 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Filter by Skills</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {ALL_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105 rounded-full px-4 py-2 text-sm font-medium border-border/30 hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && <X className="w-3 h-3 ml-2" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </WobbleCard>
      </div>
    </section>
  );
};