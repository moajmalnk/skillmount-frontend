import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TagInputProps {
    placeholder?: string;
    tags: string[];
    setTags: (tags: string[]) => void;
    className?: string;
    maxTags?: number;
}

export const TagInput = ({
    placeholder = "Add a tag...",
    tags,
    setTags,
    className,
    maxTags = 20
}: TagInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput && !tags.includes(trimmedInput) && tags.length < maxTags) {
            setTags([...tags, trimmedInput]);
            setInputValue("");
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex flex-wrap gap-2 md:gap-3 p-3 bg-secondary/20 rounded-lg border border-border/40 min-h-[3rem] items-center">
                {tags.map((tag, index) => (
                    <Badge
                        key={index}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 h-7 text-sm font-medium bg-background border border-border/50 hover:bg-background/80 transition-colors flex items-center gap-1 group"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 h-4 w-4 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag}</span>
                        </button>
                    </Badge>
                ))}

                <div className="flex-1 min-w-[120px] flex items-center relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => inputValue && addTag()}
                        className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0 h-8 text-sm placeholder:text-muted-foreground/50"
                        placeholder={tags.length === 0 ? placeholder : ""}
                    />
                    {!inputValue && tags.length === 0 && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground opacity-50 pointer-events-none">
                            Press Enter to add
                        </span>
                    )}
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>Press <kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> to add tags</span>
                <span>{tags.length}/{maxTags} tags</span>
            </div>
        </div>
    );
};
