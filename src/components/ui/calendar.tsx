import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  // Hide the caption text label if we are showing dropdowns, to avoid duplication (Label + Dropdown)
  const isDropdown = props.captionLayout?.includes("dropdown");

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2", // Added mb-2 for spacing
        // When using dropdowns, hide the static caption text "December 2025"
        caption_label: cn("text-sm font-medium", isDropdown && "hidden"),
        caption_dropdowns: "flex justify-center gap-1 items-center px-8", // Adjusted gap and align
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background p-0 opacity-50 hover:opacity-100 shadow-sm border border-input"
        ),
        nav_button_previous: "absolute left-0", // Pushed to edge
        nav_button_next: "absolute right-0", // Pushed to edge
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-sm", // Updated to use primary/foreground
        day_today: "bg-accent text-accent-foreground font-bold",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        // Dropdown specific styles - largely overridden by custom component now, but keeping for safety
        dropdown: "appearance-none bg-transparent hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md text-sm font-medium px-3 py-1.5 focus-visible:outline-none transition-colors text-center min-w-[70px]",
        dropdown_month: "border-b border-border/50 hover:border-primary/50 rounded-none px-1",
        dropdown_year: "border-b border-border/50 hover:border-primary/50 rounded-none px-1 font-bold",
        vhidden: "sr-only",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ value, onChange, children, ...props }: any) => {
          const options = React.Children.toArray(children) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[]
          const selected = options.find((child) => child.props.value === value)
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>
            onChange?.(changeEvent)
          }
          return (
            <Select
              value={value?.toString()}
              onValueChange={handleChange}
            >
              <SelectTrigger className="h-7 w-fit min-w-[80px] border border-border/40 bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-0 shadow-none px-2 py-1 text-xs font-medium gap-1 transition-all">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[200px] overflow-y-auto min-w-[100px] bg-popover text-popover-foreground border-border shadow-md z-[120]">
                {options.map((option, id) => (
                  <SelectItem key={`${option.props.value}-${id}`} value={option.props.value?.toString() ?? ""}>
                    {option.props.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
