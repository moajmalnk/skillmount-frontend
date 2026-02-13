import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    ExternalLink,
    Clock,
    Video,
    Code,
    FileText,
    Layers,
    Calendar,
    CheckCircle2,
    Info,
    Package,
    Copy,
    Layout,
    BookOpen,
    X
} from "lucide-react";
import { Material } from "@/types/material";
import { YouTubePlayer } from "./YouTubePlayer";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MaterialDetailDialogProps {
    material: Material | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MaterialDetailDialog = ({
    material,
    isOpen,
    onOpenChange,
}: MaterialDetailDialogProps) => {
    if (!material) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const getIcon = () => {
        switch (material.type) {
            case "Videos": return <Video className="w-5 h-5 text-primary" />;
            case "Snippet": return <Code className="w-5 h-5 text-primary" />;
            case "Docs": return <BookOpen className="w-5 h-5 text-primary" />;
            default: return <Package className="w-5 h-5 text-primary" />;
        }
    };

    const renderHeaderSection = () => (
        <div className="sticky top-0 px-6 py-4 border-b border-border/10 flex-shrink-0 bg-background/95 backdrop-blur-sm z-50">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm flex-shrink-0">
                        {getIcon()}
                    </div>

                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                            <DialogTitle className="text-base md:text-lg font-bold tracking-tight text-foreground leading-tight">
                                {material.title}
                            </DialogTitle>
                            <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary/80 border-0 flex-shrink-0">
                                {material.type}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <Layers className="w-3 h-3 text-primary/60" /> {material.category}
                            </span>
                            <span className="flex items-center gap-1.5 font-mono">
                                <div className="w-1 h-1 rounded-full bg-border" />
                                {material.type === 'Snippet' ? material.language : (material.size || 'N/A')}
                            </span>
                        </div>
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground/50 hover:text-foreground shrink-0" onClick={() => onOpenChange(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const renderDescriptionSection = (padding: string) => (
        <div className={`${padding} space-y-6 text-left`}>
            <div className="relative space-y-4">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mt-32 pointer-events-none" />

                <div className="prose prose-invert max-w-none relative z-10">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-normal">
                        {material.description || `This high-quality ${material.type} resource has been engineered specifically for professional WordPress and Elementor workflows.`}
                    </p>
                </div>
            </div>

            {material.features && material.features.length > 0 && (
                <div className="pt-6 border-t border-border/20 space-y-4 relative">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Requirements & Features</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {material.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm font-medium text-foreground/80 bg-background/40 p-3 rounded-xl border border-border/10 hover:border-primary/20 transition-all duration-300">
                                <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                </div>
                                <span className="leading-tight text-xs md:text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderTechnicalSection = (wrapperClass: string) => (
        <div className={wrapperClass}>
            <div className="max-w-md w-full space-y-4 text-left">
                <div className="bg-card/40 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-5 md:p-6 border border-border/30 shadow-xl space-y-4 md:space-y-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />

                    <div className="space-y-4 relative">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Technical Details</h4>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {[
                                    { label: 'Category', value: material.category, icon: Layers },
                                    { label: 'Build', value: material.version || 'v1.0.0', icon: Package },
                                    { label: 'File Size', value: material.size || 'N/A', icon: CheckCircle2 },
                                    { label: 'Released', value: new Date(material.lastUpdated).toLocaleDateString(), icon: Calendar },
                                ].map((item, i) => (
                                    <div key={i} className="p-2 md:p-3 rounded-xl bg-background/40 border border-border/10 group/item hover:border-primary/10 transition-all">
                                        <div className="p-1 rounded-lg bg-muted w-fit mb-1.5 md:mb-2 group-hover/item:bg-primary/10 transition-colors">
                                            <item.icon className="w-3 h-3 text-primary" />
                                        </div>
                                        <div className="space-y-0">
                                            <div className="text-[7px] md:text-[8px] text-muted-foreground font-bold uppercase tracking-wider">{item.label}</div>
                                            <div className="text-[9px] md:text-xs font-black truncate">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="bg-border/20" />

                        <div className="flex flex-col gap-2.5 md:gap-3">
                            <Button className="h-10 md:h-12 rounded-xl md:rounded-2xl gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-xs md:text-sm font-black group" asChild>
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:bounce" />
                                    {material.type === 'Docs' ? 'Open Resource' : 'Download Now'}
                                </a>
                            </Button>
                            {material.previewUrl && (
                                <Button variant="outline" className="h-10 md:h-12 rounded-xl md:rounded-2xl gap-2 border-border/50 hover:bg-muted text-xs md:text-sm font-black transition-all" asChild>
                                    <a href={material.previewUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" /> Live Interface
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-3 md:p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[8px] md:text-[9px] text-primary/70 font-black uppercase tracking-[0.2em]">Verified Secure Artifact</p>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (material.type) {
            case "Videos":
                return (
                    <div className="lg:h-full lg:overflow-y-auto p-5 sm:p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Video Player Container */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative aspect-video w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl bg-black/40 backdrop-blur-md">
                                <YouTubePlayer
                                    videoUrl={material.embedUrl || material.url}
                                    title={material.title}
                                    autoplay={false}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                                            <Info className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight">Lesson Overview</h3>
                                    </div>
                                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-light">
                                        {material.description || "This video provides a deep dive into the core concepts of this lesson, carefully curated by our experts."}
                                    </p>
                                </div>

                                {material.topics && material.topics.length > 0 && (
                                    <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-muted/30 border border-border/20 backdrop-blur-sm space-y-6">
                                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">Key Topics Explored</h4>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {material.topics.map((topic, i) => (
                                                <Badge key={i} variant="secondary" className="rounded-full px-4 md:px-5 py-1.5 md:py-2 bg-background/50 border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-default text-[10px] md:text-xs">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-card/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-border/40 shadow-xl space-y-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />

                                    <div className="space-y-6 relative">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Video Details</h4>
                                        <div className="space-y-4 md:space-y-5">
                                            {[
                                                { label: 'Duration', value: material.duration || "N/A", icon: Clock },
                                                { label: 'Released', value: new Date(material.lastUpdated).toLocaleDateString(), icon: Calendar },
                                                { label: 'Category', value: material.category, icon: Layers },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between group/item">
                                                    <span className="text-muted-foreground flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                                                        <div className="p-1.5 md:p-2 rounded-lg bg-muted group-hover/item:bg-primary/10 transition-colors">
                                                            <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        </div>
                                                        {item.label}
                                                    </span>
                                                    <span className="font-bold text-xs md:text-sm tracking-tight">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Separator className="bg-border/20" />
                                        <Button className="w-full h-12 md:h-14 rounded-full gap-3 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 group text-sm font-bold" asChild>
                                            <a href={material.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Access Full Content
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "Snippet":
                return (
                    <div className="lg:h-full lg:overflow-y-auto p-5 sm:p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative group">
                            {/* Editor Window Decoration */}
                            <div className="absolute right-4 top-14 md:right-6 md:top-16 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <Button
                                    size="sm"
                                    className="rounded-full shadow-2xl bg-white text-black hover:bg-slate-100 border-none px-4 md:px-6 font-bold h-8 md:h-10 text-[10px] md:text-xs"
                                    onClick={() => copyToClipboard(material.code || "")}
                                >
                                    <Copy className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Copy Snippet
                                </Button>
                            </div>
                            <div className="bg-[#0b0e14] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                                <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 bg-white/[0.03] border-b border-white/10">
                                    <div className="flex items-center gap-2 md:gap-2.5">
                                        <div className="flex gap-1 md:gap-1.5">
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ff5f56]" />
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#ffbd2e]" />
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27c93f]" />
                                        </div>
                                        <div className="h-4 w-px bg-white/10 mx-1 md:mx-2" />
                                        <span className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] text-white/40 font-mono scale-90 md:scale-100">
                                            {material.language || "source-code"}
                                        </span>
                                    </div>
                                    <div className="text-[8px] md:text-[10px] text-white/20 font-mono italic">Skillmount Code Editor</div>
                                </div>
                                <div className="p-6 md:p-12 overflow-x-auto">
                                    <pre className="text-xs md:text-sm font-mono text-slate-300 leading-relaxed selection:bg-primary/40 selection:text-white">
                                        <code>{material.code}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        Implementation Details
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-light">
                                        {material.description || "This code snippet is optimized for high performance and clean integration within your WordPress environment."}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        {material.category}
                                    </div>
                                    <div className="px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-muted border border-border text-muted-foreground text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                        {material.language}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/40 backdrop-blur-md rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-border/30 flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl transition-all duration-700 group-hover:scale-150" />
                                <div className="space-y-2 relative">
                                    <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Verification</div>
                                    <div className="text-xs md:text-sm font-medium text-foreground italic flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                                        Updated: {new Date(material.lastUpdated).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="pt-8 relative">
                                    <Button variant="outline" className="w-full h-12 md:h-14 rounded-full gap-3 border-border/50 hover:bg-background hover:shadow-xl transition-all text-sm font-bold" asChild>
                                        <a href={material.url} download>
                                            <Download className="w-4 h-4" /> Export Source File
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="lg:h-full w-full animate-in fade-in duration-700">
                        {/* Mobile View: Single Scroll Flow handled by top-level ScrollArea */}
                        <div className="lg:hidden">
                            <div className="flex flex-col">
                                {renderDescriptionSection('p-4 pt-2')}
                                <div className="p-4 bg-muted/5 border-t border-border/10 flex justify-center">
                                    {renderTechnicalSection('w-full')}
                                </div>
                            </div>
                        </div>

                        {/* Desktop View: Split Grid Layout */}
                        <div className="hidden lg:grid lg:grid-cols-2 h-full overflow-hidden">
                            {/* Left Side */}
                            <div className="h-full flex flex-col border-r border-border/10 relative">
                                <ScrollArea className="flex-1 w-full">
                                    {renderDescriptionSection('p-8 pt-4')}
                                </ScrollArea>
                            </div>

                            {/* Right Side */}
                            <div className="h-full flex flex-col justify-center items-center bg-muted/5 p-8 relative overflow-hidden">
                                {renderTechnicalSection('w-full flex justify-center relative z-10')}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100vw-1.5rem)] md:max-w-5xl h-[90dvh] overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border-border/40 bg-background/95 backdrop-blur-xl p-0 gap-0 shadow-2xl">
                <div className="h-full flex flex-col">
                    {/* Mobile View: Single Scroll Flow */}
                    <div className="lg:hidden flex-1 overflow-hidden">
                        <ScrollArea className="h-full w-full">
                            <div className="flex flex-col">
                                {renderHeaderSection()}
                                {renderContent()}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Desktop View: Fixed Header + Layout Logic */}
                    <div className="hidden lg:flex lg:flex-col h-full overflow-hidden">
                        {renderHeaderSection()}
                        <div className="flex-1 overflow-hidden relative">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
