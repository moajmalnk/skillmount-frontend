import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
    placeholder?: string;
    value: string[];
    onChange: (value: string[]) => void;
    className?: string;
}

export const TagInput = ({ placeholder, value = [], onChange, className }: TagInputProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed]);
                setInputValue("");
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
            {value.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1.5 text-sm font-medium flex items-center gap-1 hover:bg-secondary/80 h-auto whitespace-normal text-left break-all">
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            <input
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] placeholder:text-muted-foreground"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={value.length === 0 ? placeholder : ""}
            />
        </div>
    );
};
