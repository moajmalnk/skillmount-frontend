import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef, useEffect } from "react";

interface MaterialsSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const MaterialsSearchBar = ({ value, onChange, placeholder = "Search for resources..." }: MaterialsSearchBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                inputRef.current?.blur();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto mb-12 relative z-20 px-6 group">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-500 opacity-0 group-hover:opacity-100" />
            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    className="pl-14 pr-20 h-14 rounded-full border-border/40 bg-muted/10 hover:bg-muted/20 focus:bg-background/80 backdrop-blur-md transition-all text-base shadow-sm focus:ring-primary/20 focus:border-primary/30"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                    <kbd className="inline-flex h-6 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>
        </div>
    );
};
