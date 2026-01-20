import * as React from "react"
import { Check, ChevronsUpDown, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { MacroItem } from "@/services/systemService"

interface MacroSelectorProps {
    macros: MacroItem[];
    onSelect: (description: string) => void;
}

export function MacroSelector({ macros, onSelect }: MacroSelectorProps) {
    const [open, setOpen] = React.useState(false)

    // Normalize input just in case mixed types come through (legacy support)
    const normalizedMacros: MacroItem[] = React.useMemo(() => {
        return macros.map((m: any) => {
            if (typeof m === 'string') {
                return { title: 'Quick Reply', description: m, dateAdded: undefined };
            }
            return m;
        });
    }, [macros]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 bg-muted/20 text-xs border-dashed font-normal text-muted-foreground hover:text-foreground"
                >
                    Insert Quick Response...
                    <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search macros..." />
                    <CommandList>
                        <CommandEmpty>No macro found.</CommandEmpty>
                        <CommandGroup heading="Available Responses">
                            {normalizedMacros.map((macro, idx) => (
                                <CommandItem
                                    key={idx}
                                    value={macro.title} // Search by title
                                    onSelect={() => {
                                        onSelect(macro.description)
                                        setOpen(false)
                                    }}
                                    className="text-xs cursor-pointer"
                                >
                                    <div className="flex flex-col gap-1 w-full">
                                        <span className="font-medium">{macro.title}</span>
                                        <span className="text-[10px] text-muted-foreground truncate opacity-70">
                                            {macro.description.length > 60 ? macro.description.substring(0, 60) + "..." : macro.description}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
