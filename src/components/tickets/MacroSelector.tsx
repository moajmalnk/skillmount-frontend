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

interface MacroSelectorProps {
    macros: string[];
    onSelect: (macro: string) => void;
}

export function MacroSelector({ macros, onSelect }: MacroSelectorProps) {
    const [open, setOpen] = React.useState(false)

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
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search macros..." />
                    <CommandList>
                        <CommandEmpty>No macro found.</CommandEmpty>
                        <CommandGroup heading="Available Responses">
                            {macros.map((macro, idx) => (
                                <CommandItem
                                    key={idx}
                                    value={macro} // Command uses value for filtering
                                    onSelect={(currentValue) => {
                                        // currentValue might be lowercased by Command usually, but here we want the original text
                                        // Actually CommandItem value is used for search matching.
                                        // We can pass the original macro to onSelect via closure if needed, 
                                        // BUT CommandItem `onSelect` passes the `value` prop content usually.
                                        // Let's rely on the closure 'macro' variable which is correct.
                                        // Wait, `onSelect` trigger.
                                        onSelect(macro)
                                        setOpen(false)
                                    }}
                                    className="text-xs cursor-pointer"
                                >
                                    <div className="flex flex-col gap-1 w-full">
                                        <span className="truncate">{macro.length > 50 ? macro.substring(0, 50) + "..." : macro}</span>
                                        {macro.length > 50 && (
                                            <span className="text-[10px] text-muted-foreground truncate opacity-70">
                                                {macro}
                                            </span>
                                        )}
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
